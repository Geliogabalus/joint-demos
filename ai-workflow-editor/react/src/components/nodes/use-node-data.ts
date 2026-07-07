// Binds the cell's setCellData to its id and exposes a `patch` merging a partial into current data.
import { useCallback } from 'react';
import { useCellId, useGraph, type ElementRecord } from '@joint/react-plus';

export function useNodeData<Data extends object>() {
  const id = useCellId();
  const { setCellData } = useGraph<ElementRecord<Data>>();
  const patch = useCallback(
    (partial: Partial<Data>) => setCellData(id, (current) => ({ ...current, ...partial })),
    [id, setCellData]
  );
  return patch;
}
