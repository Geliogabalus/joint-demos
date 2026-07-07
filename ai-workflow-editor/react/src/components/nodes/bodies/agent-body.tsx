import { KeyRound, TriangleAlert } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useApiKeys } from "@/hooks/use-api-keys";
import { PROVIDER_LABEL } from "@/utils/ai/models";
import { cn } from "@/utils/cn";
import type { AgentNodeData } from "@/workflow/workflow-types";
import { Field } from "../node-field";
import { ModelSelector } from "../model-selector";
import { useNodeData } from "../use-node-data";

export function AgentBody({ data }: { readonly data: AgentNodeData }) {
  const patch = useNodeData<AgentNodeData>();
  const { isConnected, openKeys } = useApiKeys();
  const needsKey = !isConnected(data.provider);
  return (
    <div className="space-y-2.5">
      <Field label="Model">
        <ModelSelector
          provider={data.provider}
          model={data.model}
          className="w-full"
          // Switching model clears any stale run error from the previous provider.
          onChange={(provider, model) => patch({ provider, model, runError: undefined })}
        />
      </Field>

      {needsKey ? (
        <ConnectNotice
          tone="warning"
          icon={<KeyRound className="size-3.5 shrink-0" />}
          label={`Connect ${PROVIDER_LABEL[data.provider]}`}
          action="Configure"
          onClick={() => openKeys(data.provider)}
        />
      ) : data.runError ? (
        <ConnectNotice
          tone="error"
          icon={<TriangleAlert className="size-3.5 shrink-0" />}
          label={data.runError}
          action="Fix key"
          onClick={() => openKeys(data.provider)}
        />
      ) : null}

      <Field label={`Token budget · ${data.tokenBudget}`}>
        <Slider
          aria-label="Token budget"
          min={500}
          max={2000}
          step={500}
          value={[data.tokenBudget]}
          onValueChange={([value]) => patch({ tokenBudget: value })}
        />
      </Field>
    </div>
  );
}

interface ConnectNoticeProps {
  readonly tone: "warning" | "error";
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly action: string;
  readonly onClick: () => void;
}

function ConnectNotice({
  tone,
  icon,
  label,
  action,
  onClick,
}: ConnectNoticeProps) {
  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tone === "warning"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
          : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15",
      )}
    >
      <span className="mt-px shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
      <span className="shrink-0 font-medium underline underline-offset-2">
        {action}
      </span>
    </button>
  );
}
