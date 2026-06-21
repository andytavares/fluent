"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VisStep {
  label: string;
  sublabel?: string | undefined;
  why?: string | undefined;
}

// ─── Controls ────────────────────────────────────────────────────────────────

function Controls({
  step, total, playing, onPrev, onNext, onPlay, onReset,
}: {
  step: number; total: number; playing: boolean;
  onPrev: () => void; onNext: () => void; onPlay: () => void; onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-4 py-2">
      <div className="flex items-center gap-1">
        <button onClick={onReset} className="rounded px-2 py-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">↺</button>
        <button onClick={onPrev} disabled={step === 0} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30">‹ Prev</button>
        <button onClick={onPlay} className="rounded bg-[var(--color-interactive-primary)] px-3 py-1 text-xs font-medium text-[var(--color-interactive-primary-text)]">{playing ? "⏸ Pause" : "▶ Play"}</button>
        <button onClick={onNext} disabled={step === total - 1} className="rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30">Next ›</button>
      </div>
      <span className="text-xs text-[var(--color-text-tertiary)]">{step + 1} / {total}</span>
    </div>
  );
}

function usePlayer(totalSteps: number, intervalMs = 900) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (playing) { stop(); return; }
    setPlaying(true);
    timerRef.current = setInterval(() => {
      setStep((s) => { if (s >= totalSteps - 1) { stop(); return s; } return s + 1; });
    }, intervalMs);
  }, [playing, stop, totalSteps, intervalMs]);

  useEffect(() => () => stop(), [stop]);
  const reset = useCallback(() => { stop(); setStep(0); }, [stop]);
  const prev = useCallback(() => { stop(); setStep((s) => Math.max(0, s - 1)); }, [stop]);
  const next = useCallback(() => { stop(); setStep((s) => Math.min(totalSteps - 1, s + 1)); }, [stop, totalSteps]);
  return { step, playing, play, prev, next, reset };
}

// ─── Shared cells ─────────────────────────────────────────────────────────────

function ArrayCell({ value, index, highlight, label, dimmed }: {
  value: number | string; index: number;
  highlight?: "primary" | "secondary" | "accent" | "match" | undefined;
  label?: string | undefined; dimmed?: boolean | undefined;
}) {
  const bgMap: Record<string, string> = {
    primary: "bg-blue-500/20 border-blue-400 text-blue-300",
    secondary: "bg-orange-500/20 border-orange-400 text-orange-300",
    accent: "bg-purple-500/20 border-purple-400 text-purple-300",
    match: "bg-green-500/20 border-green-400 text-green-300",
  };
  const bg = (highlight ? bgMap[highlight] : undefined) ?? "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)]">{label}</span>}
      <div className={`flex h-10 w-10 items-center justify-center rounded border font-mono text-sm font-medium transition-all duration-300 ${bg} ${dimmed ? "opacity-30" : ""}`}>{value}</div>
      <span className="text-[10px] text-[var(--color-text-tertiary)]">{index}</span>
    </div>
  );
}

function StepLabel({ label, sublabel, why }: VisStep) {
  return (
    <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-4 py-2.5 space-y-1">
      <p className="text-xs font-semibold text-[var(--color-text-primary)]">{label}</p>
      {sublabel && <p className="text-[11px] text-[var(--color-text-secondary)]">{sublabel}</p>}
      {why && (
        <p className="text-[11px] text-blue-400/90 border-l-2 border-blue-500/40 pl-2 mt-1">{why}</p>
      )}
    </div>
  );
}

// ─── Binary Search ─────────────────────────────────────────────────────────────

interface BSStep extends VisStep { left: number; right: number; mid: number; found?: boolean; }

function buildBinarySearchSteps(arr: number[], target: number): BSStep[] {
  const steps: BSStep[] = [];
  let lo = 0, hi = arr.length - 1;
  steps.push({ left: lo, right: hi, mid: -1, label: `Find ${target} in a sorted array`, sublabel: `Search space: indices ${lo}–${hi} (${arr.length} elements)`, why: `Sorted order is the key invariant. It lets us discard half the remaining elements at every step without ever looking at them — that's what makes this O(log n) instead of O(n).` });

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) {
      steps.push({ left: lo, right: hi, mid, found: true, label: `arr[${mid}] = ${arr[mid]} — found the target!`, sublabel: `Needed ${steps.length} comparisons for ${arr.length} elements`, why: `Binary search took ${steps.length} steps. Linear search would have taken up to ${arr.length}. That's the power of the sorted invariant.` });
      break;
    } else if (arr[mid]! < target) {
      steps.push({ left: lo, right: hi, mid, label: `arr[${mid}] = ${arr[mid]} < ${target} → move lo right`, sublabel: `lo = ${mid + 1} (was ${lo}). Eliminated indices ${lo}–${mid}.`, why: `Since arr[${mid}] < target AND the array is sorted, target cannot be at ${mid} or any index to the left (all smaller). The entire left half is eliminated in one comparison.` });
      lo = mid + 1;
    } else {
      steps.push({ left: lo, right: hi, mid, label: `arr[${mid}] = ${arr[mid]} > ${target} → move hi left`, sublabel: `hi = ${mid - 1} (was ${hi}). Eliminated indices ${mid}–${hi}.`, why: `Since arr[${mid}] > target AND the array is sorted, target cannot be at ${mid} or any index to the right (all larger). The entire right half is eliminated in one comparison.` });
      hi = mid - 1;
    }
  }
  return steps;
}

function BinarySearchVis() {
  const arr = [2, 5, 8, 12, 16, 23, 38, 42, 55, 72];
  const target = 23;
  const steps = buildBinarySearchSteps(arr, target);
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="flex flex-wrap gap-2 p-4 justify-center">
        {arr.map((v, i) => {
          const hl = s.found && i === s.mid ? "match" : i === s.mid ? "accent" : i === s.left || i === s.right ? "secondary" : undefined;
          const lbl = i === s.left && i === s.right ? "lo=hi" : i === s.left ? "lo" : i === s.right ? "hi" : i === s.mid ? "mid" : undefined;
          return <ArrayCell key={i} value={v} index={i} highlight={hl} label={lbl} dimmed={step > 0 && (i < s.left || i > s.right) && !s.found} />;
        })}
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Two Pointers ─────────────────────────────────────────────────────────────

interface TPStep extends VisStep { left: number; right: number; sum?: number; target: number; found?: boolean; }

function buildTwoPointersSteps(arr: number[], target: number): TPStep[] {
  const steps: TPStep[] = [];
  let lo = 0, hi = arr.length - 1;
  steps.push({ left: lo, right: hi, target, label: `Find a pair that sums to ${target}`, sublabel: `Array is sorted. Start with the widest possible window: L=0, R=${hi}`, why: `Sorted order makes this O(n) instead of O(n²). Two pointers eliminate all pairs to the left of L or right of R without checking them — because we already know what their sums would be.` });

  while (lo < hi) {
    const sum = arr[lo]! + arr[hi]!;
    if (sum === target) {
      steps.push({ left: lo, right: hi, sum, target, found: true, label: `${arr[lo]} + ${arr[hi]} = ${sum} ✓ Found!`, sublabel: `Pair at indices (${lo}, ${hi})`, why: `Done. Two pointers scanned all necessary pairs in O(n) time by never backtracking — each pointer only moves inward.` });
      break;
    } else if (sum < target) {
      steps.push({ left: lo, right: hi, sum, target, label: `${arr[lo]} + ${arr[hi]} = ${sum} < ${target} → move L right`, sublabel: `Increasing the left value is the only way to increase the sum`, why: `Sum is too small. Moving R left would give an even smaller right value → smaller sum. Moving L right gives a larger left value → larger sum. Sorted order makes this choice unambiguous.` });
      lo++;
    } else {
      steps.push({ left: lo, right: hi, sum, target, label: `${arr[lo]} + ${arr[hi]} = ${sum} > ${target} → move R left`, sublabel: `Decreasing the right value is the only way to decrease the sum`, why: `Sum is too large. Moving L right would give an even larger left value → larger sum. Moving R left gives a smaller right value → smaller sum. One definitive move per iteration.` });
      hi--;
    }
  }
  return steps;
}

function TwoPointersVis() {
  const arr = [1, 3, 5, 7, 9, 12, 15, 18, 22, 28];
  const target = 21;
  const steps = buildTwoPointersSteps(arr, target);
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="flex flex-wrap gap-2 p-4 justify-center">
        {arr.map((v, i) => {
          const isLeft = i === s.left, isRight = i === s.right;
          const hl = s.found && (isLeft || isRight) ? "match" : isLeft ? "primary" : isRight ? "secondary" : undefined;
          const lbl = isLeft && isRight ? "L=R" : isLeft ? "L" : isRight ? "R" : undefined;
          return <ArrayCell key={i} value={v} index={i} highlight={hl} label={lbl} />;
        })}
      </div>
      {s.sum !== undefined && (
        <div className="mx-4 mb-3 rounded bg-[var(--color-bg-subtle)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
          Current sum: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{s.sum}</span>{" "}/ target: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{target}</span>
        </div>
      )}
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Sliding Window ────────────────────────────────────────────────────────────

interface SWStep extends VisStep { left: number; right: number; windowSum: number; maxSum: number; maxLeft: number; maxRight: number; k: number; }

function buildSlidingWindowSteps(arr: number[], k: number): SWStep[] {
  const steps: SWStep[] = [];
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum, maxL = 0, maxR = k - 1;
  steps.push({ left: 0, right: k - 1, windowSum, maxSum, maxLeft: maxL, maxRight: maxR, k,
    label: `Initial window [0..${k - 1}], sum = ${windowSum}`,
    sublabel: `k=${k}: compute the first window sum directly`,
    why: `We calculate the first window from scratch. Every subsequent window is derived from the previous one in O(1) — that's the sliding window trick.` });

  for (let r = k; r < arr.length; r++) {
    const l = r - k + 1;
    const removed = arr[l - 1]!;
    const added = arr[r]!;
    windowSum = windowSum - removed + added;
    if (windowSum > maxSum) { maxSum = windowSum; maxL = l; maxR = r; }
    steps.push({ left: l, right: r, windowSum, maxSum, maxLeft: maxL, maxRight: maxR, k,
      label: `Slide right: −arr[${l-1}]=${removed}, +arr[${r}]=${added} → sum = ${windowSum}`,
      sublabel: maxSum === windowSum ? `New best! Window [${l}..${r}] with sum ${windowSum}` : `Best so far: [${maxL}..${maxR}] with sum ${maxSum}`,
      why: `Instead of re-summing k elements (O(k)), we just subtract the element leaving the left and add the element entering the right. This reduces each slide to O(1), making the full pass O(n) regardless of window size.` });
  }
  steps.push({ left: maxL, right: maxR, windowSum: maxSum, maxSum, maxLeft: maxL, maxRight: maxR, k,
    label: `Best window: [${maxL}..${maxR}] = sum ${maxSum}`,
    sublabel: `Values: [${arr.slice(maxL, maxR + 1).join(", ")}]`,
    why: `Complete in O(n). A naive brute force checking every window would be O(n·k). The sliding technique eliminates the inner k-loop entirely.` });
  return steps;
}

function SlidingWindowVis() {
  const arr = [2, 1, 5, 1, 3, 2, 4, 1, 6, 2];
  const k = 3;
  const steps = buildSlidingWindowSteps(arr, k);
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  const isFinal = step === steps.length - 1;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="flex flex-wrap gap-2 p-4 justify-center">
        {arr.map((v, i) => {
          const inWindow = i >= s.left && i <= s.right;
          const isBest = isFinal && i >= s.maxLeft && i <= s.maxRight;
          return <ArrayCell key={i} value={v} index={i} highlight={isBest ? "match" : inWindow ? "primary" : undefined} />;
        })}
      </div>
      <div className="mx-4 mb-3 flex gap-4 rounded bg-[var(--color-bg-subtle)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
        <span>Window sum: <span className="font-mono font-semibold text-[var(--color-text-primary)]">{s.windowSum}</span></span>
        <span>Best so far: <span className="font-mono font-semibold text-green-400">{s.maxSum}</span></span>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Prefix Sums ──────────────────────────────────────────────────────────────

interface PSStep extends VisStep { prefixPhase: boolean; prefix: number[]; queryL?: number; queryR?: number; queryResult?: number; highlightIdx?: number; arr: number[]; }

function buildPrefixSumSteps(arr: number[]): PSStep[] {
  const steps: PSStep[] = [];
  const prefix: number[] = [0];
  steps.push({ prefixPhase: true, prefix: [...prefix], arr,
    label: `Build prefix array: prefix[0] = 0 (sentinel)`,
    sublabel: `prefix[i] = sum of arr[0..i-1]`,
    why: `The sentinel at index 0 (value 0) is essential. It means prefix[r+1] − prefix[l] gives the sum from index l to r, without any special-casing for l=0.` });

  for (let i = 0; i < arr.length; i++) {
    prefix.push(prefix[i]! + arr[i]!);
    steps.push({ prefixPhase: true, prefix: [...prefix], highlightIdx: i, arr,
      label: `prefix[${i+1}] = prefix[${i}] + arr[${i}] = ${prefix[i]} + ${arr[i]} = ${prefix[i + 1]}`,
      sublabel: `prefix[${i+1}] now holds the sum of the first ${i+1} elements`,
      why: `Each prefix value extends the previous one by one element. We build this table once in O(n), so every future range query costs only O(1) — a direct subtraction.` });
  }

  const queries: [number, number][] = [[1, 4], [2, 6], [0, arr.length - 1]];
  for (const [l, r] of queries) {
    const result = prefix[r + 1]! - prefix[l]!;
    steps.push({ prefixPhase: false, prefix, queryL: l, queryR: r, queryResult: result, arr,
      label: `Query sum(${l}..${r}) = prefix[${r+1}] − prefix[${l}] = ${prefix[r+1]} − ${prefix[l]} = ${result}`,
      sublabel: `Range [${l}..${r}] contains: [${arr.slice(l, r+1).join(", ")}]`,
      why: `prefix[r+1] is the sum of arr[0..r]. prefix[l] is the sum of arr[0..l−1]. Subtracting cancels the prefix before l, leaving only the sum from l to r. Pure O(1) — no looping.` });
  }
  return steps;
}

function PrefixSumsVis() {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];
  const steps = buildPrefixSumSteps(arr);
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-medium text-[var(--color-text-tertiary)] mb-1.5">arr[]</p>
          <div className="flex flex-wrap gap-1.5">
            {arr.map((v, i) => {
              const inQuery = !s.prefixPhase && s.queryL !== undefined && i >= s.queryL && i <= s.queryR!;
              return <ArrayCell key={i} value={v} index={i} highlight={inQuery ? "match" : undefined} />;
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-medium text-[var(--color-text-tertiary)] mb-1.5">prefix[] (size n+1)</p>
          <div className="flex flex-wrap gap-1.5">
            {s.prefix.map((v, i) => {
              const isNew = s.prefixPhase && i === s.prefix.length - 1 && i > 0;
              const isQueryBound = !s.prefixPhase && (i === s.queryL || i === (s.queryR ?? -1) + 1);
              return <ArrayCell key={i} value={v} index={i} highlight={isNew ? "primary" : isQueryBound ? "accent" : undefined} />;
            })}
          </div>
        </div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Stack ────────────────────────────────────────────────────────────────────

interface StackStep extends VisStep { stack: (string | number)[]; action?: "push" | "pop" | "peek" | undefined; actionValue?: string | number | undefined; }

function buildStackSteps(): StackStep[] {
  const ops: Array<["push" | "pop" | "peek", string | number]> = [
    ["push", 5], ["push", 3], ["push", 8], ["peek", ""], ["push", 1],
    ["pop", ""], ["pop", ""], ["push", 7], ["pop", ""], ["pop", ""],
  ];
  const steps: StackStep[] = [{ stack: [], label: "Empty stack — LIFO: Last In, First Out",
    sublabel: "Push adds to the top. Pop removes from the top.",
    why: `LIFO is ideal for matching/nesting problems (brackets, function calls). The most recently opened context is always the first one that needs to be closed.` }];
  const stack: (string | number)[] = [];

  for (const [op, val] of ops) {
    if (op === "push") {
      stack.push(val);
      steps.push({ stack: [...stack], action: "push", actionValue: val,
        label: `push(${val}) → placed on top`,
        sublabel: `Stack: [${stack.join(", ")}] — top is ${stack[stack.length-1]}`,
        why: `New element sits on top of all previous elements. If we pop next, we'll get ${val} back first — regardless of what's below.` });
    } else if (op === "pop") {
      const popped = stack.pop();
      steps.push({ stack: [...stack], action: "pop", actionValue: popped,
        label: `pop() → removed ${popped} from the top`,
        sublabel: `Stack: [${stack.join(", ")}]${stack.length ? ` — top is now ${stack[stack.length-1]}` : " — empty"}`,
        why: `LIFO guarantees ${popped} came off first because it was added last. The items below are untouched — their relative order is preserved.` });
    } else {
      steps.push({ stack: [...stack], action: "peek", actionValue: stack[stack.length - 1],
        label: `peek() → top is ${stack[stack.length - 1]}`,
        sublabel: `Stack unchanged — just looking at the top element`,
        why: `peek() reads without removing. Useful when you need to know what's on top before deciding whether to pop.` });
    }
  }
  return steps;
}

function StackVis() {
  const steps = buildStackSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex gap-8 items-end justify-center min-h-[160px]">
        <div className="flex flex-col-reverse gap-1">
          {s.stack.length === 0 && <div className="h-10 w-16 rounded border border-dashed border-[var(--color-border-subtle)] flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">empty</div>}
          {s.stack.map((v, i) => {
            const isTop = i === s.stack.length - 1;
            const hl = isTop && s.action === "peek" ? "accent" : isTop && (s.action === "push" || s.action === "pop") ? "primary" : undefined;
            const bg = hl === "accent" ? "bg-purple-500/20 border-purple-400 text-purple-300" : hl === "primary" ? "bg-blue-500/20 border-blue-400 text-blue-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
            return <div key={i} className={`flex h-10 w-16 items-center justify-center rounded border font-mono text-sm font-medium transition-all duration-200 ${bg}`}>{v}{isTop && <span className="ml-1 text-[10px] opacity-60">← top</span>}</div>;
          })}
        </div>
        <div className="text-xs space-y-1 min-w-[120px]">
          {s.action === "push" && <div className="text-blue-400">↑ push({s.actionValue})</div>}
          {s.action === "pop" && <div className="text-orange-400">↓ pop() = {s.actionValue}</div>}
          {s.action === "peek" && <div className="text-purple-400">👁 peek() = {s.actionValue}</div>}
          <div className="text-[var(--color-text-tertiary)]">size: {s.stack.length}</div>
        </div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Queue ────────────────────────────────────────────────────────────────────

interface QueueStep extends VisStep { queue: number[]; action?: "enqueue" | "dequeue" | "peek" | undefined; actionValue?: number | undefined; }

function buildQueueSteps(): QueueStep[] {
  const ops: Array<["enqueue" | "dequeue" | "peek", number]> = [
    ["enqueue", 1], ["enqueue", 4], ["enqueue", 7], ["peek", 0],
    ["enqueue", 2], ["dequeue", 0], ["dequeue", 0], ["enqueue", 9], ["dequeue", 0], ["dequeue", 0],
  ];
  const steps: QueueStep[] = [{ queue: [], label: "Empty queue — FIFO: First In, First Out",
    sublabel: "enqueue() adds to back. dequeue() removes from front.",
    why: `FIFO preserves arrival order. BFS depends on this: nodes closer to the source enter the queue first, so they're processed first — guaranteeing shortest-path ordering.` }];
  const queue: number[] = [];

  for (const [op, val] of ops) {
    if (op === "enqueue") {
      queue.push(val);
      steps.push({ queue: [...queue], action: "enqueue", actionValue: val,
        label: `enqueue(${val}) → joins the back`,
        sublabel: `Queue: [${queue.join(", ")}] — front is ${queue[0]}`,
        why: `${val} will wait behind all elements that arrived before it. FIFO ensures it's processed in arrival order — no element can jump the line.` });
    } else if (op === "dequeue") {
      const dequeued = queue.shift();
      steps.push({ queue: [...queue], action: "dequeue", actionValue: dequeued,
        label: `dequeue() → removed ${dequeued} from front`,
        sublabel: `Queue: [${queue.join(", ")}]${queue.length ? ` — next is ${queue[0]}` : " — empty"}`,
        why: `${dequeued} was the earliest-enqueued element still in the queue. FIFO guarantees the oldest item is always processed first.` });
    } else {
      steps.push({ queue: [...queue], action: "peek", actionValue: queue[0],
        label: `peek() → front is ${queue[0]}`,
        sublabel: "Queue unchanged — just inspecting who's next",
        why: `peek() is non-destructive. Check the next element without committing to removing it — useful for conditional processing.` });
    }
  }
  return steps;
}

function QueueVis() {
  const steps = buildQueueSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex flex-col gap-3 items-center min-h-[120px] justify-center">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--color-text-tertiary)] mr-1">front →</span>
          {s.queue.length === 0 && <div className="h-10 w-16 rounded border border-dashed border-[var(--color-border-subtle)] flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">empty</div>}
          {s.queue.map((v, i) => {
            const isFront = i === 0, isBack = i === s.queue.length - 1;
            const hl = isFront && s.action === "dequeue" ? "secondary" : isFront && s.action === "peek" ? "accent" : isBack && s.action === "enqueue" ? "primary" : undefined;
            const bg = hl === "secondary" ? "bg-orange-500/20 border-orange-400 text-orange-300" : hl === "accent" ? "bg-purple-500/20 border-purple-400 text-purple-300" : hl === "primary" ? "bg-blue-500/20 border-blue-400 text-blue-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
            return <div key={i} className={`flex h-10 w-10 items-center justify-center rounded border font-mono text-sm font-medium transition-all duration-200 ${bg}`}>{v}</div>;
          })}
          <span className="text-[10px] text-[var(--color-text-tertiary)] ml-1">← back</span>
        </div>
        <div className="text-xs text-center">
          {s.action === "enqueue" && <span className="text-blue-400">↓ enqueue({s.actionValue}) at back</span>}
          {s.action === "dequeue" && <span className="text-orange-400">↑ dequeue() = {s.actionValue} from front</span>}
          {s.action === "peek" && <span className="text-purple-400">👁 peek() = {s.actionValue}</span>}
        </div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Linked List (Fast/Slow Pointers) ─────────────────────────────────────────

interface LLStep extends VisStep { slow: number; fast: number; hasCycle?: boolean; nodeCount: number; cycleAt?: number; }

function buildLinkedListSteps(): LLStep[] {
  const n = 5, cycleAt = 2;
  const steps: LLStep[] = [];
  steps.push({ slow: 0, fast: 0, nodeCount: n, cycleAt,
    label: `Floyd's Cycle Detection — list: 0→1→2→3→4→2 (cycle)`,
    sublabel: `Slow pointer moves 1 step per iteration. Fast pointer moves 2 steps.`,
    why: `If a cycle exists, fast laps slow. Their relative speed is 1 node/iteration, so fast gains on slow by exactly 1 node per step. They must eventually occupy the same node — proving the cycle.` });

  let s = 0, f = 0;
  for (let i = 0; i < 10; i++) {
    const sNext = s + 1 < n ? s + 1 : cycleAt;
    const f1 = f + 1 < n ? f + 1 : cycleAt;
    const fNext = f1 + 1 < n ? f1 + 1 : cycleAt;
    s = sNext; f = fNext;
    if (s === f) {
      steps.push({ slow: s, fast: f, nodeCount: n, cycleAt, hasCycle: true,
        label: `Slow = Fast = ${s} — they've met inside the cycle!`,
        sublabel: `Cycle confirmed. Meeting point is node ${s}.`,
        why: `Meeting is guaranteed: if there's a cycle of length L, fast catches slow within at most L iterations. If fast reaches null instead, the list is acyclic.` });
      break;
    }
    steps.push({ slow: s, fast: f, nodeCount: n, cycleAt,
      label: `slow → node ${s},  fast → node ${f}`,
      sublabel: `Gap between them: ${Math.abs(f - s) % n} nodes (in the cycle)`,
      why: `Fast is ${i + 1} steps ahead total. Inside the cycle, the gap shrinks by 1 each iteration. When gap reaches 0, they meet.` });
  }
  return steps;
}

function LinkedListVis() {
  const steps = buildLinkedListSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex flex-col gap-4 items-center">
        <div className="flex items-center gap-0">
          {Array.from({ length: s.nodeCount }).map((_, i) => {
            const isSlow = i === s.slow, isFast = i === s.fast, isBoth = isSlow && isFast;
            const isCycleNode = i === s.cycleAt;
            const bg = isBoth ? "bg-green-500/20 border-green-400" : isSlow ? "bg-blue-500/20 border-blue-400" : isFast ? "bg-orange-500/20 border-orange-400" : isCycleNode ? "bg-purple-500/10 border-purple-400/50" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)]";
            const textColor = isBoth ? "text-green-300" : isSlow ? "text-blue-300" : isFast ? "text-orange-300" : "text-[var(--color-text-secondary)]";
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 text-[10px] text-center">{isBoth ? <span className="text-green-400">S+F</span> : isSlow ? <span className="text-blue-400">S</span> : isFast ? <span className="text-orange-400">F</span> : null}</div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold transition-all duration-300 ${bg} ${textColor}`}>{i}</div>
                  {isCycleNode && <span className="text-[10px] text-purple-400">↑ cycle</span>}
                </div>
                {i < s.nodeCount - 1 && <div className="w-6 h-0.5 bg-[var(--color-border-subtle)] mt-5" />}
              </div>
            );
          })}
          <div className="ml-1 text-xs text-purple-400/70">↩ {s.cycleAt}</div>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-blue-500/40 border border-blue-400" /> slow</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-orange-500/40 border border-orange-400" /> fast</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full bg-green-500/40 border border-green-400" /> meet</span>
        </div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Tree BFS ─────────────────────────────────────────────────────────────────

interface TreeNode { val: number; left?: number; right?: number; }
interface BFSStep extends VisStep { visited: Set<number>; current: number | null; queue: number[]; }

const TREE_NODES: TreeNode[] = [
  { val: 1, left: 1, right: 2 }, { val: 2, left: 3, right: 4 }, { val: 3, left: 5, right: 6 },
  { val: 4 }, { val: 5 }, { val: 6 }, { val: 7 },
];
const NODE_VALS = [1, 2, 3, 4, 5, 6, 7];
const NODE_POS: [number, number][] = [[50,8],[25,35],[75,35],[12,65],[38,65],[62,65],[88,65]];
const EDGES: [number, number][] = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

function buildBFSSteps(): BFSStep[] {
  const steps: BFSStep[] = [];
  const visited = new Set<number>();
  const queue = [0];
  steps.push({ visited: new Set(), current: null, queue: [...queue],
    label: `BFS: start with root (${NODE_VALS[0]}) in the queue`,
    sublabel: `Queue: [${NODE_VALS[0]}]`,
    why: `The queue is what makes this "breadth-first." Nodes enter the queue in discovery order, and FIFO processing means we always finish one level before starting the next.` });

  while (queue.length > 0) {
    const idx = queue.shift()!;
    visited.add(idx);
    const node = TREE_NODES[idx]!;
    const children: number[] = [];
    if (node.left !== undefined) { queue.push(node.left); children.push(node.left); }
    if (node.right !== undefined) { queue.push(node.right); children.push(node.right); }
    const level = Math.floor(Math.log2(idx + 1));
    steps.push({ visited: new Set(visited), current: idx, queue: [...queue],
      label: `Visit node ${NODE_VALS[idx]} (level ${level})`,
      sublabel: children.length > 0 ? `Enqueue children: [${children.map(c => NODE_VALS[c]).join(", ")}] → queue: [${queue.map(i => NODE_VALS[i]).join(", ")}]` : `Leaf node — no children to enqueue`,
      why: children.length > 0
        ? `Children enter at the back of the queue, behind all current-level siblings. They won't be processed until all level-${level} nodes are done — guaranteeing level-by-level order.`
        : `Leaf node. Nothing added to queue. Once all nodes at this level are processed, we naturally move to the next level.` });
  }
  steps.push({ visited: new Set(visited), current: null, queue: [],
    label: `BFS complete — all ${TREE_NODES.length} nodes visited`,
    sublabel: `Level-order: ${Array.from({length: TREE_NODES.length}, (_, i) => NODE_VALS[i]).join(" → ")}`,
    why: `BFS guarantees the shortest path (fewest edges) from the root to any node. That's why it's used for shortest-path problems in unweighted graphs.` });
  return steps;
}

function TreeBFSVis() {
  const steps = buildBFSSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="relative mx-auto h-44 w-full max-w-xs p-2">
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {EDGES.map(([a, b]) => { const [ax,ay]=NODE_POS[a]!,[bx,by]=NODE_POS[b]!; return <line key={`${a}-${b}`} x1={`${ax}%`} y1={`${ay}%`} x2={`${bx}%`} y2={`${by}%`} stroke="var(--color-border-subtle)" strokeWidth="1.5" />; })}
        </svg>
        {NODE_POS.map(([x, y], i) => {
          const isCurrent = s.current === i, isVisited = s.visited.has(i), isQueued = s.queue.includes(i);
          const bg = isCurrent ? "bg-green-500/30 border-green-400 text-green-300" : isVisited ? "bg-blue-500/20 border-blue-400/60 text-blue-300" : isQueued ? "bg-orange-500/20 border-orange-400 text-orange-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
          return <div key={i} className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${bg}`} style={{left:`${x}%`,top:`${y}%`}}>{NODE_VALS[i]}</div>;
        })}
      </div>
      <div className="mx-4 mb-1 flex gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500/40 border border-green-400 inline-block" /> current</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500/40 border border-orange-400 inline-block" /> in queue</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500/40 border border-blue-400 inline-block" /> visited</span>
      </div>
      {s.queue.length > 0 && <div className="mx-4 mb-2 text-xs text-[var(--color-text-tertiary)]">Queue: [{s.queue.map(i => NODE_VALS[i]).join(", ")}]</div>}
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Tree DFS ─────────────────────────────────────────────────────────────────

interface DFSStep extends VisStep { visited: number[]; current: number | null; callStack: number[]; }

function buildDFSSteps(): DFSStep[] {
  const steps: DFSStep[] = [];
  const visited: number[] = [];

  function dfs(idx: number, callStack: number[]) {
    callStack = [...callStack, idx];
    steps.push({ visited: [...visited], current: idx, callStack,
      label: `Enter node ${NODE_VALS[idx]} — call stack depth: ${callStack.length}`,
      sublabel: `Call stack: ${callStack.map(i => NODE_VALS[i]).join(" → ")}`,
      why: `Recursion enters this node before its siblings. The call stack implicitly records the path from the root — when we return, we automatically backtrack to the parent.` });
    visited.push(idx);
    const node = TREE_NODES[idx]!;
    if (node.left !== undefined) dfs(node.left, callStack);
    if (node.right !== undefined) dfs(node.right, callStack);
    steps.push({ visited: [...visited], current: null, callStack: callStack.slice(0, -1),
      label: `Return from node ${NODE_VALS[idx]} — back to ${callStack.length > 1 ? `node ${NODE_VALS[callStack[callStack.length - 2]!]}` : "caller"}`,
      sublabel: `Entire subtree rooted at ${NODE_VALS[idx]} is fully visited`,
      why: `Returning from the recursive call is the backtrack. We've finished everything reachable from ${NODE_VALS[idx]}. The call stack unwinds to continue from where we left off in the parent.` });
  }

  steps.push({ visited: [], current: null, callStack: [],
    label: `DFS pre-order: visit node, then recurse left, then recurse right`,
    sublabel: `Tree has ${TREE_NODES.length} nodes across 3 levels`,
    why: `DFS commits to one path as deep as possible before backtracking. It uses O(h) memory (call stack height) vs BFS's O(w) (queue width). For deep, narrow trees DFS wins; for wide, shallow trees BFS wins.` });
  dfs(0, []);
  steps.push({ visited: [...visited], current: null, callStack: [],
    label: `DFS complete — pre-order: ${visited.map(i => NODE_VALS[i]).join(" → ")}`,
    sublabel: `${TREE_NODES.length} nodes visited`,
    why: `Pre-order (root → left → right) is one of three DFS orderings. In-order gives sorted output for BSTs. Post-order processes children before parents (useful for deletion or bottom-up computation).` });
  return steps;
}

function TreeDFSVis() {
  const steps = buildDFSSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length, 700);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="relative mx-auto h-44 w-full max-w-xs p-2">
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {EDGES.map(([a, b]) => { const [ax,ay]=NODE_POS[a]!,[bx,by]=NODE_POS[b]!; return <line key={`${a}-${b}`} x1={`${ax}%`} y1={`${ay}%`} x2={`${bx}%`} y2={`${by}%`} stroke="var(--color-border-subtle)" strokeWidth="1.5" />; })}
        </svg>
        {NODE_POS.map(([x, y], i) => {
          const isCurrent = s.current === i, isVisited = s.visited.includes(i), isInStack = s.callStack.includes(i);
          const bg = isCurrent ? "bg-green-500/30 border-green-400 text-green-300" : isInStack && !isVisited ? "bg-orange-500/20 border-orange-400 text-orange-300" : isVisited ? "bg-blue-500/20 border-blue-400/60 text-blue-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
          return <div key={i} className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${bg}`} style={{left:`${x}%`,top:`${y}%`}}>{NODE_VALS[i]}</div>;
        })}
      </div>
      <div className="mx-4 mb-2 flex gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500/40 border border-green-400 inline-block" /> current</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500/40 border border-blue-400 inline-block" /> visited</span>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Hash Maps ────────────────────────────────────────────────────────────────

interface HMStep extends VisStep { pairs: Array<[string, string]>; lookup?: string | undefined; found?: string | undefined; phase: "build" | "query"; }

function buildHashMapSteps(): HMStep[] {
  const words = ["apple", "banana", "cherry", "date", "elderberry"];
  const steps: HMStep[] = [{ pairs: [], phase: "build",
    label: `Build a hash map: word → its length`,
    sublabel: `Hash function converts each key to a bucket index`,
    why: `A hash map stores key-value pairs such that lookup, insert, and delete are all O(1) average. The hash function converts the key to a bucket index in O(key_length) time.` }];
  const pairs: Array<[string, string]> = [];

  for (const w of words) {
    pairs.push([w, String(w.length)]);
    steps.push({ pairs: [...pairs], phase: "build",
      label: `map.set("${w}", ${w.length})`,
      sublabel: `hash("${w}") → bucket, store value ${w.length}`,
      why: `Insertion is O(1) amortized. The hash function computes a bucket index. In a good implementation, collisions are rare — most insertions touch exactly one bucket.` });
  }

  const queries = ["banana", "date", "fig"];
  for (const q of queries) {
    const hit = pairs.find(([k]) => k === q);
    steps.push({ pairs: [...pairs], phase: "query", lookup: q, found: hit?.[1],
      label: hit ? `map.get("${q}") → ${hit[1]} (HIT)` : `map.get("${q}") → undefined (MISS)`,
      sublabel: hit ? `hash("${q}") → same bucket, key matches` : `hash("${q}") → bucket checked, key not present`,
      why: hit
        ? `O(1) lookup — we computed the bucket index directly from the key. No scanning of other entries, no matter how large the map gets.`
        : `O(1) miss — we checked the bucket and didn't find the key. Hash maps tell you "not found" just as fast as they tell you "found."` });
  }
  return steps;
}

function HashMapVis() {
  const steps = buildHashMapSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex flex-col gap-2">
        {s.pairs.map(([k, v], i) => {
          const isLookup = s.lookup === k, isHit = isLookup && s.found !== undefined;
          const bg = isHit ? "bg-green-500/20 border-green-400" : isLookup ? "bg-orange-500/20 border-orange-400" : i === s.pairs.length - 1 && s.phase === "build" ? "bg-blue-500/20 border-blue-400" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)]";
          return (
            <div key={k} className={`flex items-center gap-3 rounded border px-3 py-1.5 transition-all duration-200 ${bg}`}>
              <span className="font-mono text-xs text-[var(--color-text-secondary)] w-24">{k}</span>
              <span className="text-[var(--color-border-subtle)]">→</span>
              <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">{v}</span>
              {isHit && <span className="ml-auto text-[10px] text-green-400">✓ found</span>}
            </div>
          );
        })}
        {s.phase === "query" && s.found === undefined && (
          <div className="flex items-center gap-3 rounded border border-orange-400/50 px-3 py-1.5 bg-orange-500/10">
            <span className="font-mono text-xs text-orange-300">"{s.lookup}"</span>
            <span className="text-orange-400">→ undefined (not in map)</span>
          </div>
        )}
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Binary Search Tree ────────────────────────────────────────────────────────

interface BSTStep extends VisStep { visited: number[]; current: number | null; inserted: number[]; phase: "insert" | "search"; searchTarget?: number | undefined; searchFound?: boolean | undefined; }

const BST_VALS = [5, 3, 7, 1, 4, 6, 9];
const BST_POS: [number, number][] = [[50,8],[25,35],[75,35],[12,65],[38,65],[62,65],[88,65]];
const BST_EDGES: [number, number][] = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

function buildBSTSteps(): BSTStep[] {
  const steps: BSTStep[] = [];
  const inserted: number[] = [];
  steps.push({ visited: [], current: null, inserted: [], phase: "insert",
    label: `BST property: left child < parent < right child`,
    sublabel: `This holds at EVERY node, not just the root`,
    why: `The BST invariant makes search equivalent to binary search on a sorted array — at each node, we eliminate an entire subtree with a single comparison. Average O(log n), worst-case O(n) if unbalanced.` });

  for (const v of [5, 3, 7, 1, 4, 6, 9]) {
    const idx = BST_VALS.indexOf(v);
    inserted.push(idx);
    steps.push({ visited: [], current: idx, inserted: [...inserted], phase: "insert",
      label: `Insert ${v}`,
      sublabel: `All left subtree values < ${v} < all right subtree values`,
      why: `Each insertion maintains the BST property. We compare at each node and go left or right until finding an empty spot. This shapes the tree in O(log n) steps on average.` });
  }

  for (const target of [4, 8]) {
    let node = 0;
    const path: number[] = [];
    while (true) {
      path.push(node);
      const val = BST_VALS[node]!;
      if (val === target) {
        steps.push({ visited: [...path], current: node, inserted: [...inserted], phase: "search", searchTarget: target, searchFound: true,
          label: `Found ${target} at this node!`,
          sublabel: `Path taken: ${path.map(i => BST_VALS[i]).join(" → ")} (${path.length} comparisons)`,
          why: `${path.length} comparisons for a ${BST_VALS.length}-node tree. The BST property let us eliminate one subtree per comparison — the same principle as binary search.` });
        break;
      } else if (target < val) {
        steps.push({ visited: [...path], current: node, inserted: [...inserted], phase: "search", searchTarget: target,
          label: `${target} < ${val} → go left`,
          sublabel: `Eliminated the entire right subtree`,
          why: `BST property: all values in the right subtree are > ${val} > ${target}. None of them can be our target. We discard that entire half in one comparison.` });
        const leftIdx = node * 2 + 1;
        if (leftIdx >= BST_VALS.length) { steps.push({ visited: [...path], current: null, inserted: [...inserted], phase: "search", searchTarget: target, searchFound: false, label: `${target} not in tree`, sublabel: "Reached a null pointer", why: `No node with value ${target} exists. BST search terminates as soon as we'd go to a null child.` }); break; }
        node = leftIdx;
      } else {
        steps.push({ visited: [...path], current: node, inserted: [...inserted], phase: "search", searchTarget: target,
          label: `${target} > ${val} → go right`,
          sublabel: `Eliminated the entire left subtree`,
          why: `BST property: all values in the left subtree are < ${val} < ${target}. None of them can be our target. One comparison eliminates that entire half.` });
        const rightIdx = node * 2 + 2;
        if (rightIdx >= BST_VALS.length) { steps.push({ visited: [...path], current: null, inserted: [...inserted], phase: "search", searchTarget: target, searchFound: false, label: `${target} not in tree`, sublabel: "Reached a null pointer", why: `No node with value ${target} exists. We've proven it definitively without scanning the tree.` }); break; }
        node = rightIdx;
      }
    }
  }
  return steps;
}

function BSTVis() {
  const steps = buildBSTSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="relative mx-auto h-44 w-full max-w-xs p-2">
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {BST_EDGES.map(([a, b]) => { if (!s.inserted.includes(a) || !s.inserted.includes(b)) return null; const [ax,ay]=BST_POS[a]!,[bx,by]=BST_POS[b]!; return <line key={`${a}-${b}`} x1={`${ax}%`} y1={`${ay}%`} x2={`${bx}%`} y2={`${by}%`} stroke="var(--color-border-subtle)" strokeWidth="1.5" />; })}
        </svg>
        {BST_POS.map(([x, y], i) => {
          if (!s.inserted.includes(i) && s.current !== i) return null;
          const isCurrent = s.current === i, isVisited = s.visited.includes(i), isFound = isCurrent && s.searchFound;
          const bg = isFound ? "bg-green-500/30 border-green-400 text-green-300" : isCurrent ? "bg-blue-500/30 border-blue-400 text-blue-300" : isVisited ? "bg-orange-500/20 border-orange-400/60 text-orange-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
          return <div key={i} className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${bg}`} style={{left:`${x}%`,top:`${y}%`}}>{BST_VALS[i]}</div>;
        })}
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Heap ─────────────────────────────────────────────────────────────────────

interface HeapStep extends VisStep { heap: number[]; highlightIdx?: number | undefined; swapping?: [number, number] | undefined; }

function buildHeapSteps(): HeapStep[] {
  const vals = [9, 4, 7, 2, 5, 1, 8, 3, 6];
  const heap: number[] = [];
  const steps: HeapStep[] = [{ heap: [],
    label: `Min-Heap: the minimum element is always at the root`,
    sublabel: `Rule: parent ≤ both children at every node`,
    why: `Heaps are complete binary trees stored in an array. Parent of index i is at (i-1)/2. Left child is 2i+1, right is 2i+2. This formula means no pointers needed — O(1) parent/child access.` }];

  function siftUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent]! <= heap[i]!) break;
      steps.push({ heap: [...heap], swapping: [parent, i],
        label: `heap[${parent}]=${heap[parent]} > heap[${i}]=${heap[i]} — swap to fix heap property`,
        sublabel: `Moving ${heap[i]} up toward the root`,
        why: `A parent larger than its child violates the min-heap invariant. Swapping restores it locally. We repeat upward because the new parent might also violate the property.` });
      [heap[parent], heap[i]] = [heap[i]!, heap[parent]!];
      i = parent;
    }
  }

  for (const v of vals) {
    heap.push(v);
    steps.push({ heap: [...heap], highlightIdx: heap.length - 1,
      label: `Insert ${v}: append to end of array (index ${heap.length - 1})`,
      sublabel: `Appending maintains the "complete tree" shape property`,
      why: `We always insert at the end to keep the tree complete (no gaps). This might violate the heap property — sift-up will fix it by bubbling the new element up to its correct position.` });
    siftUp(heap.length - 1);
    steps.push({ heap: [...heap],
      label: `After sift-up: root = ${heap[0]} (minimum of all ${heap.length} elements)`,
      sublabel: `Heap array: [${heap.join(", ")}]`,
      why: `Sift-up does at most O(log n) swaps — one per level. The heap's height is log n since it's a complete binary tree. So insert is O(log n) and peek (root) is always O(1).` });
  }
  return steps;
}

function HeapVis() {
  const steps = buildHeapSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  const positions: [number, number][] = [];
  for (let i = 0; i < Math.min(s.heap.length, 15); i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);
    positions.push([(posInLevel + 0.5) / totalInLevel * 100, level * 28 + 8]);
  }
  const heapEdges: [number, number][] = [];
  for (let i = 1; i < s.heap.length; i++) heapEdges.push([Math.floor((i - 1) / 2), i]);

  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="relative mx-auto h-44 w-full max-w-xs p-2">
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {heapEdges.map(([a, b]) => { const [ax,ay]=positions[a]??[0,0],[bx,by]=positions[b]??[0,0]; return <line key={`${a}-${b}`} x1={`${ax}%`} y1={`${ay}%`} x2={`${bx}%`} y2={`${by}%`} stroke="var(--color-border-subtle)" strokeWidth="1.5" />; })}
        </svg>
        {positions.map(([x, y], i) => {
          const isNew = i === s.highlightIdx, isSwap = s.swapping && (i === s.swapping[0] || i === s.swapping[1]), isRoot = i === 0;
          const bg = isSwap ? "bg-orange-500/30 border-orange-400 text-orange-300" : isNew ? "bg-blue-500/30 border-blue-400 text-blue-300" : isRoot ? "bg-green-500/20 border-green-400 text-green-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
          return <div key={i} className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${bg}`} style={{left:`${x}%`,top:`${y}%`}}>{s.heap[i]}</div>;
        })}
      </div>
      {s.heap.length > 0 && <div className="mx-4 mb-1 text-xs text-[var(--color-text-tertiary)]">Array: [{s.heap.join(", ")}]</div>}
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Graph BFS/DFS ────────────────────────────────────────────────────────────

interface GraphStep extends VisStep { visited: Set<number>; current: number | null; frontier: number[]; mode: "bfs" | "dfs"; }

const GRAPH_ADJ: number[][] = [[1,2],[0,3,4],[0,4],[1,5],[1,2,5],[3,4]];
const GRAPH_POS: [number, number][] = [[30,15],[15,50],[50,50],[10,85],[55,80],[35,90]];
const GRAPH_EDGES: [number, number][] = [[0,1],[0,2],[1,3],[1,4],[2,4],[3,5],[4,5]];

function buildGraphSteps(mode: "bfs" | "dfs"): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<number>();

  if (mode === "bfs") {
    const queue = [0];
    visited.add(0);
    steps.push({ visited: new Set(visited), current: null, frontier: [...queue], mode,
      label: `Graph BFS from node 0`,
      sublabel: `Queue: [0]. Mark node 0 visited immediately on enqueue.`,
      why: `BFS uses a queue. Nodes are marked visited when enqueued (not when dequeued) to prevent duplicates. This guarantees shortest path: we process nodes in order of their distance from the source.` });
    while (queue.length) {
      const node = queue.shift()!;
      const unvisited = GRAPH_ADJ[node]!.filter(n => !visited.has(n));
      steps.push({ visited: new Set(visited), current: node, frontier: [...queue], mode,
        label: `Process node ${node} — neighbors: [${GRAPH_ADJ[node]!.join(", ")}]`,
        sublabel: unvisited.length ? `Enqueue unvisited: [${unvisited.join(", ")}]` : `All neighbors already visited`,
        why: unvisited.length
          ? `We explore all neighbors at distance d before any at distance d+1. Enqueuing unvisited neighbors here means they'll be processed after all current-distance nodes — that's what produces shortest paths.`
          : `All neighbors already reached. No new nodes discovered from here. BFS continues until the queue empties.` });
      for (const nb of GRAPH_ADJ[node]!) { if (!visited.has(nb)) { visited.add(nb); queue.push(nb); } }
    }
  } else {
    const stack: number[] = [0];
    steps.push({ visited: new Set(), current: null, frontier: [0], mode,
      label: `Graph DFS from node 0`,
      sublabel: `Stack: [0]`,
      why: `DFS uses a stack (or recursion). Unlike BFS, it commits to one path as deep as possible before backtracking. Useful for: cycle detection, topological sort, connected components, maze solving.` });
    while (stack.length) {
      const node = stack.pop()!;
      if (visited.has(node)) {
        steps.push({ visited: new Set(visited), current: null, frontier: [...stack], mode,
          label: `Skip node ${node} — already visited`,
          sublabel: `Stack: [${stack.join(", ")}]`,
          why: `A node can be pushed multiple times by different neighbors. We skip it on the second visit. This is why iterative DFS checks visited on pop, not on push.` });
        continue;
      }
      visited.add(node);
      steps.push({ visited: new Set(visited), current: node, frontier: [...stack], mode,
        label: `Visit node ${node} — push unvisited neighbors onto stack`,
        sublabel: `Stack after: [${stack.concat([...GRAPH_ADJ[node]!].reverse().filter(n => !visited.has(n))).join(", ")}]`,
        why: `DFS goes deep: pushing neighbors to a stack means we'll next visit the last-pushed neighbor (the one we pushed most recently). This is what creates depth-first behavior.` });
      for (const nb of [...GRAPH_ADJ[node]!].reverse()) { if (!visited.has(nb)) stack.push(nb); }
    }
  }

  steps.push({ visited: new Set(visited), current: null, frontier: [], mode,
    label: `${mode.toUpperCase()} complete — all ${visited.size} reachable nodes visited`,
    sublabel: `Visit order: ${Array.from(visited).join(" → ")}`,
    why: mode === "bfs"
      ? `BFS visit order reflects shortest-path distance from the source. Nodes at distance 1 before distance 2, etc. This is why BFS solves shortest-path in unweighted graphs.`
      : `DFS visit order reflects the path the algorithm committed to. It's not necessarily shortest — but it explores the full depth of each branch, which is useful for exhaustive search.` });
  return steps;
}

function GraphVis() {
  const [mode, setMode] = useState<"bfs" | "dfs">("bfs");
  const bfsSteps = buildGraphSteps("bfs");
  const dfsSteps = buildGraphSteps("dfs");
  const steps = mode === "bfs" ? bfsSteps : dfsSteps;
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <div className="flex gap-2 border-b border-[var(--color-border-subtle)] px-4 py-2">
        {(["bfs", "dfs"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); reset(); }} className={`rounded px-3 py-1 text-xs font-medium transition-colors ${mode === m ? "bg-[var(--color-interactive-primary)] text-[var(--color-interactive-primary-text)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>{m.toUpperCase()}</button>
        ))}
      </div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="relative mx-auto h-44 w-full max-w-xs p-2">
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {GRAPH_EDGES.map(([a, b]) => { const [ax,ay]=GRAPH_POS[a]!,[bx,by]=GRAPH_POS[b]!; const both = s.visited.has(a) && s.visited.has(b); return <line key={`${a}-${b}`} x1={`${ax}%`} y1={`${ay}%`} x2={`${bx}%`} y2={`${by}%`} stroke={both ? "#3b82f6" : "var(--color-border-subtle)"} strokeWidth={both ? "2" : "1.5"} opacity={both ? "0.5" : "1"} />; })}
        </svg>
        {GRAPH_POS.map(([x, y], i) => {
          const isCurrent = s.current === i, isVisited = s.visited.has(i), isQueued = s.frontier.includes(i);
          const bg = isCurrent ? "bg-green-500/30 border-green-400 text-green-300" : isVisited ? "bg-blue-500/20 border-blue-400/60 text-blue-300" : isQueued ? "bg-orange-500/20 border-orange-400 text-orange-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
          return <div key={i} className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${bg}`} style={{left:`${x}%`,top:`${y}%`}}>{i}</div>;
        })}
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Greedy (Merge Intervals) ─────────────────────────────────────────────────

interface GreedyStep extends VisStep { intervals: [number, number][]; merged: [number, number][]; currentIdx: number; merging?: boolean; }

function buildGreedySteps(): GreedyStep[] {
  const intervals: [number, number][] = [[1,3],[2,6],[8,10],[15,18],[17,20],[5,7]];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]) as [number, number][];
  const steps: GreedyStep[] = [{ intervals: sorted, merged: [], currentIdx: -1,
    label: `Sort intervals by start time: ${sorted.map(([a,b]) => `[${a},${b}]`).join(", ")}`,
    sublabel: `Sorting is the prerequisite for the greedy merge`,
    why: `After sorting by start time, we only need to compare each interval with the LAST merged result. If they don't overlap, no future interval can bridge the gap either — because all future intervals start even later.` }];

  const merged: [number, number][] = [];
  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]!;
    if (!merged.length || merged[merged.length - 1]![1] < curr[0]) {
      merged.push([...curr]);
      steps.push({ intervals: sorted, merged: [...merged], currentIdx: i,
        label: `[${curr[0]},${curr[1]}] — no overlap with previous, add to result`,
        sublabel: `Result so far: ${merged.map(([a,b]) => `[${a},${b}]`).join(", ")}`,
        why: `current.start (${curr[0]}) > last.end (${merged.length > 1 ? merged[merged.length-2]![1] : "—"}). No overlap. Greedy insight: since future intervals start even later, they can't retroactively bridge this gap.` });
    } else {
      const last = merged[merged.length - 1]!;
      const newEnd = Math.max(last[1], curr[1]);
      steps.push({ intervals: sorted, merged: [...merged], currentIdx: i, merging: true,
        label: `[${curr[0]},${curr[1]}] overlaps [${last[0]},${last[1]}] → merge into [${last[0]},${newEnd}]`,
        sublabel: `Extend end from ${last[1]} to ${newEnd}`,
        why: `current.start (${curr[0]}) ≤ last.end (${last[1]}): overlap confirmed. We take the max of both ends — always extend as far as possible. This greedy choice is optimal because merging can only help, never hurt.` });
      last[1] = newEnd;
    }
  }
  steps.push({ intervals: sorted, merged: [...merged], currentIdx: sorted.length,
    label: `Done — ${merged.length} merged intervals from ${sorted.length} original`,
    sublabel: merged.map(([a,b]) => `[${a},${b}]`).join(", "),
    why: `O(n log n) total: O(n log n) to sort + O(n) to merge. The sort is the bottleneck. The merge pass itself is linear because we scan each interval exactly once.` });
  return steps;
}

function GreedyVis() {
  const steps = buildGreedySteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  const maxVal = 21;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex flex-col gap-2">
        <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1">Timeline (0–{maxVal}):</p>
        {s.intervals.map(([a, b], i) => {
          const isCurrent = i === s.currentIdx, inMerged = s.merged.some(([ma, mb]) => ma <= a && b <= mb);
          const barBg = s.merging && isCurrent ? "bg-orange-500/60" : isCurrent ? "bg-blue-500/60" : inMerged ? "bg-green-500/40" : "bg-[var(--color-bg-subtle)]";
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] w-10 shrink-0">[{a},{b}]</span>
              <div className="relative h-5 flex-1 rounded bg-[var(--color-surface-overlay)]">
                <div className={`absolute h-full rounded transition-all duration-300 ${barBg}`} style={{left:`${(a/maxVal)*100}%`,width:`${((b-a)/maxVal)*100}%`}} />
              </div>
            </div>
          );
        })}
        {s.merged.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-green-400 w-10 shrink-0">result</span>
            <div className="relative h-5 flex-1 rounded bg-[var(--color-surface-overlay)]">
              {s.merged.map(([a, b], i) => <div key={i} className="absolute h-full rounded bg-green-500/50 border border-green-400/50 transition-all duration-300" style={{left:`${(a/maxVal)*100}%`,width:`${((b-a)/maxVal)*100}%`}} />)}
            </div>
          </div>
        )}
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Dynamic Programming 1D ───────────────────────────────────────────────────

interface DP1DStep extends VisStep { dp: number[]; currentIdx: number; }

function buildDP1DSteps(): DP1DStep[] {
  const steps: DP1DStep[] = [];
  const n = 8;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1; dp[1] = 1;
  steps.push({ dp: [...dp], currentIdx: 1,
    label: `Climbing Stairs: how many ways to reach each step?`,
    sublabel: `Base cases: dp[0]=1 (stay), dp[1]=1 (one step)`,
    why: `Naive recursion recalculates the same subproblems exponentially. DP stores each result once (memoization). This turns an O(2ⁿ) recursion into O(n) with O(n) space.` });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    steps.push({ dp: [...dp], currentIdx: i,
      label: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`,
      sublabel: `${dp[i]} distinct ways to reach step ${i}`,
      why: `Recurrence: to stand on step ${i}, you must have come from step ${i-1} (took 1 step) OR step ${i-2} (took 2 steps). These are the ONLY two predecessors. So ways(${i}) = ways(${i-1}) + ways(${i-2}) — the Fibonacci recurrence.` });
  }
  steps.push({ dp: [...dp], currentIdx: n,
    label: `Answer: dp[${n}] = ${dp[n]} ways to climb ${n} stairs`,
    sublabel: `Each cell was computed once, in O(1), using the two cells to its left`,
    why: `This is the hallmark of 1D DP: each cell depends only on a constant number of previous cells. You can even reduce space to O(1) by keeping only the last two values.` });
  return steps;
}

function DP1DVis() {
  const steps = buildDP1DSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4">
        <p className="text-[10px] text-[var(--color-text-tertiary)] mb-2">dp[i] = ways to reach step i:</p>
        <div className="flex flex-wrap gap-1.5">
          {s.dp.map((v, i) => <ArrayCell key={i} value={v === 0 && i > s.currentIdx ? "?" : v} index={i} highlight={i === s.currentIdx ? "primary" : undefined} dimmed={v === 0 && i > s.currentIdx} />)}
        </div>
        {s.currentIdx >= 2 && (
          <div className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            dp[{s.currentIdx}] = dp[{s.currentIdx-1}]<span className="text-blue-400">({s.dp[s.currentIdx-1]})</span> + dp[{s.currentIdx-2}]<span className="text-orange-400">({s.dp[s.currentIdx-2]})</span> = <span className="text-green-400 font-semibold">{s.dp[s.currentIdx]}</span>
          </div>
        )}
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Backtracking ─────────────────────────────────────────────────────────────

interface BTStep extends VisStep { choices: number[]; current: number[]; results: number[][]; depth: number; }

function buildBacktrackingSteps(): BTStep[] {
  const steps: BTStep[] = [];
  const choices = [1, 2, 3];
  const results: number[][] = [];

  function backtrack(current: number[]) {
    if (current.length === choices.length) {
      results.push([...current]);
      steps.push({ choices, current: [...current], results: results.map(r => [...r]), depth: current.length,
        label: `Complete permutation found: [${current.join(",")}]`,
        sublabel: `${results.length} of 6 permutations found`,
        why: `We've filled all ${choices.length} positions. This is a valid permutation. We record it, then return — allowing backtracking to try different values in the last position.` });
      return;
    }
    for (const c of choices) {
      if (current.includes(c)) continue;
      current.push(c);
      steps.push({ choices, current: [...current], results: results.map(r => [...r]), depth: current.length,
        label: `Choose ${c} → path so far: [${current.join(",")}]`,
        sublabel: `Remaining choices: [${choices.filter(x => !current.includes(x)).join(", ")}]`,
        why: `We commit to ${c} at position ${current.length - 1} and recurse deeper. This is the "choose" phase. If this leads to a dead end, we'll undo it in the "unchoose" phase.` });
      backtrack(current);
      const removed = current.pop();
      steps.push({ choices, current: [...current], results: results.map(r => [...r]), depth: current.length,
        label: `Backtrack: undo choice ${removed} → path: [${current.join(",") || "empty"}]`,
        sublabel: `Try next available choice at this level`,
        why: `Undoing the choice is the critical insight of backtracking. Without this step, ${removed} would permanently block other branches. Undoing lets us explore sibling choices at this depth.` });
    }
  }

  steps.push({ choices, current: [], results: [], depth: 0,
    label: `Backtracking: generate all permutations of [${choices.join(",")}]`,
    sublabel: `${choices.length} choices = ${[...Array(choices.length)].map((_,i) => choices.length - i).join(" × ")} = 6 permutations`,
    why: `Backtracking is systematic DFS through a decision tree. At each node, we try all valid choices, recurse, then undo (backtrack) to try siblings. It's guaranteed to find all solutions.` });
  backtrack([]);
  steps.push({ choices, current: [], results: results.map(r => [...r]), depth: 0,
    label: `All ${results.length} permutations found!`,
    sublabel: results.map(r => `[${r.join(",")}]`).join("  "),
    why: `The decision tree had ${results.length} leaves (complete permutations) and was explored completely. Backtracking's power: it prunes branches early when a constraint is already violated, cutting the search space.` });
  return steps;
}

function BacktrackingVis() {
  const steps = buildBacktrackingSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length, 700);
  const s = steps[step]!;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex gap-4">
        <div className="flex-1">
          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-2">Current path:</p>
          <div className="flex gap-1 min-h-[2.5rem] items-center">
            {s.choices.map((_, i) => {
              const val = s.current[i];
              return <div key={i} className={`flex h-9 w-9 items-center justify-center rounded border-2 font-mono text-sm font-semibold transition-all duration-200 ${val !== undefined ? "bg-blue-500/20 border-blue-400 text-blue-300" : "border-dashed border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]"}`}>{val ?? "_"}</div>;
            })}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-2">Found ({s.results.length}/6):</p>
          <div className="flex flex-col gap-1">
            {s.results.map((r, i) => <span key={i} className="font-mono text-[10px] text-green-400">[{r.join(",")}]</span>)}
          </div>
        </div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Trie ─────────────────────────────────────────────────────────────────────

interface TrieStep extends VisStep { insertedWords: string[]; currentWord?: string | undefined; searchResult?: boolean | undefined; }

function TrieVis() {
  const words = ["cat", "car", "card", "care", "bat", "bad"];
  const queries = ["car", "cat", "ca", "dog"];
  const steps: TrieStep[] = [{ insertedWords: [], label: `Trie: prefix tree — each node represents one character`,
    sublabel: `Words with common prefixes share nodes`,
    why: `A hash map stores full strings. A trie decomposes each string into characters and shares the prefix structure. This makes prefix queries O(m) where m = prefix length, regardless of dictionary size.` }];

  for (const w of words) {
    const prevCount = words.slice(0, words.indexOf(w));
    const sharedWith = prevCount.filter(p => p.startsWith(w.slice(0, 2)));
    steps.push({ insertedWords: [...words.slice(0, words.indexOf(w) + 1)], currentWord: w,
      label: `Insert "${w}"`,
      sublabel: sharedWith.length ? `Shares prefix "${w.slice(0, 2)}" with: ${sharedWith.join(", ")}` : `New prefix branch starting with "${w[0]}"`,
      why: sharedWith.length
        ? `"${w}" shares nodes with existing words up to the common prefix. Only the diverging suffix needs new nodes. This is why tries are space-efficient for large dictionaries with shared prefixes.`
        : `New root-level branch. Each character in "${w}" is one node. We mark the last node as a word-end (isEnd=true) so we can distinguish "car" from "card".` });
  }

  for (const q of queries) {
    const found = words.includes(q);
    const prefixMatch = words.some(w => w.startsWith(q));
    steps.push({ insertedWords: [...words], currentWord: q, searchResult: found,
      label: found ? `search("${q}") → true` : prefixMatch ? `search("${q}") → false (it's a prefix, not a complete word)` : `search("${q}") → false (no path found)`,
      sublabel: found ? `Followed ${q.length} nodes: ${q.split("").join(" → ")} → (end)` : prefixMatch ? `Path exists but no word-end marker at "${q}"` : `No node found for one of the characters`,
      why: found
        ? `O(m) where m = word length. We traversed ${q.length} nodes. The critical insight: time complexity is independent of how many words are in the trie.`
        : prefixMatch
        ? `The path exists (other words use this prefix) but this node isn't marked as a word end. Tries distinguish "car" from "ca" with a single boolean flag at each node.`
        : `No node for one of the characters means no word with this prefix exists at all. We fail fast — no need to check any stored words.` });
  }

  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  const groups = new Map<string, Set<string>>();
  for (const w of s.insertedWords) {
    const key = w[0]!;
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key)!.add(w);
  }

  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4">
        <div className="flex gap-6 justify-center">
          {Array.from(groups.entries()).map(([letter, ws]) => (
            <div key={letter} className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-200 ${s.currentWord?.startsWith(letter) ? "bg-blue-500/30 border-blue-400 text-blue-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"}`}>{letter}</div>
              <div className="w-px h-3 bg-[var(--color-border-subtle)]" />
              <div className="flex flex-col gap-1 items-center">
                {Array.from(ws).map(w => {
                  const isSearched = s.currentWord === w;
                  const bg = isSearched && s.searchResult ? "bg-green-500/20 border-green-400 text-green-300" : isSearched ? "bg-orange-500/20 border-orange-400 text-orange-300" : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]";
                  return <div key={w} className={`rounded border px-2 py-0.5 font-mono text-xs transition-all duration-200 ${bg}`}>{w}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-[var(--color-text-tertiary)] text-center">{s.insertedWords.length} words inserted</div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Union Find ───────────────────────────────────────────────────────────────

interface UFStep extends VisStep { parent: number[]; rank: number[]; nodes: [number, number][]; action?: "union" | undefined; }

function buildUnionFindSteps(): UFStep[] {
  const n = 7;
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const nodes: [number, number][] = [[0,1],[0,2],[1,3],[2,4],[5,6]].map((_, i, arr) => arr[i] as [number, number]);

  function find(x: number): number {
    while (parent[x] !== x) { parent[x] = parent[parent[x]!]!; x = parent[x]!; }
    return x;
  }
  function union(x: number, y: number) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return;
    if (rank[rx]! < rank[ry]!) parent[rx] = ry;
    else if (rank[rx]! > rank[ry]!) parent[ry] = rx;
    else { parent[ry] = rx; rank[rx]!++; }
  }

  const steps: UFStep[] = [];
  steps.push({ parent: [...parent], rank: [...rank], nodes,
    label: `Union-Find: start with ${n} singleton components`,
    sublabel: `parent[i] = i means each node is its own root`,
    why: `Initially, ${n} nodes = ${n} separate components. Each union() call merges two components, reducing the count by 1. After k union calls, we have ${n} − k components.` });

  const ops: [number, number][] = [[0,1],[2,3],[4,5],[0,2],[1,6]];
  for (const [a, b] of ops) {
    const ra = find(a), rb = find(b);
    const alreadySame = ra === rb;
    union(a, b);
    const componentCount = new Set(Array.from({length: n}, (_, i) => { let x = i; while (parent[x] !== x) x = parent[x]!; return x; })).size;
    steps.push({ parent: [...parent], rank: [...rank], nodes, action: "union",
      label: alreadySame ? `union(${a}, ${b}) — already in the same component, no change` : `union(${a}, ${b}) — merged their components`,
      sublabel: `parent[] = [${parent.join(", ")}] · ${componentCount} component${componentCount !== 1 ? "s" : ""} remaining`,
      why: alreadySame
        ? `find(${a}) = find(${b}) = ${ra}. Same root means same component. Union is a no-op. This is how Union-Find detects cycles: if two nodes already share a root, adding an edge between them would create a cycle.`
        : `Union by rank: attach the shorter tree under the taller one to keep the tree flat. Path compression (during find) makes future finds faster by pointing nodes directly to the root.` });
  }
  return steps;
}

function UnionFindVis() {
  const steps = buildUnionFindSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  const n = s.parent.length;
  const components: Map<number, number[]> = new Map();
  function getRoot(i: number) { let x = i; while (s.parent[x] !== x) x = s.parent[x]!; return x; }
  for (let i = 0; i < n; i++) { const r = getRoot(i); if (!components.has(r)) components.set(r, []); components.get(r)!.push(i); }
  const rootList = Array.from(components.keys());
  const colors = ["text-blue-300 border-blue-400 bg-blue-500/20","text-orange-300 border-orange-400 bg-orange-500/20","text-green-300 border-green-400 bg-green-500/20","text-purple-300 border-purple-400 bg-purple-500/20"];
  const colorMap = new Map(rootList.map((r, i) => [r, colors[i % colors.length]!]));
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({length: n}).map((_, i) => {
            const root = getRoot(i);
            const colorClass = colorMap.get(root) ?? "text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]";
            return <div key={i} className="flex flex-col items-center gap-0.5"><div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold ${colorClass}`}>{i}</div><span className="text-[10px] text-[var(--color-text-tertiary)]">→{s.parent[i]}</span></div>;
          })}
        </div>
        <div className="text-xs text-[var(--color-text-tertiary)] text-center">Components: {rootList.map(r => `{${components.get(r)!.join(",")}}`).join("  ")}</div>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── DP 2D (LCS) ──────────────────────────────────────────────────────────────

interface DP2DStep extends VisStep { dp: number[][]; row: number; col: number; s1: string; s2: string; }

function buildDP2DSteps(): DP2DStep[] {
  const s1 = "ABCDE", s2 = "ACBE";
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  const steps: DP2DStep[] = [{ dp: dp.map(r => [...r]), row: 0, col: 0, s1, s2,
    label: `LCS of "${s1}" and "${s2}"`,
    sublabel: `dp[i][j] = length of LCS of s1[0..i-1] and s2[0..j-1]`,
    why: `2D DP because the answer depends on TWO independent indices simultaneously (position in s1 AND position in s2). We fill bottom-up, so dp[i][j] always has dp[i-1][j-1], dp[i-1][j], and dp[i][j-1] already computed.` }];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) {
        dp[i]![j] = dp[i-1]![j-1]! + 1;
        steps.push({ dp: dp.map(r => [...r]), row: i, col: j, s1, s2,
          label: `s1[${i-1}]='${s1[i-1]}' = s2[${j-1}]='${s2[j-1]}' → dp[${i}][${j}] = dp[${i-1}][${j-1}]+1 = ${dp[i]![j]}`,
          sublabel: `Characters match — extend the diagonal`,
          why: `When characters match, we MUST use this pair — it's always at least as good as skipping either character. dp[i-1][j-1] is the LCS ignoring both these characters; adding this match extends it by 1.` });
      } else {
        dp[i]![j] = Math.max(dp[i-1]![j]!, dp[i]![j-1]!);
        steps.push({ dp: dp.map(r => [...r]), row: i, col: j, s1, s2,
          label: `s1[${i-1}]='${s1[i-1]}' ≠ s2[${j-1}]='${s2[j-1]}' → dp[${i}][${j}] = max(${dp[i-1]![j]}, ${dp[i]![j-1]!}) = ${dp[i]![j]}`,
          sublabel: `No match — skip one character from either string`,
          why: `Characters differ, so we can't use both. Option A: skip s1[${i-1}] (take dp[${i-1}][${j}]). Option B: skip s2[${j-1}] (take dp[${i}][${j-1}]). We take the max — greedy-within-DP: always keep the best LCS seen so far.` });
      }
    }
  }
  steps.push({ dp: dp.map(r => [...r]), row: m, col: n, s1, s2,
    label: `LCS length = dp[${m}][${n}] = ${dp[m]![n]}`,
    sublabel: `The full table gives O(mn) time and O(mn) space`,
    why: `dp[m][n] considers all of s1 and all of s2 — it's the answer for the full strings. Space can be reduced to O(min(m,n)) since each row only looks at the previous row.` });
  return steps;
}

function DP2DVis() {
  const steps = buildDP2DSteps();
  const { step, playing, play, prev, next, reset } = usePlayer(steps.length);
  const s = steps[step]!;
  const { dp, row, col, s1, s2 } = s;
  return (
    <div>
      <StepLabel label={s.label} sublabel={s.sublabel} why={s.why} />
      <div className="p-4 overflow-x-auto">
        <table className="mx-auto border-collapse text-xs font-mono">
          <thead>
            <tr>
              <td className="w-7 text-center text-[var(--color-text-tertiary)]" />
              <td className="w-7 text-center text-[var(--color-text-tertiary)]">ε</td>
              {s2.split("").map((c, j) => <td key={j} className="w-7 text-center font-semibold text-[var(--color-text-primary)]">{c}</td>)}
            </tr>
          </thead>
          <tbody>
            {dp.map((dpRow, i) => (
              <tr key={i}>
                <td className="w-7 text-center font-semibold text-[var(--color-text-primary)]">{i === 0 ? "ε" : s1[i-1]}</td>
                {dpRow.map((v, j) => {
                  const isCurrent = i === row && j === col;
                  const isFilled = i < row || (i === row && j <= col);
                  const bg = isCurrent ? "bg-blue-500/30 text-blue-300" : "";
                  return <td key={j} className={`w-7 h-7 text-center border border-[var(--color-border-subtle)] transition-all duration-150 ${bg} ${isFilled ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] opacity-30"}`}>{v}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Controls step={step} total={steps.length} playing={playing} onPrev={prev} onNext={next} onPlay={play} onReset={reset} />
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

const SLUG_TO_VIS: Record<string, React.ComponentType> = {
  "two-pointers": TwoPointersVis,
  "sliding-window": SlidingWindowVis,
  "prefix-sums": PrefixSumsVis,
  "binary-search": BinarySearchVis,
  "hash-maps-and-sets": HashMapVis,
  "stacks": StackVis,
  "queues-and-deques": QueueVis,
  "linked-list-patterns": LinkedListVis,
  "tree-dfs": TreeDFSVis,
  "tree-bfs": TreeBFSVis,
  "binary-search-trees": BSTVis,
  "heaps-and-priority-queues": HeapVis,
  "graphs-bfs-dfs": GraphVis,
  "greedy-algorithms": GreedyVis,
  "dynamic-programming-1d": DP1DVis,
  "backtracking": BacktrackingVis,
  "tries": TrieVis,
  "union-find": UnionFindVis,
  "dynamic-programming-2d": DP2DVis,
};

interface AlgorithmVisualizerProps {
  conceptSlug: string;
  title?: string | undefined;
}

export function AlgorithmVisualizer({ conceptSlug, title }: AlgorithmVisualizerProps) {
  const Vis = SLUG_TO_VIS[conceptSlug];
  if (!Vis) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] overflow-hidden">
      <div className="border-b border-[var(--color-border-subtle)] px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">{title ?? "Algorithm Visualizer"}</span>
      </div>
      <Vis />
    </div>
  );
}
