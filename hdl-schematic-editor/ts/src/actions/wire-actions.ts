import { Edge, HdlNode } from '../diagram/models';

import type { App } from '../app';

/**
 * Updates the width of all wires based on the widths of the connected ports.
 */
export function updateWires(app: App) {
    const { graph } = app;

    // Only one wire of each net shows the bus width (the wires share the first segment)
    const labeledNets = new Set<string>();

    graph.getLinks().forEach((link) => {
        if (!(link instanceof Edge)) return;
        const source = link.getSourceElement();
        const target = link.getTargetElement();
        if (!(source instanceof HdlNode) || !(target instanceof HdlNode)) return;
        const sourceWidth = source.getPortWidth(link.source().port as string);
        const targetWidth = target.getPortWidth(link.target().port as string);
        link.setBusWidth(sourceWidth, sourceWidth !== targetWidth);
        if (sourceWidth <= 1) return;
        const netKey = `${source.id}
${link.source().port}`;
        if (labeledNets.has(netKey)) {
            link.updateBusLabelPosition(null);
            return;
        }
        labeledNets.add(netKey);
        // The wire route (the pin ends and the vertices computed by the layout)
        link.updateBusLabelPosition([
            source.getPortCenter(link.source().port as string),
            ...link.vertices(),
            target.getPortCenter(link.target().port as string)
        ]);
    });
}

/**
 * Get all wires driven by the same output port as the given wire (the net).
 */
export function getNetEdges(app: App, edge: Edge): Edge[] {
    const { graph } = app;

    const source = edge.getSourceElement();
    if (!source) return [edge];
    const portId = edge.source().port;
    return graph.getConnectedLinks(source, { outbound: true }).filter(link => {
        return link instanceof Edge && link.source().port === portId;
    }) as Edge[];
}
