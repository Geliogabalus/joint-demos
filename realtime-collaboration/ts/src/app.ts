import { dia, shapes } from '@joint/core';
import { init as initCollaboration } from './collaboration';
import { init as initInteractions } from './interactions';
import { TextBox, TextBoxView } from './shapes/text-box';

const textMargin = 5;

export const cellNamespace = { ...shapes, custom: { TextBox, TextBoxView }};

export let graph: dia.Graph;

export let paper: dia.Paper;

export function init() {

    graph = new dia.Graph({}, { cellNamespace });

    paper = new dia.Paper({
        el: document.getElementById('paper-container'),
        width: window.innerWidth,
        height: window.innerHeight,
        overflow: true,
        model: graph,
        cellViewNamespace: cellNamespace,
        gridSize: 1,
        async: true,
        linkPinning: false,
        defaultAnchor: {
            name: 'center',
            args: { useModelGeometry: true },
        },
        defaultConnectionPoint: {
            name: 'rectangle',
            args: { useModelGeometry: true },
        },
    });

    window.addEventListener('resize', () => {
        paper.setDimensions(window.innerWidth, window.innerHeight);
    });

    const r1 = new TextBox({
        id: 'rect1',
        position: { x: 100, y: 100 },
        attrs: { label: { text: 'Hello World' }},
    });

    const r2 = new TextBox({
        id: 'rect2',
        position: { x: 400, y: 100 },
        attrs: { label: { text: 'Double-click to edit' }},
    });

    const l1 = new shapes.standard.Link({
        id: 'link1',
        source: { id: r1.id },
        target: { id: r2.id },
        defaultLabel: {
            markup: [
                { tagName: 'rect', selector: 'labelBody' },
                { tagName: 'text', selector: 'labelText' },
            ],
            attrs: {
                labelBody: {
                    ref: 'labelText',
                    fill: '#fff',
                    fillOpacity: 0.9,
                    stroke: '#333',
                    strokeWidth: 0.5,
                    width: `calc(w + ${textMargin * 2})`,
                    height: `calc(h + ${textMargin * 2})`,
                    x: `calc(x - ${textMargin})`,
                    y: `calc(y - ${textMargin})`,
                },
                labelText: {
                    fontSize: 12,
                    fontFamily: 'sans-serif',
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle',
                    fill: '#333',
                    strokeWidth: 2,
                },
            },
        },
        labels: [
            {
                position: 0.5,
                attrs: { labelText: { text: 'Label auto size' }},
            },
        ],
    });

    graph.addCells([r1, r2, l1]);

    initCollaboration();
    initInteractions();
}



