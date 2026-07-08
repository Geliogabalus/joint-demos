# JointJS+: AI Workflow Builder (React) <a href="https://www.jointjs.com/jointjs-plus"><img src="../../jointjs-plus-badge.svg" alt="JointJS+" width="123" align="right" /></a>

AI Workflow Builder is a JointJS+ demo application that lets you visually design an autonomous agent’s behavior by wiring together triggers, conditions, and actions.

This demo is also available online at [jointjs.com](https://jointjs.com/demos/ai-workflow-editor).

## What this demo shows

- **Agent configuration on canvas** — an `AI Agent` node with model selection, token budget, and connected `prompt` and `skill` inputs
- **Tool calling, visualized** — tools like `Search Reddit` attach directly to the agent node as connected blocks, so the flow of data into and out of the agent is visible, not hidden in a config panel
- **Skill files as first-class nodes** — a `Markdown File` node feeds instructions into the agent, making the agent's behavior inspectable and editable on the graph
- **Structured output rendering** — a `Formatted Output` node renders the agent's result as Markdown, closing the loop from prompt to tool call to result

## Why build agent builder UIs with JointJS+ for React

Most AI agent interfaces start as a form. They outgrow that fast — once an agent has multiple tools, conditional branches, or chained sub-agents, a form can't represent it, but a graph can.

JointJS+ for React is a UI library for exactly this kind of diagramming — not a wrapper around a canvas library, but a native React integration with:

- **A real data model** — the graph (nodes, links, and their data) is the source of truth, not just what's rendered, so you can inspect, validate, and serialize an agent's structure directly
- **Large-graph performance** — agent flows grow quickly once you add tools, sub-agents, and branching logic; JointJS+ for React is built to stay responsive as graphs scale
- **Custom shapes** — agent nodes, tool nodes, and skill nodes in this demo are custom React components, not generic boxes
- **Feature richness out of the box** — this demo ships with an inspector panel, element palette, export/import, automatic layout, a navigator, and built-in accessibility support, all included as part of JointJS+ for React

## Use cases

- Visual AI agent builders and agent configuration platforms
- LLM workflow / pipeline editors (prompt chaining, tool calling, RAG pipelines)
- Multi-agent orchestration dashboards
- Internal tools for configuring and debugging agent behavior

## How to download this demo

You can download this demo using our [`@joint/cli` tool](https://www.npmjs.com/package/@joint/cli):

```bash
npx @joint/cli download ai-workflow-editor/react
```

Alternatively, you can get the [copy of the repository](https://github.com/clientIO/joint-demos/archive/refs/heads/main.zip) from GitHub as usual.

## Running the application

To run this application you need to have access to JointJS+ package. You can get it by having a JointJS+ license or by starting a [free trial](https://www.jointjs.com/free-trial).

If you are a trial user, you received your access token during the trial sign-up process.
If you are a customer, log in to the customer portal at https://my.jointjs.com to obtain your access token.

This example uses `.npmrc` file to set up access to the JointJS+ private npm registry. By default it uses `JOINTJS_NPM_TOKEN` environment variable to get authentication token. You can set this environment variable in your terminal or CI environment in the following way:

**macOS / Linux**:
```sh
export JOINTJS_NPM_TOKEN="jjs-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Windows (PowerShell)**:
```sh
$env:JOINTJS_NPM_TOKEN="jjs-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Learn more about our [private npm registry here.](https://docs.jointjs.com/learn/help-center/npm-registry)

After setting up access to JointJS+ package, install the dependencies by running:

```bash
npm install
```

And then start the application with:

```bash
npm run dev
```

## Related

- [JointJS for React documentation](https://docs.jointjs.com/react)
- [Other JointJS demos](https://jointjs.com/demos)
