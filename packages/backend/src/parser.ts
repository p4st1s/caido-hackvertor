export type HVElement =
  | { type: "text"; content: string }
  | { type: "start"; name: string; args: string[] }
  | { type: "end"; name: string }
  | { type: "selfclose"; name: string; args: string[] };

const IDENTIFIER_RE = /^[0-9a-z_-]+/i;

function unescapeJava(s: string): string {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
    .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function tryParseArgs(input: string, start: number): { args: string[]; end: number } | null {
  if (input[start] !== "(") return { args: [], end: start };
  const args: string[] = [];
  let i = start + 1;
  while (i < input.length) {
    while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
    if (input[i] === ")") return { args, end: i + 1 };
    if (input[i] === '"' || input[i] === "'") {
      const quote = input[i];
      let j = i + 1, arg = "";
      while (j < input.length) {
        if (input[j] === "\\" && j + 1 < input.length) { arg += input[j] + input[j + 1]; j += 2; }
        else if (input[j] === quote) { j++; break; }
        else { arg += input[j]; j++; }
      }
      args.push(unescapeJava(arg));
      i = j;
    } else {
      const m = input.slice(i).match(/^[0-9a-z._+\-]+/i);
      if (m) { args.push(m[0]); i += m[0].length; }
      else return null;
    }
    while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
    if (input[i] === ",") i++;
    else if (input[i] === ")") return { args, end: i + 1 };
    else return null;
  }
  return null;
}

function tryParseStartOrSelfClose(input: string, pos: number): { el: HVElement; end: number } | null {
  if (!input.startsWith("<@", pos)) return null;
  let i = pos + 2;
  while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
  const m = input.slice(i).match(IDENTIFIER_RE);
  if (!m) return null;
  const name = m[0].toLowerCase();
  i += m[0].length;
  while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
  let args: string[] = [];
  if (input[i] === "(") {
    const result = tryParseArgs(input, i);
    if (!result) return null;
    args = result.args; i = result.end;
  }
  while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
  if (input.startsWith("/>", i) || input.startsWith("@/>", i)) {
    return { el: { type: "selfclose", name, args }, end: i + (input.startsWith("@/>", i) ? 3 : 2) };
  }
  if (input[i] === ">") return { el: { type: "start", name, args }, end: i + 1 };
  return null;
}

function tryParseEndTag(input: string, pos: number): { el: HVElement; end: number } | null {
  if (!input.startsWith("</@", pos)) return null;
  let i = pos + 3;
  while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
  const m = input.slice(i).match(IDENTIFIER_RE);
  if (!m) return null;
  const name = m[0].toLowerCase();
  i += m[0].length;
  while (i < input.length && (input[i] === " " || input[i] === "\t")) i++;
  if (input[i] !== ">") return null;
  return { el: { type: "end", name }, end: i + 1 };
}

export function parse(input: string): HVElement[] {
  const elements: HVElement[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] !== "<") {
      let j = i + 1;
      while (j < input.length && input[j] !== "<") j++;
      elements.push({ type: "text", content: input.slice(i, j) });
      i = j; continue;
    }
    if (input.startsWith("</@", i)) {
      const r = tryParseEndTag(input, i);
      if (r) { elements.push(r.el); i = r.end; continue; }
    }
    if (input.startsWith("<@", i)) {
      const r = tryParseStartOrSelfClose(input, i);
      if (r) { elements.push(r.el); i = r.end; continue; }
    }
    elements.push({ type: "text", content: "<" }); i++;
  }
  return elements;
}
