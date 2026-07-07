/**
 * Popover menu for every graph-anchored menu (node ⋯, port "+", right-click); caller positions it.
 * `onPointerDown` is swallowed so clicking the menu never starts a node drag or trips a click-away.
 * A11y: focus moves to the first item on open, arrows + Tab cycle, closing restores focus to the opener.
 */
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function FloatingMenu({
  className,
  children,
  shouldRestoreFocus,
}: {
  readonly className?: string;
  readonly children: ReactNode;
  /** Consulted when the menu closes; return false to skip restoring focus to
   *  the opener — for actions that send focus somewhere else (e.g. a newly
   *  created node). Called at close time, so it may read a ref. @default true */
  readonly shouldRestoreFocus?: () => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Ref, not closure capture: the unmount cleanup below runs with the mount
  // render's props, so it must read the latest callback through a ref.
  const shouldRestoreFocusRef = useRef(shouldRestoreFocus);
  useEffect(() => {
    shouldRestoreFocusRef.current = shouldRestoreFocus;
  });

  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const restoreTo = document.activeElement;
    menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      if (shouldRestoreFocusRef.current?.() === false) return;
      if (restoreTo instanceof HTMLElement) restoreTo.focus();
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const menu = ref.current;
    if (!menu) return;
    const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    if (items.length === 0) return;
    const active = document.activeElement;
    const current = active instanceof HTMLElement ? items.indexOf(active) : -1;
    const forward = event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey);
    const backward = event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey);
    if (forward) {
      event.preventDefault();
      items[(current + 1 + items.length) % items.length].focus();
    } else if (backward) {
      event.preventDefault();
      items[(current - 1 + items.length) % items.length].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1].focus();
    }
  }

  return (
    <div
      ref={ref}
      role="menu"
      onKeyDown={onKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
      className={cn(
        'min-w-36 animate-rise rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

export function MenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  readonly icon?: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
  readonly destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent',
        'focus-visible:outline-none focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
        destructive && 'text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
