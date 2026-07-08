// Swatch-based styling for notes + the inspector Appearance section. Dark-mode
// fills are an OPAQUE color-mix over --color-card, not an alpha tint: an alpha bg
// drops the opaque bg-card beneath it (twMerge keeps the last bg-*) — node turns see-through.
import { cn } from '@/utils/cn';
import type { FontKey, NodeAppearance, SwatchKey } from '@/workflow/workflow-types';

interface Swatch {
  /** Full note surface: bg + text + border. */
  readonly surface: string;
  /** Round picker dot. */
  readonly dot: string;
  /** Subtle background tint for config-node Appearance overrides. */
  readonly fill: string;
  readonly text: string;
  readonly border: string;
}

const SWATCHES: Record<SwatchKey, Swatch> = {
    default: {
        surface: 'bg-card text-card-foreground border-border',
        dot: 'bg-card border border-border',
        fill: '',
        text: '',
        border: '',
    },
    violet: {
        surface:
      'bg-violet-100 text-violet-950 border-violet-300/70 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-violet-500)_20%)] dark:text-violet-50 dark:border-violet-400/30',
        dot: 'bg-violet-400',
        fill: 'bg-violet-50 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-violet-500)_12%)]',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-300 dark:border-violet-400/40',
    },
    blue: {
        surface:
      'bg-sky-100 text-sky-950 border-sky-300/70 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-sky-500)_20%)] dark:text-sky-50 dark:border-sky-400/30',
        dot: 'bg-sky-400',
        fill: 'bg-sky-50 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-sky-500)_12%)]',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-300 dark:border-sky-400/40',
    },
    green: {
        surface:
      'bg-emerald-100 text-emerald-950 border-emerald-300/70 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-emerald-500)_20%)] dark:text-emerald-50 dark:border-emerald-400/30',
        dot: 'bg-emerald-400',
        fill: 'bg-emerald-50 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-emerald-500)_12%)]',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-400/40',
    },
    amber: {
        surface:
      'bg-amber-100 text-amber-950 border-amber-300/70 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-amber-500)_20%)] dark:text-amber-50 dark:border-amber-400/30',
        dot: 'bg-amber-400',
        fill: 'bg-amber-50 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-amber-500)_12%)]',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-400/40',
    },
    rose: {
        surface:
      'bg-rose-100 text-rose-950 border-rose-300/70 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-rose-500)_20%)] dark:text-rose-50 dark:border-rose-400/30',
        dot: 'bg-rose-400',
        fill: 'bg-rose-50 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-rose-500)_12%)]',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-300 dark:border-rose-400/40',
    },
    slate: {
        surface:
      'bg-slate-100 text-slate-950 border-slate-300/70 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-slate-500)_20%)] dark:text-slate-50 dark:border-slate-400/30',
        dot: 'bg-slate-400',
        fill: 'bg-slate-50 dark:bg-[color-mix(in_oklab,var(--color-card),var(--color-slate-500)_12%)]',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-400/40',
    },
};

export const SWATCH_KEYS = Object.keys(SWATCHES) as readonly SwatchKey[];

const buildSwatchClasses = (key: keyof Swatch): Record<SwatchKey, string> =>
  Object.fromEntries(SWATCH_KEYS.map((k) => [k, SWATCHES[k][key]])) as Record<SwatchKey, string>;

export const NOTE_SURFACE_CLASS = buildSwatchClasses('surface');
export const SWATCH_DOT_CLASS = buildSwatchClasses('dot');

const FONT_CLASS: Record<FontKey, string> = {
    sans: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
};

export function getAppearanceClass(appearance?: NodeAppearance): string {
    if (!appearance) return '';
    return cn(
        appearance.fill && SWATCHES[appearance.fill].fill,
        appearance.text && SWATCHES[appearance.text].text,
        appearance.border && SWATCHES[appearance.border].border,
        appearance.font && FONT_CLASS[appearance.font]
    );
}
