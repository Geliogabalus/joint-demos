/** The left palette (FR-05): a searchable, sectioned list of draggable node kinds. */
import { useState } from 'react';
import { Stencil, useGraph, useSelection, useStencil } from '@joint/react-plus';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAnnounce } from '@/components/ui/announcer-context';
import { RenderNode } from '@/components/nodes/render-node';
import { NodeIconChip } from '@/components/nodes/node-icon-chip';
import { useWorkflowCells } from '@/hooks/use-workflow-cells';
import { createNode, createStencilTemplate } from '@/workflow/build-node';
import { NODE_CATALOG, type ConfigKind } from '@/workflow/node-catalog';
import type { WorkflowElement, WorkflowLink } from '@/workflow/workflow-types';

const AUDIT_BASE = 'https://www.accessibilitychecker.org/audit/';

interface Section {
  readonly title: string;
  readonly kinds: readonly ConfigKind[];
}

const SECTIONS: readonly Section[] = [
    { title: 'Inputs', kinds: ['input', 'skill'] },
    { title: 'Agent', kinds: ['agent'] },
    { title: 'Tools', kinds: ['tool'] },
    { title: 'Output', kinds: ['output'] },
];

interface StencilItemProps {
  readonly kind: ConfigKind;
  /** Fired alongside drag-start so the mobile drawer can close (no-op on desktop). */
  readonly onDragStart?: () => void;
}

/** A draggable palette entry; Enter / Space adds the node without a mouse (accessibility). */
function StencilItem({ kind, onDragStart }: StencilItemProps) {
    const { startCellDrag } = useStencil();
    const { setCell } = useGraph<WorkflowElement, WorkflowLink>();
    const { selectCells } = useSelection();
    const cells = useWorkflowCells();
    const announce = useAnnounce();
    const config = NODE_CATALOG[kind];

    /** Keyboard alternative to dragging: drop the node (cascaded so repeats don't stack), select + focus it. */
    function addToCanvas() {
        const count = cells.filter((cell) => cell.type === 'element').length;
        const offset = (count % 6) * 36;
        const node = createNode(kind, { x: 200 + offset, y: 160 + offset });
        const { id } = node;
        setCell(node);
        if (id == null) return;
        selectCells([id]);
        announce(
            `Added ${config.title} to the canvas. Use the arrow keys to move it.`,
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onPointerDown={(event) => {
                        startCellDrag(createStencilTemplate(kind), event);
                        onDragStart?.();
                    }}
                    onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        addToCanvas();
                        onDragStart?.();
                    }}
                    className="flex w-full cursor-grab items-center gap-2.5 rounded-lg border border-border bg-card/60 px-2.5 py-2 text-left transition-colors hover:bg-accent active:cursor-grabbing"
                >
                    <NodeIconChip kind={kind} className="size-6 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{config.title}</div>
                        <div className="truncate text-[11px] leading-snug text-muted-foreground">
                            {config.description}
                        </div>
                    </div>
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
                {config.description}
            </TooltipContent>
        </Tooltip>
    );
}

interface WorkflowStencilProps {
  /** Called when an item starts dragging — closes the mobile drawer. */
  readonly onDragStart?: () => void;
}

export function WorkflowStencil({ onDragStart }: WorkflowStencilProps) {
    const { selectCells } = useSelection();
    const [query, setQuery] = useState('');
    const needle = query.trim().toLowerCase();

    function matchesQuery(kind: ConfigKind) {
        if (!needle) return true;
        const config = NODE_CATALOG[kind];
        return (
            config.title.toLowerCase().includes(needle) ||
      config.description.toLowerCase().includes(needle)
        );
    }

    return (
        <Stencil
            renderElement={RenderNode}
            // A dropped node lands selected and takes keyboard focus, so tabbing
            // continues into its controls.
            onCellDrop={({ model }) => {
                const { id } = model;
                if (id == null) return;
                selectCells([id]);
            }}
            className="flex h-full w-full flex-col bg-background"
        >
            <div className="border-b border-border px-3 py-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search nodes…"
                        aria-label="Search nodes"
                        className="h-8 pl-8 text-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto py-2">
                {SECTIONS.map((section) => {
                    const kinds = section.kinds.filter(matchesQuery);
                    if (kinds.length === 0) return null;
                    return (
                        <div key={section.title}>
                            <div className="px-3 pb-0.5 pt-1">
                                <span className="text-[11px] text-muted-foreground">
                                    {section.title}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5 px-2">
                                {kinds.map((kind) => (
                                    <StencilItem
                                        key={kind}
                                        kind={kind}
                                        onDragStart={onDragStart}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* "Check accessibility" link in the footer so it never overlaps the mobile zoom controls. */}
            <div className="border-t border-border px-3 py-3">
                <a
                    href={`${AUDIT_BASE}?website=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Check accessibility"
                    className="flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
                    style={{
                        background:
              'linear-gradient(to right, oklch(0.32 0.04 250), var(--color-primary))',
                    }}
                >
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-run opacity-75 [animation-duration:2s] motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-run" />
                    </span>
                    <svg
                        viewBox="0 0 512 512"
                        className="size-3.5"
                        fill="currentColor"
                        aria-hidden
                    >
                        <path d="M256,112a56,56,0,1,1,56-56A56.06,56.06,0,0,1,256,112Z" />
                        <path d="M432,112.8l-.45.12h0l-.42.13c-1,.28-2,.58-3,.89-18.61,5.46-108.93,30.92-172.56,30.92-59.13,0-141.28-22-167.56-29.47a73.79,73.79,0,0,0-8-2.58c-19-5-32,14.3-32,31.94,0,17.47,15.7,25.79,31.55,31.76v.28l95.22,29.74c9.73,3.73,12.33,7.54,13.6,10.84,4.13,10.59.83,31.56-.34,38.88l-5.8,45L150.05,477.44q-.15.72-.27,1.47l-.23,1.27h0c-2.32,16.15,9.54,31.82,32,31.82,19.6,0,28.25-13.53,32-31.94h0s28-157.57,42-157.57,42.84,157.57,42.84,157.57h0c3.75,18.41,12.4,31.94,32,31.94,22.52,0,34.38-15.74,32-31.94-.21-1.38-.46-2.74-.76-4.06L329,301.27l-5.79-45c-4.19-26.21-.82-34.87.32-36.9a1.09,1.09,0,0,0,.08-.15c1.08-2,6-6.48,17.48-10.79l89.28-31.21a16.9,16.9,0,0,0,1.62-.52c16-6,32-14.3,32-31.93S451,107.81,432,112.8Z" />
                    </svg>
          check accessibility
                </a>
            </div>
        </Stencil>
    );
}
