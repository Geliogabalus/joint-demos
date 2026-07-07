// Holds the in-memory API keys + the Connect dialog's open state, and renders the dialog.
// Wrap the app so every node, the run, and the toolbar share one source via useApiKeys.
import { useMemo, useState, type ReactNode } from 'react';
import { ApiKeysDialog } from '@/components/toolbar/api-keys-dialog';
import { ApiKeysContext, isKeyConnected, type ApiKeys, type ApiKeysContextValue } from './use-api-keys';
import type { AgentProvider } from '@/workflow/workflow-types';

const EMPTY_KEYS: ApiKeys = { openai: '', anthropic: '', openaiBaseURL: '' };

export function ApiKeysProvider({ children }: { readonly children: ReactNode }) {
    const [keys, setKeys] = useState<ApiKeys>(EMPTY_KEYS);
    const [open, setOpen] = useState(false);
    const [focus, setFocus] = useState<AgentProvider | undefined>(undefined);

    const value = useMemo<ApiKeysContextValue>(
        () => ({
            keys,
            setKeys: (patch) => setKeys((previous) => ({ ...previous, ...patch })),
            isConnected: (provider) =>
                provider === 'mock' ||
        isKeyConnected(provider === 'openai' ? keys.openai : keys.anthropic),
            openKeys: (next) => {
                setFocus(next);
                setOpen(true);
            },
        }),
        [keys]
    );

    return (
        <ApiKeysContext.Provider value={value}>
            {children}
            <ApiKeysDialog
                open={open}
                onOpenChange={setOpen}
                keys={keys}
                onChange={value.setKeys}
                focus={focus}
            />
        </ApiKeysContext.Provider>
    );
}
