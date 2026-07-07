import type { PointerEvent, ReactNode } from 'react';

// Stop pointer-down reaching JointJS so using a control doesn't drag the node.
function stopDrag(event: PointerEvent) {
    event.stopPropagation();
}

interface FieldProps {
  readonly label?: string;
  readonly children: ReactNode;
}

// Real <label> so the wrapped control is announced by assistive tech.
export function Field({ label, children }: FieldProps) {
    return (
        <label className="block space-y-1" onPointerDown={stopDrag}>
            {label ? (
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </span>
            ) : null}
            {children}
        </label>
    );
}
