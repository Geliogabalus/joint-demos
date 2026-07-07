// Canonical link orientation: a link flows output → input. `orientEnds` states
// the rule once — connection-rules validates with it, and `orientLink`
// applies it to a just-drawn link (which may be dragged from either end).
import type { dia } from '@joint/plus';
import { getPortConfig } from './node-catalog';
import { getNodeKind } from './node-model';
import type { PortDirection } from './workflow-types';

/**
 * Arranges two link ends into `[source, target]` by their port direction —
 * `null` when the pair isn't exactly one output + one input.
 */
export function orientEnds<T extends { readonly direction: PortDirection }>(
  a: T,
  b: T,
): [source: T, target: T] | null {
  if (a.direction === 'out' && b.direction === 'in') return [a, b];
  if (a.direction === 'in' && b.direction === 'out') return [b, a];
  return null;
}

function getEndDirection(cell: dia.Cell, port: string): PortDirection | null {
  return getPortConfig(getNodeKind(cell), port)?.direction ?? null;
}

/**
 * Rewrites `link`'s ends into canonical orientation, so a link drawn
 * input → output comes out stored as output → input. No-op when already
 * canonical or when either end is unresolvable.
 */
export function orientLink(link: dia.Link): void {
  const source = link.source();
  const target = link.target();
  const sourceCell = link.getSourceCell();
  const targetCell = link.getTargetCell();
  // Port-to-port links only — an unresolved cell or a port-less end is left alone.
  if (!sourceCell || !targetCell || !source.port || !target.port) return;

  const sourceDirection = getEndDirection(sourceCell, source.port);
  const targetDirection = getEndDirection(targetCell, target.port);
  if (!sourceDirection || !targetDirection) return;

  const oriented = orientEnds(
    { end: source, direction: sourceDirection },
    { end: target, direction: targetDirection },
  );
  if (!oriented) return;
  const [sourceEnd, targetEnd] = oriented;
  if (sourceEnd.end === source) return;
  link.set({ source: sourceEnd.end, target: targetEnd.end });
}
