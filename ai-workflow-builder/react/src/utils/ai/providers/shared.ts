/** Real-provider plumbing: build the model, validate the key, map errors. */
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { PROVIDER_LABEL } from '../models';
import { runWithModel } from './run-with-model';
import type { AgentRunInput, AgentRunResult } from '../types';

const RE = {
    apiKey: /api key|unauthor|invalid.*key/i,
    notFound: /model.*(not found|does not exist)|not_found/i,
    rateLimit: /rate.?limit|quota/i,
    cors: /failed to fetch|load failed|networkerror|cors/i,
};

type RealProvider = 'openai' | 'anthropic';

// Build the model then run (run-with-model). Anthropic: the
// `anthropic-dangerous-direct-browser-access` header opts in to direct (CORS) calls —
// demo-only; production would proxy. OpenAI sends no CORS headers so a direct browser call
// is blocked — point `baseURL` at a CORS-permissive proxy for a real OpenAI run.
export function createProvider(type: RealProvider, input: AgentRunInput): Promise<AgentRunResult> {
    const label = PROVIDER_LABEL[type];
    const apiKey = requireApiKey(input.apiKey, label);
    const baseURL = input.baseURL ? { baseURL: input.baseURL } : {};

    const model =
    type === 'anthropic'
        ? createAnthropic({
            apiKey,
            headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
            ...baseURL,
        })(input.model)
        : createOpenAI({ apiKey, ...baseURL })(input.model);

    return runWithModel(model, input, label);
}

function requireApiKey(apiKey: string | undefined, provider: string): string {
    const trimmed = apiKey?.trim();
    if (!trimmed) {
        throw new Error(`${provider} API key required — open Run → Use API key.`);
    }
    return trimmed;
}

/** Turn whatever the SDK / fetch threw into a message the user can act on. */
export function describeRunError(error: unknown, provider: string): string {
    const status = readStatus(error);
    const raw = error instanceof Error ? error.message : String(error);

    if (isAbort(error)) return 'Run cancelled.';
    if (status === 401 || RE.apiKey.test(raw)) {
        return `${provider} rejected the API key (401). Check the key and try again.`;
    }
    if (status === 404 || RE.notFound.test(raw)) {
        return `${provider} model not found (404). Pick a different model in the Agent node.`;
    }
    if (status === 429 || RE.rateLimit.test(raw)) {
        return `${provider} rate limit or quota exceeded (429). Wait and retry.`;
    }
    // A browser CORS block surfaces as a statusless TypeError "Failed to fetch".
    if (status === undefined && RE.cors.test(raw)) {
        return (
            `Could not reach ${provider} from the browser — likely a CORS block or network error. ` +
      'OpenAI blocks direct browser calls: add a CORS-proxy Base URL in the API-keys dialog, ' +
      `or use Anthropic / Mock instead. (${raw})`
        );
    }
    if (status && status >= 500) {
        return `${provider} server error (${status}). Try again shortly.`;
    }
    return raw || `${provider} run failed.`;
}

// AI SDK errors (APICallError) carry a numeric `statusCode`; plain fetch does not.
function readStatus(error: unknown): number | undefined {
    if (error && typeof error === 'object' && 'statusCode' in error) {
        const code = (error as { statusCode: unknown }).statusCode;
        if (typeof code === 'number') return code;
    }
    return undefined;
}

// Covers Error and DOMException (the latter isn't always `instanceof Error`).
function isAbort(error: unknown): boolean {
    return (
        typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'AbortError'
    );
}
