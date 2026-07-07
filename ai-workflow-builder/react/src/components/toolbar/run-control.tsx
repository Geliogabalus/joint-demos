/** The Run control (FR-13): runs the whole graph in one click. On a blocked/failed
 *  run, a toast surfaces the reason with a one-click "Configure". */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, Play, Square, TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApiKeys } from '@/hooks/use-api-keys';
import type { RunFeedback } from '@/hooks/use-workflow-run';

interface RunControlProps {
  readonly isRunning: boolean;
  readonly onRun: () => void | Promise<RunFeedback | null>;
  readonly onStop: () => void;
}

export function RunControl({ isRunning, onRun, onStop }: RunControlProps) {
    const { openKeys } = useApiKeys();
    const [feedback, setFeedback] = useState<RunFeedback | null>(null);

    async function handleRun() {
        setFeedback(null);
        setFeedback((await onRun()) ?? null);
    }

    // Toasts are transient; clear after a few seconds.
    useEffect(() => {
        if (!feedback) return;
        const timer = window.setTimeout(() => setFeedback(null), 7000);
        return () => clearTimeout(timer);
    }, [feedback]);

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Connect a model (API keys)"
                        onClick={() => openKeys()}
                    >
                        <KeyRound className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Connect a model</TooltipContent>
            </Tooltip>
            <Button
                variant="run"
                className="gap-1.5"
                onClick={isRunning ? onStop : handleRun}
            >
                {isRunning ? (
                    <Square className="size-3.5 fill-current" />
                ) : (
                    <Play className="size-3.5 fill-current" />
                )}
                {isRunning ? 'Stop' : 'Run'}
            </Button>

            {feedback
                ? createPortal(
                    <div
                        role="alert"
                        className="fixed bottom-5 left-1/2 z-50 flex max-w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-lg border border-destructive/40 bg-popover px-4 py-3 text-sm text-popover-foreground shadow-md"
                    >
                        <TriangleAlert className="size-4 shrink-0 text-destructive" />
                        <span className="min-w-0 flex-1 whitespace-pre-line">
                            {feedback.message}
                        </span>
                        {feedback.canConfigure ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    openKeys();
                                    setFeedback(null);
                                }}
                            >
                  Configure
                            </Button>
                        ) : null}
                        <button
                            type="button"
                            aria-label="Dismiss"
                            onClick={() => setFeedback(null)}
                            className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    </div>,
                    document.body,
                )
                : null}
        </>
    );
}
