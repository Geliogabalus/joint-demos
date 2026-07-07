// The flow shown on first load: Text Input + Skill feed an AI Agent, which calls the
// Search Reddit tool, then results flow to Formatted Output. A sticky note (behind
// everything) onboards first-time visitors with the 5-step setup.
import { createLink, createNode, createNote } from './build-node';
import type { WorkflowCell } from './workflow-types';

// Marketing-supplied onboarding copy — keep verbatim.
const ONBOARDING_NOTE = `# 🤖 AI agent setup

1. **Choose a model**
2. **Set token budget**
3. **Connect prompt & skill**
4. **Add agent tools**
5. **Run & view result**

> 💡 Tip: Runs with mock data by default — add your Anthropic or OpenAI API key to use a real LLM.`;

const NODES = {
    // Sits behind the Agent node (z=0) as a framing "spotlight": the steps read in
    // the note's upper half, the Agent card overlaps its lower half.
    note: createNote(
        { x: 430, y: -85 },
        {
            id: 'note-onboarding',
            text: ONBOARDING_NOTE,
            color: 'blue',
            size: { width: 340, height: 500 },
        },
    ),
    input: createNode('input', { x: 80, y: 80 }, { id: 'input-1' }),
    skill: createNode('skill', { x: 80, y: 360 }, { id: 'skill-1' }),
    agent: createNode('agent', { x: 460, y: 170 }, { id: 'agent-1' }),
    tool: createNode('tool', { x: 470, y: 520 }, { id: 'tool-1' }),
    output: createNode('output', { x: 860, y: 250 }, { id: 'output-1' }),
};

const LINKS = [
    // Input → Agent prompt, Skill → Agent skill, Agent tool → Search Reddit.
    createLink(
        { id: 'input-1', port: 'out' },
        { id: 'agent-1', port: 'prompt' },
        { id: 'link-prompt' },
    ),
    createLink(
        { id: 'skill-1', port: 'out' },
        { id: 'agent-1', port: 'skill' },
        { id: 'link-skill' },
    ),
    createLink(
        { id: 'agent-1', port: 'tool' },
        { id: 'tool-1', port: 'tool' },
        { id: 'link-tool' },
    ),
    // Agent result → Output: carries the token counter, the one labelled link.
    createLink(
        { id: 'agent-1', port: 'result' },
        { id: 'output-1', port: 'result' },
        { id: 'link-result', tokens: 0 },
    ),
];

export const INITIAL_CELLS: readonly WorkflowCell[] = [
    ...Object.values(NODES),
    ...LINKS,
];
