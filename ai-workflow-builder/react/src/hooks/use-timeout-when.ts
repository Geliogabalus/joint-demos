import { useEffect, useRef } from 'react';

// Run `fn` once, `ms` after `active` flips true; cancel if it flips back / unmounts first.
// `fn` is read through a ref (useLatest) so a fresh inline callback each render doesn't reset
// the timer — only `active` / `ms` do (ref updated in an effect, never during render).
export function useTimeoutWhen(active: boolean, ms: number, fn: () => void) {
    const fnRef = useRef(fn);
    useEffect(() => {
        fnRef.current = fn;
    });
    useEffect(() => {
        if (!active) return;
        const timer = window.setTimeout(() => fnRef.current(), ms);
        return () => clearTimeout(timer);
    }, [active, ms]);
}
