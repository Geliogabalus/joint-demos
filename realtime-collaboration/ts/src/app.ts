import { dia, shapes } from '@joint/core';
import { init as initCollaboration } from './collaboration';
import { init as initInteractions } from './interactions';
const textMargin = 5;

export const cellNamespace = { ...shapes };

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

    const r1 = new shapes.standard.Rectangle({
        id: 'rect1',
        position: { x: 100, y: 100 },
        size: { width: 140, height: 100 },
        attrs: {
            label: {
                fontSize: 14,
                fontFamily: 'sans-serif',
                text: 'Text wrapping',
            },
        },
    });

    const r2 = new shapes.standard.Rectangle({
        id: 'rect2',
        position: { x: 400, y: 100 },
        size: { width: 140, height: 100 },
        attrs: {
            label: {
                fontSize: 12,
                fontFamily: 'sans-serif',
                text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                textWrap: {
                    width: -10,
                    height: -10,
                    ellipsis: true,
                },
            },
        },
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



