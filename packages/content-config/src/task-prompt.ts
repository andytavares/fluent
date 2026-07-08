// Pure string helper, kept free of node:fs imports so browser bundles can
// import it via the "@fluent/content-config/task-prompt" subpath.

export function extractTaskPrompt(instructions: string): string {
  const match = instructions.match(/## The task\n([\s\S]*?)(?=\n## |$)/);
  return match?.[1]?.trim() ?? "";
}
