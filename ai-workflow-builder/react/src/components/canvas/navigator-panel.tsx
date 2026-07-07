import { useState } from 'react';
import {
    Navigator,
    useGraph,
    usePaperScroller,
    usePaperScrollerViewport,
} from '@joint/react-plus';
import { ChevronDown, Map, Maximize, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/cn';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3.0;
const STEP = 0.2;
/** Padding (px) around the content when framing it — shared with the canvas's initial fit. */
export const FIT_CONTENT_MARGIN = 60;
// Slider works in integer "ticks"; 0..TICKS maps onto MIN_ZOOM..MAX_ZOOM.
const TICKS = 100;

function zoomToTick(zoom: number): number {
    return Math.round(((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * TICKS);
}
function tickToZoom(tick: number): number {
    return MIN_ZOOM + (tick / TICKS) * (MAX_ZOOM - MIN_ZOOM);
}
function clampZoom(zoom: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function NavigatorPanel() {
    const { paperScroller, setZoom, zoomToFit } = usePaperScroller();
    const { graph } = useGraph();
    const { zoom, canZoomIn, canZoomOut } = usePaperScrollerViewport();
    const [mapOpen, setMapOpen] = useState(true);
    const percent = Math.round(zoom * 100);
    // Glide to frame all content (vs. zoomToFit's instant jump); curve in index.css.
    function fitToScreen() {
    // Content bounds from the React graph store; empty graph → plain fit.
        const area = graph.getBBox();
        if (!paperScroller || !area) {
            zoomToFit();
            return;
        }
        area.inflate(FIT_CONTENT_MARGIN);
        paperScroller.transitionToRect(area, {
            maxScale: 1,
            minScale: MIN_ZOOM,
            visibility: 1,
            duration: '0.3s',
        });
    }

    return (
        <div className="absolute bottom-3 right-3 z-10 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-popover/80 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-popover/70">
            {/* Collapse animates grid-rows 0fr→1fr; sits behind the controls row (lower z + opaque bg) so it tucks behind the bar, not squishes. */}
            <div
                className={cn(
                    'relative z-0 hidden overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out md:grid',
                    mapOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
            >
                {/* Divider lives on the map (inside the clip) so it disappears when collapsed. */}
                <div
                    className={cn(
                        'overflow-hidden transition-transform duration-200 ease-out',
                        mapOpen ? 'translate-y-0' : 'translate-y-3',
                    )}
                >
                    <Navigator className="h-28 w-full border-b border-border/50" />
                </div>
            </div>

            {/* Opaque + above the map (z-10) so the collapsing map tucks behind this bar. */}
            <div className="relative z-10 flex items-center gap-0.5 bg-popover px-1.5 py-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden size-6 text-muted-foreground hover:text-foreground md:inline-flex"
                    aria-label={mapOpen ? 'Hide mini-map' : 'Show mini-map'}
                    aria-expanded={mapOpen}
                    onClick={() => setMapOpen((open) => !open)}
                >
                    {mapOpen ? (
                        <ChevronDown className="size-3.5" />
                    ) : (
                        <Map className="size-3.5" />
                    )}
                </Button>
                <div className="mx-0.5 hidden h-3.5 w-px shrink-0 bg-border/70 md:block" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    aria-label="Zoom out"
                    disabled={!canZoomOut}
                    onClick={() => setZoom((previous) => clampZoom(previous - STEP))}
                >
                    <Minus className="size-3.5" />
                </Button>

                <Slider
                    className="w-20 md:w-24"
                    aria-label="Zoom level"
                    // Slider works in 0..TICKS — announce percent, not the raw tick, to screen readers.
                    aria-valuetext={`${percent}%`}
                    min={0}
                    max={TICKS}
                    step={1}
                    value={[zoomToTick(zoom)]}
                    onValueChange={([tick]) => setZoom(clampZoom(tickToZoom(tick)))}
                />

                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    aria-label="Zoom in"
                    disabled={!canZoomIn}
                    onClick={() => setZoom((previous) => clampZoom(previous + STEP))}
                >
                    <Plus className="size-3.5" />
                </Button>

                <span
                    aria-live="polite"
                    className="w-9 shrink-0 text-center font-mono text-[11px] tabular-nums text-muted-foreground"
                >
                    {percent}%
                </span>

                <div className="mx-0.5 h-3.5 w-px shrink-0 bg-border/70" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    aria-label="Fit to screen"
                    onClick={fitToScreen}
                >
                    <Maximize className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
