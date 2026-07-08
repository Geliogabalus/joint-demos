import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { usePress } from '@/hooks/use-press';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MarkdownView } from '@/components/ui/markdown';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import type { OutputNodeData } from '@/workflow/workflow-types';

// Rendered Markdown result, or a hint to run the flow. Caller controls height.
export function MarkdownResult({ markdown }: { readonly markdown: string }) {
    if (!markdown) {
        return (
            <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
        Run the flow to see the output…
            </p>
        );
    }
    return <MarkdownView markdown={markdown} />;
}

function ResultDialog({
    open,
    onOpenChange,
    markdown,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly markdown: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Result</DialogTitle>
                    <DialogDescription>Formatted output from the flow.</DialogDescription>
                </DialogHeader>
                <div className="-mx-1 max-h-[70vh] overflow-auto px-1">
                    <MarkdownResult markdown={markdown} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ExpandableResult({
    markdown,
    boxClassName,
}: {
  readonly markdown: string;
  readonly boxClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    // 'pointerup': node-select on pointerdown re-renders this node, and the
    // re-render can swallow the synthetic click (see usePress activateOn).
    const expandPress = usePress(() => setOpen(true), { activateOn: 'pointerup' });
    return (
    // stopPropagation goes on the scroll box + button, NOT this wrapper: React
    // bubbles the portaled dialog's overlay events through the tree, so a
    // wrapper-level stop swallows Radix's click-outside.
        <div className="relative min-w-0">
            <div
                // Stop pointerdown reaching the node so scrolling the result doesn't drag it.
                onPointerDown={(event) => event.stopPropagation()}
                data-jj-scrollable
                className={cn(
                    'overflow-auto overscroll-contain rounded-md border border-border bg-muted/30 px-3 py-2',
                    boxClassName,
                )}
            >
                <MarkdownResult markdown={markdown} />
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label="Open result in full screen"
                        onPointerDown={(event) => {
                            event.stopPropagation();
                            expandPress.onPointerDown(event);
                        }}
                        onPointerMove={expandPress.onPointerMove}
                        onPointerUp={(event) => {
                            event.stopPropagation();
                            expandPress.onPointerUp(event);
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            expandPress.onClick(event);
                        }}
                        className={cn(
                            'absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md',
                            'border border-border/60 bg-card/85 text-muted-foreground shadow-sm backdrop-blur-sm',
                            'transition-colors hover:text-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                    >
                        <Maximize2 className="size-3.5 pointer-events-none" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Full screen</TooltipContent>
            </Tooltip>
            <ResultDialog open={open} onOpenChange={setOpen} markdown={markdown} />
        </div>
    );
}

export function OutputBody({ data }: { readonly data: OutputNodeData }) {
    // Capped + scrollable in the node (expand opens full screen) so it can't grow unbounded.
    if (!data.markdown) return <MarkdownResult markdown="" />;
    return <ExpandableResult markdown={data.markdown} boxClassName="max-h-56" />;
}
