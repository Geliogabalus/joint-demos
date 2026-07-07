import type { ReactNode } from 'react';
import { Overlay, useGraph, useSelection } from '@joint/react-plus';
import { StickyNote, Trash2 } from 'lucide-react';
import { FloatingMenu, MenuItem } from '@/components/ui/floating-menu';
import { useDismiss } from '@/hooks/use-dismiss';
import { createNote } from '@/workflow/build-node';
import type { CellId, WorkflowElement, WorkflowLink } from '@/workflow/workflow-types';

function ContextMenu(props: {
  readonly x: number;
  readonly y: number;
  readonly icon: ReactNode;
  readonly label: string;
  readonly destructive?: boolean;
  readonly onAction: () => void;
  readonly onClose: () => void;
}) {
    const { x, y, icon, label, destructive, onAction, onClose } = props;
    useDismiss(onClose);
    return (
        <Overlay x={x} y={y} origin="top-left">
            <FloatingMenu className="w-40">
                <MenuItem
                    icon={icon}
                    label={label}
                    destructive={destructive}
                    onClick={() => {
                        onAction();
                        onClose();
                    }}
                />
            </FloatingMenu>
        </Overlay>
    );
}

export interface CanvasMenuState {
  readonly x: number;
  readonly y: number;
}

export function CanvasContextMenu({
    menu,
    onClose,
}: {
  readonly menu: CanvasMenuState;
  readonly onClose: () => void;
}) {
    const { setCell } = useGraph<WorkflowElement, WorkflowLink>();
    const { selectCells } = useSelection();
    return (
        <ContextMenu
            x={menu.x}
            y={menu.y}
            icon={<StickyNote className="size-3.5" />}
            label="Add note"
            onAction={() => {
                const note = createNote({ x: menu.x, y: menu.y });
                setCell(note);
                // Select the new note (opens it editable). Drop DOM focus to the body so
                // the canvas owns arrow-key nudging, not the just-clicked menu item.
                selectCells([note.id]);
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }}
            onClose={onClose}
        />
    );
}

export interface LinkMenuState {
  readonly id: CellId;
  readonly x: number;
  readonly y: number;
}

export function LinkContextMenu({
    menu,
    onClose,
}: {
  readonly menu: LinkMenuState;
  readonly onClose: () => void;
}) {
    const { removeCell } = useGraph<WorkflowElement, WorkflowLink>();
    return (
        <ContextMenu
            x={menu.x}
            y={menu.y}
            destructive
            icon={<Trash2 className="size-3.5" />}
            label="Remove link"
            onAction={() => removeCell(menu.id)}
            onClose={onClose}
        />
    );
}
