// Layered left-to-right layout: inputs/skills left, agent + tool middle, output right.
// Pure — returns new positions for the caller to apply; notes and links are untouched.
// Stacking is per COLUMN: each node steps down by its own height + a gap, so cards never overlap.
import { NODE_CATALOG, type ConfigKind } from './node-catalog';
import type { NodeData, WorkflowCell } from './workflow-types';

// Which column each kind belongs to, and its order within it (lower `order` sits higher).
const SLOT: Record<ConfigKind, { col: number; order: number }> = {
  input: { col: 0, order: 0 },
  skill: { col: 0, order: 1 },
  agent: { col: 1, order: 0 },
  tool: { col: 1, order: 1 },
  output: { col: 2, order: 0 },
};

const ORIGIN = { x: 80, y: 80 };
// Wide enough to clear the mid-wire "Tokens used: N" pill on the agent→output link
// (widest node 288 + ~130 for the pill).
const COLUMN_WIDTH = 420;
const ROW_GAP = 56;

interface PositionedCell {
  readonly id: string;
  readonly position: { x: number; y: number };
}

interface ColumnEntry {
  readonly id: string;
  readonly kind: ConfigKind;
  readonly order: number;
  /** Original index in `cells`, used as a stable tiebreaker. */
  readonly index: number;
}

export function autoArrange(cells: readonly WorkflowCell[]): PositionedCell[] {
  const columns = new Map<number, ColumnEntry[]>();
  cells.forEach((cell, index) => {
    if (cell.type !== 'element') return;
    const data = cell.data as NodeData;
    if (data.kind === 'note') return;
    const slot = SLOT[data.kind];
    const entry: ColumnEntry = { id: String(cell.id), kind: data.kind, order: slot.order, index };
    const bucket = columns.get(slot.col);
    if (bucket) bucket.push(entry);
    else columns.set(slot.col, [entry]);
  });

  const positioned: PositionedCell[] = [];
  for (const [col, entries] of columns) {
    // Stable order: by the kind's intended row, then original insertion order.
    entries.sort((a, b) => a.order - b.order || a.index - b.index);
    const x = ORIGIN.x + col * COLUMN_WIDTH;
    let y = ORIGIN.y;
    for (const entry of entries) {
      positioned.push({ id: entry.id, position: { x, y } });
      y += NODE_CATALOG[entry.kind].height + ROW_GAP;
    }
  }
  return positioned;
}
