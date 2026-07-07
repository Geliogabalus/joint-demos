// The Search Reddit tool, exposed to the agent via the AI SDK's `tool()`.
// JSONP, not fetch: Reddit sends no CORS header (fetch blocked) and its JSON sits behind
// Cloudflare (a proxy gets a bot-check page). A <script> load is CORS-exempt and clears
// Cloudflare; Reddit wraps the listing in the `jsonp` callback. Browser-only (uses `document`).
import { tool } from 'ai';
import { z } from 'zod';
import type { RedditToolConfig } from '../types';

interface RedditPost {
  readonly title: string;
  readonly score: number;
  readonly url: string;
}

interface RedditListing {
  readonly data: {
    readonly children: ReadonlyArray<{
      readonly data: { readonly title: string; readonly score: number; readonly permalink: string };
    }>;
  };
}

let jsonpSeq = 0;

// Load a URL via JSONP: append `&<callbackParam>=<fn>`, inject a <script>, resolve with what
// it passes to that global `fn`. Cleans up on settle/timeout.
function jsonp<T>(url: string, callbackParam: string, timeoutMs = 10_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const name = `__redditJsonp_${Date.now().toString(36)}_${jsonpSeq++}`;
    const script = document.createElement('script');
    const globals = window as unknown as Record<string, ((data: T) => void) | undefined>;

    let timer = 0;
    const cleanup = () => {
      delete globals[name];
      script.remove();
      window.clearTimeout(timer);
    };

    globals[name] = (data: T) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error('Could not reach Reddit (network or blocked).'));
    };
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Reddit request timed out.'));
    }, timeoutMs);

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}${callbackParam}=${name}`;
    document.head.appendChild(script);
  });
}

/** Fetch a subreddit's top posts of the past year (via JSONP — see file header). */
async function fetchTopPosts(subreddit: string, limit: number): Promise<RedditPost[]> {
  const url =
    `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json` +
    `?limit=${limit}&t=year&raw_json=1`;

  const listing = await jsonp<RedditListing>(url, 'jsonp');
  if (!listing?.data?.children) {
    throw new Error(`No posts found for r/${subreddit}.`);
  }
  return listing.data.children.map(({ data }) => ({
    title: data.title,
    score: data.score,
    url: `https://www.reddit.com${data.permalink}`,
  }));
}

// Locked to the Tool node's subreddit + limit. The subreddit is NOT a tool input — the
// model can't choose it — so every call searches the configured subreddit.
export function createRedditSearchTool(config: RedditToolConfig) {
  return tool({
    description:
      `Get the top posts of the past year from r/${config.subreddit}. ` +
      `This tool ONLY searches r/${config.subreddit} and takes no arguments.`,
    inputSchema: z.object({}),
    execute: () => fetchTopPosts(config.subreddit, config.limit),
  });
}
