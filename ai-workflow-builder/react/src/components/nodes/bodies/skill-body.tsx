import { Textarea } from "@/components/ui/textarea";
import type { SkillNodeData } from "@/workflow/workflow-types";
import { Field } from "../node-field";
import { MarkdownFileField } from "../markdown-file-field";
import { useNodeData } from "../use-node-data";

export function SkillBody({ data }: { readonly data: SkillNodeData }) {
  const patch = useNodeData<SkillNodeData>();

  return (
    <div className="space-y-2">
      <Field label="Markdown file">
        <MarkdownFileField
          fileName={data.fileName}
          onFile={(fileName, content) => patch({ fileName, content })}
        />
      </Field>
      <Field label="Instruction">
        <Textarea
          value={data.content}
          onChange={(event) => patch({ content: event.target.value })}
          className="resize-none field-sizing-content min-h-20 max-h-[400px] overflow-auto overscroll-contain text-xs"
        />
      </Field>
    </div>
  );
}
