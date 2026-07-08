import { useRef } from 'react';
import { Overlay, useGraph, useSelection } from '@joint/react-plus';
import type { OverlayPosition } from '@joint/react-plus';
import { Unlink } from 'lucide-react';
import { FloatingMenu, MenuItem } from '@/components/ui/floating-menu';
import { useAnnounce } from '@/components/ui/announcer-context';
import { useDismiss } from '@/hooks/use-dismiss';
import { createLink, createNode } from '@/workflow/build-node';
import { NODE_CATALOG } from '@/workflow/node-catalog';
import type {
    CellId,
    PortSide,
    WorkflowElement,
    WorkflowLink,
} from '@/workflow/workflow-types';
import { NodeIconChip } from '@/components/nodes/node-icon-chip';
import {
    getConnectionSlots,
    getConnectionSource,
    getLinkEnds,
    getLinkPeerName,
    getNewNodePosition,
    type NewNodeSlot,
    type PortRef,
} from './connection-menu-util';

// Popup anchor per port side: which overlay edge sits at the port. The gap
// between the port and the menu is the menu's own margin (see FloatingMenu below).
const POPUP_ORIGIN: Record<PortSide, OverlayPosition> = {
    right: 'left',
    left: 'right',
    top: 'bottom',
    bottom: 'top',
};

export function ConnectionMenu({
    portRef,
    onClose,
}: {
  /** The port the menu was opened on. */
  readonly portRef: PortRef;
  readonly onClose: () => void;
}) {
    const { setCell, removeCell, graph } = useGraph<
    WorkflowElement,
    WorkflowLink
  >();
    const { selectCells } = useSelection();
    const announce = useAnnounce();
    useDismiss(onClose);
    // True once "New <node>" created a node — that close moves focus to the new
    // node instead of restoring it to the opener port.
    const createdNodeRef = useRef(false);

    const source = getConnectionSource(graph, portRef);
    if (!source) return null;

    const { existing, creatable, attached } = getConnectionSlots(graph, source);
    if (existing.length === 0 && creatable.length === 0 && attached.length === 0)
        return null;

    const { element, port } = source;
    // Anchor the popup at the port centre (graph coords), read from the live element.
    const portCenter = element.getPortCenter(portRef.portId);

    // Links the clicked port to a port on an existing node.
    function connect(peerId: CellId, peerPort: string) {
        const ends = getLinkEnds({ element, port }, { id: peerId, port: peerPort });
        setCell(createLink(ends.source, ends.target));
        onClose();
    }

    // Creates a new node beside the clicked port and links the two.
    function connectNew(slot: NewNodeSlot) {
        const node = createNode(
            slot.kind,
            getNewNodePosition(port.side, element.getBBox()),
        );
        setCell(node);
        // Select right away — the new node focuses itself once its view mounts
        // (node-container focuses on select). The menu skips its focus restore for
        // this close (see shouldRestoreFocus below): restoring would refocus the
        // source node, whose onFocus re-selects it and undoes this selection.
        selectCells([node.id]);
        createdNodeRef.current = true;
        connect(node.id, slot.port);
    }

    // Deletes a link attached to the clicked port.
    function removeLink(id: CellId) {
        removeCell(id);
        announce('Connection removed.');
        onClose();
    }

    return (
        <Overlay x={portCenter.x} y={portCenter.y} origin={POPUP_ORIGIN[port.side]}>
            {/* The margin keeps the menu a fixed gap away from the port on every side. */}
            <FloatingMenu
                className="m-3.5 w-48"
                shouldRestoreFocus={() => !createdNodeRef.current}
            >
                {existing.map((slot) => (
                    <MenuItem
                        key={`existing-${slot.nodeId}-${slot.port}`}
                        icon={<NodeIconChip kind={slot.kind} className="size-6" />}
                        label={slot.name}
                        onClick={() => {
                            announce(`Connected to ${slot.name}.`);
                            connect(slot.nodeId, slot.port);
                        }}
                    />
                ))}
                {existing.length > 0 && creatable.length > 0 ? (
                    <div className="my-1 h-px bg-border" />
                ) : null}
                {creatable.map((slot) => (
                    <MenuItem
                        key={`new-${slot.kind}-${slot.port}`}
                        icon={<NodeIconChip kind={slot.kind} className="size-6" />}
                        label={`New ${NODE_CATALOG[slot.kind].title}`}
                        onClick={() => {
                            announce(`Connected to a new ${NODE_CATALOG[slot.kind].title}.`);
                            connectNew(slot);
                        }}
                    />
                ))}
                {attached.length > 0 &&
        (existing.length > 0 || creatable.length > 0) ? (
                        <div className="my-1 h-px bg-border" />
                    ) : null}
                {attached.map((linkId) => (
                    <MenuItem
                        key={`remove-${linkId}`}
                        icon={
                            <span className="grid size-6 place-items-center text-muted-foreground">
                                <Unlink className="size-4" />
                            </span>
                        }
                        label={`Remove link to ${getLinkPeerName(graph, linkId, portRef) ?? 'node'}`}
                        onClick={() => removeLink(linkId)}
                    />
                ))}
            </FloatingMenu>
        </Overlay>
    );
}
