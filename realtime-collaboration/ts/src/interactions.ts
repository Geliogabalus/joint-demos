import { dia, shapes, elementTools } from '@joint/core';

import { graph, paper } from './graph';
import { provider, isRemotelySelected, setCursorPosition } from './collaboration';

paper.on('blank:pointerdblclick', (_evt, x, y) => {
    const rect = new shapes.standard.Rectangle({
        position: { x: x - 50, y: y - 20 },
        size: { width: 100, height: 40 },
        attrs: { label: { text: 'New box' } },
    });
    graph.addCell(rect);
});

paper.on('element:mouseenter', (elementView) => {
    if (isRemotelySelected(elementView.model.id)) return;
    elementView.addTools(
        new dia.ToolsView({
            tools: [
                new elementTools.Connect({ x: 'calc(w)', y: 'calc(h / 2 + 10)' }),
                new elementTools.Remove(),
            ],
        })
    );
});

paper.on('element:mouseleave', (elementView) => {
    elementView.removeTools();
});

paper.el.addEventListener('mousemove', (evt) => {
    const { x, y } = paper.clientToLocalPoint(evt.clientX, evt.clientY);
    setCursorPosition(x, y);
});

paper.el.addEventListener('mouseleave', () => {
    provider.awareness.setLocalStateField('cursor', null);
});

paper.on('cell:pointerdown', (cellView, evt) => {
    if (isRemotelySelected(cellView.model.id)) {
        cellView.preventDefaultInteraction(evt);
        return;
    }
    provider.awareness.setLocalStateField('selection', [cellView.model.id]);
});

paper.on('blank:pointerdown', () => {
    provider.awareness.setLocalStateField('selection', []);
});
