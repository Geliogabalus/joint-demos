import {
    ElementOverlay,
    useCellId,
    useClipboard,
    useGraph,
    useSelectionCollection,
} from '@joint/react-plus';
import { Copy, Trash2 } from 'lucide-react';
import { FloatingMenu, MenuItem } from '@/components/ui/floating-menu';
import { useDismiss } from '@/hooks/use-dismiss';

export function NodeContextMenu({ onClose }: { readonly onClose: () => void }) {
    const id = useCellId();
    const { removeCell, graph } = useGraph();
    const { copyCells, pasteCells } = useClipboard();
    const { selectCells } = useSelectionCollection(); // Ensure selection is up-to-date for copy/paste

    useDismiss(onClose);
    function duplicate() {
        copyCells([id]);
        pasteCells({ translate: { dx: 28, dy: 28 }});
        onClose();
    }

    function remove() {
        removeCell(id);
        onClose();
        // Keep a selection so keyboard nav continues — fall back to the last cell.
        const nextSelection = graph.getLastCell();
        if (nextSelection) selectCells([nextSelection]);
    }

    return (
        <ElementOverlay position="top-right" origin="top-left" dx={8} dy={0}>
            <FloatingMenu className="w-36">
                <MenuItem
                    icon={<Copy className="size-3.5" />}
                    label="Duplicate"
                    onClick={duplicate}
                />
                <MenuItem
                    icon={<Trash2 className="size-3.5" />}
                    label="Delete"
                    onClick={remove}
                    destructive
                />
            </FloatingMenu>
        </ElementOverlay>
    );
}
