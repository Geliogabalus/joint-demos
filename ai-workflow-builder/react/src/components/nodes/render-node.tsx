import { useCellDrag } from '@joint/react-plus';
import type { NodeData } from '@/workflow/workflow-types';
import { AgentBody } from './bodies/agent-body';
import { OutputBody } from './bodies/output-body';
import { SkillBody } from './bodies/skill-body';
import { TextInputBody } from './bodies/text-input-body';
import { ToolBody } from './bodies/tool-body';
import { NodeContainer } from './node-container';
import { NodePreview } from './node-preview';
import { NoteCard } from './note-card';

type ConfigNodeData = Exclude<NodeData, { kind: 'note' }>;

function NodeBody({ data }: { readonly data: ConfigNodeData }) {
    switch (data.kind) {
        case 'input':
            return <TextInputBody data={data} />;
        case 'skill':
            return <SkillBody data={data} />;
        case 'agent':
            return <AgentBody data={data} />;
        case 'tool':
            return <ToolBody data={data} />;
        case 'output':
            return <OutputBody data={data} />;
    }
}

export function RenderNode(data: NodeData) {
    // isPreview is the stencil drag ghost only (not a node moving on the canvas).
    const { isPreview } = useCellDrag();
    if (data.kind === 'note') return <NoteCard data={data} />;
    if (isPreview) return <NodePreview kind={data.kind} />;
    return (
        <NodeContainer
            kind={data.kind}
            status={data.status}
            appearance={data.appearance}
            name={data.name}
            description={data.description}
        >
            <NodeBody data={data} />
        </NodeContainer>
    );
}
