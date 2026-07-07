import { FileCode, FileText, Type, Wrench } from "lucide-react";
import { cn } from "@/utils/cn";
import { NODE_CATALOG, type ConfigKind } from "@/workflow/node-catalog";
import { PORT_TYPE_COLOR } from "@/workflow/port-colors";
import type { PortDescriptor, PortType } from "@/workflow/workflow-types";
import { ToolDropZone } from "./tool-drop-zone";

const PORT_ICON: Record<
  PortType,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  text: Type,
  skill: FileCode,
  result: FileText,
  tool: Wrench,
};

function PortIcon({ type }: { readonly type: PortType }) {
  const Icon = PORT_ICON[type];
  return <Icon size={10} color={PORT_TYPE_COLOR[type]} />;
}

function PortRow({
  port,
  side,
}: {
  readonly port: PortDescriptor;
  readonly side: "in" | "out";
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-[11px] text-muted-foreground",
        side === "out" && "flex-row-reverse",
      )}
    >
      <PortIcon type={port.type} />
      {port.label}
    </span>
  );
}

function PortColumns({
  inputs,
  outputs,
}: {
  readonly inputs: readonly PortDescriptor[];
  readonly outputs: readonly PortDescriptor[];
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        {inputs.map((port) => (
          <PortRow key={port.id} port={port} side="in" />
        ))}
      </div>
      <div className="flex flex-col items-end gap-1">
        {outputs.map((port) => (
          <PortRow key={port.id} port={port} side="out" />
        ))}
      </div>
    </>
  );
}

export function PortLegend({ kind }: { readonly kind: ConfigKind }) {
  const { ports } = NODE_CATALOG[kind];
  if (ports.length === 0) return null;
  const inputs = ports.filter((port) => port.direction === "in");
  const outputs = ports.filter((port) => port.direction === "out");
  if (kind === "agent") {
    // The agent's bottom tool port lives in the drop zone, not the output column.
    const sideOutputs = outputs.filter((port) => port.side !== "bottom");
    return (
      <div className="border-t border-border/70 bg-muted/30">
        <div className="flex items-start justify-between px-3.5 pt-2 pb-0">
          <PortColumns inputs={inputs} outputs={sideOutputs} />
        </div>
        <div className="-mt-3">
          <ToolDropZone />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-t border-border/70 bg-muted/30 px-3.5 py-2">
      <PortColumns inputs={inputs} outputs={outputs} />
    </div>
  );
}
