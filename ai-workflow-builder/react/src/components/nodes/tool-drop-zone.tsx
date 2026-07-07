import { NODE_CATALOG } from '@/workflow/node-catalog';

/** Trapezoid drop-zone hint shown inside the AI Agent node above the tool port. */
export function ToolDropZone() {
  const nodeW = NODE_CATALOG.agent.width;
  const w = Math.round(nodeW * 0.32);
  const h = 22;
  const offsetX = Math.round((nodeW - w) / 2);

  return (
    <svg
      width={nodeW}
      height={h}
      viewBox={`0 0 ${nodeW} ${h}`}
      aria-label="Add agent tools"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <g transform={`translate(${offsetX}, 0)`}>
        <path
          d={`M 0,${h} L 3,${h} Q 3,0 20,0 L ${w - 20},0 Q ${w - 3},0 ${w - 3},${h} L ${w},${h}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          style={{ color: 'color-mix(in oklch, var(--color-foreground) 45%, transparent)' }}
        />
        <text
          x={w / 2}
          y={h / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="currentColor"
          style={{ color: 'var(--color-muted-foreground)', opacity: 0.9, fontFamily: 'inherit', letterSpacing: '0.02em' }}
        >
          agent tools
        </text>
      </g>
    </svg>
  );
}
