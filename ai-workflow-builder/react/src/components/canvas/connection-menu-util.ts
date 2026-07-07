// Pure helpers behind the connection menu — no React in here. Everything reads
// the live dia.Graph (the same model `canConnect` validates against), so the
// menu only offers connections the paper would accept.
import type { dia } from '@joint/plus';
import {
    getPortConfig,
    NODE_CATALOG,
    STENCIL_KINDS,
    type ConfigKind,
} from '@/workflow/node-catalog';
import { getNodeData, getNodeKind } from '@/workflow/node-model';
import type {
    CellId,
    PortDescriptor,
    PortSide,
} from '@/workflow/workflow-types';

/** A concrete port on a concrete cell — the port the menu was opened on. */
export interface PortRef {
  readonly cellId: CellId;
  readonly portId: string;
}

/** A `PortRef` resolved against the live graph. */
export interface ConnectionSource {
  readonly element: dia.Element;
  readonly port: PortDescriptor;
}

/** A compatible free port on a node already in the graph. */
export interface ExistingNodeSlot {
  readonly nodeId: CellId;
  readonly port: string;
  readonly kind: ConfigKind;
  /** Display name — inspector-edited name, else the catalog title. */
  readonly name: string;
}

/** A node kind that could be created and wired to the clicked port. */
export interface NewNodeSlot {
  readonly kind: ConfigKind;
  readonly port: string;
}

export interface ConnectionSlots {
  readonly existing: ExistingNodeSlot[];
  readonly creatable: NewNodeSlot[];
  /** Links already attached to the clicked port, offered for removal. */
  readonly attached: CellId[];
}

/**
 * Resolves the clicked port to its live element and catalog descriptor.
 * `null` when the ref is stale (cell removed, not an element, unknown port).
 */
export function getConnectionSource(
    graph: dia.Graph,
    ref: PortRef,
): ConnectionSource | null {
    const model = graph.getCell(ref.cellId);
    if (!model || !model.isElement()) return null;
    const port = getPortConfig(getNodeKind(model), ref.portId);
    return port ? { element: model, port } : null;
}

/**
 * The three menu sections: nodes to connect to (existing), new nodes to create
 * and connect (creatable), attached links offered as "Remove link". A full
 * single-connection input offers only removal.
 */
export function getConnectionSlots(
    graph: dia.Graph,
    source: ConnectionSource,
): ConnectionSlots {
    const { element, port } = source;
    const attached = graph
        .getConnectedLinks(element, { port: port.id })
        .map((link) => link.id);
    if (isInputPortOccupied(graph, element, port)) {
        return { existing: [], creatable: [], attached };
    }
    return {
        existing: computeExistingSlots(graph, element.id, port),
        creatable: computeNewNodeSlots(port),
        attached,
    };
}

/** One end of a link, as `createLink` takes it. */
export interface LinkEnd {
  readonly id: CellId;
  readonly port: string;
}

/**
 * Ends of a would-be link between the clicked port and `peer`, in canonical
 * orientation: the output port is always the link source, the input always the
 * target — the same rule `orientLink` applies to drag-drawn links.
 */
export function getLinkEnds(
    source: ConnectionSource,
    peer: LinkEnd,
): { source: LinkEnd; target: LinkEnd } {
    const clicked = { id: source.element.id, port: source.port.id };
    return source.port.direction === 'out'
        ? { source: clicked, target: peer }
        : { source: peer, target: clicked };
}

/** Display name of the node on the far end of `linkId`, seen from `ref`. */
export function getLinkPeerName(
    graph: dia.Graph,
    linkId: CellId,
    ref: PortRef,
): string | null {
    const link = graph.getCell(linkId);
    if (!link?.isLink()) return null;
    const source = link.source();
    const refIsSource = source.id === ref.cellId && source.port === ref.portId;
    const peer = refIsSource ? link.getTargetCell() : link.getSourceCell();
    return (peer && getNodeIdentity(peer)?.name) ?? null;
}

// Gaps and offsets used by `getNewNodePosition`. The left / top values are
// larger because they must also absorb the new node's own width / height (the
// returned point is the new node's top-left corner).
const NEW_NODE_RIGHT_GAP = 130;
const NEW_NODE_LEFT_OFFSET = 386;
const NEW_NODE_TOP_OFFSET = 300;
const NEW_NODE_BOTTOM_GAP = 120;

/**
 * Where a node created from the menu should land: a fixed gap away from the
 * source node's bounding box, on the side the clicked port faces.
 */
export function getNewNodePosition(
    side: PortSide,
    bbox: { x: number; y: number; width: number; height: number },
): { x: number; y: number } {
    switch (side) {
        case 'right':
            return { x: bbox.x + bbox.width + NEW_NODE_RIGHT_GAP, y: bbox.y };
        case 'left':
            return { x: bbox.x - NEW_NODE_LEFT_OFFSET, y: bbox.y };
        case 'top':
            return { x: bbox.x, y: bbox.y - NEW_NODE_TOP_OFFSET };
        case 'bottom':
            return { x: bbox.x, y: bbox.y + bbox.height + NEW_NODE_BOTTOM_GAP };
    }
}

interface NodeIdentity {
  readonly kind: ConfigKind;
  readonly name: string;
}

/** Kind + display name of a catalog node; `null` for notes and non-nodes. */
function getNodeIdentity(model: dia.Cell): NodeIdentity | null {
    const data = getNodeData(model);
    if (!data || data.kind === 'note') return null;
    return { kind: data.kind, name: data.name ?? NODE_CATALOG[data.kind].title };
}

/** Inputs take one connection; outputs fan out, `tool` inputs are shared — matches `canConnect`. */
function isInputPortOccupied(
    graph: dia.Graph,
    element: dia.Element,
    port: PortDescriptor,
): boolean {
    if (port.direction !== 'in' || port.type === 'tool') return false;
    return (
        graph.getConnectedLinks(element, { inbound: true, port: port.id }).length >
    0
    );
}

/** The direction a counterpart port must have to connect to `port`. */
function getOppositeDirection(
    port: PortDescriptor,
): PortDescriptor['direction'] {
    return port.direction === 'out' ? 'in' : 'out';
}

/**
 * Free compatible ports on every other node in the graph: opposite direction,
 * same data type, and (for single-connection inputs) not already occupied.
 */
function computeExistingSlots(
    graph: dia.Graph,
    selfId: CellId,
    port: PortDescriptor,
): ExistingNodeSlot[] {
    const direction = getOppositeDirection(port);
    const slots: ExistingNodeSlot[] = [];
    for (const element of graph.getElements()) {
        if (element.id === selfId) continue;
        const identity = getNodeIdentity(element);
        if (!identity) continue;
        for (const candidate of NODE_CATALOG[identity.kind].ports) {
            if (candidate.direction !== direction || candidate.type !== port.type) {
                continue;
            }
            if (isInputPortOccupied(graph, element, candidate)) continue;
            slots.push({
                nodeId: element.id,
                port: candidate.id,
                kind: identity.kind,
                name: identity.name,
            });
        }
    }
    return slots;
}

/**
 * Ports on catalog (stencil) kinds that could connect to `port` if such a node
 * were created: opposite direction, same data type. One slot per matching port,
 * so a kind can appear more than once.
 */
function computeNewNodeSlots(port: PortDescriptor): NewNodeSlot[] {
    const direction = getOppositeDirection(port);
    return STENCIL_KINDS.flatMap((kind) =>
        NODE_CATALOG[kind].ports
            .filter(
                (candidate) =>
                    candidate.direction === direction && candidate.type === port.type,
            )
            .map((candidate) => ({ kind, port: candidate.id })),
    );
}
