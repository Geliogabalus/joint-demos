// Model menu shown in the Agent inspector. Model ids pass straight to the AI SDK.
import type { AgentProvider } from '../../workflow/workflow-types';

interface ModelOption {
  readonly id: string;
  readonly label: string;
}

export const PROVIDERS: readonly AgentProvider[] = ['mock', 'openai', 'anthropic'];

export const PROVIDER_LABEL: Record<AgentProvider, string> = {
    mock: 'Mock',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
};

export const PROVIDER_MODELS: Record<AgentProvider, readonly ModelOption[]> = {
    mock: [{ id: 'mock', label: 'Offline' }],
    openai: [
        { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
        { id: 'gpt-4o', label: 'GPT-4o' },
        { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
    ],
    // Verified current Anthropic model ids (Haiku 4.5 / Sonnet 4.6 / Opus 4.8).
    anthropic: [
        { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
        { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
        { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
    ],
};

export function isAgentProvider(value: string): value is AgentProvider {
    return value === 'mock' || value === 'openai' || value === 'anthropic';
}
