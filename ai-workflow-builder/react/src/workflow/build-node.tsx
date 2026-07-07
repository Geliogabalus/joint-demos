/** Factories that turn the declarative catalog into JointJS cell records, so
 *  the stencil, initial graph and "+ add node" all emit identical shapes. */
import type { CellRecord, Computed } from '@joint/react-plus';
import { jsx } from '@joint/react-plus';
import type { dia } from '@joint/plus';
import { NODE_CATALOG, type ConfigKind } from './node-catalog';
import type {
    CellId,
    NodeData,
    PortDescriptor,
    SwatchKey,
    WorkflowElement,
    WorkflowLink,
} from './workflow-types';

// Layering: notes rest at the very back (below links + nodes) so they never
// cover wires or cards. A note being EDITED is raised to NOTE_SELECTED_Z so
// its editor isn't covered, then drops back to NOTE_Z when editing ends (see
// note-card.tsx). Mere selection (e.g. multi-select) leaves the note behind.
const ELEMENT_Z = 10;
const LINK_Z = 1;
export const NOTE_Z = 0;
// Transparent wrapper stroke width (px) — widens the pointer hit area so a
// label-less wire is grabbable along its length.
const LINK_HIT_WIDTH = 22;
// Shared by createLink and DEFAULT_LINK. Line color is uniform (CSS); only the
// wrapper hit-area + cursor come from style.
const LINK_BASE = {
    type: 'link',
    z: LINK_Z,
    style: { wrapperWidth: LINK_HIT_WIDTH, wrapperClassName: 'cursor-pointer' },
} as const;
export const NOTE_SELECTED_Z = 100;

const PORT_GROUP = 'main';
// Port model size drives the link anchor's outward offset — independent of the markup radii.
const PORT_SIZE = { width: 13, height: 13 };
const PORT_HIT_R = 11; // transparent grab/focus target around the dot
const PORT_DOT_R = 5;
const PORT_PLUS_PATH = 'M -3.4 0 H 3.4 M 0 -3.4 V 3.4';

function createId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function getPortPosition(port: PortDescriptor): { x: number | string; y: number | string } {
    const at = port.at ?? 0.5;
    switch (port.side) {
        case 'left':
            return { x: 0, y: `calc(${at} * h)` };
        case 'right':
            return { x: 'calc(w)', y: `calc(${at} * h)` };
        case 'top':
            return { x: `calc(${at} * w)`, y: 0 };
        case 'bottom':
            return { x: `calc(${at} * w)`, y: 'calc(h)' };
    }
}

// GOTCHA: the port visuals MUST be wrapped in ONE <g> carrying the magnet — JointJS stamps
// the `port` attribute on the single top-level markup node, so multi-node markup leaves the
// magnet without `port` and links fall back to straight. The "+" lives in SVG so it scales with zoom.
function buildPort(port: PortDescriptor): dia.Element.Port {
    // Colors live in CSS (keyed off `jj-port--<type>`). The magnet + a11y roles stay in
    // `attrs` (JointJS needs `magnet` on the port root); geometry is inline in the markup.
    const attrs: Record<string, Record<string, unknown>> = {
        portRoot: {
            magnet: 'active',
            tabindex: 0, // focusable + labelled so the port is keyboard-operable
            role: 'button',
            ariaLabel: `Connect ${port.label}`,
        },
    };

    const markup = jsx(
        <g joint-selector="portRoot" className={`jj-port jj-port--${port.type}`}>
            <circle joint-selector="hit" className="jj-port-hit" r={PORT_HIT_R} fill="transparent" />
            <circle joint-selector="dot" className="jj-port-dot" r={PORT_DOT_R} pointerEvents="none" />
            <path
                joint-selector="plus"
                className="jj-port-plus"
                d={PORT_PLUS_PATH}
                strokeWidth={1.6}
                pointerEvents="none"
            />
        </g>,
    );

    return {
        id: port.id,
        group: PORT_GROUP,
        size: PORT_SIZE,
        position: { args: getPortPosition(port) },
        markup,
        attrs,
    };
}

function buildPorts(ports: readonly PortDescriptor[]): {
  groups: Record<string, dia.Element.PortGroup>;
  items: dia.Element.Port[];
} {
    return {
        groups: { [PORT_GROUP]: { position: { name: 'absolute' }}},
        items: ports.map(buildPort),
    };
}

interface CreateNodeOptions {
  readonly id?: string;
  readonly data?: NodeData;
}

/** Create a fully-formed element for a catalog kind at a given position. */
export function createNode(
    kind: ConfigKind,
    position: { x: number; y: number },
    options: CreateNodeOptions = {},
): Computed<WorkflowElement> {
    const config = NODE_CATALOG[kind];
    return {
        id: options.id ?? createId(kind),
        type: 'element',
        position,
        angle: 0,
        z: ELEMENT_Z,
        size: { width: config.width, height: config.height },
        ports: buildPorts(config.ports),
        data: options.data ?? config.createData(),
    };
}

/** Create a sticky note (no ports). */
export function createNote(
    position: { x: number; y: number },
    options: {
    id?: string;
    text?: string;
    color?: SwatchKey;
    size?: { width: number; height: number };
  } = {},
): Computed<WorkflowElement> {
    return {
        id: options.id ?? createId('note'),
        type: 'element',
        position,
        angle: 0,
        z: NOTE_Z,
        size: options.size ?? { width: 200, height: 120 },
        data: {
            kind: 'note',
            text: options.text ?? '# Note',
            color: options.color ?? 'amber',
        },
    };
}

/** Headless cell template for the stencil drag preview — cloned on drop, with ports. */
export function createStencilTemplate(kind: ConfigKind): CellRecord<NodeData> {
    const config = NODE_CATALOG[kind];
    return {
        type: 'element',
        size: { width: config.width, height: config.height },
        ports: buildPorts(config.ports),
        data: config.createData(),
    };
}

interface CreateLinkOptions {
  readonly id?: string;
  /** A short pill label centred on the wire (e.g. "Prompt", "Skill", "Tool"). */
  readonly label?: string;
  /** When set, shows a "Tokens used: N" pill. */
  readonly tokens?: number;
}

type LinkLabel = NonNullable<WorkflowLink['labelMap']>[string];

function buildLabelPill(text: string): LinkLabel {
    return {
        text,
        position: 0.5,
        fontSize: 11,
        color: '#f8fafc',
        backgroundColor: 'rgba(18, 18, 24, 0.92)',
        // No rect outline (the API default '' renders a stroke, hence the old CSS override).
        backgroundOutline: 'none',
        backgroundBorderRadius: 7,
        backgroundPadding: { horizontal: 8, vertical: 4 },
        // Read-only badge — never a pointer target (on both text + background).
        className: 'pointer-events-none',
        backgroundClassName: 'pointer-events-none',
    };
}

export function tokenLabelMap(tokens: number): WorkflowLink['labelMap'] {
    return { tokens: buildLabelPill(`Tokens used: ${tokens}`) };
}

/** Create a styled link between two ports. */
export function createLink(
    source: { id: CellId; port: string },
    target: { id: CellId; port: string },
    options: CreateLinkOptions = {},
): Computed<WorkflowLink> {
    // Tokens win the label slot (live during a run); else the static pill label.
    const labelMap =
    options.tokens !== undefined
        ? tokenLabelMap(options.tokens)
        : options.label
            ? { label: buildLabelPill(options.label) }
            : undefined;

    return {
        id: options.id ?? createId('link'),
        ...LINK_BASE,
        source: { id: source.id, port: source.port },
        target: { id: target.id, port: target.port },
        data: { tokens: options.tokens },
        ...(labelMap ? { labelMap } : {}),
    };
}

/** Shape for `<Paper defaultLink>`: a user-drawn link. */
export const DEFAULT_LINK: Partial<WorkflowLink> = { ...LINK_BASE, data: {}};
