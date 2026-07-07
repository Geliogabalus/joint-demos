// Typed connection rules layered on JointJS' built-in `canConnect`: only output→input,
// matching types, one source per input port EXCEPT `tool` inputs (a tool can be shared by
// many agents). Kinds and occupancy come from the live dia.Graph the controlled cells sync
// into — not from the React state — so the rules read the same model JointJS validates against.
import type { CanConnectOptions } from '@joint/react-plus';
import { orientEnds } from './link-orientation';
import { getPortConfig } from './node-catalog';
import { getNodeKind } from './node-model';

/**
 * `<Paper validateConnection>` rules. The built-in defaults already reject self-loops,
 * link-to-link, and root connections (every node has ports); `linkLimit: 'one-per-pair'`
 * additionally allows at most one link between any two nodes in either direction, and
 * `validate` adds the typed-port constraints on top.
 */
export const connectionRules: CanConnectOptions = {
  // 'one-per-pair' (not 'one-per-direction'): a link drawn the wrong way is
  // auto-flipped to output→input, so A→B and B→A are the same connection here.
  // Blocking both directions prevents a duplicate once the reverse gets flipped.
  linkLimit: 'one-per-pair',
  allowSelfLoops: false,
  validate: ({ source, target, graph }) => {
    // Port-to-port only — a `null` port is an end dropped on the cell body.
    if (source.port == null || target.port == null) return false;

    const sourceDescriptor = getPortConfig(getNodeKind(source.model), source.port);
    const targetDescriptor = getPortConfig(getNodeKind(target.model), target.port);
    if (!sourceDescriptor || !targetDescriptor) return false;

    // Ends must carry the same data type (text→text, tool→tool, …).
    if (sourceDescriptor.type !== targetDescriptor.type) return false;

    // Exactly one output and one input — a link may be dragged from either end.
    const oriented = orientEnds(
      { ...sourceDescriptor, end: source },
      { ...targetDescriptor, end: target },
    );
    if (!oriented) return false;

    // One source per input port, except `tool` inputs: a single tool can be
    // wired to (reused by) any number of agents, so its input accepts many.
    const [, input] = oriented;
    if (
      input.type !== 'tool' &&
      graph.getConnectedLinks(input.end.model, { inbound: true, port: input.id }).length > 0
    ) {
      return false;
    }

    return true;
  },
};
