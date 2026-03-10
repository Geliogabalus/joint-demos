import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { g, dia, V, mvc, highlighters } from '@joint/core';

import { graph, paper } from './graph';

// ---- Types ----

export interface User {
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

// ---- UserCursor view ----

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
        V('circle', { r: 5, fill: this.user.color }).appendTo(this.el);
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
            const existing = UserCursor.cursors.get(user.name)!;
            existing.cursor = cursor;
            existing.update();
            return existing;
        }
        const view = new UserCursor({ paper, user, cursor });
        view.render();
        UserCursor.cursors.set(user.name, view);
        return view;
    }

    static remove(user: User): void {
        const existing = UserCursor.cursors.get(user.name);
        if (existing) {
            existing.remove();
            UserCursor.cursors.delete(user.name);
        }
    }
}

// ---- Yjs sync ----

const ydoc = new Y.Doc();
const ymap = ydoc.getMap<dia.Cell.JSON>();

graph.getCells().forEach((cell) => {
    ymap.set(cell.id as string, cell.toJSON({ ignoreDefaults: false }));
});

graph.on('change', (cell, opt) => {
    if (opt.remote) return;
    ymap.set(cell.id as string, cell.toJSON({ ignoreDefaults: false }));
});

graph.on('add', (cell, opt) => {
    if (opt.remote) return;
    ymap.set(cell.id as string, cell.toJSON({ ignoreDefaults: false }));
});

graph.on('remove', (cell, opt) => {
    if (opt.remote) return;
    ymap.delete(cell.id);
});

ymap.observe((event) => {
    event.keysChanged.forEach((key) => {
        const cellData = ymap.get(key);
        if (!cellData) {
            const cell = graph.getCell(key);
            if (cell) graph.removeCell(cell, { remote: true });
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

// ---- WebRTC provider ----

export const provider = new WebrtcProvider('jointjs-yjs', ydoc, {
    signaling: ['wss://jointjs-y-webrtc.duckdns.org'],
});

// ---- Local user ----

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5'];

export const localUser: User = (() => {
    const user = {
        name: 'User ' + g.random(0, 1000).toString(),
        color: colors[Math.floor(Math.random() * colors.length)],
    };
    provider.awareness.setLocalStateField('user', user);
    return user;
})();

export function setCursorPosition(x: number, y: number) {
    provider.awareness.setLocalStateField('cursor', { x, y });
}

export function isRemotelySelected(cellId: dia.Cell.ID) {
    return Array.from(provider.awareness.getStates()).some(([, state]) => {
        if (state.user === localUser || !state.selection) return false;
        return state.selection.includes(cellId);
    });
}

// ---- Awareness: user panel, cursors, selection highlights ----

provider.awareness.on('change', () => {
    const localStrings: string[] = [];
    const remoteStrings: string[] = [];
    highlighters.mask.removeAll(paper, 'selection');

    provider.awareness.getStates().forEach((state) => {
        if (!state.user) return;

        const isLocal = state.user.name === localUser.name;
        const entry = isLocal
            ? `<div class="user user-local" style='color:${state.user.color};'>• ${state.user.name} <span class="user-you">you</span></div>`
            : `<div class="user" style='color:${state.user.color};'>• ${state.user.name}</div>`;
        (isLocal ? localStrings : remoteStrings).push(entry);

        if (state.cursor) {
            if (!isLocal) UserCursor.get(paper, state.user, state.cursor);
        } else {
            UserCursor.remove(state.user);
        }

        const selection = state.selection || [];
        (selection as dia.Cell.ID[]).forEach((id) => {
            const cell = graph.getCell(id);
            if (!cell) return;
            highlighters.mask.add(
                cell.findView(paper),
                cell.isLink() ? 'line' : 'body',
                'selection',
                { attrs: { stroke: state.user.color, strokeWidth: 3 } }
            );
        });
    });

    document.querySelector('#users')!.innerHTML = [...localStrings, ...remoteStrings].join('');
});
