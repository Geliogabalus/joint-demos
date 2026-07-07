// Pure selectors over a cells array (e.g. the `useCells` selector argument).
// Named so intent reads at the call site and the "what is a selected element"
// rule lives in one place. `AnyCellRecord` is the same constraint `useCells`
// uses, so these accept whatever it hands the selector.
import type { AnyCellRecord } from "@joint/react-plus";
import type { CellId, WorkflowCell, WorkflowElement } from "./workflow-types";

/** Find an element cell by id in the controlled cells (`null` if absent / a link). */
export function getElementById(
  cells: readonly WorkflowCell[],
  id: CellId | undefined,
): WorkflowElement | null {
  if (id == null) return null;
  return (
    cells.find(
      (cell): cell is WorkflowElement =>
        cell.type === "element" && cell.id === id,
    ) ?? null
  );
}

/** The element feeding an input port (`target.port`) of `targetId` — `null` if
 *  unwired. One source per input port, so the first inbound link wins. */
export function getUpstreamElement(
  cells: readonly WorkflowCell[],
  targetId: CellId,
  port: string,
): WorkflowElement | null {
  for (const cell of cells) {
    if (
      cell.type === "link" &&
      cell.target?.id === targetId &&
      cell.target?.port === port
    ) {
      return getElementById(cells, cell.source?.id);
    }
  }
  return null;
}

/** Every element fed by an output port (`source.port`) of `sourceId`. */
export function getDownstreamElements(
  cells: readonly WorkflowCell[],
  sourceId: CellId,
  port: string,
): WorkflowElement[] {
  const targets: WorkflowElement[] = [];
  for (const cell of cells) {
    if (
      cell.type === "link" &&
      cell.source?.id === sourceId &&
      cell.source?.port === port
    ) {
      const node = getElementById(cells, cell.target?.id);
      if (node) targets.push(node);
    }
  }
  return targets;
}

/** Element cells within a selection (drops links). Narrows to the element
 *  member of the input type, so typed cell unions keep their `data` typing. */
export function selectElements<T extends AnyCellRecord>(
  cells: readonly T[],
): Extract<T, { readonly type: "element" }>[] {
  return cells.filter(
    (cell): cell is Extract<T, { readonly type: "element" }> =>
      cell.type === "element",
  );
}

/** Link cells within a selection (drops elements). Narrows to the link
 *  member of the input type, so typed cell unions keep their `data` typing. */
export function selectLinks<T extends AnyCellRecord>(
  cells: readonly T[],
): Extract<T, { readonly type: "link" }>[] {
  return cells.filter(
    (cell): cell is Extract<T, { readonly type: "link" }> =>
      cell.type === "link",
  );
}
