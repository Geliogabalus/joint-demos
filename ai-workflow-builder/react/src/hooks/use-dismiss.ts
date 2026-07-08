import { useEffect } from 'react';

// Calls `onClose` on an outside pointer-down or Escape. Clicks inside a menu are stopped
// by FloatingMenu, so they never reach the document listener.
export function useDismiss(onClose: () => void): void {
    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        document.addEventListener('pointerdown', onClose);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onClose);
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);
}
