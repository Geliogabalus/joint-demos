// Tailwind color maps for HTML node chrome. (SVG ports: workflow/port-colors.ts.)
import type { AccentKey, RunStatus } from '@/workflow/workflow-types';

export const PORT_DOT_CLASS: Record<AccentKey, string> = {
    text: 'bg-type-text',
    skill: 'bg-type-skill',
    tool: 'bg-type-tool',
    result: 'bg-type-result',
    brand: 'bg-primary',
};

export const PORT_CHIP_CLASS: Record<AccentKey, string> = {
    text: 'bg-type-text/6 text-type-text ring-[0.5px] ring-type-text/40',
    skill: 'bg-type-skill/7 text-type-skill ring-[0.5px] ring-type-skill/40',
    tool: 'bg-type-tool/6 text-type-tool ring-[0.5px] ring-type-tool/40',
    result: 'bg-type-result/6 text-type-result ring-[0.5px] ring-type-result/40',
    brand: 'bg-primary/7 text-primary ring-[0.5px] ring-primary/40',
};

export const STATUS_DOT_CLASS: Record<Exclude<RunStatus, 'idle'>, string> = {
    running: 'bg-status-running',
    success: 'bg-status-success',
    error: 'bg-status-error',
};
