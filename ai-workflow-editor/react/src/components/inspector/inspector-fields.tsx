import type { ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";

export function NodeTextarea({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <Textarea
      value={value}
      rows={4}
      onChange={(event) => onChange(event.target.value)}
      className="resize-none text-sm field-sizing-content min-h-20 max-h-48"
    />
  );
}

export function Panel({ children }: { readonly children: ReactNode }) {
  return (
    <aside className="flex h-full w-full flex-col gap-5 overflow-auto bg-background p-4">
      {children}
    </aside>
  );
}

export function Labelled({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="block space-y-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function ReadOnly({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="space-y-2.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <p className="rounded-md border border-dashed border-border bg-muted/40 px-2.5 py-2 text-xs text-muted-foreground">
        {value || "—"}
      </p>
    </div>
  );
}
