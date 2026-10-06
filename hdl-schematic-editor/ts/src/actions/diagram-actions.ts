// Diagram
import { Attribute } from '../diagram/const';
import { runAfterLayout } from '../diagram/utils';
import { HdlNode } from '../diagram/models';
import {
    appendNodeToPort,
    prependNodeToPort,
    insertNodeOnEdge,
    replaceNodeData,
    disconnectInputPort
} from '../diagram/data/manipulation';
import {
    getDefaultCellData,
    getDefaultConstantData,
    getDefaultInputData,
    getDefaultOutputData,
    getDataWidth
} from '../diagram/data/defaults';
// Yosys
import { getTopModuleName, yosysToDiagram } from '../yosys/import';
import { getDefaultParameters } from '../registry';
// Config
import { appConfig } from '../configs';
// Actions
import { openMessageDialog } from './dialog-actions';

import type { dia } from '@joint/plus';
import type { App } from '../app';
import type { Edge, HdlCell, Node } from '../diagram/models';
import type { Model, NodeData } from '../diagram/types';
import type { YosysJSON } from '../yosys/types';
import type { CellDefinition } from '../registry';

/**
 * Loads the top module of the given Yosys JSON into the app.
 */
export function loadYosysJSON(app: App, document: YosysJSON) {
    const { diagramData, graph, history, scroller } = app;

    let moduleName: string;
    let diagram;
    try {
        moduleName = getTopModuleName(document);
        diagram = yosysToDiagram(document, moduleName);
    } catch (error) {
        openMessageDialog(app, 'Invalid Yosys JSON', `${(error as Error).message || error}`);
        return;
    }

    app.setYosysDocument(document, moduleName);
    // Reset the diagram data
    diagramData.fromJSON(diagram);
    // Reset the history after loading a new diagram
    history.reset();

    const zoomToFit = () => {
        // Zoom to fit the loaded diagram.
        scroller.zoomToFit({
            useModelGeometry: true,
            padding: 50,
            maxScale: 1.5,
        });
    };

    runAfterLayout(graph, zoomToFit);
}

/**
 * Resets the diagram to a module with a single input and a single output.
 */
export function resetDiagram(app: App) {
    loadYosysJSON(app, {
        modules: {
            [appConfig.defaultModuleName]: {
                attributes: { top: 1 },
                ports: {
                    a: { direction: 'input', bits: [2] },
                    y: { direction: 'output', bits: [3] },
                },
                cells: {},
                netnames: {}
            }
        }
    });
}

/**
 * Removes the given model from the diagram.
 */
export function removeModel(app: App, model: Model) {
    const { diagramData } = app;

    if (model.isLink()) {
        removeEdge(app, model as Edge);
        return;
    }
    diagramData.removeNode(model.id);
}

/**
 * Removes the given edge from the diagram.
 */
export function removeEdge(app: App, edge: Edge) {
    const { diagramData } = app;

    diagramData.removeEdge({
        id: edge.source().id!,
        portId: edge.source().port as string | undefined
    }, {
        id: edge.target().id!,
        portId: edge.target().port as string | undefined
    });
}

/**
 * Get the width of the given port (1 if unknown).
 */
export function getPortWidth(element: dia.Element, portId: string): number {
    return (element instanceof HdlNode) ? element.getPortWidth(portId) : 1;
}

// Adding nodes

export function addInputNode(app: App): Node {
    const { diagramData, graph } = app;
    const id = diagramData.createNode(getDefaultInputData(diagramData.toJSON()));
    return graph.getCell(id) as Node;
}

export function addOutputNode(app: App): Node {
    const { diagramData, graph } = app;
    const id = diagramData.createNode(getDefaultOutputData(diagramData.toJSON()));
    return graph.getCell(id) as Node;
}

export function addCellNode(app: App, definition: CellDefinition): Node {
    const { diagramData, graph } = app;
    const id = diagramData.createNode(getDefaultCellData(definition, diagramData.toJSON()));
    return graph.getCell(id) as Node;
}

/**
 * Appends a new cell driven by the given output port. The cell is as wide as the port.
 */
export function appendCellNode(app: App, definition: CellDefinition, node: dia.Element, portId: string): Node {
    const data = getDefaultCellData(definition, app.diagramData.toJSON(), getPortWidth(node, portId));
    return appendNodeToPort(app, data, node, portId);
}

/**
 * Appends a new module output driven by the given output port.
 */
export function appendOutputNode(app: App, node: dia.Element, portId: string): Node {
    const data = getDefaultOutputData(app.diagramData.toJSON(), getPortWidth(node, portId));
    return appendNodeToPort(app, data, node, portId);
}

/**
 * Prepends a new cell driving the given input port. The cell is as wide as the port.
 */
export function prependCellNode(app: App, definition: CellDefinition, node: dia.Element, portId: string): Node {
    const data = getDefaultCellData(definition, app.diagramData.toJSON(), getPortWidth(node, portId));
    return prependNodeToPort(app, data, node, portId);
}

/**
 * Prepends a new module input driving the given input port.
 */
export function prependInputNode(app: App, node: dia.Element, portId: string): Node {
    const data = getDefaultInputData(app.diagramData.toJSON(), getPortWidth(node, portId));
    return prependNodeToPort(app, data, node, portId);
}

/**
 * Prepends a new constant driving the given input port.
 */
export function prependConstantNode(app: App, node: dia.Element, portId: string): Node {
    const data = getDefaultConstantData(getPortWidth(node, portId));
    return prependNodeToPort(app, data, node, portId);
}

/**
 * Disconnects the wire driving the given input port.
 */
export function disconnectPort(app: App, node: dia.Element, portId: string) {
    const { diagramData } = app;
    diagramData.runInBatch('disconnect-port', () => {
        disconnectInputPort(app, node.id, portId);
    });
}

/**
 * Inserts a new cell on the given edge. The cell is as wide as the wire.
 */
export function insertCellNode(app: App, definition: CellDefinition, edge: Edge): Node {
    const data = getDefaultCellData(definition, app.diagramData.toJSON(), edge.getBusWidth());
    return insertNodeOnEdge(app, data, edge);
}

/**
 * Changes the type of the given cell. The name and the width are kept,
 * the wires connected to the ports which do not exist anymore are removed.
 */
export function changeCellType(app: App, cell: HdlCell, definition: CellDefinition) {
    const { diagramData } = app;
    const currentData = diagramData.get(cell.id as string) as NodeData;
    const parameters = getDefaultParameters(definition);
    const width = getDataWidth(currentData);
    if (width && 'WIDTH' in parameters) {
        parameters.WIDTH = width;
    }
    replaceNodeData(app, cell.id, {
        type: definition.shape as NodeData['type'],
        [Attribute.CellType]: definition.type,
        [Attribute.Parameters]: parameters,
    });
}

// IO

/**
 * Downloads the current diagram as a Yosys JSON file.
 */
export function downloadYosysJSON(app: App, {
    fileName = 'netlist.json'
} = {}): void {
    const str = JSON.stringify(app.getYosysJSON(), null, 2);
    const bytes = new TextEncoder().encode(str);
    const blob = new Blob([bytes], { type: 'application/json' });
    const el = window.document.createElement('a');
    el.href = window.URL.createObjectURL(blob);
    el.download = fileName;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

/**
 * Opens a file dialog to load a Yosys JSON file.
 */
export function openFileDialog(app: App, {
    accept = '.json'
}) {

    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', accept);
    fileInput.onchange = () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            let json: YosysJSON;
            try {
                json = JSON.parse(evt.target!.result as string);
            } catch {
                openMessageDialog(app, 'Invalid file', 'The file is not a valid JSON.');
                return;
            }
            loadYosysJSON(app, json);
        };

        reader.readAsText(file);
    };

    fileInput.click();
}
