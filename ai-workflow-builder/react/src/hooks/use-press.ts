import { useRef } from "react";
import { isClick } from "@/utils/pointer";

interface PointerPoint {
  readonly clientX: number;
  readonly clientY: number;
}

interface PressOptions {
  /** Which pointer event activates. 'click' when the control is stable through
   *  the press; 'pointerup' when the press re-renders the control — a React
   *  re-render can swallow the synthetic click, so pointerup is the reliable
   *  pointer trigger and keyboard activates via its synthesized click
   *  (detail 0, no pointer press). @default 'click' */
  readonly activateOn?: "click" | "pointerup";
}

interface PressHandlers {
  readonly onPointerDown: (event: PointerPoint) => void;
  readonly onPointerMove: (event: PointerPoint) => void;
  readonly onPointerUp: (event: PointerPoint) => void;
  readonly onClick: (event: PointerPoint & { readonly detail: number }) => void;
}

/**
 * Press-to-activate for controls on a draggable surface: `onPress` fires for a
 * real click — a pointer press that stayed put, or keyboard activation — and
 * never for a press that dragged, even one released where it started.
 *
 * Wire the returned handlers onto the control (compose with stopPropagation
 * etc. as needed). Each press arms exactly one decision, so a later keyboard
 * click is not judged against a stale press.
 */
export function usePress(
  onPress: () => void,
  { activateOn = "click" }: PressOptions = {},
): PressHandlers {
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);

  function wasClick(event: PointerPoint): boolean {
    const start = downRef.current;
    const dragged = draggedRef.current;
    downRef.current = null;
    draggedRef.current = false;
    if (start === null) return !dragged;
    return !dragged && isClick(start, event);
  }

  return {
    onPointerDown(event) {
      downRef.current = { x: event.clientX, y: event.clientY };
      draggedRef.current = false;
    },
    onPointerMove(event) {
      if (downRef.current && !isClick(downRef.current, event)) {
        draggedRef.current = true;
      }
    },
    onPointerUp(event) {
      if (activateOn === "pointerup" && wasClick(event)) onPress();
    },
    onClick(event) {
      if (activateOn === "pointerup") {
        // The pointer path activated on pointerup; only the keyboard's
        // synthesized click (detail 0) activates here.
        if (event.detail === 0) onPress();
      } else if (wasClick(event)) {
        onPress();
      }
    },
  };
}
