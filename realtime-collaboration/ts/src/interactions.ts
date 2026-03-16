import { dia, elementTools } from '@joint/core';

import { graph, paper } from './app';
import { provider, localUser, isInteractionBlocked, isEditingName, setCursorPosition, setEditingCell } from './collaboration';
import { TextBox } from './shapes/text-box';

let activeEditor: HTMLElement | null = null;

export function init() {

    paper.on('blank:pointerdblclick', (_evt, x, y) => {
        if (isEditingName()) return;
        const box = new TextBox({
            position: { x: x - 40, y: y - 20 },
            attrs: { label: { text: 'New box' }},
        });
        graph.addCell(box);
    });

    paper.on('element:pointerdblclick', (elementView) => {
        const cell = elementView.model as dia.Element;
        if (isInteractionBlocked(cell.id)) return;
        startEditing(cell);
    });

    paper.on('element:mouseenter', (elementView) => {
        if (isInteractionBlocked(elementView.model.id)) return;
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
        if (isInteractionBlocked(cellView.model.id)) {
            cellView.preventDefaultInteraction(evt);
            return;
        }
        provider.awareness.setLocalStateField('selection', [cellView.model.id]);
    });

    paper.on('blank:pointerdown', () => {
        provider.awareness.setLocalStateField('selection', []);
        activeEditor?.blur();
    });

}

function startEditing(cell: dia.Element) {
    const { x, y } = cell.position();
    const { width, height } = cell.size();
    const topLeft = paper.localToClientPoint(x, y);
    const bottomRight = paper.localToClientPoint(x + width, y + height);

    setEditingCell(cell.id);
    provider.awareness.setLocalStateField('selection', []);

    const wrapper = document.createElement('div');
    const editor = document.createElement('div');
    activeEditor = editor;
    editor.contentEditable = 'true';
    editor.spellcheck = false;
    editor.textContent = (cell.attr('label/text') as string) || '';

    Object.assign(wrapper.style, {
        position: 'fixed',
        left: `${topLeft.x}px`,
        top: `${topLeft.y}px`,
        width: `${bottomRight.x - topLeft.x}px`,
        height: `${bottomRight.y - topLeft.y}px`,
        zIndex: '100',
        border: `2px solid ${localUser.color}`,
        borderRadius: '2px',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
    });

    const fontSize = cell.attr('label/fontSize') ?? 14;
    const textWrap = cell.attr('label/textWrap') as { width?: number; height?: number } | undefined;
    const { sx, sy } = paper.scale();
    const paddingH = textWrap?.width != null && textWrap.width < 0 ? (Math.abs(textWrap.width) / 2) * sx : 8;
    const paddingV = textWrap?.height != null && textWrap.height < 0 ? (Math.abs(textWrap.height) / 2) * sy : 4;

    Object.assign(editor.style, {
        outline: 'none',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontSize: `${fontSize}px`,
        padding: `${paddingV}px ${paddingH}px`,
        width: '100%',
        wordBreak: 'break-word',
    });

    wrapper.appendChild(editor);
    document.body.appendChild(wrapper);

    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    let done = false;

    function commit() {
        if (done) return;
        done = true;
        cell.attr('label/text', editor.textContent?.trim() ?? '');
        cleanup();
    }

    function cancel() {
        if (done) return;
        done = true;
        cleanup();
    }

    function cleanup() {
        activeEditor = null;
        setEditingCell(null);
        wrapper.remove();
    }

    editor.addEventListener('blur', commit);

    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            cancel();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            commit();
        }
    });
}
