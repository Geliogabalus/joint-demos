// LLM provider + model dropdown, encoding both as "provider:model".
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isAgentProvider, PROVIDER_LABEL, PROVIDER_MODELS, PROVIDERS } from '@/utils/ai/models';
import type { AgentProvider } from '@/workflow/workflow-types';

interface ModelSelectorProps {
  readonly provider: AgentProvider;
  readonly model: string;
  /** Called with the decoded provider + model when the selection changes. */
  readonly onChange: (provider: AgentProvider, model: string) => void;
  readonly className?: string;
}

export function ModelSelector({ provider, model, onChange, className }: ModelSelectorProps) {
  return (
    <Select
      value={`${provider}:${model}`}
      onValueChange={(value) => {
        const separator = value.indexOf(':');
        const nextProvider = value.slice(0, separator);
        const nextModel = value.slice(separator + 1);
        if (isAgentProvider(nextProvider)) onChange(nextProvider, nextModel);
      }}
    >
      <SelectTrigger className={className} aria-label="LLM model">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PROVIDERS.flatMap((option) =>
          PROVIDER_MODELS[option].map((entry) => (
            <SelectItem key={`${option}:${entry.id}`} value={`${option}:${entry.id}`}>
              {PROVIDER_LABEL[option]} · {entry.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
