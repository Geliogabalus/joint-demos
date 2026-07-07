/**
 * Responsive collapsible side panel, mounted once (no portal/remount) so stencil drag + inspector
 * hooks survive every breakpoint: inline flex column on desktop (`md:`+), CSS slide-over on mobile.
 * Parent owns `open`: mobile slides off-screen, desktop collapses width to 0.
 * A11y: a closed panel is `inert` in both modes. On mobile it's a modal dialog — Esc/backdrop close,
 * focus moves in on open and restores on close. Transitions drop under `prefers-reduced-motion`.
 */
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { MOBILE_QUERY } from './viewport';

// matchMedia via useSyncExternalStore (no setState-in-effect); `false` during SSR (desktop-first).
function useIsMobile(): boolean {
    return useSyncExternalStore(
        (onChange) => {
            const mql = window.matchMedia(MOBILE_QUERY);
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        },
        () => window.matchMedia(MOBILE_QUERY).matches,
        () => false
    );
}

interface SlideOverProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly side: 'left' | 'right';
  readonly label: string;
  readonly children: ReactNode;
}

export function SlideOver({ open, onClose, side, label, children }: SlideOverProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const restoreFocusRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const isMobile = useIsMobile();

    // Mobile only: Esc to close + move focus into the panel on open, restoring it on close.
    useEffect(() => {
        if (!open || !isMobile) return;

        restoreFocusRef.current = document.activeElement as HTMLElement | null;
        panelRef.current?.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            // Focus trap — aria-modal promises Tab stays inside the drawer (Esc or
            // the backdrop leave it).
            if (event.key !== 'Tab') return;
            const panel = panelRef.current;
            if (!panel) return;
            const focusables = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) {
                event.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            if (event.shiftKey && (active === first || active === panel)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            } else if (active && !panel.contains(active)) {
                event.preventDefault();
                first.focus();
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            restoreFocusRef.current?.focus?.();
        };
    }, [open, isMobile, onClose]);

    const offscreen = side === 'left' ? '-translate-x-full' : 'translate-x-full';
    // Fixed open width, shared by outer (flex layout) and inner (no reflow while outer collapses).
    const panelWidth = side === 'left' ? 'md:w-64' : 'md:w-72';

    return (
        <>
            {/* Backdrop: mobile-only, shown while open. */}
            <button
                type="button"
                tabIndex={open ? 0 : -1}
                aria-label={`Close ${label}`}
                onClick={onClose}
                className={cn(
                    'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden motion-reduce:transition-none',
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
            />
            <div
                ref={panelRef}
                // Dialog semantics only on mobile (modal drawer); desktop is an inline region.
                role={isMobile ? 'dialog' : undefined}
                aria-modal={isMobile ? true : undefined}
                aria-labelledby={isMobile ? titleId : undefined}
                // A closed panel (off-screen on mobile, width-0 on desktop) leaves the tab order + a11y tree.
                inert={!open}
                tabIndex={-1}
                className={cn(
                    // Mobile: fixed drawer that slides via translate (never width, so content keeps its size).
                    'fixed inset-y-0 z-50 w-[19rem] max-w-[85vw] shadow-xl outline-none',
                    'transition-transform duration-200 ease-out motion-reduce:transition-none',
                    side === 'left' ? 'left-0 border-r border-border' : 'right-0 border-l border-border',
                    open ? 'translate-x-0' : `${offscreen} pointer-events-none`,
                    // Desktop: width animates open↔0; overflow-hidden + relative clip the fixed-width inner panel.
                    'md:relative md:z-auto md:max-w-none md:shrink-0 md:translate-x-0 md:overflow-hidden md:shadow-none md:pointer-events-auto',
                    'md:transition-[width] md:duration-200 md:ease-out motion-reduce:md:transition-none',
                    open ? panelWidth : 'md:w-0 md:border-0'
                )}
            >
                <span id={titleId} className="sr-only">
                    {label}
                </span>
                {/* Fixed-width inner panel: holds the open width on desktop (no reflow), pinned to its side. */}
                <div
                    className={cn(
                        'flex h-full w-[19rem] max-w-[85vw] flex-col bg-background',
                        'md:absolute md:inset-y-0 md:max-w-none',
                        side === 'left' ? 'md:left-0' : 'md:right-0',
                        panelWidth
                    )}
                >
                    {children}
                </div>
            </div>
        </>
    );
}
