// Offline "fake run" provider: deterministic, no network or key. Pauses briefly to let
// the run animation play, then returns a canned Markdown table.
import { delay } from '../../delay';
import type { AgentRunInput, AgentRunResult } from '../types';

function buildMockTable(subreddit: string): string {
    return [
        `## Trending in r/${subreddit}`,
        '',
        '| # | Topic | Why it matters |',
        '| - | ----- | -------------- |',
        '| 1 | React Compiler is stable | Auto-memoization without manual `useMemo` |',
        '| 2 | Server Components in production | Data fetching moves to the server |',
        '| 3 | Suspense + transitions | Smoother streaming UIs |',
        '| 4 | The signals debate | Fine-grained reactivity vs. the VDOM |',
        '| 5 | Tailwind v4 `@theme` | Design tokens live in CSS |',
        '',
        '_Mock run — add an OpenAI or Anthropic key for live results._',
    ].join('\n');
}

export async function runMock(input: AgentRunInput): Promise<AgentRunResult> {
    const markdown = buildMockTable(input.tool?.subreddit ?? 'reactjs');

    // Stream the canned text word-by-word so the offline run feels like a real
    // (streaming) one — the Output fills in progressively. Falls back to a single
    // pause if nobody is listening for partials.
    if (input.onPartial) {
        let shown = '';
        for (const chunk of markdown.match(/\S+\s*/g) ?? [markdown]) {
            if (input.signal?.aborted) throw new DOMException('Run cancelled.', 'AbortError');
            shown += chunk;
            input.onPartial(shown);
            await delay(28);
        }
    } else {
        await delay(1500);
        if (input.signal?.aborted) throw new DOMException('Run cancelled.', 'AbortError');
    }

    // Plausible output-token count within the node's budget (Tokens used ≤ Token budget).
    const tokensUsed = Math.min(input.maxOutputTokens ?? 480, 480);
    return { markdown, tokensUsed };
}
