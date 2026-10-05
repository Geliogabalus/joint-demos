import { layout } from '@joint/layout-elk';
import { SystemNode } from '../../models';
import { Attribute, LAYOUT_BATCH_NAME } from '../../const';

export async function layoutCells(graph, cells, options) {
    const { nodes, edges, } = cells;

    try {
        graph.startBatch(LAYOUT_BATCH_NAME);
        // Lay out the given cells only (e.g. not the notes), in the order ELK should consider
        await layout({ graph, elements: nodes, links: edges }, {
            elkLayoutOptions: getElkLayoutOptions(options),
            exportElement: ({ element, elkNode }) => {
                if (!(element instanceof SystemNode))
                    return;
                const partitionIndex = element.get(Attribute.PartitionIndex) == null ? '1000' : element.get(Attribute.PartitionIndex).toString();
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
            setElementAttributes: ({ element, attributes }) => {
                const { x, y } = attributes.position;
                element.position(x, y);
            },
            setLinkAttributes: ({ link, attributes }) => {
                // Update link vertices (bend points)
                link.vertices(attributes.vertices);
            }
        });
    }
    catch (error) {
        console.warn('ELK layout error:', error);
    }
    finally {
        graph.stopBatch(LAYOUT_BATCH_NAME);
    }
}

function getElkLayoutOptions(options) {

    const layoutOptions = {
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
