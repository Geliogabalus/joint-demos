import { Controller } from '../system/controllers';
// Diagram
import { LAYOUT_BATCH_NAME } from '../diagram/const';
// Actions
import { updateWires } from '../actions/wire-actions';
import { updateJSONPanel } from '../actions/json-actions';

import type { App } from '../app';

/**
 * NetlistController keeps the derived views of the netlist up to date
 * (the wire widths and the Yosys JSON) every time the diagram is rebuilt.
 */
export default class NetlistController extends Controller<[App]> {

    startListening() {
        const { graph } = this.context;

        this.listenTo(graph, {
            'batch:stop': onGraphBatchStop,
        });
    }
}

function onGraphBatchStop(app: App, { batchName }: { batchName: string }) {
    if (batchName !== LAYOUT_BATCH_NAME) return;
    updateWires(app);
    updateJSONPanel(app);
}
