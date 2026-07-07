// Composition root. The controlled `cells` array is the single source of truth:
// <Diagram cells onCellsChange> renders it and every edit flows back through setCells.
import { useState } from "react";
import {
  Diagram,
  useCells,
  useSelection,
  type InteractionsOptions,
} from "@joint/react-plus";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnnouncerProvider } from "@/components/ui/announcer";
import { ApiKeysProvider } from "@/hooks/api-keys-provider";
import { SlideOver } from "@/components/ui/slide-over";
import { isDesktopViewport } from "@/components/ui/viewport";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";
import { Inspector } from "@/components/inspector/inspector";
import { WorkflowStencil } from "@/components/stencil/workflow-stencil";
import { Toolbar } from "@/components/toolbar/toolbar";
import type { PaperMode } from "@/components/toolbar/paper-modes";
import { useTheme } from "@/hooks/use-theme";
import { WorkflowCellsProvider } from "@/hooks/workflow-cells-provider";
import { useWorkflowRun } from "@/hooks/use-workflow-run";
import { INITIAL_CELLS } from "@/workflow/initial-graph";
import { selectElements } from "@/workflow/selectors";
import type {
  WorkflowCell,
} from "@/workflow/workflow-types";

interface WorkspaceProps {
  readonly cells: readonly WorkflowCell[];
  readonly setCells: (cells: WorkflowCell[]) => void;
}

// The workspace lives inside <Diagram> so its hooks can reach the graph.
function Workspace({ cells, setCells }: WorkspaceProps) {
  const { theme, toggle } = useTheme();
  const { isRunning, run, stop } = useWorkflowRun();
  const { collection } = useSelection();
  const [paperMode, setPaperMode] = useState<PaperMode>("infinite");
  const [showPageBreaks, setShowPageBreaks] = useState(false);
  // Grid snap step in px; 1 = smooth free dragging.
  const [gridSize, setGridSize] = useState(1);
  // Panels open on desktop, closed on mobile.
  const [stencilOpen, setStencilOpen] = useState(isDesktopViewport);
  const [inspectorOpen, setInspectorOpen] = useState(isDesktopViewport);

  // The currently selected cells, passed to the inspector (which edits them).
  const selectedCells = useCells<WorkflowCell>(collection);

  // Auto-open the inspector on selection change: compare the selection key to the
  // previous one *in state* so it opens without setState-in-effect. Derived from
  // `selectedCells` (already subscribed) — no second useCells subscription needed.
  const selectionKey = selectElements(selectedCells)
    .map((cell) => cell.id)
    .join("|");
  const [seenSelectionKey, setSeenSelectionKey] = useState(selectionKey);
  if (selectionKey !== seenSelectionKey) {
    setSeenSelectionKey(selectionKey);
    if (selectionKey !== "" && !inspectorOpen) setInspectorOpen(true);
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <Toolbar
        cells={cells}
        isRunning={isRunning}
        onRun={run}
        onStop={stop}
        onImport={setCells}
        theme={theme}
        onToggleTheme={toggle}
        paperMode={paperMode}
        onModeChange={setPaperMode}
        showPageBreaks={showPageBreaks}
        onTogglePageBreaks={() => setShowPageBreaks((value) => !value)}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        stencilOpen={stencilOpen}
        onToggleStencil={() => setStencilOpen((value) => !value)}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen((value) => !value)}
      />
      <main className="relative flex min-h-0 flex-1">
        {/* Page heading for assistive tech (visually hidden; the brand wordmark carries it for sighted users). */}
        <h1 className="sr-only">AI Workflow Builder</h1>
        <SlideOver
          open={stencilOpen}
          onClose={() => setStencilOpen(false)}
          side="left"
          label="Nodes"
        >
          {/* Mobile only: close on drag-start to uncover the canvas drop target. */}
          <WorkflowStencil
            onDragStart={() => !isDesktopViewport() && setStencilOpen(false)}
          />
        </SlideOver>
        <WorkflowCanvas
          cells={cells}
          paperMode={paperMode}
          showPageBreaks={showPageBreaks}
          gridSize={gridSize}
          isRunning={isRunning}
        />
        <SlideOver
          open={inspectorOpen}
          onClose={() => setInspectorOpen(false)}
          side="right"
          label="Properties"
        >
          <Inspector cells={selectedCells} />
        </SlideOver>
      </main>
    </div>
  );
}

const INTERACTIONS: InteractionsOptions = {
  // keyboard:false disables built-in shortcuts (not the Keyboard) so useWorkflowShortcuts owns them.
  keyboard: false,
  wheelAction: "pan",
  // Only affects the Shift+drag rubber-band: it selects elements only; flip to
  // `true` to also grab the links it encloses. Clicking a link selects it either way.
  selectionRegion: { selectLinks: false },
};

export function App() {
  const [cells, setCells] = useState<readonly WorkflowCell[]>(INITIAL_CELLS);
  return (
    <TooltipProvider delayDuration={300}>
      <ApiKeysProvider>
        <Diagram
          cells={cells}
          onCellsChange={setCells}
          // Record edits for undo/redo, but keep a run's transient writes
          // (node status, streamed output, token pills) off the stack.
          history
          clipboard
          // Scroll/blank-drag pan; pinch (⌘/ctrl+scroll) zooms.
          interactions={INTERACTIONS}
        >
          <WorkflowCellsProvider cells={cells}>
            <AnnouncerProvider>
              <Workspace cells={cells} setCells={setCells} />
            </AnnouncerProvider>
          </WorkflowCellsProvider>
        </Diagram>
      </ApiKeysProvider>
    </TooltipProvider>
  );
}
