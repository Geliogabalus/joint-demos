/** Canvas settings (FR-10): infinite vs. fixed-sheet paper + page breaks. */
import { Check, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { PAPER_MODES, type PaperMode } from "./paper-modes";

/** Grid snap presets. 1px reads as "smooth" free dragging. */
const GRID_OPTIONS: readonly { readonly label: string; readonly size: number }[] = [
  { label: "Smooth (1px)", size: 1 },
  { label: "Snap to 8px", size: 8 },
  { label: "Snap to 16px", size: 16 },
];

const MENU_LABEL_CLASS = "text-[11px] uppercase tracking-wide text-muted-foreground";

interface PaperSettingsMenuProps {
  readonly paperMode: PaperMode;
  readonly onModeChange: (mode: PaperMode) => void;
  readonly showPageBreaks: boolean;
  readonly onTogglePageBreaks: () => void;
  readonly gridSize: number;
  readonly onGridSizeChange: (size: number) => void;
}

function getItemClass(active: boolean): string {
  return cn("text-xs", active && "bg-accent font-medium text-accent-foreground");
}

/** Keep the menu open after a choice (these toggles are often flipped several at once). */
const keepOpen = (event: Event) => event.preventDefault();

export function PaperSettingsMenu({
  paperMode,
  onModeChange,
  showPageBreaks,
  onTogglePageBreaks,
  gridSize,
  onGridSizeChange,
}: PaperSettingsMenuProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Canvas settings">
              <Settings2 className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Canvas settings</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel className={MENU_LABEL_CLASS}>Canvas</DropdownMenuLabel>
        {PAPER_MODES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            className={getItemClass(paperMode === value)}
            onSelect={keepOpen}
            onClick={() => onModeChange(value)}
          >
            {label}
            {paperMode === value && <Check className="ml-auto size-3.5" aria-hidden />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={getItemClass(showPageBreaks)}
          onSelect={keepOpen}
          onClick={onTogglePageBreaks}
        >
          Page breaks
          {showPageBreaks && <Check className="ml-auto size-3.5" aria-hidden />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className={MENU_LABEL_CLASS}>Grid</DropdownMenuLabel>
        {GRID_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.size}
            className={getItemClass(gridSize === option.size)}
            onSelect={keepOpen}
            onClick={() => onGridSizeChange(option.size)}
          >
            {option.label}
            {gridSize === option.size && <Check className="ml-auto size-3.5" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
