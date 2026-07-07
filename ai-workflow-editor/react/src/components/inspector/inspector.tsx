import { useGraph } from "@joint/react-plus";
import { ExpandableResult, MarkdownResult } from "@/components/nodes/bodies/output-body";
import { NodeIcon } from "@/components/nodes/node-icon";
import { MarkdownFileField } from "@/components/nodes/markdown-file-field";
import { ModelSelector } from "@/components/nodes/model-selector";
import { PORT_CHIP_CLASS } from "@/components/nodes/port-style";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/utils/cn";
import { useUpstreamElement } from "@/hooks/use-upstream-element";
import { NODE_CATALOG } from "@/workflow/node-catalog";
import { selectElements, selectLinks } from "@/workflow/selectors";
import type { Computed } from "@joint/react-plus";
import type {
  NodeAppearance,
  NodeData,
  WorkflowCell,
  WorkflowElement,
  WorkflowLink,
} from "@/workflow/workflow-types";
import { AppearanceSection } from "./appearance-section";
import {
  Labelled,
  NodeTextarea,
  Panel,
  ReadOnly,
} from "./inspector-fields";
import { SwatchRow } from "@/components/ui/swatch-row";
import { InspectorEmptyState } from "./inspector-empty-state";
import { NoteEditor } from "./note-editor";

export function Inspector({
  cells,
}: {
  /** The currently selected cells (not the whole graph), in resolved
   *  `Computed` form so framework fields like `id`/`data` are required. */
  readonly cells: readonly Computed<WorkflowCell>[];
}) {
  // `selectElements` / `selectLinks` split the selection into typed records.
  const selectedElements = selectElements(cells);
  const selectedLinks = selectLinks(cells);

  if (selectedElements.length === 0 && selectedLinks.length === 0) {
    return (
      <Panel>
        <InspectorEmptyState />
      </Panel>
    );
  }

  // Single node (and nothing else) → its editable properties. Any other mix
  // (multiple nodes, links, or a node + link) → a count summary.
  if (selectedElements.length === 1 && selectedLinks.length === 0) {
    return (
      <Panel>
        <InspectorBody element={selectedElements[0]} />
      </Panel>
    );
  }

  return (
    <Panel>
      <p className="text-xs text-muted-foreground">
        {describeSelection(selectedElements.length, selectedLinks.length)}
      </p>
    </Panel>
  );
}

/** "2 nodes and 1 link selected." — omits a zero part, pluralizes each. */
function describeSelection(nodeCount: number, linkCount: number): string {
  const parts: string[] = [];
  if (nodeCount > 0) parts.push(`${nodeCount} ${nodeCount === 1 ? "node" : "nodes"}`);
  if (linkCount > 0) parts.push(`${linkCount} ${linkCount === 1 ? "link" : "links"}`);
  return `${parts.join(" and ")} selected.`;
}

interface InspectorBodyProps {
  readonly element: Computed<WorkflowElement>;
}

function InspectorBody({ element }: InspectorBodyProps) {
  const { setCellData } = useGraph<WorkflowElement, WorkflowLink>();
  const data = element.data;
  const elementId = element.id;
  // Agent read-only mirrors: the wired-in Input's prompt / Skill's content.
  // Reactive, so they update when links change (only meaningful for agents).
  const promptNode = useUpstreamElement(elementId, "prompt", "input");
  const skillNode = useUpstreamElement(elementId, "skill", "skill");

  // All three edits only touch `data`, so they go through `setCellData`.
  // `current` is narrowed to a single kind at the call site, so spreading stays type-correct.
  function updateData<T extends NodeData>(current: T, next: Partial<T>) {
    setCellData(elementId, { ...current, ...next });
  }

  function setAppearance(next: NodeAppearance) {
    if (data.kind === "note") return;
    updateData(data, { appearance: { ...data.appearance, ...next } });
  }

  function setMeta(next: { name?: string; description?: string }) {
    if (data.kind === "note") return;
    updateData(data, next);
  }

  if (data.kind === "note") {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <span className="text-[11px] text-muted-foreground">Note</span>
          <NoteEditor
            text={data.text}
            onChange={(text) => updateData(data, { text })}
          />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] text-muted-foreground">Color</span>
          <SwatchRow
            label="Note color"
            value={data.color}
            onChange={(color) => updateData(data, { color })}
            size="size-5"
            ringOffset="ring-offset-background"
            className="gap-1.5"
          />
        </div>
      </div>
    );
  }

  const config = NODE_CATALOG[data.kind];

  return (
    <>
      <header className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-lg",
            PORT_CHIP_CLASS[config.accent],
          )}
        >
          <NodeIcon name={config.icon} className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {data.name ?? config.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {config.title}
          </p>
        </div>
      </header>

      <div className="space-y-3">
        <Labelled label="Title">
          <Input
            value={data.name ?? config.title}
            placeholder={config.title}
            onChange={(event) => setMeta({ name: event.target.value })}
          />
        </Labelled>
        <Labelled label="Description">
          <Input
            value={data.description ?? config.description}
            placeholder={config.description}
            onChange={(event) => setMeta({ description: event.target.value })}
          />
        </Labelled>
      </div>

      {data.kind === "input" && (
        <Labelled label="Prompt">
          <NodeTextarea
            value={data.prompt}
            onChange={(prompt) => updateData(data, { prompt })}
          />
        </Labelled>
      )}

      {data.kind === "skill" && (
        <>
          <div className="space-y-2.5">
            <span className="text-[11px] text-muted-foreground">
              Markdown file
            </span>
            <MarkdownFileField
              fileName={data.fileName}
              pillClassName="bg-muted/40"
              onFile={(fileName, content) =>
                updateData(data, { fileName, content })
              }
            />
          </div>
          <Labelled label="Instruction">
            <NodeTextarea
              value={data.content}
              onChange={(content) => updateData(data, { content })}
            />
          </Labelled>
        </>
      )}

      {data.kind === "agent" && (
        <>
          <Labelled label="Model">
            <ModelSelector
              provider={data.provider}
              model={data.model}
              onChange={(provider, model) =>
                updateData(data, { provider, model })
              }
            />
          </Labelled>
          <Labelled label={`Token budget · ${data.tokenBudget}`}>
            <Slider
              aria-label="Token budget"
              min={500}
              max={2000}
              step={500}
              value={[data.tokenBudget]}
              onValueChange={([tokenBudget]) =>
                updateData(data, { tokenBudget })
              }
            />
          </Labelled>
          <ReadOnly
            label="Prompt (from Text Input)"
            value={promptNode?.data.prompt ?? ""}
          />
          <ReadOnly
            label="Skill (from Markdown File)"
            value={skillNode?.data.content ?? ""}
          />
        </>
      )}

      {data.kind === "tool" && (
        <>
          <ReadOnly label="Subreddit" value={`r/${data.subreddit}`} />
          <Labelled label={`Topic limit · ${data.limit}`}>
            <Slider
              aria-label="Topic limit"
              min={0}
              max={10}
              step={1}
              value={[data.limit]}
              onValueChange={([limit]) => updateData(data, { limit })}
            />
          </Labelled>
        </>
      )}

      {data.kind === "output" && (
        // min-w-0 lets this flex child shrink to the panel instead of growing to a wide table.
        <div className="min-w-0 space-y-2">
          <span className="text-[11px] text-muted-foreground">Result</span>
          {data.markdown ? (
            <ExpandableResult markdown={data.markdown} />
          ) : (
            <MarkdownResult markdown="" />
          )}
        </div>
      )}

      <AppearanceSection
        appearance={data.appearance}
        onChange={setAppearance}
      />
    </>
  );
}
