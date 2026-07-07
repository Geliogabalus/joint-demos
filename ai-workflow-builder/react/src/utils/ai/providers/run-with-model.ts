/**
 * Shared real-provider execution. OpenAI and Anthropic differ only in how the
 * model is constructed; once we have a model, the run is identical — assemble
 * the system prompt, expose the Reddit tool, let the SDK handle tool round-trips
 * (`stopWhen: stepCountIs`), and STREAM the answer so the Output fills in live.
 */
import { stepCountIs, streamText } from 'ai';
import { buildSystemPrompt } from '../skills';
import { createRedditSearchTool } from '../tools/reddit-search';
import { describeRunError } from './shared';
import type { AgentRunInput, AgentRunResult } from '../types';

/** The model type the AI SDK's `streamText` accepts. */
type ChatModel = Parameters<typeof streamText>[0]['model'];

/**
 * Max agent steps. With a tool wired, the model needs at least two: one to call
 * `redditSearch`, one to read the result and answer. A few extra steps let it
 * refine the query or chain calls before the final text.
 */
const MAX_STEPS = 5;

export async function runWithModel(
    model: ChatModel,
    input: AgentRunInput,
    provider: string
): Promise<AgentRunResult> {
    const tools = input.tool ? { redditSearch: createRedditSearchTool(input.tool) } : undefined;

    try {
        const result = streamText({
            model,
            system: buildSystemPrompt({ skill: input.skill, hasTool: Boolean(input.tool) }),
            prompt: input.prompt,
            tools,
            // Multi-step: let the model call the tool, read it, then answer. Without
            // this the model would emit a tool call and stop, never producing text.
            stopWhen: stepCountIs(MAX_STEPS),
            maxOutputTokens: input.maxOutputTokens,
            abortSignal: input.signal,
        });

        // Stream the answer as it arrives so the Output node fills in progressively.
        let markdown = '';
        for await (const delta of result.textStream) {
            markdown += delta;
            input.onPartial?.(markdown);
        }

        // Report OUTPUT tokens — that's what the Token budget caps (maxOutputTokens),
        // so "Tokens used" stays comparable to the budget instead of dwarfing it with
        // the prompt + tool round-trip tokens (totalTokens).
        const usage = await result.totalUsage;
        return { markdown, tokensUsed: usage?.outputTokens ?? usage?.totalTokens ?? 0 };
    } catch (caught) {
    // Re-throw with a message the user can act on (bad key, model, CORS, …).
        throw new Error(describeRunError(caught, provider), { cause: caught });
    }
}
