// Sticky note: a Markdown card. Drag anywhere to move it (like any node); click to
// edit; the grip just marks the grab spot in the reserved right gutter (drag works
// through it) so you can move the note even while its editor is open. Editing is
// kept separate from selection so a drag never opens the editor. Rests behind
// everything (NOTE_Z) and rises to the front (NOTE_SELECTED_Z) only while its
// editor is open — mere selection (e.g. multi-select) must not cover other nodes.
import { useEffect, useRef, useState } from "react";
import {
  ElementOverlay,
  FreeTransform,
  HTMLHost,
  useCellId,
  useCells,
  useGraph,
  useIsCellSelected,
  useOnKeyboardEvents,
  useSelectionCollection,
  type ElementRecord,
} from "@joint/react-plus";
import { GripVertical, Trash2 } from "lucide-react";
import { MarkdownView } from "@/components/ui/markdown";
import { SwatchRow } from "@/components/ui/swatch-row";
import { cn } from "@/utils/cn";
import { useSelectCell } from "@/hooks/use-select-cell";
import type { NoteNodeData } from "@/workflow/workflow-types";
import { NOTE_SELECTED_Z, NOTE_Z } from "@/workflow/build-node";
import { IS_APPLE_WEBKIT } from "@/utils/platform";
import { usePress } from "@/hooks/use-press";
import { NOTE_SURFACE_CLASS } from "./appearance";

export function NoteCard({ data }: { readonly data: NoteNodeData }) {
  const selected = useIsCellSelected();
  // Resize + color/delete chrome only when THIS note is the sole selection.
  // `useIsCellSelected` doesn't re-render when another cell joins the selection
  // (this note stays selected), so track the reactive count for that flip.
  const { collection, selectCells } = useSelectionCollection();
  const selectionCount = useCells(collection, (cells) => cells.length);
  const isSoleSelection = selected && selectionCount === 1;
  const selectCell = useSelectCell();
  const id = useCellId();
  const { setCell, removeCell, setCellData } =
    useGraph<ElementRecord<NoteNodeData>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Editing is separate from selection: a drag selects (to move) but only a click
  // opens the editor. Deselecting exits it (store-prev — no setState-in-effect).
  const [editing, setEditing] = useState(false);
  const [wasSelected, setWasSelected] = useState(selected);
  if (selected !== wasSelected) {
    setWasSelected(selected);
    if (!selected) setEditing(false);
  }

  // Enter edits the sole-selected note (the hook ignores keys typed in inputs,
  // so it won't fire once the textarea is focused). Latest-callback binding, so
  // reading `isSoleSelection`/`editing` here is always current. preventDefault
  // stops this same Enter from landing in the textarea as a newline.
  useOnKeyboardEvents({
    enter: (event) => {
      if (!isSoleSelection || editing) return;
      event.preventDefault();
      setEditing(true);
    },
  });

  // A note being edited rises above the other nodes so its editor isn't
  // covered. Selection alone (e.g. multi-select) leaves it at the back.
  useEffect(() => {
    const z = editing ? NOTE_SELECTED_Z : NOTE_Z;
    setCell(id, (p) => (p.z === z ? p : { ...p, z }), { skipHistory: true });
  }, [editing, id, setCell]);

  // Focus on the next frame: when Enter opens the editor the textarea mounts
  // mid-keydown, and focusing synchronously races the event (focus doesn't
  // stick). A frame later the DOM has settled.
  useEffect(() => {
    if (!editing) return;
    const raf = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [editing]);

  // A click (no travel) opens the editor; a drag is left to the paper, which moves
  // the note — so dragging never enters edit mode.
  const editPress = usePress(
    () => {
      // Editing implies a sole selection: collapse any multi-select to this note
      // (useSelectCell keeps a group intact on click) so its chrome shows.
      selectCells([id]);
      setEditing(true);
    },
    { activateOn: "pointerup" },
  );

  return (
    <>
      <HTMLHost useModelGeometry className="size-full">
        <div
          // Tab-reachable so keyboard users can select the note (focus → select,
          // co-located with pointer selection below) and edit it with Enter.
          tabIndex={0}
          // `application` (same as a node): note keystrokes (arrow-key nudging,
          // Enter-to-edit) reach the app, not the SR virtual cursor. It also
          // gives `aria-label` a valid role to sit on (bare div = prohibited).
          role="application"
          aria-roledescription="diagram note"
          aria-label="Note"
          onFocus={() => selectCells([id])}
          onPointerDownCapture={selectCell}
          onPointerDown={editPress.onPointerDown}
          onPointerMove={editPress.onPointerMove}
          onPointerUp={editPress.onPointerUp}
          data-jj-scrollable
          className={cn(
            "group/note relative size-full rounded-lg border p-2.5 shadow-sm",
            NOTE_SURFACE_CLASS[data.color],
            // Selected cue for multi-select only; a sole selection shows the
            // FreeTransform frame instead. WebKit can't paint the ring's box-shadow
            // inside a foreignObject, so use a plain primary border there; the ring
            // (rides Tailwind's box-shadow chain with `shadow-sm`) elsewhere.
            selected &&
              !isSoleSelection &&
              (IS_APPLE_WEBKIT
                ? // dark: variant needed — NOTE_SURFACE_CLASS sets `dark:border-*`,
                  // which outspecifies a plain `border-primary` in dark mode.
                  "border-primary dark:border-primary"
                : "ring-2 ring-primary ring-offset-1 ring-offset-background"),
            editing ? 'overflow-hidden' : 'overflow-auto overscroll-contain',
          )}
        >
          <GripVertical
            aria-hidden
            className={cn(
              "cursor-move absolute right-1.5 top-1.5 size-3.5 opacity-0 transition-opacity duration-150 group-hover/note:opacity-50",
              selected && "opacity-50",
            )}
          />
          {editing ? (
            // stopPropagation lets you select text without moving the note; drag
            // the gutter (grip) to move while editing.
            <textarea
              ref={textareaRef}
              value={data.text}
              onChange={(e) =>
                setCellData(id, (c) => ({ ...c, text: e.target.value }))
              }
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                // Keys are kept off the canvas shortcuts; Escape exits editing
                // (the note stays selected, so its frame remains).
                e.stopPropagation();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder="Write Markdown…"
              aria-label="Note text (Markdown)"
              className="size-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:opacity-50"
            />
          ) : data.text.trim() ? (
            <MarkdownView markdown={data.text} />
          ) : (
            <p className="text-sm opacity-50">Empty note — click to edit</p>
          )}
        </div>
      </HTMLHost>

      {isSoleSelection && (
        <>
          <FreeTransform allowRotation={false} minWidth={140} minHeight={90} />
          <ElementOverlay position="top" origin="bottom" dy={-8}>
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg"
            >
              <SwatchRow
                label="Note color"
                value={data.color}
                onChange={(color) =>
                  setCellData(id, (c) => ({ ...c, color }))
                }
                ringOffset="ring-offset-popover"
                className="gap-2"
              />
              <span className="mx-0.5 h-4 w-px bg-border" />
              <button
                type="button"
                aria-label="Delete note"
                onClick={() => removeCell(id)}
                className="grid size-5 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </ElementOverlay>
        </>
      )}
    </>
  );
}
