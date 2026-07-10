export interface ComplexityEstimate {
  time: string; // e.g. "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n^3)", "O(2^n)"
  space: string; // same vocabulary
  basis: string; // one-line human-readable justification
}

/** Complexity order, best (fastest/smallest) to worst. */
const ORDER = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n^3)", "O(n^4)", "O(2^n)"] as const;
type Complexity = (typeof ORDER)[number];

function worseOf(a: Complexity, b: Complexity): Complexity {
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
}

/**
 * Strip comments and string/char literal contents so keywords inside them
 * don't produce false positives. Covers C-family/Java/JS/TS/Rust/Kotlin/Go
 * block and line comments, Python/Ruby/Elixir/shell `#` comments, and
 * double/single/backtick-quoted string bodies.
 */
function stripNoise(code: string): string {
  let out = code;
  // Block comments: /* ... */
  out = out.replace(/\/\*[\s\S]*?\*\//g, "");
  // Line comments: // ...
  out = out.replace(/\/\/.*$/gm, "");
  // Line comments: # ... (Python/Ruby/Elixir/shell)
  out = out.replace(/#.*$/gm, "");
  // String/char literals - replace contents with empty, keep the quotes.
  out = out.replace(/`(?:\\.|[^`\\])*`/g, "``");
  out = out.replace(/"(?:\\.|[^"\\])*"/g, '""');
  out = out.replace(/'(?:\\.|[^'\\])*'/g, "''");
  return out;
}

const LOOP_KEYWORD = /\b(for|while|until|loop|do)\b/g;

function indentOf(line: string): number {
  const match = /^[ \t]*/.exec(line);
  return match ? match[0].length : 0;
}

/**
 * Compute the maximum loop nesting depth found anywhere in the code. Uses a
 * brace counter for brace-delimited languages and an indentation fallback
 * for Python-style bodies. This is intentionally approximate, not a parser.
 */
function maxLoopNestingDepth(code: string): number {
  const lines = code.split("\n");
  // Stack of open loops: either a brace-depth target (brace languages) or an
  // indentation threshold (indentation languages).
  type OpenLoop = { kind: "brace"; closeAtBraceDepth: number } | { kind: "indent"; indent: number };
  const stack: OpenLoop[] = [];
  let braceDepth = 0;
  let maxDepth = 0;

  for (const rawLine of lines) {
    const line = rawLine;
    const lineIndent = indentOf(line);

    // Pop indentation-based loops whose body has ended (a non-blank line at
    // or below the loop's own indentation).
    if (line.trim().length > 0) {
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top?.kind === "indent" && lineIndent <= top.indent) {
          stack.pop();
        } else {
          break;
        }
      }
    }

    // Count loop keywords on this line before adjusting brace depth so a
    // loop keyword's own line is attributed to the current (outer) depth.
    const loopMatches = line.match(LOOP_KEYWORD);
    const hasBraceOpenOnLine = line.includes("{");

    if (loopMatches) {
      for (let i = 0; i < loopMatches.length; i++) {
        maxDepth = Math.max(maxDepth, stack.length + 1);
        if (hasBraceOpenOnLine) {
          stack.push({ kind: "brace", closeAtBraceDepth: braceDepth + 1 });
        } else {
          stack.push({ kind: "indent", indent: lineIndent });
        }
      }
    }

    // Update brace depth and pop brace-based loops whose closing brace we hit.
    for (const ch of line) {
      if (ch === "{") {
        braceDepth++;
      } else if (ch === "}") {
        while (stack.length > 0) {
          const top = stack[stack.length - 1];
          if (top?.kind === "brace" && top.closeAtBraceDepth >= braceDepth) {
            stack.pop();
          } else {
            break;
          }
        }
        braceDepth = Math.max(0, braceDepth - 1);
      }
    }
  }

  return maxDepth;
}

interface FunctionDef {
  name: string;
  body: string;
}

type DefStyle = "brace" | "indent";

const FUNCTION_DEF_PATTERNS: Array<{ pattern: RegExp; style: DefStyle }> = [
  { pattern: /\bfunc\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g, style: "brace" }, // Go/Swift
  { pattern: /\bdefp?\s+([A-Za-z_][A-Za-z0-9_?!]*)\s*\(/g, style: "indent" }, // Elixir (def/defp)
  { pattern: /\bdef\s+([A-Za-z_][A-Za-z0-9_?!]*)\s*\(/g, style: "indent" }, // Python/Ruby
  { pattern: /\bfn\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g, style: "brace" }, // Rust
  { pattern: /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g, style: "brace" }, // JS/TS
  {
    pattern: /\bconst\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?=>/g,
    style: "brace",
  }, // JS/TS arrow
  {
    pattern:
      /\b(?:public\s+|private\s+|protected\s+|static\s+)*[A-Za-z_][A-Za-z0-9_<>[\],\s]*?\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{]*\)\s*\{/g,
    style: "brace",
  }, // C/C++/Java/Kotlin
];

/**
 * Extract the body of a definition starting at `defLineStart` (character
 * offset of the regex match). `style` selects brace-delimited scanning
 * (Go/Rust/JS/TS/C-family) vs indentation-delimited scanning
 * (Python/Ruby/Elixir) — using the definition's own syntax family rather
 * than sniffing for braces avoids false matches on stray `{}` (e.g. a
 * Python default argument `memo={}`).
 */
function extractBody(code: string, defLineStart: number, style: DefStyle): string {
  const lines = code.split("\n");
  // Find which line index defLineStart falls on.
  let offset = 0;
  let startLineIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLen = (lines[i]?.length ?? 0) + 1;
    if (offset + lineLen > defLineStart) {
      startLineIdx = i;
      break;
    }
    offset += lineLen;
  }

  const defLine = lines[startLineIdx] ?? "";
  const defIndent = indentOf(defLine);

  if (style === "brace") {
    // Brace-delimited: scan forward counting braces from the def line.
    let depth = 0;
    let seenOpen = false;
    const bodyLines: string[] = [];
    for (let i = startLineIdx; i < lines.length; i++) {
      const line = lines[i] ?? "";
      for (const ch of line) {
        if (ch === "{") {
          depth++;
          seenOpen = true;
        } else if (ch === "}") {
          depth--;
        }
      }
      bodyLines.push(line);
      if (seenOpen && depth <= 0) break;
    }
    return bodyLines.join("\n");
  }

  // Indentation-delimited: everything after the def line, more indented,
  // until indentation returns to <= defIndent.
  const bodyLines: string[] = [defLine];
  for (let i = startLineIdx + 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.trim().length === 0) {
      bodyLines.push(line);
      continue;
    }
    if (indentOf(line) <= defIndent) break;
    bodyLines.push(line);
  }
  return bodyLines.join("\n");
}

function findFunctionDefs(code: string): FunctionDef[] {
  const defs: FunctionDef[] = [];
  const seen = new Set<string>();
  for (const { pattern, style } of FUNCTION_DEF_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      const name = match[1];
      if (!name) continue;
      const key = `${name}@${match.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const body = extractBody(code, match.index, style);
      defs.push({ name, body });
    }
  }
  return defs;
}

function countSelfCalls(body: string, name: string): number {
  const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`, "g");
  const matches = body.match(pattern);
  // Subtract 1 for the definition itself (only present when brace-delimited
  // body includes the def line, which it always does here).
  const count = matches ? matches.length : 0;
  return Math.max(0, count - 1);
}

const HALVING_PATTERN = /\/\s*2\b|>>\s*1\b|\bmid(?:dle)?\b\s*=/i;
const MEMO_PATTERN = /\b(memo|cache|seen)\b|dp\s*\[|dp\.get\(/i;

function detectRecursion(body: string, name: string): {
  isRecursive: boolean;
  selfCalls: number;
  hasHalvingSignal: boolean;
  hasMemoSignal: boolean;
} {
  const selfCalls = countSelfCalls(body, name);
  return {
    isRecursive: selfCalls > 0,
    selfCalls,
    hasHalvingSignal: HALVING_PATTERN.test(body),
    hasMemoSignal: MEMO_PATTERN.test(body),
  };
}

// Note: deliberately does NOT include a generic `[key] = value` pattern —
// that's indistinguishable via regex from an ordinary array-index write
// (e.g. a sort's swap `arr[i], arr[j] = arr[j], arr[i]`), which is common
// in loops that don't grow anything. `.put(`/`.insert(` cover map/dict
// writes without that false-positive risk.
const GROWING_COLLECTION_PATTERN =
  /\.push\(|\.append\(|\.add\(|\+=\s*\[|List<|ArrayList|Vec::new|vec!\[|make\(\[\]|\[\]\w*\s*=|\.put\(|\.insert\(/;

function loopBodyHasGrowingCollection(code: string): boolean {
  // Approximate: check for growing-collection evidence anywhere loops are
  // present. A precise "inside the loop body" check would need a parser;
  // for this heuristic, presence anywhere alongside a loop is sufficient
  // signal since these idioms rarely appear outside loop bodies in code
  // that also has loops.
  return GROWING_COLLECTION_PATTERN.test(code);
}

function timeForLoopDepth(depth: number): Complexity {
  if (depth <= 0) return "O(1)";
  if (depth === 1) return "O(n)";
  if (depth === 2) return "O(n^2)";
  if (depth === 3) return "O(n^3)";
  return "O(n^4)";
}

/**
 * Estimate the asymptotic time/space complexity of a snippet of source code
 * using lightweight, language-agnostic syntactic heuristics (loop nesting
 * depth, recursion + halving/memoization signals, growing-collection
 * idioms). This is deliberately NOT a proof of complexity — it's a rough,
 * best-effort estimate meant to give learners directional feedback, and it
 * can be fooled by unusual code shapes. No network calls, no LLM: purely
 * static regex/line-scanning analysis over the given source text.
 */
export function estimateComplexity(code: string, language: string): ComplexityEstimate {
  void language; // heuristics below are intentionally language-agnostic
  const clean = stripNoise(code);

  const loopDepth = maxLoopNestingDepth(clean);
  const functions = findFunctionDefs(clean);

  let recursionTime: Complexity | null = null;
  let recursionSpace: Complexity | null = null;
  let recursionBasis = "";

  for (const fn of functions) {
    const rec = detectRecursion(fn.body, fn.name);
    if (!rec.isRecursive) continue;

    let time: Complexity;
    let space: Complexity;
    let basis: string;

    if (rec.hasHalvingSignal && rec.selfCalls === 1) {
      time = "O(log n)";
      space = "O(log n)";
      basis = "Recursive halving pattern (binary search-like) with a single self-call";
    } else if (rec.hasHalvingSignal && rec.selfCalls >= 2) {
      time = "O(n log n)";
      space = "O(n)";
      basis = "Divide-and-conquer recursion (halving with two self-calls, e.g. merge sort shape)";
    } else if (rec.hasMemoSignal) {
      time = "O(n)";
      space = "O(n)";
      basis = "Recursive function with memoization/caching detected";
    } else if (rec.selfCalls >= 2) {
      time = "O(2^n)";
      space = "O(n)";
      basis = "Naive branching recursion with no memoization (multiple self-calls)";
    } else {
      time = "O(n)";
      space = "O(n)";
      basis = "Simple linear recursion (single self-call, no halving or memoization)";
    }

    if (recursionTime === null || ORDER.indexOf(time) > ORDER.indexOf(recursionTime)) {
      recursionTime = time;
      recursionSpace = space;
      recursionBasis = basis;
    }
  }

  const loopTime = timeForLoopDepth(loopDepth);
  const hasGrowingCollection = loopDepth > 0 && loopBodyHasGrowingCollection(clean);
  const loopSpace: Complexity = hasGrowingCollection ? "O(n)" : "O(1)";

  let time: Complexity;
  let space: Complexity;
  let basis: string;

  if (recursionTime !== null) {
    time = worseOf(loopTime, recursionTime);
    space = worseOf(loopSpace, recursionSpace ?? "O(1)");
    basis = loopDepth > 0 ? `${recursionBasis}; also ${loopDepth} level(s) of loop nesting` : recursionBasis;
  } else if (loopDepth > 0) {
    time = loopTime;
    space = loopSpace;
    const depthDesc = loopDepth === 1 ? "1 loop" : `${loopDepth} nested loops`;
    basis = hasGrowingCollection
      ? `${depthDesc} over the input; a collection grows proportionally to input size`
      : `${depthDesc} over the input; no data structures grown proportionally to input size`;
  } else {
    time = "O(1)";
    space = "O(1)";
    basis = "No loops or recursion detected";
  }

  return { time, space, basis };
}
