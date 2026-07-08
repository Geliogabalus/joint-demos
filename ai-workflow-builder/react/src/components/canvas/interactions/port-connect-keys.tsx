import { useOnKeyboardEvents, usePaper } from '@joint/react-plus';
import type { dia } from '@joint/plus';
import type { PortRef } from '../connection-menu-util';
import { getFocusedElementPort } from './focus';

/**
 * Keyboard parity with the port click (which the Paper handles via
 * `onElementMagnetPointerClick`): Enter / Space on a focused port opens the
 * connect popup. `paper.findView` resolves the owning element from the focused
 * port node. Mount inside `<Paper>` so `usePaper` / `useOnKeyboardEvents` resolve.
 */
export function PortConnectKeys({
    onOpen,
}: {
  readonly onOpen: (target: PortRef) => void;
}): null {
    const { paper } = usePaper();
    const openFocusedPort = (event: dia.Event) => {
        const port = paper && getFocusedElementPort(paper);
        if (!port) return;
        event.preventDefault();
        onOpen(port);
    };
    useOnKeyboardEvents({ enter: openFocusedPort, space: openFocusedPort });
    return null;
}
