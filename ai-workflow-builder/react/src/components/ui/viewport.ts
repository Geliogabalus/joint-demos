// Viewport helpers for the responsive shell (`md:` = 768px). Own module for Fast Refresh.

/** Media query marking the mobile (slide-over drawer) layout. */
export const MOBILE_QUERY = '(max-width: 767px)';

/** Whether the desktop (inline-column) layout is active right now. SSR-safe. */
export function isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && !window.matchMedia(MOBILE_QUERY).matches;
}
