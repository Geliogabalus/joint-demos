// Exposes the controlled `cells` to nodes rendered inside `renderElement`. React context
// flows through JointJS's render portals, so this is available inside any node.
import { createContext, useContext } from 'react';
import type { WorkflowCell } from '@/workflow/workflow-types';

export const WorkflowCellsContext = createContext<readonly WorkflowCell[]>([]);

export function useWorkflowCells(): readonly WorkflowCell[] {
  return useContext(WorkflowCellsContext);
}
