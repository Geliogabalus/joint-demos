/** Connect-a-model dialog. Keys stay in memory (this tab only) and feed straight to the provider. */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';
import { isKeyConnected, type ApiKeys } from '@/hooks/use-api-keys';
import type { AgentProvider } from '@/workflow/workflow-types';

interface ApiKeysDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly keys: ApiKeys;
  readonly onChange: (patch: Partial<ApiKeys>) => void;
  readonly focus?: AgentProvider;
}

function FieldHeader({ htmlFor, label, connected }: {
  readonly htmlFor: string;
  readonly label: string;
  readonly connected: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={htmlFor}>{label}</Label>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
          connected ? 'bg-status-success/15 text-status-success' : 'bg-muted text-muted-foreground'
        )}
      >
        <span className={cn('size-1.5 rounded-full', connected ? 'bg-status-success' : 'bg-muted-foreground/60')} />
        {connected ? 'Connected' : 'Not connected'}
      </span>
    </div>
  );
}

export function ApiKeysDialog({ open, onOpenChange, keys, onChange, focus }: ApiKeysDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect a model</DialogTitle>
          <DialogDescription>
            Keys stay in this tab's memory and go straight to the provider. The Mock model needs no
            key, so you can try the flow offline first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <section className="space-y-2">
            <FieldHeader htmlFor="anthropic-key" label="Anthropic" connected={isKeyConnected(keys.anthropic)} />
            <Input
              id="anthropic-key"
              type="password"
              autoComplete="off"
              autoFocus={focus === 'anthropic'}
              value={keys.anthropic}
              placeholder="sk-ant-…"
              onChange={(event) => onChange({ anthropic: event.target.value })}
            />
            <p className="text-xs text-muted-foreground">Runs directly from the browser.</p>
          </section>

          <section className="space-y-2">
            <FieldHeader htmlFor="openai-key" label="OpenAI" connected={isKeyConnected(keys.openai)} />
            <Input
              id="openai-key"
              type="password"
              autoComplete="off"
              autoFocus={focus === 'openai'}
              value={keys.openai}
              placeholder="sk-…"
              onChange={(event) => onChange({ openai: event.target.value })}
            />
            <Input
              id="openai-base-url"
              type="url"
              autoComplete="off"
              // No visible label, so name it explicitly (a placeholder isn't an accessible name).
              aria-label="OpenAI base URL (CORS proxy, optional)"
              value={keys.openaiBaseURL}
              placeholder="https://your-cors-proxy/v1  (optional)"
              onChange={(event) => onChange({ openaiBaseURL: event.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              OpenAI blocks direct browser calls (CORS); point the base URL at a proxy, or use
              Anthropic for a key-only run.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
