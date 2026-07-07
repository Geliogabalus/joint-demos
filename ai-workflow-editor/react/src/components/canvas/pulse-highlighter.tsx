import { dia, V } from "@joint/plus";
import { jsx } from "@joint/react-plus";

const PULSE_RADIUS = 9;
const PULSE_DURATION = "1.3s";

interface PulseHighlighterOptions {
  /** Radius of the pulsing ring. Defaults to 9. */
  readonly radius?: number;
  /** Duration of the pulse animation. Defaults to 1.3s. */
  readonly duration?: string;
}

/**
 * A highlighter that renders a pulsing ring around a node.
 */
export class PulseHighlighter extends dia.HighlighterView<PulseHighlighterOptions> {
  preinitialize() {
    const { radius = PULSE_RADIUS, duration = PULSE_DURATION } = this.options;
    this.children = jsx(
      <circle className="jj-port-pulse" fill="none" r={radius} strokeWidth={2}>
        <animate
          attributeName="r"
          from={radius * 0.55}
          to={radius * 1.7}
          dur={duration}
          begin="0s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from={0.9}
          to={0}
          dur={duration}
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>,
    );
  }

  highlight(elementView: dia.ElementView, node: SVGElement) {
    this.renderChildren();
    const bbox = elementView.getNodeBoundingRect(node);
    const matrix = elementView.getNodeMatrix(node);
    const center = V.transformRect(bbox, matrix).center();
    this.el.setAttribute("transform", `translate(${center.x}, ${center.y})`);
  }
}
