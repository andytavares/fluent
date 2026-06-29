"use client";

import { useState, useCallback } from "react";
import { CodeEditor, OutputPane, TracePanel, AlgorithmVisualizer } from "@fluent/ui";
import type { TraceFrame } from "@fluent/ui";
import { trpc } from "@/lib/trpc/client";

const ALGOS = [
  { slug: "custom",                    title: "Custom — write your own" },
  { slug: "two-pointers",              title: "Two Pointers" },
  { slug: "sliding-window",            title: "Sliding Window" },
  { slug: "prefix-sums",              title: "Prefix Sums" },
  { slug: "binary-search",            title: "Binary Search" },
  { slug: "hash-maps-and-sets",       title: "Hash Maps & Sets" },
  { slug: "stacks",                   title: "Stacks" },
  { slug: "queues-and-deques",        title: "Queues & Deques" },
  { slug: "linked-list-patterns",     title: "Linked List: Fast & Slow" },
  { slug: "tree-dfs",                 title: "Tree DFS" },
  { slug: "tree-bfs",                 title: "Tree BFS" },
  { slug: "binary-search-trees",      title: "Binary Search Trees" },
  { slug: "heaps-and-priority-queues",title: "Heaps & Priority Queues" },
  { slug: "graphs-bfs-dfs",          title: "Graphs: BFS & DFS" },
  { slug: "greedy-algorithms",        title: "Greedy: Merge Intervals" },
  { slug: "dynamic-programming-1d",   title: "Dynamic Programming: 1D" },
  { slug: "backtracking",             title: "Backtracking" },
  { slug: "tries",                    title: "Tries" },
  { slug: "union-find",               title: "Union-Find" },
  { slug: "dynamic-programming-2d",   title: "Dynamic Programming: 2D" },
] as const;

type AlgoSlug = (typeof ALGOS)[number]["slug"];

const STARTERS: Record<AlgoSlug, string> = {
  custom: `// trace.step({ label, state, highlights }) is injected automatically.
// Arrays in state are rendered as blocks; highlighted indices are lit up.

function example(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    trace.step({
      label: \`left=\${left}  right=\${right}  sum=\${sum}\`,
      state: { nums, left, right, target },
      highlights: { arrays: { nums: [left, right] } },
    });
    if (sum === target) return [left, right];
    if (sum < target) left++; else right--;
  }
  return [];
}
console.log(example([2, 7, 11, 15], 9));
`,
  "two-pointers": `function twoSum(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    trace.step({
      label: \`left=\${left}  right=\${right}  sum=\${sum}\`,
      state: { nums, left, right, target },
      highlights: { arrays: { nums: [left, right] } },
    });
    if (sum === target) return [left, right];
    if (sum < target) left++; else right--;
  }
  return [];
}
console.log(twoSum([2, 7, 11, 15], 9));
`,
  "sliding-window": `function maxSumWindow(nums, k) {
  let sum = nums.slice(0, k).reduce((a, b) => a + b, 0);
  let best = sum, start = 0;
  trace.step({ label: \`init window [0,\${k-1}] sum=\${sum}\`, state: { nums, start, end: k-1, sum, best }, highlights: { arrays: { nums: Array.from({length:k},(_,i)=>i) } } });
  for (let end = k; end < nums.length; end++) {
    sum += nums[end] - nums[start];
    start++;
    if (sum > best) best = sum;
    trace.step({ label: \`window [\${start},\${end}] sum=\${sum} best=\${best}\`, state: { nums, start, end, sum, best }, highlights: { arrays: { nums: Array.from({length:k},(_,i)=>start+i) } } });
  }
  return best;
}
console.log(maxSumWindow([2,1,5,1,3,2], 3));
`,
  "prefix-sums": `function buildPrefix(nums) {
  const prefix = [0];
  for (let i = 0; i < nums.length; i++) {
    prefix.push(prefix[i] + nums[i]);
    trace.step({ label: \`prefix[\${i+1}] = \${prefix[i+1]}\`, state: { nums, prefix, i }, highlights: { arrays: { nums: [i], prefix: [i+1] } } });
  }
  return prefix;
}
const nums = [3, 1, 4, 1, 5, 9];
const p = buildPrefix(nums);
console.log('Range sum [1,4]:', p[5] - p[1]);
`,
  "binary-search": `function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    trace.step({ label: \`lo=\${lo} mid=\${mid} hi=\${hi} val=\${nums[mid]}\`, state: { nums, lo, mid, hi, target }, highlights: { arrays: { nums: [lo, mid, hi] } } });
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}
console.log(binarySearch([1,3,5,7,9,11,13], 7));
`,
  "hash-maps-and-sets": `function twoSumMap(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    const j = seen.get(comp);
    trace.step({ label: \`i=\${i} val=\${nums[i]} need=\${comp} found=\${j !== undefined}\`, state: { nums, i, target, seen: Object.fromEntries(seen) }, highlights: { arrays: { nums: j !== undefined ? [j, i] : [i] } } });
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return [];
}
console.log(twoSumMap([2, 7, 11, 15], 9));
`,
  stacks: `function isValid(s) {
  const stack = [];
  const match = { ')': '(', ']': '[', '}': '{' };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if ('([{'.includes(c)) {
      stack.push(c);
      trace.step({ label: \`push '\${c}'\`, state: { i, char: c, stack: [...stack] } });
    } else {
      const top = stack.pop();
      trace.step({ label: \`pop '\${top}' match '\${c}' ok=\${top === match[c]}\`, state: { i, char: c, stack: [...stack], ok: top === match[c] } });
      if (top !== match[c]) return false;
    }
  }
  return stack.length === 0;
}
console.log(isValid('()[]{}')); // true
console.log(isValid('([)]'));   // false
`,
  "queues-and-deques": `function bfsLevels(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const levels = [];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node);
      for (const nb of (graph[node] ?? [])) {
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      }
    }
    levels.push(level);
    trace.step({ label: \`level \${levels.length}: [\${level}]\`, state: { queue: [...queue], visited: [...visited], levels: levels.map(l=>l.join(',')) } });
  }
  return levels;
}
const g = {0:[1,2],1:[3],2:[3,4],3:[],4:[]};
console.log(bfsLevels(g, 0));
`,
  "linked-list-patterns": `// Simulate linked list with array
function hasCycle(nodes) {
  let slow = 0, fast = 0;
  for (let step = 0; step < nodes.length * 2; step++) {
    slow = nodes[slow].next ?? -1;
    fast = nodes[nodes[fast].next ?? -1]?.next ?? -1;
    if (slow === -1 || fast === -1) { trace.step({ label: 'no cycle', state: { slow, fast } }); return false; }
    trace.step({ label: \`slow=\${slow} fast=\${fast} meet=\${slow===fast}\`, state: { slow, fast } });
    if (slow === fast) return true;
  }
  return false;
}
// 0→1→2→3→1 (cycle)
const list = [{next:1},{next:2},{next:3},{next:1}];
console.log(hasCycle(list));
`,
  "tree-dfs": `function dfs(node, path = []) {
  if (!node) return;
  path.push(node.val);
  trace.step({ label: \`visit \${node.val}\`, state: { path: [...path] } });
  dfs(node.left, path);
  dfs(node.right, path);
  path.pop();
}
const tree = { val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: null, right: { val: 6, left: null, right: null } } };
dfs(tree);
`,
  "tree-bfs": `function bfs(root) {
  if (!root) return;
  const q = [root];
  let level = 0;
  while (q.length) {
    const sz = q.length;
    const vals = [];
    for (let i = 0; i < sz; i++) {
      const n = q.shift();
      vals.push(n.val);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    trace.step({ label: \`level \${level}: [\${vals}]\`, state: { level, nodes: vals, queue: q.map(n=>n.val) } });
    level++;
  }
}
const tree = { val: 1, left: { val: 2, left: { val: 4, left:null,right:null }, right: { val: 5, left:null,right:null } }, right: { val: 3, left: null, right: { val: 6, left:null,right:null } } };
bfs(tree);
`,
  "binary-search-trees": `function bstInsert(root, val) {
  if (!root) return { val, left: null, right: null };
  trace.step({ label: \`at \${root.val} → go \${val < root.val ? 'left' : 'right'}\`, state: { current: root.val, insert: val } });
  if (val < root.val) root.left = bstInsert(root.left, val);
  else root.right = bstInsert(root.right, val);
  return root;
}
let root = null;
for (const v of [5,3,7,1,4,6,8]) root = bstInsert(root, v);
`,
  "heaps-and-priority-queues": `function heapifyUp(heap, i) {
  while (i > 0) {
    const parent = (i - 1) >> 1;
    trace.step({ label: \`compare heap[\${i}]=\${heap[i]} with parent[\${parent}]=\${heap[parent]}\`, state: { heap: [...heap], i, parent }, highlights: { arrays: { heap: [i, parent] } } });
    if (heap[i] < heap[parent]) {
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    } else break;
  }
}
const heap = [];
for (const v of [5, 3, 8, 1, 7, 2]) {
  heap.push(v);
  heapifyUp(heap, heap.length - 1);
}
console.log(heap);
`,
  "graphs-bfs-dfs": `const graph = { A:['B','C'], B:['D'], C:['D','E'], D:[], E:[] };
function dfs(node, visited = new Set()) {
  visited.add(node);
  trace.step({ label: \`DFS visit \${node}\`, state: { visited: [...visited], stack_node: node } });
  for (const nb of (graph[node] ?? [])) {
    if (!visited.has(nb)) dfs(nb, visited);
  }
  return visited;
}
dfs('A');
`,
  "greedy-algorithms": `function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const cur = intervals[i];
    trace.step({ label: \`compare [\${last}] with [\${cur}]\`, state: { last: \`[\${last}]\`, cur: \`[\${cur}]\`, overlap: cur[0] <= last[1] } });
    if (cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);
    else result.push([...cur]);
  }
  return result;
}
console.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));
`,
  "dynamic-programming-1d": `function climbStairs(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1; dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
    trace.step({ label: \`dp[\${i}] = dp[\${i-1}]+dp[\${i-2}] = \${dp[i]}\`, state: { dp: [...dp], i }, highlights: { arrays: { dp: [i, i-1, i-2] } } });
  }
  return dp[n];
}
console.log(climbStairs(6));
`,
  backtracking: `function permutations(nums) {
  const result = [];
  function bt(path, used) {
    trace.step({ label: \`path=[\${path}]\`, state: { path: [...path], used: [...used] } });
    if (path.length === nums.length) { result.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      path.push(nums[i]); used[i] = true;
      bt(path, used);
      path.pop(); used[i] = false;
    }
  }
  bt([], Array(nums.length).fill(false));
  return result;
}
console.log(permutations([1,2,3]).length);
`,
  tries: `class TrieNode { constructor() { this.children = {}; this.end = false; } }
const root = new TrieNode();
function insert(word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new TrieNode();
    node = node.children[ch];
    trace.step({ label: \`insert '\${ch}' from '\${word}'\`, state: { char: ch, word, keys: Object.keys(node.children) } });
  }
  node.end = true;
}
function search(word) {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) return false;
    node = node.children[ch];
  }
  return node.end;
}
for (const w of ['apple','app','apt']) insert(w);
console.log(search('app'), search('ap'));
`,
  "union-find": `function makeUF(n) {
  const parent = Array.from({length:n},(_,i)=>i);
  const rank = Array(n).fill(0);
  function find(x) { if (parent[x]!==x) parent[x]=find(parent[x]); return parent[x]; }
  function union(a,b) {
    const ra=find(a), rb=find(b);
    if(ra===rb) return;
    if(rank[ra]<rank[rb]) parent[ra]=rb;
    else if(rank[ra]>rank[rb]) parent[rb]=ra;
    else { parent[rb]=ra; rank[ra]++; }
    trace.step({ label: \`union(\${a},\${b}) roots \${ra}→\${rb}\`, state: { parent:[...parent], rank:[...rank] }, highlights: { arrays: { parent:[ra,rb] } } });
  }
  return { union, find };
}
const uf = makeUF(6);
for (const [a,b] of [[0,1],[1,2],[3,4]]) uf.union(a,b);
console.log(uf.find(0)===uf.find(2), uf.find(0)===uf.find(3));
`,
  "dynamic-programming-2d": `function lcs(a, b) {
  const m=a.length, n=b.length;
  const dp = Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) {
    if(a[i-1]===b[j-1]) dp[i][j]=dp[i-1][j-1]+1;
    else dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1]);
    trace.step({ label: \`dp[\${i}][\${j}]=\${dp[i][j]} a='\${a[i-1]}' b='\${b[j-1]}'\`, state: { i, j, match: a[i-1]===b[j-1], dp_row: [...dp[i]] }, highlights: { arrays: { dp_row: [j] } } });
  }
  return dp[m][n];
}
console.log(lcs('ABCBDAB','BDCAB'));
`,
};

type RunState = "idle" | "running" | "complete" | "error";
interface OutputLine { type: "stdout" | "stderr"; data: string; }

export default function SandboxPage() {
  const [algo, setAlgo] = useState<AlgoSlug>("custom");
  const [code, setCode] = useState(STARTERS["custom"]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [traceFrames, setTraceFrames] = useState<TraceFrame[]>([]);
  const [exitCode, setExitCode] = useState<number | undefined>();
  const [runtimeMs, setRuntimeMs] = useState<number | undefined>();

  const runSandbox = trpc.submissions.runSandbox.useMutation();

  const handleAlgoChange = (slug: AlgoSlug) => {
    setAlgo(slug);
    setCode(STARTERS[slug]);
    setLines([]);
    setTraceFrames([]);
    setExitCode(undefined);
    setRuntimeMs(undefined);
    setRunState("idle");
  };

  const run = useCallback(async () => {
    setRunState("running");
    setLines([]);
    setTraceFrames([]);
    setExitCode(undefined);
    setRuntimeMs(undefined);
    try {
      const { streamToken } = await runSandbox.mutateAsync({ code, language: "javascript" });
      const es = new EventSource(`/api/stream/${streamToken}`);
      es.addEventListener("stdout", (e: MessageEvent<string>) => {
        const { data } = JSON.parse(e.data) as { data: string };
        setLines((prev) => [...prev, { type: "stdout", data }]);
      });
      es.addEventListener("stderr", (e: MessageEvent<string>) => {
        const { data } = JSON.parse(e.data) as { data: string };
        setLines((prev) => [...prev, { type: "stderr", data }]);
      });
      es.addEventListener("trace", (e: MessageEvent<string>) => {
        const { frames } = JSON.parse(e.data) as { frames: TraceFrame[] };
        setTraceFrames(frames ?? []);
      });
      es.addEventListener("result", (e: MessageEvent<string>) => {
        const result = JSON.parse(e.data) as { exit_code: number; runtime_ms: number };
        setExitCode(result.exit_code);
        setRuntimeMs(result.runtime_ms);
        setRunState("complete");
        es.close();
      });
      es.onerror = () => { setRunState("error"); es.close(); };
    } catch {
      setRunState("error");
    }
  }, [code, runSandbox]);

  const selectedAlgo = ALGOS.find((a) => a.slug === algo)!;
  const showViz = algo !== "custom";

  return (
    <main className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-[var(--color-border-subtle)] px-6 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
          Algorithm Sandbox
        </h1>
        <select
          value={algo}
          onChange={(e) => handleAlgoChange(e.target.value as AlgoSlug)}
          className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
        >
          {ALGOS.map((a) => (
            <option key={a.slug} value={a.slug}>{a.title}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[var(--color-text-disabled)]">
          JavaScript · <code className="font-mono">trace.step(&#123; label, state, highlights &#125;)</code>
        </span>
      </header>

      {/* Body: up to 3-column layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Col 1: pre-built visualizer (only when an algo is selected) */}
        {showViz && (
          <div className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-[var(--color-border-subtle)] p-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-disabled)]">
                Pattern
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {selectedAlgo.title}
              </p>
            </div>
            <AlgorithmVisualizer conceptSlug={algo} title={selectedAlgo.title} />
          </div>
        )}

        {/* Col 2: editor + run + output */}
        <div className={[
          "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6",
          traceFrames.length > 0 ? "border-r border-[var(--color-border-subtle)]" : "",
        ].join(" ")}>
          <CodeEditor value={code} onChange={setCode} onRun={() => void run()} />

          <div className="flex gap-3">
            <button
              onClick={() => void run()}
              disabled={runState === "running" || !code}
              className="rounded-lg bg-[var(--color-interactive-primary)] px-4 py-2 text-sm font-medium text-[var(--color-interactive-primary-text)] disabled:opacity-50"
            >
              {runState === "running" ? "Running…" : "Run (Ctrl+Enter)"}
            </button>
          </div>

          <OutputPane
            state={runState === "idle" ? "idle" : runState === "running" ? "streaming" : runState === "complete" ? "complete" : "error"}
            lines={lines}
            isSuite={false}
            {...(exitCode !== undefined ? { exitCode } : {})}
            {...(runtimeMs !== undefined ? { runtimeMs } : {})}
          />
        </div>

        {/* Col 3: trace panel — only rendered once there are frames */}
        {traceFrames.length > 0 && (
          <div className="flex w-72 shrink-0 flex-col overflow-y-auto p-4">
            <TracePanel frames={traceFrames} />
          </div>
        )}
      </div>
    </main>
  );
}
