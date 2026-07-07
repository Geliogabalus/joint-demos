// A row of color swatches, shared by the inspector's Appearance controls and
// the sticky-note color picker so both render identically.
import { SWATCH_DOT_CLASS, SWATCH_KEYS } from '@/components/nodes/appearance';
import { cn } from '@/utils/cn';
import type { SwatchKey } from '@/workflow/workflow-types';

/** Each swatch's aria-label is `${label} ${swatch}` so screen readers announce
 *  role + color. */
export function SwatchRow({
    label,
    value,
    onChange,
    size = 'size-4',
    ringOffset = 'ring-offset-card',
    className = 'gap-2 pr-1',
}: {
  readonly label: string;
  readonly value: SwatchKey;
  readonly onChange: (value: SwatchKey) => void;
  readonly size?: string;
  readonly ringOffset?: string;
  readonly className?: string;
}) {
    return (
        <div className={cn('flex', className)}>
            {SWATCH_KEYS.map((swatch) => (
                <button
                    key={swatch}
                    type="button"
                    aria-label={`${label} ${swatch}`}
                    onClick={() => onChange(swatch)}
                    className={cn(
                        'rounded-full ring-offset-1',
                        size,
                        ringOffset,
                        SWATCH_DOT_CLASS[swatch],
                        value === swatch && 'ring-2 ring-foreground',
                    )}
                />
            ))}
        </div>
    );
}
