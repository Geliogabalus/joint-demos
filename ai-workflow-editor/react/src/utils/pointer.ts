/** A pointer gesture counts as a click (not a drag) when it travels at most this
 *  many px between pointerdown and the given pointer event. */
const CLICK_TRAVEL_PX = 4;

/** True when the pointer barely moved from `from` — a click, not a drag. */
export function isClick(
  from: { x: number; y: number },
  event: { clientX: number; clientY: number },
): boolean {
  return (
    Math.hypot(event.clientX - from.x, event.clientY - from.y) <=
    CLICK_TRAVEL_PX
  );
}
