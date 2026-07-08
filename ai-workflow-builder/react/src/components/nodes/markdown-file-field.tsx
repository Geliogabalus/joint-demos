import { useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { usePress } from '@/hooks/use-press';

interface MarkdownFileFieldProps {
  readonly fileName: string;
  /** Receives the chosen file's name and its text content. */
  readonly onFile: (fileName: string, content: string) => void;
  readonly pillClassName?: string;
}

export function MarkdownFileField({ fileName, onFile, pillClassName }: MarkdownFileFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    // A node drag can start on this control; only a real click opens the picker.
    // Native label→input click forwarding can't tell the two apart (and an outer
    // <label> wrapper like Field forwards too), so the input cancels every
    // trusted click below and only this guarded programmatic one opens it.
    const replacePress = usePress(() => inputRef.current?.click());

    async function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        const content = await file.text();
        onFile(file.name, content);
    }
    return (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    'flex-1 cursor-pointer truncate rounded-md border border-input bg-background px-2.5 py-1.5 font-mono text-xs',
                    pillClassName
                )}
                onPointerDown={replacePress.onPointerDown}
                onPointerMove={replacePress.onPointerMove}
                onClick={replacePress.onClick}
                title="Choose a Markdown file"
            >
                {fileName}
            </span>
            <Button asChild variant="outline" size="sm">
                <label
                    className="cursor-pointer"
                    onPointerDown={replacePress.onPointerDown}
                    onPointerMove={replacePress.onPointerMove}
                    onClick={replacePress.onClick}
                >
          Replace
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".md,.markdown,.txt"
                        className="hidden"
                        onClick={(event) => {
                            event.stopPropagation();
                            // Trusted = a label forwarded a native click here (own label or
                            // an outer Field label) — those bypass the press guard, cancel
                            // them. The guarded inputRef.click() is untrusted and passes.
                            if (event.nativeEvent.isTrusted) event.preventDefault();
                        }}
                        onChange={handleChange}
                    />
                </label>
            </Button>
        </div>
    );
}
