/** Generic Appearance controls (FR-07): fill / text / border swatches + font family, for any node. */
import { useState } from "react";
import { Collapsible } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FontKey,
  NodeAppearance,
  SwatchKey,
} from "@/workflow/workflow-types";
import { SwatchRow } from "@/components/ui/swatch-row";

const FONTS: ReadonlyArray<{ id: FontKey; label: string }> = [
  { id: "sans", label: "Sans" },
  { id: "mono", label: "Mono" },
  { id: "serif", label: "Serif" },
];

type SwatchField = "fill" | "text" | "border";

const SWATCH_FIELDS: ReadonlyArray<{ label: string; key: SwatchField }> = [
  { label: "Fill", key: "fill" },
  { label: "Text", key: "text" },
  { label: "Border", key: "border" },
];

export function AppearanceSection({
  appearance,
  onChange,
}: {
  readonly appearance?: NodeAppearance;
  readonly onChange: (patch: NodeAppearance) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <Separator className="mb-4" />
      <Collapsible
        title="Appearance"
        open={open}
        onToggle={() => setOpen((o) => !o)}
        contentClassName="mt-3 space-y-4"
      >
        {SWATCH_FIELDS.map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            <SwatchRow
              label={label}
              value={appearance?.[key] ?? "default"}
              onChange={(value: SwatchKey) =>
                onChange({ [key]: value } as NodeAppearance)
              }
            />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Font</span>
          <Select
            value={appearance?.font ?? "sans"}
            onValueChange={(value) => onChange({ font: value as FontKey })}
          >
            <SelectTrigger className="h-7 w-28 text-xs" aria-label="Font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Collapsible>
    </section>
  );
}
