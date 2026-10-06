import { dia } from '@joint/plus';

/**
 * Get the center point of a tool view.
 */
export function getToolCenter(tool: dia.ToolView): dia.Point {
    const bbox = tool.el.getBoundingClientRect();
    return {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2
    };
}

/**
 * Adds the given tools to the cell view.
 */
export function addTools(cellView: dia.CellView, tools: dia.ToolView[], options?: dia.ToolsView.Options): dia.ToolsView | null {
    if (tools.length === 0) return null;

    const toolsView = new dia.ToolsView({ ...options, tools });
    cellView.addTools(toolsView);
    return toolsView;
}

/**
 * Is the given DOM element (e.g. the element the pointer moved to) a part of a tool?
 */
export function isToolElement(target: EventTarget | null | undefined): boolean {
    return target instanceof Element && Boolean(target.closest('.joint-tools'));
}

