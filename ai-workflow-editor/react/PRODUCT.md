# Product

## Register

product

## Users

Developers and technical evaluators trying out **@joint/react-plus**. They open this example to judge whether JointJS+ can power a polished, node-based product UI. The canvas is the product: a node-based AI workflow builder (Text Input → AI Agent → Tools → Formatted Output). Context of use: a desktop screen, focused building/demoing, often a dim room and a dark editor. The job is "wire up an AI workflow and run it, and be impressed by how it feels."

## Product Purpose

A demo app that showcases @joint/react-plus by building a real AI workflow canvas. Success = a developer looks at this and thinks "I could ship this as a product." The canvas and node-wiring are the hero; chrome is secondary.

## Brand Personality

White-label, enterprise. Precise, confident, technical-but-refined. Three words: **calm, engineered, neutral**. The interface should feel like a professional tool a customer could rebrand as their own: quiet surfaces, one restrained accent, motion that only ever explains state. No spectacle.

## Anti-references

- The gamified "web3 / AI-SaaS" look — saturated brand glow, neon nebula canvas, rainbow ports, big rounded cards, heavy drop shadows.
- The earlier JointJS-red + glow build leaned into this; this redesign strips it back to enterprise-calm.
- Any aesthetic that competes with the canvas or makes the chrome feel heavier than the content.

## Design Principles

1. **The canvas is the stage.** Chrome (toolbar, stencil, inspector) stays quiet and recessive so nodes and structure read first.
2. **Color carries meaning, sparingly.** Blue = accent/selection, green = go/success, red = error, muted node-type hues = node kind. Ports/links/chrome are neutral. Never decorative color.
3. **Motion reveals state, quietly.** Ring on selection, faint pulse on running, a subtle token on links — every animation explains state, none is filler or flashy.
4. **True neutrals.** Surfaces are near-neutral (hue 250, very low chroma), OKLCH throughout. Small radii, hairline elevation — white-label, rebrandable.
5. **Logic stays put.** This is a re-skin: tokens, radii, elevation, selection and the run token. Component structure and behavior are preserved.

## Accessibility & Inclusion

- WCAG AA minimum (4.5:1 body text, 3:1 large/graphical).
- Full `prefers-reduced-motion` support on all animations.
- Both light and dark themes, switchable at runtime.
