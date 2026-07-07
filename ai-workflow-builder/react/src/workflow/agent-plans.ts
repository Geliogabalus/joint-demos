// Run plans read from the live dia.Graph: each AI Agent with whatever its
// ports are wired to. The graph indexes cells and adjacency natively
// (getCell / getConnectedLinks), so planning needs no array scans and always
// sees the current wiring.
import type { dia } from '@joint/plus';
import { getNodeData, getNodeKind } from './node-model';
import type { AgentNodeData, NodeData, NodeKind } from './workflow-types';

type DataOfKind<K extends NodeKind> = Extract<NodeData, { readonly kind: K }>;

/** A node wired to one of the agent's ports, with its data narrowed by kind. */
export interface WiredNode<K extends NodeKind> {
  readonly id: string;
  readonly data: DataOfKind<K>;
}

export interface AgentPlan {
  readonly agentId: string;
  readonly agent: AgentNodeData;
  readonly prompt: WiredNode<'input'> | null;
  readonly skill: WiredNode<'skill'> | null;
  readonly tool: WiredNode<'tool'> | null;
  readonly outputIds: readonly string[];
}

/** First node on the far end of a link at `port`, if it is of `kind`. */
function getWiredNode<K extends NodeKind>(
    graph: dia.Graph,
    agent: dia.Element,
    options: { readonly port: string; readonly inbound?: boolean; readonly outbound?: boolean },
    kind: K,
): WiredNode<K> | null {
    const [link] = graph.getConnectedLinks(agent, options);
    if (!link) return null;
    const cell = options.inbound ? link.getSourceCell() : link.getTargetCell();
    const data = cell ? getNodeData(cell) : null;
    if (!cell || data?.kind !== kind) return null;
    return { id: String(cell.id), data: data as DataOfKind<K> };
}

/** Output nodes fed by the agent's `result` port. */
function getOutputIds(graph: dia.Graph, agent: dia.Element): string[] {
    return graph
        .getConnectedLinks(agent, { outbound: true, port: 'result' })
        .map((link) => link.getTargetCell())
        .filter((cell): cell is dia.Cell => cell != null && getNodeKind(cell) === 'output')
        .map((cell) => String(cell.id));
}

/** One plan per AI Agent in the graph, wired or not (the run validates wiring). */
export function getAgentPlans(graph: dia.Graph): AgentPlan[] {
    const plans: AgentPlan[] = [];
    for (const element of graph.getElements()) {
        const data = getNodeData(element);
        if (data?.kind !== 'agent') continue;
        plans.push({
            agentId: String(element.id),
            agent: data,
            prompt: getWiredNode(graph, element, { inbound: true, port: 'prompt' }, 'input'),
            skill: getWiredNode(graph, element, { inbound: true, port: 'skill' }, 'skill'),
            tool: getWiredNode(graph, element, { outbound: true, port: 'tool' }, 'tool'),
            outputIds: getOutputIds(graph, element),
        });
    }
    return plans;
}
