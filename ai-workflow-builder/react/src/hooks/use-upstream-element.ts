// Reactive lookup of the node feeding an input port. Reads the controlled
// `cells` (via `useWorkflowCells`) so the result updates when links or the
// source node change — unlike an imperative `dia.Graph` read during render.
import { useWorkflowCells } from './use-workflow-cells';
import { getUpstreamElement } from '@/workflow/selectors';
import type {
    CellId,
    NodeData,
    NodeKind,
    WorkflowElement,
} from '@/workflow/workflow-types';

/** A workflow element narrowed to a specific node kind. */
type NodeOfKind<K extends NodeKind> = WorkflowElement & {
  readonly data: Extract<NodeData, { kind: K }>;
};

/**
 * The element wired into `targetId`'s `targetPort`, if it is of `kind`.
 * One source per input port, so the first inbound link wins.
 * @returns the typed upstream node, or `null` if unwired / wrong kind.
 */
export function useUpstreamElement<K extends NodeKind>(
    targetId: CellId,
    targetPort: string,
    kind: K,
): NodeOfKind<K> | null {
    const cells = useWorkflowCells();
    const element = getUpstreamElement(cells, targetId, targetPort);
    return element?.data.kind === kind ? (element as NodeOfKind<K>) : null;
}
