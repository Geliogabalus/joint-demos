// Single entry point for running the agent: picks a provider (offline mock, or a real
// OpenAI / Anthropic call) and returns a uniform result.
import { runMock } from './providers/mock';
import { createProvider } from './providers/shared';
import type { AgentRunInput, AgentRunResult } from './types';

export function runAgent(input: AgentRunInput): Promise<AgentRunResult> {
  switch (input.provider) {
    case 'openai':
    case 'anthropic':
      return createProvider(input.provider, input);
    case 'mock':
      return runMock(input);
  }
}

export type { AgentRunInput, AgentRunResult } from './types';
