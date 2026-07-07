// Read domain data off a live dia model — controlled cells sync it under the `data` attribute.
import type { dia } from '@joint/plus';
import type { NodeData, NodeKind } from './workflow-types';

export function getNodeData(model: dia.Cell): NodeData | null {
  return (model.get('data') as NodeData | undefined) ?? null;
}

/** The cell's node kind; `'unknown'` for cells carrying no node data (links,
 *  foreign or malformed-import cells). `getPortConfig` accepts it, so kind
 *  lookups chain without a guard. */
export function getNodeKind(model: dia.Cell): NodeKind | 'unknown' {
  return getNodeData(model)?.kind ?? 'unknown';
}
