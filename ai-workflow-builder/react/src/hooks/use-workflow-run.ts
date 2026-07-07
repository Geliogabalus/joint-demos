// Runs the flow per the graph wiring: every AI Agent reads its wired prompt/skill/tool
// ports and writes Markdown + token count to its result Output(s). Per-node status drives
// the running pulse; every lit node lands on a terminal status.
import { useEffect, useRef, useState } from "react";
import { useGraph } from "@joint/react-plus";
import { useAnnounce } from "@/components/ui/announcer-context";
import { runAgent, type AgentRunInput } from "@/utils/ai/agent-runner";
import { PROVIDER_LABEL } from "@/utils/ai/models";
import { tokenLabelMap } from "@/workflow/build-node";
import { delay } from "@/utils/delay";
import { useApiKeys, type ApiKeys } from "@/hooks/use-api-keys";
import { getAgentPlans, type AgentPlan } from "@/workflow/agent-plans";
import type {
  AgentNodeData,
  WorkflowElement,
  WorkflowLink,
} from "@/workflow/workflow-types";

export interface RunFeedback {
  readonly message: string;
  /** Offer a "Configure" (API keys) action — true when a key is missing or a run failed. */
  readonly canConfigure: boolean;
}

export interface WorkflowRunState {
  readonly isRunning: boolean;
  readonly error: string | null;
  /** Resolves to `null` on success, or the problems to surface. */
  readonly run: () => Promise<RunFeedback | null>;
  /** Cancels the in-flight run; the run resolves with no feedback. */
  readonly stop: () => void;
}

function formatIssues(list: readonly string[]): string {
  const MAX = 3;
  if (list.length <= MAX) return list.join("\n");
  return [...list.slice(0, MAX), `+${list.length - MAX} more`].join("\n");
}

/** Everything the provider call needs, read off the plan + the entered keys. */
function buildAgentRunInput(
  plan: AgentPlan,
  keys: ApiKeys,
  signal: AbortSignal,
  onPartial: (markdown: string) => void,
): AgentRunInput {
  const provider = plan.agent.provider;
  return {
    provider,
    model: plan.agent.model,
    apiKey:
      provider === "openai"
        ? keys.openai
        : provider === "anthropic"
          ? keys.anthropic
          : undefined,
    baseURL: provider === "openai" ? keys.openaiBaseURL || undefined : undefined,
    prompt: plan.prompt?.data.prompt ?? "",
    skill: plan.skill?.data.content,
    tool: plan.tool
      ? { subreddit: plan.tool.data.subreddit, limit: plan.tool.data.limit }
      : undefined,
    maxOutputTokens: plan.agent.tokenBudget || undefined,
    signal,
    onPartial,
  };
}

/** Ids of the plan's wired upstream nodes (prompt, skill, tool). */
function getUpstreamIds(plan: AgentPlan): string[] {
  return [plan.prompt, plan.skill, plan.tool]
    .filter((node) => node !== null)
    .map((node) => node.id);
}

export function useWorkflowRun(): WorkflowRunState {
  const { graph, setCellData } = useGraph<WorkflowElement, WorkflowLink>();
  const { keys, isConnected } = useApiKeys();
  const announce = useAnnounce();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Abort an in-flight run when the owner unmounts, so orphaned streams
      // stop writing into the graph.
      abortRef.current?.abort();
    };
  }, []);

  // Run writes (status, streamed output, token pills) are transient — this keeps
  // them off the undo/redo stack. Reused by every write below.
  const TRANSIENT = { skipHistory: true };

  function setStatus(id: string, status: AgentNodeData["status"]) {
    setCellData(id, (previous) => ({ ...previous, status }), TRANSIENT);
  }

  function setAgentError(id: string, runError?: string) {
    setCellData(id, (previous) => ({ ...previous, runError }), TRANSIENT);
  }

  function writeOutputs(
    outputIds: readonly string[],
    markdown: string,
  ) {
    // Reassert `status: 'running'` with the markdown in ONE update — a separate
    // write in the same tick would spread a stale cell and clobber the running
    // state (dropping the output's Running badge during streaming).
    for (const id of outputIds) {
      setCellData(id, (previous) => ({
        ...previous,
        status: "running",
        markdown,
      }), TRANSIENT);
    }
  }

  async function run(): Promise<RunFeedback | null> {
    const plans = getAgentPlans(graph);
    if (plans.length === 0) {
      const message =
        "Add an AI Agent with a Text Input and an Output, then connect Input → Agent → Output to run.";
      setError(message);
      return { message, canConfigure: false };
    }

    // Each agent needs a Text Input (prompt) and an Output (result). Agents
    // missing either are reported and skipped, so a partly-wired graph still runs.
    const messages: string[] = [];
    const wired: AgentPlan[] = [];
    for (const plan of plans) {
      const hasPrompt = plan.prompt !== null;
      const hasOutput = plan.outputIds.length > 0;
      if (hasPrompt && hasOutput) {
        wired.push(plan);
        continue;
      }
      const name = plan.agent.name ?? "AI Agent";
      const need =
        !hasPrompt && !hasOutput
          ? "a Text Input and an Output"
          : !hasPrompt
            ? "a Text Input"
            : "an Output";
      messages.push(`${name} needs ${need} connected.`);
    }

    // Nothing is fully wired → surface the wiring problems and don't run.
    if (wired.length === 0) {
      const message = formatIssues(messages);
      setError(message);
      return { message, canConfigure: false };
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    setError(null);
    announce("Running the workflow…");
    for (const plan of plans) setAgentError(plan.agentId, undefined);
    try {
      return await runPlans(wired, messages, controller.signal);
    } finally {
      // Always release the Run button — even if a status/label write throws.
      setIsRunning(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  async function runPlans(
    wired: readonly AgentPlan[],
    messages: string[],
    signal: AbortSignal,
  ): Promise<RunFeedback | null> {
    const runnable = wired.filter((plan) => isConnected(plan.agent.provider));
    const blocked = wired.filter((plan) => !isConnected(plan.agent.provider));
    let canConfigure = false;

    // Agents whose provider has no key: don't run; the node shows a connect prompt.
    for (const plan of blocked) {
      const message = `Add your ${PROVIDER_LABEL[plan.agent.provider]} API key to run this agent.`;
      messages.push(message);
      canConfigure = true;
      setAgentError(plan.agentId, message);
      setStatus(plan.agentId, "error");
    }

    // Light up every node in a runnable agent's flow.
    for (const plan of runnable) {
      for (const id of [plan.agentId, ...getUpstreamIds(plan)]) {
        setStatus(id, "running");
      }
      writeOutputs(plan.outputIds, "");
    }

    const outcomes = await Promise.all(
      runnable.map(async (plan) => {
        try {
          const result = await runAgent(
            // Stream the answer into the Output node(s) as it arrives.
            buildAgentRunInput(plan, keys, signal, (markdown) =>
              writeOutputs(plan.outputIds, markdown),
            ),
          );
          return { plan, result, error: null as string | null };
        } catch (caught) {
          return {
            plan,
            result: null,
            error: caught instanceof Error ? caught.message : "Run failed",
          };
        }
      }),
    );

    // Settle every agent's terminal flow independently — one agent's staggered
    // "done" animation must not delay another's.
    await Promise.all(
      outcomes.map(async ({ plan, result, error: runError }) => {
        const upstreamIds = getUpstreamIds(plan);
        if (result) {
          // Flow "done" through upstream → agent → outputs so every lit node lands terminal.
          for (const id of [...upstreamIds, plan.agentId, ...plan.outputIds]) {
            setStatus(id, "success");
            await delay(90);
          }
          for (const id of plan.outputIds) {
            setCellData(id, (previous) => ({
              ...previous,
              markdown: result.markdown,
            }), TRANSIENT);
          }
          setCellData(plan.agentId, (previous) => ({
            ...previous,
            tokensUsed: result.tokensUsed,
            runError: undefined,
          }), TRANSIENT);
          updateResultLabels(plan.agentId, result.tokensUsed);
        } else if (signal.aborted) {
          // Cancelled, not failed: everything lit goes back to idle, no toast.
          for (const id of [...upstreamIds, plan.agentId, ...plan.outputIds]) {
            setStatus(id, "idle");
          }
        } else {
          messages.push(runError ?? "Run failed");
          canConfigure = true;
          setAgentError(plan.agentId, runError ?? "Run failed");
          for (const id of upstreamIds) setStatus(id, "success");
          setStatus(plan.agentId, "error");
          for (const id of plan.outputIds) setStatus(id, "error");
        }
      }),
    );

    if (signal.aborted) {
      setError(null);
      announce("Run cancelled.");
      return null;
    }
    const message = messages.length ? formatIssues(messages) : null;
    setError(message);
    announce(
      message ? "Run finished with issues." : "Run finished successfully.",
    );
    return message ? { message, canConfigure } : null;
  }

  /** Token pills on the agent's result links — read from the live graph, so
   *  links wired mid-run get labeled too. */
  function updateResultLabels(agentId: string, tokens: number) {
    const agent = graph.getCell(agentId);
    if (!agent) return;
    for (const link of graph.getConnectedLinks(agent, {
      outbound: true,
      port: "result",
    })) {
      setCellData(link.id, (previous) => ({
        ...previous,
        tokens,
        labelMap: tokenLabelMap(tokens),
      }), TRANSIENT);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  return { isRunning, error, run, stop };
}
