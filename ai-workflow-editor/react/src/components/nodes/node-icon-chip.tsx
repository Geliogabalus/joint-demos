import { cn } from '@/utils/cn';
import { NODE_CATALOG, type ConfigKind } from '@/workflow/node-catalog';
import { NodeIcon } from './node-icon';
import { PORT_CHIP_CLASS } from './port-style';

export function NodeIconChip({
  kind,
  className,
}: {
  readonly kind: ConfigKind;
  readonly className?: string;
}) {
  const config = NODE_CATALOG[kind];
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-lg',
        PORT_CHIP_CLASS[config.accent],
        className
      )}
    >
      <NodeIcon name={config.icon} className="size-4" />
    </span>
  );
}
