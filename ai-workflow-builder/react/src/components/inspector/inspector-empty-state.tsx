import { useEffect, useState } from 'react';
import { Collapsible } from '@/components/ui/collapsible';

const HINTS = [
    'Drag from the palette to add a node',
    'Connect ports by dragging from a node edge',
    'Right-click the canvas to add a sticky note',
    'Select a node to edit its properties here',
    'Scroll to pan — pinch to zoom the canvas',
];

const SHORTCUTS = [
    { key: '⌘Z', label: 'Undo' },
    { key: '⌘⇧Z', label: 'Redo' },
    { key: '⌫', label: 'Delete selected' },
    { key: '⌘C / ⌘V', label: 'Copy / Paste' },
    { key: '⌘A', label: 'Select all' },
    { key: '⇧ + drag', label: 'Multi-select' },
    { key: 'Scroll / Space + drag', label: 'Pan canvas' },
    { key: 'Pinch / ⌘ + scroll', label: 'Zoom' },
];

function WorkflowIllustration() {
    return (
        <svg viewBox="0 0 80 58" width="80" height="58" aria-hidden className="text-border" style={{ overflow: 'visible' }}>
            <rect x="5" y="7" width="58" height="46" rx="6" fill="currentColor" opacity="0.07" />
            <rect x="2.5" y="2.5" width="58" height="46" rx="5" fill="var(--color-muted)" stroke="currentColor" strokeWidth="1" />
            <rect x="10" y="10" width="34" height="16" rx="2" fill="var(--color-muted-foreground)" opacity="0.22" />
            <rect x="10" y="33" width="34" height="3" rx="1" fill="var(--color-muted-foreground)" opacity="0.28" />
            <rect x="10" y="39" width="22" height="2.5" rx="1" fill="var(--color-muted-foreground)" opacity="0.16" />
            <g transform="translate(48, 38)">
                <path
                    d="M0,0 L0,16 L3.8,12.4 L7,18.5 L9,17.5 L5.8,11.4 L10.5,11.4 Z"
                    fill="var(--color-background)"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}

export function InspectorEmptyState() {
    const [index, setIndex] = useState(0);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    // Cycle the hint. Instant swap, not an opacity crossfade: animating text to
    // opacity 0 momentarily drops it below WCAG contrast and trips a11y audits.
    useEffect(() => {
        const id = window.setInterval(
            () => setIndex((i) => (i + 1) % HINTS.length),
            3500,
        );
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
                <WorkflowIllustration />
                <p className="mb-4 min-h-8 text-center text-xs leading-relaxed text-muted-foreground">
                    {HINTS[index]}
                </p>
            </div>

            <div>
                <div className="border-t border-border/60 pt-3 pb-2">
                    <Collapsible
                        title="Keyboard shortcuts"
                        open={shortcutsOpen}
                        onToggle={() => setShortcutsOpen((o) => !o)}
                        contentClassName="mt-1 flex flex-col gap-0"
                    >
                        {SHORTCUTS.map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between py-1">
                                <span className="text-[11px] text-muted-foreground">{label}</span>
                                {/* UI font (not mono): ⌘⇧⌫ render as crisp glyphs in the system
                    sans, muddy in monospace. Bumped size/weight/contrast for legibility. */}
                                <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium leading-none text-foreground/80">
                                    {key}
                                </kbd>
                            </div>
                        ))}
                    </Collapsible>
                </div>
            </div>
        </div>
    );
}
