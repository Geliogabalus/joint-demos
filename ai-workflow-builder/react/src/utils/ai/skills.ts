// Assemble the agent's system instruction from the Skill node and tool availability.
interface BuildSystemPromptOptions {
  /** Markdown content from the Skill node, if connected. */
  readonly skill?: string;
  /** Whether a Search Reddit tool is wired to the agent. */
  readonly hasTool: boolean;
}

export function buildSystemPrompt({ skill, hasTool }: BuildSystemPromptOptions): string {
    const parts = ['You are an AI agent running inside a visual workflow.'];
    if (skill?.trim()) {
        parts.push(skill.trim());
    }
    if (hasTool) {
        parts.push(
            'Use the `redditSearch` tool to gather real posts before answering. ' +
        'Base your response on what it returns.'
        );
    }
    parts.push('Respond in GitHub-flavoured Markdown; prefer a clean table when listing findings.');
    return parts.join('\n\n');
}
