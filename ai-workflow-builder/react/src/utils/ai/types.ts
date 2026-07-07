// Shared types for the agent runner. One AgentRunInput drives the mock + the real
// OpenAI / Anthropic calls; all return the same AgentRunResult.
import type { AgentProvider } from '../../workflow/workflow-types';

export interface RedditToolConfig {
  readonly subreddit: string;
  readonly limit: number;
}

export interface AgentRunInput {
  readonly provider: AgentProvider;
  /** Provider model id (ignored by the mock provider). */
  readonly model: string;
  /** Required for the `openai` / `anthropic` providers. */
  readonly apiKey?: string;
  /** Base URL override. OpenAI blocks direct browser calls (no CORS header) so a real
   *  OpenAI run needs a CORS-permissive proxy here; Anthropic works direct, needs none. */
  readonly baseURL?: string;
  /** The user prompt (from the Text Input node). */
  readonly prompt: string;
  /** Optional Markdown skill (from the Skill node) folded into the system prompt. */
  readonly skill?: string;
  /** Present when a Search Reddit tool is wired to the agent. */
  readonly tool?: RedditToolConfig;
  /** Soft cap on output tokens. */
  readonly maxOutputTokens?: number;
  /** Aborts the run (Stop button, unmount). Providers reject with an
   *  AbortError, mapped to "Run cancelled." by `describeRunError`. */
  readonly signal?: AbortSignal;
  /** Streaming callback: fires with the accumulated Markdown as it arrives, so
   *  the Output node fills in progressively instead of in one jump. */
  readonly onPartial?: (markdown: string) => void;
}

export interface AgentRunResult {
  /** Markdown to render in the Output node. */
  readonly markdown: string;
  /** Total tokens consumed (shown on the result link). */
  readonly tokensUsed: number;
}
