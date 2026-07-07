import { env } from "@joint/plus";

// WebKit (macOS Safari, all iOS browsers, WKWebView) mis-paints <foreignObject>
// subtrees, so node HTML needs Safari-specific fallbacks. Evaluated once.
export const IS_APPLE_WEBKIT = env.test("isAppleWebKit");
