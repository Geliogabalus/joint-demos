// In-memory API keys for the real LLM providers — live only in this tab's memory
// (never persisted), entered in the Connect dialog, read by the run + each Agent node.
import { createContext, useContext } from 'react';
import type { AgentProvider } from '@/workflow/workflow-types';

export interface ApiKeys {
  readonly openai: string;
  readonly anthropic: string;
  /** Optional OpenAI base URL (a CORS proxy, since OpenAI blocks direct calls). */
  readonly openaiBaseURL: string;
}

export interface ApiKeysContextValue {
  readonly keys: ApiKeys;
  readonly setKeys: (patch: Partial<ApiKeys>) => void;
  /** Mock is always ready; a real provider is ready once its key is set. */
  readonly isConnected: (provider: AgentProvider) => boolean;
  /** Open the Connect dialog, optionally focused on a provider. */
  readonly openKeys: (focus?: AgentProvider) => void;
}

/** The "key is set" rule — a key counts once it's non-blank. */
export function isKeyConnected(key: string): boolean {
  return key.trim() !== '';
}

export const ApiKeysContext = createContext<ApiKeysContextValue | null>(null);

export function useApiKeys(): ApiKeysContextValue {
  const context = useContext(ApiKeysContext);
  if (!context) throw new Error('useApiKeys must be used within <ApiKeysProvider>');
  return context;
}
