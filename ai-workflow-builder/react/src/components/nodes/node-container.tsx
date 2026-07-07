// Shared chrome for every config node. Width pinned per kind (config.width):
// HTMLHost otherwise sizes the host to max-content, so wide content blows the
// node out horizontally. Pinned, it only grows in height (bodies cap + scroll).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HTMLHost, useCellId, useIsCellSelected } from "@joint/react-plus";
import { IS_APPLE_WEBKIT } from "@/utils/platform";
import { cn } from "@/utils/cn";
import { useSelectCell } from "@/hooks/use-select-cell";
import { useTimeoutWhen } from "@/hooks/use-timeout-when";
import { NODE_CATALOG, type ConfigKind } from "@/workflow/node-catalog";
import type { NodeAppearance, RunStatus } from "@/workflow/workflow-types";
import { getAppearanceClass } from "./appearance";
import { NodeContextMenu } from "./node-context-menu";
import { NodeHeader } from "./node-header";
import { DONE_VISIBLE_MS, NodeStatusBadge } from "./node-status-badge";
import { PortLegend } from "./port-legend";

interface NodeContainerProps {
  readonly kind: ConfigKind;
  readonly status: RunStatus;
  readonly appearance?: NodeAppearance;
  /** Inspector-editable overrides of the catalog title / description. */
  readonly name?: string;
  readonly description?: string;
  readonly children: ReactNode;
  /** Slot between the body and the port legend (edge-to-edge, no padding). */
  readonly footer?: ReactNode;
}

export function NodeContainer({
  kind,
  status,
  appearance,
  name,
  description,
  children,
  footer,
}: NodeContainerProps) {
  const config = NODE_CATALOG[kind];
  const id = useCellId();
  const selected = useIsCellSelected();
  const selectCell = useSelectCell();
  const [menuOpen, setMenuOpen] = useState(false);

  // Derive render state from the previously-seen status (store-prev, no
  // setState-in-effect). `entering` plays the mount rise once, then drops so a
  // running→done flip doesn't replay it as a jump; `doneVisible` is the transient border.
  const [entering, setEntering] = useState(true);
  const [doneVisible, setDoneVisible] = useState(false);
  const [seenStatus, setSeenStatus] = useState(status);
  if (status !== seenStatus) {
    setSeenStatus(status);
    setDoneVisible(status === "success");
    if (status !== "idle") setEntering(false);
  }
  useTimeoutWhen(status === "success", DONE_VISIBLE_MS, () =>
    setDoneVisible(false),
  );
  const hostRef = useRef<HTMLDivElement>(null);

  // Focus follows selection — a just-created node mounts already selected
  // (creation handlers select it), so this also covers focus-on-create without
  // an unconditional mount focus stealing from load / import / paste.
  useEffect(() => {
    if (!selected) {
      return;
    }
    hostRef.current?.focus();
  }, [selected]);

  return (
    <>
      <HTMLHost
        ref={hostRef}
        // `application`: node keystrokes (arrow-key nudging, shortcuts) must reach
        // the app, not the screen reader's virtual cursor. The roledescription is
        // announced in place of the generic "application".
        role="application"
        aria-roledescription="diagram node"
        aria-label={`${name ?? config.title} node`}
        onFocus={(e) => {
          e.stopPropagation();
          selectCell();
        }}
        data-node-id={id}
        onPointerDownCapture={selectCell}
        style={{ width: config.width }}
        className={cn(
          "select-none overflow-hidden rounded-lg border bg-card text-card-foreground transition-[box-shadow,border-color] duration-200 ease-out",
          kind === "tool"
            ? "border-dashed border-foreground/45"
            : "border-border",
          status === "running" && "border-status-running/60",
          status === "success" && doneVisible && "border-status-success/60",
          status === "error" && "border-status-error/70",
          status !== "running" && !selected && "node-elevation",
          // WebKit can't paint the box-shadow glow inside a foreignObject, so use a
          // plain primary border there; the glow stays the cue everywhere else.
          selected && (IS_APPLE_WEBKIT ? "border-primary" : "node-glow-selected"),
          status === "running"
            ? "animate-node-running"
            : entering && "animate-node-in",
          getAppearanceClass(appearance),
        )}
      >
        {/* The node grows/shrinks with its content. `interpolate-size` makes
            `height` animatable to/from the content's intrinsic (auto) size, so
            the resize eases in CSS alone — no JS measuring. Unsupported browsers
            simply snap; reduced motion snaps too. */}
        <div className="overflow-hidden transition-[height] duration-200 ease-out [interpolate-size:allow-keywords] motion-reduce:transition-none">
          <NodeHeader
            config={config}
            status={status}
            title={name ?? config.title}
            description={description ?? config.description}
            onToggleMenu={() => setMenuOpen((open) => !open)}
          />
          <div
            className={cn(
              "px-3.5 pb-3 pt-1.5",
              kind === "tool" && "bg-muted/30",
            )}
          >
            {children}
          </div>
          {footer}
          <PortLegend kind={kind} />
        </div>
      </HTMLHost>

      <NodeStatusBadge status={status} />

      {menuOpen ? <NodeContextMenu onClose={() => setMenuOpen(false)} /> : null}
    </>
  );
}
