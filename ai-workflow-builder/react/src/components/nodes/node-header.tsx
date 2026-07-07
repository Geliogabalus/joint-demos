import { MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePress } from "@/hooks/use-press";
import type { NodeConfig } from "@/workflow/node-catalog";
import type { RunStatus } from "@/workflow/workflow-types";
import { NodeIconChip } from "./node-icon-chip";
import { PORT_DOT_CLASS, STATUS_DOT_CLASS } from "./port-style";

interface NodeHeaderProps {
  readonly config: NodeConfig;
  readonly status: RunStatus;
  /** Resolved title / description (inspector override else catalog). */
  readonly title: string;
  readonly description: string;
  readonly onToggleMenu: () => void;
}

export function NodeHeader({
  config,
  status,
  title,
  description,
  onToggleMenu,
}: NodeHeaderProps) {
  // A press that turns into a drag must NOT open the menu — only a real click.
  const menuPress = usePress(onToggleMenu);
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3.5 pt-3",
        config.kind === "tool" && "bg-muted/30",
      )}
    >
      <NodeIconChip kind={config.kind} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              status === "idle"
                ? PORT_DOT_CLASS[config.accent]
                : STATUS_DOT_CLASS[status],
              status === "running" && "animate-pulse",
            )}
          />
          <span className="truncate text-sm font-semibold leading-tight">
            {title}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>

      <button
        type="button"
        aria-label="Node menu"
        onPointerDown={(event) => {
          event.stopPropagation();
          menuPress.onPointerDown(event);
        }}
        onPointerMove={menuPress.onPointerMove}
        onClick={menuPress.onClick}
        className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreVertical className="size-4" />
      </button>
    </div>
  );
}
