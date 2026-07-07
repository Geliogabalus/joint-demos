import type { ReactNode } from 'react';
import type { WorkflowCell } from '@/workflow/workflow-types';
import { WorkflowCellsContext } from './use-workflow-cells';

export function WorkflowCellsProvider({
  cells,
  children,
}: {
  readonly cells: readonly WorkflowCell[];
  readonly children: ReactNode;
}) {
  return <WorkflowCellsContext value={cells}>{children}</WorkflowCellsContext>;
}
