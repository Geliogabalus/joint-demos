// Link motion while the workflow runs. Rendered as the Paper's renderLink, so it
// lives in each link's SVG group; useLinkLayout() gives the routed path `d`, drawn
// as a flowing dash + travelling dot via declarative SVG animateMotion (no core API).
import { useContext } from 'react';
import { useIsCellSelected, useLinkLayout } from '@joint/react-plus';
import { RunningContext } from '@/hooks/running-context';

const TRIP = '1.1s'; // one source → target trip
const FLOW_COLOR = '#c9952a';

export function LinkFlow() {
    const running = useContext(RunningContext);
    const layout = useLinkLayout();
    const d = layout?.d;
    const isSelected = useIsCellSelected();

    if (!d || (!running && !isSelected)) return null;

    return (
        <g pointerEvents="none">
            {/* Selected wire: primary highlight over the line (see .link-selected-highlight). */}
            {isSelected ? <path className="link-selected-highlight" d={d} /> : null}
            {running ? (
                <>
                    <path
                        className="link-flow-dash"
                        d={d}
                        fill="none"
                        stroke={FLOW_COLOR}
                        strokeOpacity={0.55}
                        strokeWidth={2}
                        strokeDasharray="1 7"
                        strokeLinecap="round"
                    />
                    <circle r={5} fill={FLOW_COLOR} opacity={0.16}>
                        <animateMotion dur={TRIP} repeatCount="indefinite" path={d} />
                    </circle>
                    <circle
                        r={3}
                        fill={FLOW_COLOR}
                        stroke="var(--color-card)"
                        strokeWidth={1}
                        strokeOpacity={0.9}
                    >
                        <animateMotion dur={TRIP} repeatCount="indefinite" path={d} />
                    </circle>
                </>
            ) : null}
        </g>
    );
}
