import { HTMLHost } from "@joint/react-plus";
import { NODE_CATALOG, type ConfigKind } from "@/workflow/node-catalog";
import { NodeIconChip } from "./node-icon-chip";

export function NodePreview({ kind }: { readonly kind: ConfigKind }) {
  const config = NODE_CATALOG[kind];
  return (
    <HTMLHost className="flex w-56 items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 text-card-foreground shadow-md">
      <NodeIconChip kind={kind} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{config.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {config.description}
        </p>
      </div>
    </HTMLHost>
  );
}
