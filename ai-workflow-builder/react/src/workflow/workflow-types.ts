// Pure domain types for the workflow graph (no React, no JointJS views).
import type { ElementRecord, LinkRecord } from '@joint/react-plus';

/** The data type that flows through a port. Connections require a type match. */
export type PortType = 'text' | 'skill' | 'tool' | 'result';

/** A node header's accent: a data-type hue, or `brand` for the agent centrepiece. */
export type AccentKey = PortType | 'brand';

export type PortDirection = 'in' | 'out';

export type PortSide = 'left' | 'right' | 'top' | 'bottom';

/** Lifecycle of a node during a run (drives the status dot + animation). */
export type RunStatus = 'idle' | 'running' | 'success' | 'error';

/** The kinds of node the builder understands. `note` is a canvas annotation. */
export type NodeKind = 'input' | 'skill' | 'agent' | 'tool' | 'output' | 'note';

/** Where the agent sends its request. `mock` runs fully offline. */
export type AgentProvider = 'mock' | 'openai' | 'anthropic';

type ToolId = 'reddit-search';

/** Lucide icon names, resolved to components in `components/nodes/node-icon`. */
export type NodeIconName = 'type' | 'file-code' | 'bot' | 'file-text' | 'reddit';

/** Declarative description of one port; the catalog lists these per kind. */
export interface PortDescriptor {
  /** Stable id, unique within the node (referenced by links). */
  readonly id: string;
  readonly direction: PortDirection;
  readonly type: PortType;
  readonly label: string;
  readonly side: PortSide;
  /** Position along the side, 0–1 (default 0.5 = centred). */
  readonly at?: number;
}

/** User-editable look of a node. Values are swatch keys (not raw colors) so styling
 *  stays in Tailwind classes — never inline styles. */
export interface NodeAppearance {
  readonly fill?: SwatchKey;
  readonly border?: SwatchKey;
  readonly text?: SwatchKey;
  readonly font?: FontKey;
}

export type SwatchKey =
  | 'default'
  | 'violet'
  | 'blue'
  | 'green'
  | 'amber'
  | 'rose'
  | 'slate';

export type FontKey = 'sans' | 'mono' | 'serif';

interface BaseNodeData {
  readonly status: RunStatus;
  readonly appearance?: NodeAppearance;
  /** Inspector-editable overrides of the catalog title / description. */
  readonly name?: string;
  readonly description?: string;
}

export interface InputNodeData extends BaseNodeData {
  readonly kind: 'input';
  /** The user prompt fed into the agent. */
  readonly prompt: string;
}

export interface SkillNodeData extends BaseNodeData {
  readonly kind: 'skill';
  readonly fileName: string;
  /** Markdown content appended to the agent's system instruction. */
  readonly content: string;
}

export interface AgentNodeData extends BaseNodeData {
  readonly kind: 'agent';
  readonly provider: AgentProvider;
  readonly model: string;
  /** Soft cap on output tokens. */
  readonly tokenBudget: number;
  /** Tokens consumed by the last run (shown on the result link). */
  readonly tokensUsed?: number;
  /** Last run error for this agent (bad key, CORS, …), shown inside the node. */
  readonly runError?: string;
}

export interface ToolNodeData extends BaseNodeData {
  readonly kind: 'tool';
  readonly tool: ToolId;
  readonly subreddit: string;
  readonly limit: number;
}

export interface OutputNodeData extends BaseNodeData {
  readonly kind: 'output';
  /** Markdown result rendered in the node + inspector. */
  readonly markdown: string;
}

export interface NoteNodeData {
  readonly kind: 'note';
  readonly text: string;
  readonly color: SwatchKey;
}

/** Discriminated union of everything that can live on an element's `data`. */
export type NodeData =
  | InputNodeData
  | SkillNodeData
  | AgentNodeData
  | ToolNodeData
  | OutputNodeData
  | NoteNodeData;

/** Data carried on a link (currently just the token counter). */
interface LinkData {
  readonly tokens?: number;
}

export type WorkflowElement = ElementRecord<NodeData>;
export type WorkflowLink = LinkRecord<LinkData>;
export type WorkflowCell = WorkflowElement | WorkflowLink;

/** A cell id, as JointJS types it (no stringifying). */
export type CellId = NonNullable<WorkflowCell['id']>;

