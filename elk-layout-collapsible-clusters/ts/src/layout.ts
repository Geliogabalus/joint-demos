import { layout } from '@joint/layout-elk';

import type { dia } from '@joint/plus';

import type { ElkLayoutOptions, NodeElkLayoutOptions } from '@joint/layout-elk';
import { isClusterSpec, type ClusterSpec, type NodeSpec } from './dataset';
import { Cluster, Edge, Leaf, CLUSTER_PADDING, COLLAPSED_SIZE, HEADER_HEIGHT, LEAF_SIZE } from './shapes';

const ROOT_LAYOUT_OPTIONS: ElkLayoutOptions = {
    /**
     * There are no links between the top-level clusters, so they are packed
     * into a compact area instead of being placed in a single row.
     */
    'elk.algorithm': 'rectpacking',
    'elk.aspectRatio': '1.6',
    'elk.spacing.nodeNode': '60',
    /**
     * No link crosses a cluster boundary in this example, so every cluster can
     * be laid out on its own.
     */
    'elk.hierarchyHandling': 'SEPARATE_CHILDREN'
};

const CLUSTER_LAYOUT_OPTIONS: NodeElkLayoutOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.spacing.nodeNode': '24',
    'elk.spacing.edgeNode': '16',
    'elk.layered.spacing.nodeNodeBetweenLayers': '48',
    /** Reserve the space of the cluster header. */
    'elk.padding': `[top=${HEADER_HEIGHT + CLUSTER_PADDING},left=${CLUSTER_PADDING},bottom=${CLUSTER_PADDING},right=${CLUSTER_PADDING}]`
};

/**
 * Create the JointJS cells of the whole diagram (including the content of the
 * clusters which are collapsed later on). The cells are created once - the
 * collapsing and the layout only change their geometry and visibility.
 */
export function createCells(clusters: ClusterSpec[]): dia.Cell[] {
    const cells: dia.Cell[] = [];
    clusters.forEach((cluster) => addCells(cluster, 0, cells));
    return cells;
}

function addCells(node: NodeSpec, depth: number, cells: dia.Cell[]): void {
    if (!isClusterSpec(node)) {
        cells.push(new Leaf({
            id: node.id,
            z: depth * 10,
            size: LEAF_SIZE,
            attrs: { label: { text: node.label }}
        }));
        return;
    }

    const cluster = new Cluster({
        id: node.id,
        z: depth * 10,
        size: COLLAPSED_SIZE,
        attrs: { headerText: { text: node.label }}
    });
    cluster.setDepth(depth);
    cells.push(cluster);

    node.children.forEach((child) => addCells(child, depth + 1, cells));
    // The links of a cluster are rendered above its body, but below its
    // children (which are one level deeper).
    node.edges.forEach(({ id, source, target }) => cells.push(new Edge({
        id,
        z: depth * 10 + 5,
        source: { id: source },
        target: { id: target }
    })));
}

/**
 * Embed the children into their clusters and move every link into the cluster
 * of its endpoints, so that a single `collapsed` flag hides the whole subtree.
 */
export function embedCells(graph: dia.Graph, clusters: ClusterSpec[]): void {
    clusters.forEach((cluster) => embedCluster(graph, cluster));
}

function embedCluster(graph: dia.Graph, cluster: ClusterSpec): void {
    const parent = graph.getCell(cluster.id) as Cluster;
    parent.embed(cluster.children.map(({ id }) => graph.getCell(id)));
    cluster.children.forEach((child) => {
        if (isClusterSpec(child)) embedCluster(graph, child);
    });
    cluster.edges.forEach(({ id }) => (graph.getCell(id) as dia.Link).reparent());
}

/**
 * Lay the diagram out with ELK and apply the result to the JointJS graph.
 * The embedded elements become the children of their cluster in the ELK graph.
 */
export async function layoutDiagram(graph: dia.Graph): Promise<void> {
    await layout({ graph }, {
        elkLayoutOptions: ROOT_LAYOUT_OPTIONS,
        exportElement: ({ element, elkNode }) => {
            // The content of a collapsed cluster is left out.
            const parent = element.getParentCell();
            if (parent instanceof Cluster && parent.isCollapsed()) return false;
            if (element instanceof Cluster) {
                if (element.isCollapsed()) {
                    // The cluster becomes a plain node of the size of its header.
                    elkNode.width = COLLAPSED_SIZE.width;
                    elkNode.height = COLLAPSED_SIZE.height;
                } else {
                    Object.assign(elkNode.layoutOptions, CLUSTER_LAYOUT_OPTIONS);
                }
            }
            return undefined;
        },
        setElementAttributes: ({ element, attributes, elkNode }) => {
            // Note: `element.set()` is used instead of `element.position()` and
            // `element.resize()` - the children of the element are positioned by
            // ELK too and must not be moved along with their parent.
            // `attributes` carries the size of the expanded clusters only - the
            // size is taken from ELK for the collapsed clusters too.
            element.set({
                position: attributes.position,
                size: { width: elkNode.width!, height: elkNode.height! }
            });
        }
    });
}
