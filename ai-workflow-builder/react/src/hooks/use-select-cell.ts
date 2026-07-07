import type { PointerEvent } from "react";
import { useCellId, useSelection } from "@joint/react-plus";

// Pointer-down handler that selects this cell on a plain click. Node bodies stop pointer
// propagation (so dragging a control doesn't move the node), which also kills JointJS's own
// click-to-select; used as onPointerDownCapture this runs *before* that stop. Multi-select
// (Cmd/Ctrl) and region (Shift) are left to the Diagram interactions.
export function useSelectCell(): (event?: PointerEvent) => void {
  const id = useCellId();
  const { selectCells, collection } = useSelection();

  return (event?: PointerEvent) => {
    if (event?.shiftKey || event?.metaKey || event?.ctrlKey) return;
    // Already part of a multi-selection: leave it intact so the drag moves the
    // whole group. Re-selecting here would collapse it to this one node.
    if (collection.length > 1 && collection.get(id)) return;
    // Clicking a node with the mouse supersedes a stale keyboard-focused port,
    // so its focus ring doesn't linger after focus moves to another element.
    const active = document.activeElement;
    if (active instanceof SVGElement && active.closest(".jj-port")) {
      active.blur();
    }
    selectCells([id]);
  };
}
