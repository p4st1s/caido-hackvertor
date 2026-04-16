import { autocompletion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { TAGS, TagDef } from "./tags";

function buildSnippet(tag: TagDef): string {
  if (!tag.hasInput) {
    if (tag.args.length === 0) return `<@${tag.name}/>`;
    const argsStr = tag.args.map(a => `"${a.default}"`).join(", ");
    return `<@${tag.name}(${argsStr})/>`;
  }
  if (tag.args.length === 0) return `<@${tag.name}>\${1}</@${tag.name}>`;
  const argsStr = tag.args.map((a, i) => `"\${${i + 2}:${a.default}}"`).join(", ");
  return `<@${tag.name}(${argsStr})>\${1}</@${tag.name}>`;
}

function hackvertorCompletions(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/<@[a-z0-9_-]*/i);
  if (!match) return null;

  const typed = match.text.slice(2).toLowerCase();

  const options = TAGS
    .filter(tag => tag.name.startsWith(typed))
    .map(tag => ({
      label: `<@${tag.name}>`,
      apply: buildSnippet(tag),
      type: "function",
      detail: tag.category,
      info: tag.args.length > 0
        ? `Args: ${tag.args.map(a => `${a.label}=${a.default}`).join(", ")}`
        : undefined,
    }));

  if (options.length === 0) return null;

  return {
    from: match.from,
    options,
    validFor: /^(<@[a-z0-9_-]*)?$/i,
  };
}

export const hackvertorAutocomplete = autocompletion({
  override: [hackvertorCompletions],
  activateOnTyping: true,
});
