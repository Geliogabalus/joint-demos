import { dia } from '@joint/plus';
import { layout } from '@joint/layout-elk';
import { SystemNode } from '../../models';
import { Attribute, LAYOUT_BATCH_NAME } from '../../const';

import type { AutoLayoutDiagramCells } from '../types';
import type { ElkLayoutOptions } from '@joint/layout-elk';

interface LayoutCellsOptions {
    /**
     * Disable the optimal order heuristic for crossing minimization.
     * This is useful to get a faster layout, but the result may not be optimal.
     */
    disableOptimalOrderHeuristic?: boolean;
}

export async function layoutCells(graph: dia.Graph, cells: AutoLayoutDiagramCells, options?: LayoutCellsOptions): Promise<void> {
    const {
        nodes,
        edges,
    } = cells;

    // Construct a graph with the cells in the order ELK should consider
    const layoutGraph = createLayoutGraph([...nodes, ...edges]);

    try {
        graph.startBatch(LAYOUT_BATCH_NAME);
        await layout(layoutGraph, {
            elkLayoutOptions: getElkLayoutOptions(options),
            exportElement: ({ element, elkNode }) => {
                if (!(element instanceof SystemNode)) return;
                const partitionIndex = element.get(Attribute.PartitionIndex) == null ? '1000' : (element.get(Attribute.PartitionIndex) as number).toString();
                Object.assign(elkNode.layoutOptions, {
                    'elk.portConstraints': 'FIXED_POS',
                    'elk.partitioning.partition': partitionIndex,
                });
                if (element.get('type') === 'trigger') {
                    elkNode.layoutOptions['elk.layered.layering.layerChoiceConstraint'] = '0';
                }
                elkNode.labels = element.getLabelsRelativeRects().map(rect => ({
                    text: '-', // some text is required (ELK ignores empty labels)
                    width: rect.width,
                    height: rect.height,
                    x: rect.x,
                    y: rect.y,
                    layoutOptions: {}
                }));
            },
            // Apply the layout to the original cells
            setElementAttributes: ({ element, attributes }) => {
                const { x, y } = attributes.position;
                (graph.getCell(element.id) as dia.Element).position(x, y);
            },
            setLinkAttributes: ({ link, attributes }) => {
                // Update link vertices (bend points)
                (graph.getCell(link.id) as dia.Link).vertices(attributes.vertices);
            }
        });
    } catch (error) {
        console.warn('ELK layout error:', error);
    } finally {
        graph.stopBatch(LAYOUT_BATCH_NAME);
    }
}

/**
 * ELK takes the order of the nodes and edges into account (see the layout options),
 * while the layout reads them from the graph (sorted by z-index, the new cells last).
 * Copies of the cells are therefore laid out in a separate graph, which keeps the given order.
 */
function createLayoutGraph(cells: dia.Cell[]): dia.Graph {
    const layoutGraph = new dia.Graph();
    layoutGraph.resetCells(cells.map(cell => cell.clone().set({ id: cell.id, z: 0 })));
    return layoutGraph;
}

function getElkLayoutOptions(options?: LayoutCellsOptions): ElkLayoutOptions {

    const layoutOptions: ElkLayoutOptions = {
        'elk.algorithm': 'layered',
        'elk.direction': 'RIGHT',
        'elk.separateConnectedComponents': 'false',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.partitioning.activate': 'true',
        'elk.layered.spacing.nodeNodeBetweenLayers': '100',
        'elk.spacing.edgeNode': '50',
        'elk.layered.spacing.edgeNodeBetweenLayers': '50',
        'elk.layered.feedbackEdges': 'true',

        // Preserve model order
        'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',
        'elk.layered.cycleBreaking.strategy': 'DFS_NODE_ORDER',

        // Don't reorder nodes within a layer during crossing minimization
        'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',

        // Center layers as a whole (optional)
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',

        // Ports
        'elk.layered.considerModelOrder.portModelOrder': 'true'
    };

    if (options?.disableOptimalOrderHeuristic) {
        Object.assign(layoutOptions, {
            'elk.layered.crossingMinimization.strategy': 'NONE', // No crossing minimization is done (at all)
            'elk.layered.crossingMinimization.greedySwitch.type': 'OFF', // Disables greedy switch
        });
    }

    return layoutOptions;
}
