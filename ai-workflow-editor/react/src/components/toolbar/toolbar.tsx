/** Top toolbar: brand, panel toggles, edit actions, and the Run/export/theme cluster.
 *  Responsive: edit + canvas controls are inline at `md:`+ and collapse into one overflow menu below. */
import {
  LayoutGrid,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Redo2,
  Undo2,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  useGraph,
  useGraphHistory,
  useGraphHistoryStack,
} from "@joint/react-plus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Separator } from "@/components/ui/separator";
import { autoArrange } from "@/workflow/auto-arrange";
import type { RunFeedback } from "@/hooks/use-workflow-run";
import type { Theme } from "@/hooks/use-theme";
import type {
  WorkflowCell,
  WorkflowElement,
  WorkflowLink,
} from "@/workflow/workflow-types";
import { Brand } from "./brand";
import { ExportMenu } from "./export-menu";
import { PAPER_MODES, type PaperMode } from "./paper-modes";
import { PaperSettingsMenu } from "./paper-settings-menu";
import { RunControl } from "./run-control";
import { ThemeToggle } from "./theme-toggle";

interface ToolbarProps {
  readonly cells: readonly WorkflowCell[];
  readonly isRunning: boolean;
  readonly onRun: () => void | Promise<RunFeedback | null>;
  readonly onStop: () => void;
  readonly onImport: (cells: WorkflowCell[]) => void;
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
  readonly paperMode: PaperMode;
  readonly onModeChange: (mode: PaperMode) => void;
  readonly showPageBreaks: boolean;
  readonly onTogglePageBreaks: () => void;
  readonly gridSize: number;
  readonly onGridSizeChange: (size: number) => void;
  readonly stencilOpen: boolean;
  readonly onToggleStencil: () => void;
  readonly inspectorOpen: boolean;
  readonly onToggleInspector: () => void;
}

interface EditAction {
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly onClick: () => void;
  readonly disabled?: boolean;
}

export function Toolbar({
  cells,
  isRunning,
  onRun,
  onStop,
  onImport,
  theme,
  onToggleTheme,
  paperMode,
  onModeChange,
  showPageBreaks,
  onTogglePageBreaks,
  gridSize,
  onGridSizeChange,
  stencilOpen,
  onToggleStencil,
  inspectorOpen,
  onToggleInspector,
}: ToolbarProps) {
  const { setCell, transaction } = useGraph<WorkflowElement, WorkflowLink>();
  const history = useGraphHistory();
  const stack = useGraphHistoryStack();

  function arrange() {
    // One transaction: every move collapses into a single undo entry + one
    // re-render, and reverts as a unit if anything throws.
    transaction(() => {
      for (const { id, position } of autoArrange(cells)) {
        setCell(id, (previous) => ({
          ...previous,
          position,
        }));
      }
    });
  }

  // Rendered inline (desktop) and in the overflow menu (mobile); only canvas-wide edits.
  const editActions: readonly EditAction[] = [
    { label: "Auto-arrange", icon: LayoutGrid, onClick: arrange },
    {
      label: "Undo",
      icon: Undo2,
      disabled: !stack?.canUndo,
      onClick: () => history?.undo(),
    },
    {
      label: "Redo",
      icon: Redo2,
      disabled: !stack?.canRedo,
      onClick: () => history?.redo(),
    },
  ];

  return (
    <header className="flex items-center gap-1 border-b border-border bg-background px-2 py-2 sm:px-3">
      <Brand />
      <IconButton
        label={stencilOpen ? "Hide element palette" : "Show element palette"}
        icon={PanelLeft}
        onClick={onToggleStencil}
        expanded={stencilOpen}
      />
      <Separator orientation="vertical" className="mx-2 hidden h-5 md:block" />

      {/* Desktop: edit actions + canvas settings inline. */}
      <div className="hidden items-center gap-1 md:flex">
        {editActions.map((action) => (
          <IconButton key={action.label} {...action} />
        ))}
        <PaperSettingsMenu
          paperMode={paperMode}
          onModeChange={onModeChange}
          showPageBreaks={showPageBreaks}
          onTogglePageBreaks={onTogglePageBreaks}
          gridSize={gridSize}
          onGridSizeChange={onGridSizeChange}
        />
      </div>

      {/* Mobile: those same controls collapse into one overflow menu. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="More actions"
            className="md:hidden"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          {editActions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              disabled={action.disabled}
              onClick={action.onClick}
              className="text-xs"
            >
              <action.icon className="size-3.5" />
              {action.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {PAPER_MODES.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              className="text-xs"
              onClick={() => onModeChange(value)}
            >
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem className="text-xs" onClick={onTogglePageBreaks}>
            {showPageBreaks ? "Hide page breaks" : "Show page breaks"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Run is the primary CTA: `order-last` floats it far-right on mobile, source order on desktop. */}
        <span className="order-last flex md:order-none">
          <RunControl isRunning={isRunning} onRun={onRun} onStop={onStop} />
        </span>
        <ExportMenu cells={cells} onImport={onImport} theme={theme} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <IconButton
          label={inspectorOpen ? "Hide properties" : "Show properties"}
          icon={PanelRight}
          onClick={onToggleInspector}
          expanded={inspectorOpen}
        />
      </div>
    </header>
  );
}
