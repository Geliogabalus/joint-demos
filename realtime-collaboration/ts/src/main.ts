import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import {
    g,
    dia,
    shapes,
    V,
    elementTools,
    mvc,
    highlighters,
} from '@joint/core';

const textMargin = 5;

const cellNamespace = {
    ...shapes,
};

const graph = new dia.Graph(
    {},
    {
        cellNamespace: cellNamespace,
    }
);

const paper = new dia.Paper({
    el: document.getElementById('paper-container'),
    width: 600,
    height: 600,
    overflow: true,
    model: graph,
    cellViewNamespace: cellNamespace,
    gridSize: 1,
    async: true,
    linkPinning: false,
    defaultAnchor: {
        name: 'center',
        args: {
            useModelGeometry: true,
        },
    },
    defaultConnectionPoint: {
        name: 'rectangle',
        args: {
            useModelGeometry: true,
        },
    },
});

paper.el.style.border = '1px solid lightgray';

// Text rendering

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
            {
                tagName: 'rect',
                selector: 'labelBody',
            },
            {
                tagName: 'text',
                selector: 'labelText',
            },
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
            attrs: {
                labelText: {
                    text: 'Label auto size',
                },
            },
        },
    ],
});

// Add examples to the graph
graph.addCells([r1, r2, l1]);

// Resize the paper to fit the content using the model geometry.
// paper.fitToContent({ useModelGeometry: true, padding: 20 });

// Yjs documents are collections of
// shared objects that sync automatically.
const ydoc = new Y.Doc();
// Define a shared Y.Map instance
const ymap = ydoc.getMap<dia.Cell.JSON>();

graph.getCells().forEach((cell) => {
    ymap.set(cell.id as string, cell.toJSON({ ignoreDefaults: false }));
});

graph.on('change', (cell, opt) => {
    if (opt.remote) return; // Ignore remote changes
    ymap.set(cell.id as string, cell.toJSON({ ignoreDefaults: false }));
});

graph.on('add', (cell, opt) => {
    if (opt.remote) return; // Ignore remote changes
    ymap.set(cell.id as string, cell.toJSON({ ignoreDefaults: false }));
});

graph.on('remove', (cell, opt) => {
    if (opt.remote) return; // Ignore remote changes
    ymap.delete(cell.id);
});

ymap.observe((event) => {
    event.keysChanged.forEach((key) => {
        const cellData = ymap.get(key);
        if (!cellData) {
            const cell = graph.getCell(key);
            if (cell) {
                graph.removeCell(cell, { remote: true });
            }
            return;
        }
        const cell = graph.getCell(key);
        if (cell) {
            const { id, type, ...restData } = cellData;
            cell.set(restData, { remote: true });
        } else {
            graph.addCell(cellData);
        }
    });
});

const provider = new WebrtcProvider('jointjs-yjs', ydoc, {
    signaling: ['wss://tydzhj.csb.app/'],
});

paper.on('blank:pointerdblclick', (evt, x, y) => {
    const rect = new shapes.standard.Rectangle({
        position: { x: x - 50, y: y - 20 },
        size: { width: 100, height: 40 },
        attrs: {
            label: {
                text: 'New box',
            },
        },
    });
    graph.addCell(rect);
});

paper.on('element:mouseenter', (elementView, evt) => {
    const remotelySelected = isRemotelySelected(elementView.model.id);
    if (remotelySelected) {
        return;
    }
    elementView.addTools(
        new dia.ToolsView({
            tools: [
                new elementTools.Connect({ x: 'calc(w)', y: 'calc(h / 2 + 10)' }),
                new elementTools.Remove(),
            ],
        })
    );
});

paper.on('element:mouseleave', (elementView, evt) => {
    elementView.removeTools();
});

function isRemotelySelected(cellId: dia.Cell.ID) {
    return Array.from(provider.awareness.getStates()).some(([, state]) => {
        if (state.user === localUser || !state.selection) {
            return false;
        }
        return state.selection.includes(cellId);
    });
}

interface User {
    name: string;
    color: string;
}

interface Cursor {
    x: number;
    y: number;
}

interface UserCursorOptions extends mvc.ViewOptions<undefined, SVGGElement> {
    paper: dia.Paper;
    user: User;
    cursor: Cursor;
}

class UserCursor extends mvc.View<undefined, SVGGElement> {
    static cursors: Map<string, UserCursor> = new Map();

    paper!: dia.Paper;
    user!: User;
    cursor!: Cursor;

    preinitialize(options: UserCursorOptions) {
        this.tagName = 'g';
        this.svgElement = true;
        this.paper = options.paper;
        this.user = options.user;
        this.cursor = options.cursor;
    }

    attributes = {
        pointerEvents: 'none',
        filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))',
    };

    render(): this {
        V('circle', {
            r: 5,
            fill: this.user.color,
        }).appendTo(this.el);
        V('text', {
            x: 10,
            y: 4,
            fontSize: 12,
            fontFamily: 'sans-serif',
            fill: this.user.color,
        })
            .appendTo(this.el)
            .text(this.user.name);

        this.update();
        this.vel.appendTo(this.paper.getLayerView(dia.Paper.Layers.FRONT).el);
        return this;
    }

    update() {
        this.vel.attr('transform', `translate(${this.cursor.x}, ${this.cursor.y})`);
    }

    static get(paper: dia.Paper, user: User, cursor: Cursor): UserCursor {
        if (UserCursor.cursors.has(user.name)) {
            const existingView = UserCursor.cursors.get(user.name)!;
            existingView.cursor = cursor;
            existingView.update();
            return existingView;
        }
        const view = new UserCursor({ paper, user, cursor });
        view.render();
        UserCursor.cursors.set(user.name, view);
        return view;
    }

    static remove(user: User): void {
        const existingView = UserCursor.cursors.get(user.name);
        if (existingView) {
            existingView.remove();
            UserCursor.cursors.delete(user.name);
        }
    }
}

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5'];

const setUser = () => {
    const user = {
        name: 'User ' + g.random(0, 1000).toString(),
        color: colors[Math.floor(Math.random() * colors.length)],
    };
    provider.awareness.setLocalStateField('user', user);
    return user;
};

const setCursorPosition = (x: number, y: number) => {
    provider.awareness.setLocalStateField('cursor', {
        x,
        y,
    });
};

provider.awareness.on('change', () => {
    // Map each awareness state to a dom-string
    const strings: string[] = [];
    highlighters.mask.removeAll(paper, 'selection');
    provider.awareness.getStates().forEach((state) => {
        if (state.user) {
            strings.push(
                `<div style='color:${state.user.color};'>• ${state.user.name}</div>`
            );
            // Update or create user cursor
            if (state.cursor) {
                if (localUser !== state.user) {
                    UserCursor.get(paper, state.user, state.cursor);
                }
            } else {
                UserCursor.remove(state.user);
            }
            // Update the selection
            const selection = state.selection || [];
            const cells = (selection as dia.Cell.ID[]).map((id) => graph.getCell(id));
            cells.forEach((cell) => {
                if (!cell) {
                    return;
                }
                highlighters.mask.add(
                    cell.findView(paper),
                    cell.isLink() ? 'line' : 'body',
                    'selection',
                    {
                        attrs: {
                            stroke: state.user.color,
                            strokeWidth: 3,
                        },
                    }
                );
            });
        }
    });
    document.querySelector('#users')!.innerHTML = strings.join('');
});

const localUser = setUser();

paper.el.addEventListener('mousemove', (evt) => {
    const { x, y } = paper.clientToLocalPoint(evt.clientX, evt.clientY);
    setCursorPosition(x, y);
});

paper.el.addEventListener('mouseleave', (evt) => {
    provider.awareness.setLocalStateField('cursor', null);
});

paper.on('cell:pointerdown', (cellView, evt, x, y) => {
    const remotelySelected = isRemotelySelected(cellView.model.id);
    if (remotelySelected) {
        cellView.preventDefaultInteraction(evt);
        return;
    }
    provider.awareness.setLocalStateField('selection', [cellView.model.id]);
});

paper.on('blank:pointerdown', (evt, x, y) => {
    provider.awareness.setLocalStateField('selection', []);
});
