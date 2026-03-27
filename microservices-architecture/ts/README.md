# JointJS+: Microservices Architecture (TypeScript) <a href="https://www.jointjs.com/jointjs-plus"><img src="../../jointjs-plus-badge.svg" alt="JointJS+" width="123" align="right" /></a>

Microservices Architecture is a JointJS+ demo application for modeling microservices with services, databases, and groups organized into containers, with links that intelligently route between groups.

This demo is also available online at [jointjs.com](https://jointjs.com/demos/microservices-architecture).

## Features

- **Containers** arranged left-to-right with automatic layout
- **Groups** within containers for organizing related elements
- **Cross-group link routing** -- links between elements in different groups visually connect to the group boundary, while internal links connect directly to elements
- **Stencil** with drag-and-drop for rectangles, circles, and groups
- **Undo/redo** with atomic container operations
- **Navigator** mini-map for large diagrams
- **Selection** with connected-link highlighting

## Project Structure

| File | Description |
|------|-------------|
| `src/main.ts` | App entry point -- paper, selection, keyboard, stencil setup |
| `src/models.ts` | Element models: Container, Rectangle, Circle, Group, Link |
| `src/layout.ts` | Container ordering and left-to-right positioning |
| `src/link-routing.ts` | Custom anchor and router for cross-group link routing |
| `src/containers.ts` | Container creation and element tools |
| `src/views.ts` | Navigator mini-map element view |
| `src/example.ts` | Example diagram with groups and cross-group links |
| `src/theme.ts` | Color tokens, container palette, and icon data URIs |
| `src/styles.css` | Layout and component styles with CSS variables |

## How to download this demo

You can download this demo using our [`@joint/cli` tool](https://www.npmjs.com/package/@joint/cli):

```bash
npx @joint/cli download microservices-architecture/ts
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
npm start
```
