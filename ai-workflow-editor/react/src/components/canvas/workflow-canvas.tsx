import {
  Overlay,
  PageBreaks,
  Paper,
  PaperScroller,
  Selection,
  Snaplines,
  getSelectionDefaultHandle,
  linkRoutingSmooth,
  useGraph,
  useOnElementsMeasured,
  usePaperScroller,
} from "@joint/react-plus";
import { dia, highlighters } from "@joint/plus";
import { useEffect, useRef, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { RenderNode } from "@/components/nodes/render-node";
import { useAnnounce } from "@/components/ui/announcer-context";
import { PulseHighlighter } from "./pulse-highlighter";
import { cn } from "@/utils/cn";
import { DEFAULT_LINK } from "@/workflow/build-node";
import { connectionRules } from "@/workflow/connection-rules";
import { orientLink } from "@/workflow/link-orientation";
import type {
  CellId,
  WorkflowCell,
  WorkflowElement,
  WorkflowLink,
} from "@/workflow/workflow-types";
import { RunningProvider } from "@/hooks/running-context";
import {
  CanvasContextMenu,
  LinkContextMenu,
  type CanvasMenuState,
  type LinkMenuState,
} from "./canvas-context-menu";
import { ConnectionMenu } from "./connection-menu";
import type { PortRef } from "./connection-menu-util";
import { LinkFlow } from "./link-flow";
import { LinkFocusSelect } from "./interactions/link-focus-select";
import { PortConnectKeys } from "./interactions/port-connect-keys";
import { WorkflowShortcuts } from "./interactions/workflow-shortcuts";
import { FIT_CONTENT_MARGIN, NavigatorPanel } from "./navigator-panel";

interface HoveredLink {
  readonly id: CellId;
  readonly x: number;
  readonly y: number;
}

const WORKFLOW_PAPER_ID = "default-paper";

function LinkHoverActions({
  link,
  onHide,
  onDelete,
}: {
  readonly link: HoveredLink;
  readonly onHide: () => void;
  readonly onDelete: () => void;
}) {
  const { removeCell } = useGraph<WorkflowElement, WorkflowLink>();
  const announce = useAnnounce();
  const btnClass =
    "grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors duration-150";
  return (
    <Overlay x={link.x} y={link.y - 14} origin="bottom">
      <div
        className="flex items-center gap-1.5"
        onMouseEnter={onHide /* re-enter cancels the hide timer */}
      >
        <button
          type="button"
          aria-label="Delete link"
          onClick={() => {
            removeCell(link.id);
            announce("Connection removed.");
            // Removed link emits no mouseleave, so clear hover or buttons linger.
            onDelete();
          }}
          className={cn(
            btnClass,
            "hover:border-destructive hover:bg-destructive hover:text-white",
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </Overlay>
  );
}

const SMOOTH_LINKS = linkRoutingSmooth();
const SHEET = { width: 1600, height: 1120 };
// The Paper `highlighting` / `highlighterNamespace` props forward JointJS' own
// option shape, so the MAGNET_AVAILABILITY key and the `highlighters` namespace
// are used raw here — there is no react-side constant for them (this mirrors
// joint-react's own paper preset).
const HIGHLIGHTING = {
  [dia.CellView.Highlighting.MAGNET_AVAILABILITY]: {
    name: "pulse",
    options: { radius: 11 },
  },
};
const HIGHLIGHTER_NAMESPACE = { ...highlighters, pulse: PulseHighlighter };

interface WorkflowCanvasProps {
  readonly cells: readonly WorkflowCell[];
  readonly paperMode: "infinite" | "sheets";
  readonly showPageBreaks: boolean;
  /** Grid snap step in px (1 = smooth). The visible dot grid stays fixed. */
  readonly gridSize: number;
  readonly isRunning: boolean;
}

export function WorkflowCanvas({
  cells,
  paperMode,
  showPageBreaks,
  gridSize,
  isRunning,
}: WorkflowCanvasProps) {
  const [menu, setMenu] = useState<CanvasMenuState | null>(null);
  const [linkMenu, setLinkMenu] = useState<LinkMenuState | null>(null);
  const [hoveredLink, setHoveredLink] = useState<HoveredLink | null>(null);
  const [connectTarget, setConnectTarget] = useState<PortRef | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      // A hide timer pending at unmount would set state on an unmounted tree.
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Fit once nodes are first measured — the scroller centres at mount before HTML
  // nodes report size, so an early fit lands on empty canvas. `isInitial` flags
  // that first measurement.
  const { zoomToFit } = usePaperScroller();
  useOnElementsMeasured(({ isInitial }) => {
    if (isInitial) zoomToFit({ maxScale: 1, contentMargin: FIT_CONTENT_MARGIN });
  });

  function showLinkActions(id: CellId, x: number, y: number) {
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    setHoveredLink({ id, x, y });
  }

  function scheduleLinkHide() {
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setHoveredLink(null), 150);
  }

  // Show the link's hover actions only while the link still exists (a removed link
  // emits no mouseleave) and not under the connect menu (both are plain overlays).
  const shouldShowLinkActions =
    !connectTarget &&
    hoveredLink != null &&
    cells.some((cell) => cell.type === "link" && cell.id === hoveredLink.id);

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="canvas-glow pointer-events-none absolute inset-0"
      />
      <RunningProvider value={isRunning}>
        <PaperScroller
          className="relative size-full touch-none bg-transparent"
          mode={paperMode}
          sheetWidth={SHEET.width}
          sheetHeight={SHEET.height}
        >
          <Paper
            id={WORKFLOW_PAPER_ID}
            className={cn(
              "bg-transparent",
              paperMode === "sheets" &&
                "rounded-lg border border-border bg-canvas shadow-md",
            )}
            gridSize={gridSize}
            drawGridSize={16}
            // The dot grid is the paper default; its color comes from the
            // `--jj-paper-grid-color` CSS var (themed light/dark in index.css).
            snapLinks={{ radius: 40 }}
            renderElement={RenderNode}
            renderLink={LinkFlow}
            linkRouting={SMOOTH_LINKS}
            markAvailable
            highlighting={HIGHLIGHTING}
            highlighterNamespace={HIGHLIGHTER_NAMESPACE}
            validateConnection={connectionRules}
            defaultLink={DEFAULT_LINK}
            onLinkMouseEnter={({ id, view }) => {
              // mouseenter has no x/y — anchor to the link midpoint (paper coords).
              const mid = view.getPointAtRatio(0.5);
              if (mid) showLinkActions(id, mid.x, mid.y);
            }}
            onLinkMouseLeave={scheduleLinkHide}
            onLinkContextMenu={({ event, x, y, id }) => {
              event.preventDefault();
              setMenu(null);
              setLinkMenu({ id, x, y });
            }}
            onBlankContextMenu={({ event, x, y }) => {
              event.preventDefault();
              setLinkMenu(null);
              setMenu({ x, y });
            }}
            // A port click (not a drag) opens the connect popup; a drag draws a
            // link and never fires pointerclick, so dragging shows no popup.
            onElementMagnetPointerClick={({ model, port }) => {
              if (port) setConnectTarget({ cellId: model.id, portId: port });
            }}
            onLinkConnect={({ model }) => orientLink(model)}
          >
            <Selection
              allowTranslate
              wrapper={{
                handles: () => {
                  // Re-skin the built-in "clone" handle as a Copy action; pair it
                  // with the built-in "remove" handle.
                  const copy = {
                    ...getSelectionDefaultHandle("clone"),
                    content: <Copy className="size-3.5" />,
                    title: "Copy",
                  };
                  return [copy, getSelectionDefaultHandle("remove")];
                },
              }}
            />
            <Snaplines />
            {/* Inside the Paper so usePaper() + useOnKeyboardEvents resolve. */}
            <PortConnectKeys onOpen={setConnectTarget} />
            {/* Tab onto a link → select it (keyboard path to Delete a link). */}
            <LinkFocusSelect />
            {/* Inside the Paper so useSelection() resolves (arrow-key nudge needs live SelectionView). */}
            <WorkflowShortcuts />
            {showPageBreaks ? (
              <PageBreaks
                x={0}
                y={0}
                width={SHEET.width}
                height={SHEET.height}
              />
            ) : null}
            {menu ? (
              <CanvasContextMenu menu={menu} onClose={() => setMenu(null)} />
            ) : null}
            {linkMenu ? (
              <LinkContextMenu
                menu={linkMenu}
                onClose={() => setLinkMenu(null)}
              />
            ) : null}
            {connectTarget ? (
              <ConnectionMenu
                portRef={connectTarget}
                onClose={() => setConnectTarget(null)}
              />
            ) : null}
            {shouldShowLinkActions && hoveredLink && (
              <LinkHoverActions
                link={hoveredLink}
                onHide={() => {
                  if (hideTimerRef.current !== null)
                    clearTimeout(hideTimerRef.current);
                }}
                onDelete={() => setHoveredLink(null)}
              />
            )}
          </Paper>
        </PaperScroller>
      </RunningProvider>

      <NavigatorPanel />
    </div>
  );
}
