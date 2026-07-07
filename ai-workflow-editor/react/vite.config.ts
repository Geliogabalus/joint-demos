import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs so the build runs from ANY sub-path without a hardcoded
  // base (e.g. served under /gallery/react-ai-workflow-builder/). Emits
  // `./assets/…` instead of `/assets/…`, which resolve against the page URL.
  base: "./",
  // Ship source maps so the minified first-party bundle is debuggable in prod
  // (Lighthouse "Best Practices" flags large JS without a map).
  build: { sourcemap: false },
  plugins: [
    react(),
    // The React Compiler runs as a Babel pass — it auto-memoizes components so
    // we rarely need manual `useMemo`/`useCallback` in this demo.
    babel({ presets: [reactCompilerPreset()] }),
    // Tailwind CSS v4 — config lives entirely in `src/index.css` (`@theme`).
    tailwindcss(),
    // `yarn build:analyze` — writes a treemap of the production bundle to
    // `dist/stats.html` so bundle bloat is attributable per module.
    process.env.ANALYZE === "1" &&
      visualizer({ filename: "dist/stats.html", gzipSize: true }),
  ],
  resolve: {
    // `@/` → `src/` so imports read `@/components/...` instead of `../../...`.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    // `@joint/react` declares its own React; without deduping, Vite loads a
    // second copy and every hook throws "Invalid hook call". Force one copy.
    dedupe: ["react", "react-dom", "@joint/react"],
  },
  // Pre-bundle the (large, linked) JointJS workspace deps into single chunks.
  optimizeDeps: {
    include: [
      "@joint/plus",
      "@joint/core",
      "@joint/react",
      "@joint/react/internal",
    ],
    // Re-bundle deps on every dev start. The `@joint/*` packages are linked
    // workspaces, and Vite hashes pre-bundled deps by package version + lockfile
    // — NOT by `dist/` contents. So rebuilding `@joint/react` (same version)
    // never invalidates the cache, and the dev server keeps serving the stale
    // bundle on a fresh page load until the cache is deleted by hand. HMR pushes
    // fresh source and masks it — the tell-tale symptom is "works after an edit,
    // breaks on reload". Forcing re-optimization means a plain `yarn dev`
    // restart always picks up a freshly built `@joint/react`.
    // Set `VITE_NO_FORCE_OPTIMIZE=1` to opt out when not touching the libraries.
    force: process.env.VITE_NO_FORCE_OPTIMIZE !== "1",
  },
});
