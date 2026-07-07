import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Single stylesheet entry: Tailwind + @joint/react-plus base styles + tokens.
import "./index.css";
import { App } from "./app";
import { IS_APPLE_WEBKIT } from "@/utils/platform";

// WebKit mis-paints <foreignObject> subtrees that use backdrop-filter or box-shadow
// (same paint bug as position: relative). Tag the document so CSS can strip those
// properties from node HTML on Apple WebKit — see `.is-apple-webkit` in index.css.
if (IS_APPLE_WEBKIT) {
  document.documentElement.classList.add("is-apple-webkit");
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
