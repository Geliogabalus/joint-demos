import { usePaper, useSelection } from '@joint/react-plus';
import { useEffect } from 'react';

/** Tab onto a link's <g> → select it, so keyboard users can act on links
 *  (Delete, etc.). The focusable link wrapper is JointJS-managed (outside our
 *  React tree), so we catch focus at paper.el rather than via an onFocus prop.
 *  Ports/HTML controls resolve to an element view → ignored. Notes handle their
 *  own focus→select locally (they are our React DOM). */
export function LinkFocusSelect(): null {
    const { paper } = usePaper();
    const { selectCells } = useSelection();
    useEffect(() => {
        if (!paper) return;
        const onFocusIn = (event: FocusEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const view = paper.findView(target);
            if (view?.model.isLink()) selectCells([view.model]);
        };
        paper.el.addEventListener('focusin', onFocusIn);
        return () => paper.el.removeEventListener('focusin', onFocusIn);
    }, [paper, selectCells]);
    return null;
}
