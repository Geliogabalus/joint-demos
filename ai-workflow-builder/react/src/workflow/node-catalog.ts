// Catalog of node kinds — single source of truth for each block's title, size, ports and
// default data. Add a kind here (plus a body in components/nodes/bodies) and the rest follows.
import type {
  AccentKey,
  NodeData,
  NodeIconName,
  NodeKind,
  PortDescriptor,
} from "./workflow-types";

/** Every kind except `note` (notes have no ports and aren't in the stencil). */
export type ConfigKind = Exclude<NodeKind, "note">;

export interface NodeConfig {
  readonly kind: ConfigKind;
  readonly title: string;
  readonly description: string;
  readonly icon: NodeIconName;
  /** Drives the node's header accent color (a data-type hue, or `brand`). */
  readonly accent: AccentKey;
  /** Initial size. Nodes auto-grow to content (HTMLHost), so height is a hint; width is fixed. */
  readonly width: number;
  readonly height: number;
  readonly ports: readonly PortDescriptor[];
  readonly createData: () => NodeData;
}

export const NODE_CATALOG: Record<ConfigKind, NodeConfig> = {
  input: {
    kind: "input",
    title: "Text Input",
    description: "The starting prompt for the flow.",
    icon: "type",
    accent: "skill",
    width: 256,
    height: 188,
    ports: [{ id: "out", direction: "out", type: "text", label: "text", side: "right" }],
    createData: () => ({
      kind: "input",
      status: "idle",
      prompt:
        "Give me the most trending topics in the React community on Reddit.",
    }),
  },
  skill: {
    kind: "skill",
    title: "Markdown File",
    description: "A Markdown instruction file for the agent.",
    icon: "file-code",
    accent: "skill",
    width: 256,
    height: 168,
    ports: [{ id: "out", direction: "out", type: "skill", label: "skill", side: "right" }],
    createData: () => ({
      kind: "skill",
      status: "idle",
      fileName: "agent-skill.md",
      content:
        "You are a senior React analyst. Summarise the findings as a clean Markdown table.",
    }),
  },
  agent: {
    kind: "agent",
    title: "AI Agent",
    description: "Runs an LLM with tool calling.",
    icon: "bot",
    accent: "brand",
    width: 272,
    height: 226,
    ports: [
      { id: "prompt", direction: "in", type: "text", label: "prompt", side: "left", at: 0.816 },
      { id: "skill", direction: "in", type: "skill", label: "skill", side: "left", at: 0.913 },
      { id: "result", direction: "out", type: "result", label: "result", side: "right", at: 0.816 },
      { id: "tool", direction: "out", type: "tool", label: "tool", side: "bottom", at: 0.5 },
    ],
    createData: () => ({
      kind: "agent",
      status: "idle",
      provider: "mock",
      model: "mock",
      tokenBudget: 500,
      tokensUsed: 0,
    }),
  },
  tool: {
    kind: "tool",
    title: "Search Reddit",
    description: "Finds trending posts in a subreddit.",
    icon: "reddit",
    accent: "tool",
    width: 256,
    height: 200,
    ports: [
      { id: "tool", direction: "in", type: "tool", label: "tool", side: "top" },
    ],
    createData: () => ({
      kind: "tool",
      status: "idle",
      tool: "reddit-search",
      subreddit: "reactjs",
      limit: 10,
    }),
  },
  output: {
    kind: "output",
    title: "Formatted Output",
    description: "Renders the result as Markdown.",
    icon: "file-text",
    accent: "result",
    width: 288,
    height: 224,
    ports: [{ id: "result", direction: "in", type: "result", label: "result", side: "left" }],
    createData: () => ({ kind: "output", status: "idle", markdown: "" }),
  },
};

/** Stencil order, left rail top-to-bottom. */
export const STENCIL_KINDS: readonly ConfigKind[] = [
  "input",
  "skill",
  "agent",
  "tool",
  "output",
];

function getNodeConfig(kind: NodeKind | "unknown"): NodeConfig | null {
  return kind === "note" || kind === "unknown" ? null : NODE_CATALOG[kind];
}

export function getPortConfig(
  kind: NodeKind | "unknown",
  portId: string,
): PortDescriptor | null {
  return getNodeConfig(kind)?.ports.find((port) => port.id === portId) ?? null;
}
