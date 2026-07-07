import type { dia } from "@joint/plus";

/** The element + port currently focused (via a `.jj-port` <g>), or null. Ports
 *  are keyboard-focusable and their Enter/Space are reserved for connecting —
 *  canvas shortcuts skip them and PortConnectKeys targets them. */
export function getFocusedElementPort(
  paper: dia.Paper,
): { cellId: dia.Cell.ID; portId: string } | null {
  const active = document.activeElement;
  if (!active) return null;
  const view = paper.findView(active);
  if (!view) return null;
  const portId = view.findAttribute("port", active);
  if (!portId) return null;
  return { cellId: view.model.id, portId };
}

/** True when a popup menu/dialog owns focus — its keys must win over canvas
 *  shortcuts. (dia.Event omits `target`; the Keyboard hands handlers the native event.) */
export function isInOverlay(event: dia.Event): boolean {
  const target = (event as unknown as KeyboardEvent).target;
  return (
    target instanceof Element &&
    target.closest('[role="menu"],[role="dialog"]') !== null
  );
}

/** True when the CANVAS owns focus — not a side panel/input, and not a focused
 *  port (port keys are reserved for connecting). Gates canvas-only shortcuts so
 *  arrows don't move a node while tabbing a panel. */
export function isCanvasFocused(paper: dia.Paper): boolean {
  if (getFocusedElementPort(paper)) return false;
  const active = document.activeElement;
  return active === document.body || paper.el.contains(active);
}
