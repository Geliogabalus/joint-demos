// Floating run-status pill at a node's top-right corner. "Running" stays for the
// duration, "Error" persists until the next run, "Done" auto-dismisses ~3s after success.
import { useState } from 'react';
import { ElementOverlay } from '@joint/react-plus';
import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTimeoutWhen } from '@/hooks/use-timeout-when';
import type { RunStatus } from '@/workflow/workflow-types';

const BADGE: Record<
  Exclude<RunStatus, 'idle'>,
  { readonly label: string; readonly className: string }
> = {
  running: {
    label: 'Running',
    className: 'border-status-running/40 bg-status-running/15 text-status-running',
  },
  success: {
    label: 'Done',
    className: 'border-status-success/40 bg-status-success/15 text-status-success',
  },
  error: {
    label: 'Error',
    className: 'border-status-error/40 bg-status-error/15 text-status-error',
  },
};

// How long the transient "Done" lingers — shared with the node's success border so they fade together.
export const DONE_VISIBLE_MS = 3000;

export function NodeStatusBadge({ status }: { readonly status: RunStatus }) {
  // Reset auto-dismiss on each status change (store-prev, no setState-in-effect).
  const [seenStatus, setSeenStatus] = useState(status);
  const [dismissing, setDismissing] = useState(false);
  if (status !== seenStatus) {
    setSeenStatus(status);
    setDismissing(false);
  }
  // animate-status-out holds the faded end-state (forwards) so the pill stays gone without unmounting mid-animation.
  useTimeoutWhen(status === 'success', DONE_VISIBLE_MS, () => setDismissing(true));
  if (status === 'idle') return null;
  const badge = BADGE[status];

  return (
    <ElementOverlay position="top-right" origin="bottom-right" dy={-6}>
      <span
        className={cn(
          'pointer-events-none flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur',
          dismissing ? 'animate-status-out' : 'animate-rise',
          badge.className
        )}
      >
        {status === 'running' ? (
          <Loader2 className="size-3 animate-spin" />
        ) : status === 'success' ? (
          <Check className="size-3" />
        ) : (
          <X className="size-3" />
        )}
        {badge.label}
      </span>
    </ElementOverlay>
  );
}
