import { useState, type KeyboardEvent } from 'react';
import { MarkdownView } from '@/components/ui/markdown';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';

const TABS = ['write', 'preview'] as const;
type Tab = (typeof TABS)[number];

// Markdown note editor: a Write/Preview segmented control over one text value.
export function NoteEditor({
    text,
    onChange,
}: {
  readonly text: string;
  readonly onChange: (text: string) => void;
}) {
    const [tab, setTab] = useState<Tab>('write');

    // WAI-ARIA tabs: arrows/Home/End move selection, focus follows; the roving
    // tabIndex below keeps only the selected tab in the Tab order.
    function onTablistKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const index = TABS.indexOf(tab);
        const next =
      event.key === 'ArrowRight'
          ? TABS[(index + 1) % TABS.length]
          : event.key === 'ArrowLeft'
              ? TABS[(index - 1 + TABS.length) % TABS.length]
              : event.key === 'Home'
                  ? TABS[0]
                  : event.key === 'End'
                      ? TABS[TABS.length - 1]
                      : undefined;
        if (!next) return;
        event.preventDefault();
        setTab(next);
        document.getElementById(`note-tab-${next}`)?.focus();
    }

    return (
        <div className="space-y-2">
            <div
                role="tablist"
                aria-label="Note editor"
                onKeyDown={onTablistKeyDown}
                className="inline-flex rounded-md bg-muted p-0.5 text-xs"
            >
                {TABS.map((value) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        id={`note-tab-${value}`}
                        aria-selected={tab === value}
                        aria-controls={`note-panel-${value}`}
                        tabIndex={tab === value ? 0 : -1}
                        onClick={() => setTab(value)}
                        className={cn(
                            'rounded-[5px] px-2.5 py-1 capitalize transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            tab === value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {value}
                    </button>
                ))}
            </div>

            {tab === 'write' ? (
            // tabpanel goes on the wrapper, not the <textarea> (a textarea can't take
            // role="tabpanel" — aria-allowed-role).
                <div role="tabpanel" id="note-panel-write" aria-labelledby="note-tab-write">
                    <Textarea
                        aria-label="Note Markdown source"
                        value={text}
                        rows={6}
                        placeholder="Write Markdown…"
                        onChange={(event) => onChange(event.target.value)}
                        className="resize-none font-mono text-sm field-sizing-content min-h-28 max-h-72"
                    />
                </div>
            ) : (
                <div
                    role="tabpanel"
                    id="note-panel-preview"
                    aria-labelledby="note-tab-preview"
                    className="max-h-72 min-h-28 overflow-auto rounded-md border border-border bg-muted/30 px-3 py-2"
                >
                    {text.trim() ? (
                        <MarkdownView markdown={text} />
                    ) : (
                        <p className="text-xs text-muted-foreground">
              Nothing to preview yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
