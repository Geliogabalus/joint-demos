/** Export (JSON / PNG / WebP) and Import JSON (FR-14). */
import { useMemo, useRef, type ChangeEvent } from 'react';
import { useImageExport } from '@joint/react-plus';
import { Download, FileImage, FileJson, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { downloadJson } from '@/utils/download';
import type { Theme } from '@/hooks/use-theme';
import type { WorkflowCell } from '@/workflow/workflow-types';

// Raster-export background per theme — mirrors `--canvas` in index.css (else exports default to white).
const CANVAS_BG: Record<Theme, string> = {
    light: 'oklch(0.965 0.004 27)',
    dark: 'oklch(0.155 0.006 27)',
};

const ICON_CLASS = 'size-3.5';

interface ExportMenuProps {
  readonly cells: readonly WorkflowCell[];
  readonly onImport: (cells: WorkflowCell[]) => void;
  readonly theme: Theme;
}

export function ExportMenu({ cells, onImport, theme }: ExportMenuProps) {
    // `useImageExport` captures options per render, so a theme switch is picked up next export.
    const exportOptions = useMemo(
        () => ({ padding: 24, backgroundColor: CANVAS_BG[theme] }),
        [theme]
    );
    const [exportPng] = useImageExport({ type: 'image/png', ...exportOptions });
    const [exportWebp] = useImageExport({ type: 'image/webp', ...exportOptions });
    const fileRef = useRef<HTMLInputElement>(null);

    async function onFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            const parsed: WorkflowCell[] = JSON.parse(await file.text());
            onImport(parsed);
        } catch {
            // Ignore malformed JSON — a production app would surface a toast here.
        }
    }

    return (
        <>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Export / import">
                                <Download className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Export / import</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => downloadJson(cells, 'workflow.json')}>
                        <FileJson className={ICON_CLASS} />
            Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void exportPng({ downloadAs: 'workflow' })}>
                        <FileImage className={ICON_CLASS} />
            Export PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void exportWebp({ downloadAs: 'workflow' })}>
                        <FileImage className={ICON_CLASS} />
            Export WebP
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                        <Upload className={ICON_CLASS} />
            Import JSON
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <input
                ref={fileRef}
                type="file"
                accept="application/json"
                aria-label="Import workflow JSON file"
                className="hidden"
                onChange={onFile}
            />
        </>
    );
}
