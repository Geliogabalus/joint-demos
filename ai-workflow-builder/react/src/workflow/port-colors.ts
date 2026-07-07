import type { PortType } from "./workflow-types";

// Data-type colors for the JointJS LINKS (concrete SVG strings, not Tailwind). Baked into
// the model so they don't re-resolve on theme toggle. Same hues tint ports on hover/focus.
export const PORT_TYPE_COLOR: Record<PortType, string> = {
  text: "#c9952a", // amber  — plain text (matches skill/input accent)
  skill: "#c9952a", // amber  — markdown skill
  tool: "#d94b1a", // reddit orange-red — tool call
  result: "#3da872", // green  — agent result
};
