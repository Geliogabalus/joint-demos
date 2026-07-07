// Canvas keyboard shortcuts (a11y: operable without the pointer). Bound via the real
// useOnKeyboardEvents on the Diagram's ui.Keyboard, which already ignores typing in
// inputs/textareas/contentEditable. Built-in shortcuts are off (interactions.keyboard:
// false) so these never double-fire — that flag disables shortcuts, not the Keyboard instance.
import {
  useClipboard,
  useGraph,
  useGraphHistory,
  useOnKeyboardEvents,
  usePaper,
  useSelection,
} from "@joint/react-plus";
import type { dia } from "@joint/plus";
import type { WorkflowElement, WorkflowLink } from "@/workflow/workflow-types";
import { isCanvasFocused, isInOverlay } from "./focus";

const ARROW_DELTA: Record<string, readonly [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

function useWorkflowShortcuts(): void {
  const { collection: selectionCollection, selection, selectCells, selectAllElements } =
    useSelection();
  const { copyCells, pasteCells } = useClipboard();
  const { removeCells, graph, transaction } = useGraph<WorkflowElement, WorkflowLink>();
  const { undo, redo } = useGraphHistory();
  const { paper } = usePaper();

  function nudge(direction: keyof typeof ARROW_DELTA, big: boolean, event: dia.Event) {
    if (isInOverlay(event)) return;
    if (!selection || selectionCollection.length === 0) return;
    if (!paper || !isCanvasFocused(paper)) return;
    event.preventDefault();
    const step = big ? 40 : 8;
    const [ux, uy] = ARROW_DELTA[direction];
    // Use Selection.translateSelectedElements (what a drag calls) so the move renders +
    // persists; a plain setCell({ position }) won't repaint the frozen React-driven paper.
    // One transaction → a single undo entry for the nudge.
    transaction(() => {
      selection.translateSelectedElements(ux * step, uy * step);
    });
  }

  useOnKeyboardEvents({
    "ctrl+z command+z": () => undo(),
    "shift+ctrl+z shift+command+z": () => redo(),
    "ctrl+a command+a": (event) => {
      if (isInOverlay(event)) return;
      event.preventDefault();
      // Select all nodes (elements only, not links).
      selectAllElements();
    },
    "ctrl+c command+c": (event) => {
      if (!isInOverlay(event)) copyCells(selectionCollection);
    },
    "ctrl+v command+v": (event) => {
      if (!isInOverlay(event)) pasteCells({ translate: { dx: 28, dy: 28 } });
    },
    "delete backspace": (event) => {
      if (isInOverlay(event)) return;
      // Selection holds elements AND links (click-select works on both).
      if (selectionCollection.length === 0) return;
      event.preventDefault();
      removeCells(selectionCollection.toArray());
      // Keep a selection after delete so keyboard nav continues — fall back to
      // the last remaining cell (mirrors the node context-menu remove).
      const nextSelection = graph.getLastCell();
      if (nextSelection) selectCells([nextSelection]);
    },
    // Arrow + Shift+Arrow hash separately — bind every combo.
    up: (event) => nudge("up", false, event),
    down: (event) => nudge("down", false, event),
    left: (event) => nudge("left", false, event),
    right: (event) => nudge("right", false, event),
    "shift+up": (event) => nudge("up", true, event),
    "shift+down": (event) => nudge("down", true, event),
    "shift+left": (event) => nudge("left", true, event),
    "shift+right": (event) => nudge("right", true, event),
  });
}

// Mount-only wrapper. Rendered as a CHILD of <Paper> (next to <Selection>) so
// useSelection().selection resolves — the nudge needs the live SelectionView.
export function WorkflowShortcuts(): null {
  useWorkflowShortcuts();
  return null;
}
