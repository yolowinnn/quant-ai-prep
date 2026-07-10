import type { Problem } from "../types";

export const programming: Problem[] = [
  {
    id: "reservoir-sampling",
    track: "programming",
    title: "Reservoir Sampling",
    difficulty: "core",
    tags: ["sampling", "streaming"],
    source: "Classic",
    prompt:
      "A stream of unknown length passes by once; you cannot store it. Select one element uniformly at random. Generalize to picking $k$ elements.",
    solution:
      "**k = 1.** Keep the current pick. When the $i$-th element arrives, replace the pick with probability $1/i$.\n\nBy induction the pick is uniform: after $n$ items, element $i$ survives iff it was chosen at step $i$ (prob $1/i$) and never replaced by later items:\n$$\\frac1i\\cdot\\prod_{j=i+1}^n\\Big(1 - \\frac1j\\Big) = \\frac1i\\cdot\\prod_{j=i+1}^n\\frac{j-1}{j} = \\frac1i\\cdot\\frac{i}{n} = \\frac1n.$$\n\n**General $k$ (Algorithm R):** fill a reservoir with the first $k$ items. For the $i$-th item ($i>k$), pick a random $j\\in[1,i]$; if $j\\le k$, replace reservoir slot $j$ with the new item. Each element ends up in the reservoir with probability $k/n$.\n\n```python\nimport random\ndef reservoir(stream, k):\n    res = []\n    for i, x in enumerate(stream):\n        if i < k:\n            res.append(x)\n        else:\n            j = random.randint(0, i)\n            if j < k:\n                res[j] = x\n    return res\n```\n\nOne pass, $O(1)$ extra memory per slot, no need to know $n$ in advance.",
    keyInsight:
      "Accept item i with prob k/i; the telescoping product guarantees uniformity in a single pass with O(k) memory.",
  },
  {
    id: "kadane-max-subarray",
    track: "programming",
    title: "Maximum Subarray (Kadane)",
    difficulty: "warmup",
    tags: ["dynamic programming", "arrays"],
    source: "Classic",
    prompt:
      "Given an array of integers (possibly negative), find the maximum sum of any contiguous subarray in $O(n)$ time.",
    solution:
      "Let $\\text{best}(i)$ be the max subarray sum **ending at** index $i$. Either extend the previous best or start fresh at $i$:\n$$\\text{best}(i) = \\max\\big(a_i,\\ \\text{best}(i-1) + a_i\\big).$$\nThe answer is $\\max_i \\text{best}(i)$.\n\n```python\ndef max_subarray(a):\n    best = cur = a[0]\n    for x in a[1:]:\n        cur = max(x, cur + x)   # extend or restart\n        best = max(best, cur)\n    return best\n```\n\n$O(n)$ time, $O(1)$ space. The DP insight: a running prefix is worth keeping only while its sum is positive; the moment it drops below the current element, discard it and restart.",
    keyInsight:
      "Carry a running sum; reset it whenever extending would hurt more than starting over.",
  },
  {
    id: "floyd-cycle",
    track: "programming",
    title: "Cycle Detection (Floyd's Tortoise & Hare)",
    difficulty: "core",
    tags: ["linked list", "two pointers"],
    source: "Classic",
    prompt:
      "Detect whether a linked list has a cycle using $O(1)$ extra space, and find the node where the cycle begins.",
    solution:
      "Run a slow pointer (1 step) and fast pointer (2 steps). If there is a cycle they eventually meet inside it; if the fast pointer hits `null`, there's no cycle.\n\n**Finding the entry.** Let the tail before the loop have length $\\mu$ and the loop length $\\lambda$. When they meet, slow has traveled $d$, fast $2d$, and the difference $d$ is a multiple of $\\lambda$. Resetting one pointer to the head and advancing both one step at a time, they meet exactly at the loop entry after $\\mu$ steps.\n\n```python\ndef detect_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast:            # meeting point\n            slow = head\n            while slow is not fast:  # walk to entry\n                slow, fast = slow.next, fast.next\n            return slow\n    return None\n```\n\n$O(n)$ time, $O(1)$ space — no hash set needed.",
    keyInsight:
      "Two speeds guarantee a meeting inside any cycle; the head-reset trick locates the entry via the μ = distance-to-loop identity.",
  },
  {
    id: "quickselect-median",
    track: "programming",
    title: "Quickselect: k-th Smallest in O(n)",
    difficulty: "core",
    tags: ["divide and conquer", "selection"],
    source: "Classic",
    prompt:
      "Find the $k$-th smallest element of an unsorted array in expected linear time without fully sorting.",
    solution:
      "**Quickselect** is quicksort that only recurses into the side containing the target rank. Partition around a pivot; the pivot lands at its final sorted position $p$. If $p=k$ you're done; if $k<p$ recurse left, else recurse right.\n\n```python\nimport random\ndef quickselect(a, k):          # k is 0-indexed rank\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        p = partition(a, lo, hi, random.randint(lo, hi))\n        if p == k: return a[p]\n        elif p < k: lo = p + 1\n        else:       hi = p - 1\n\ndef partition(a, lo, hi, pi):\n    a[pi], a[hi] = a[hi], a[pi]\n    pivot, store = a[hi], lo\n    for i in range(lo, hi):\n        if a[i] < pivot:\n            a[i], a[store] = a[store], a[i]; store += 1\n    a[store], a[hi] = a[hi], a[store]\n    return store\n```\n\n**Complexity:** expected $O(n)$ — the work halves on average, $n + n/2 + n/4 + \\dots = 2n$. Worst case $O(n^2)$ with bad pivots, avoided by random pivots (or median-of-medians for a guaranteed $O(n)$).",
    keyInsight:
      "Recurse into only the side holding rank k; the geometric series n+n/2+… gives expected O(n).",
  },
  {
    id: "biased-to-fair-coin",
    track: "programming",
    title: "Fair Coin from a Biased One",
    difficulty: "core",
    tags: ["simulation", "randomness"],
    source: "von Neumann",
    prompt:
      "You have a coin with unknown bias $p\\in(0,1)$. Generate a perfectly fair (50/50) bit. Then: how would you generate a fair coin the other way — a biased coin from a fair one, e.g. probability $1/3$?",
    solution:
      "**Fair from biased (von Neumann).** Flip the biased coin **twice**:\n- $HT$ occurs with probability $p(1-p)$,\n- $TH$ occurs with probability $(1-p)p$ — identical!\n\nOutput $H$ on $HT$, $T$ on $TH$, and **reject** (reflip) on $HH$ or $TT$. The two accepted outcomes are equally likely regardless of $p$, so the output is fair. Expected flips per fair bit: $1/[2p(1-p)]$.\n\n```python\ndef fair_bit(flip):        # flip() -> biased H/T\n    while True:\n        a, b = flip(), flip()\n        if a != b: return a\n```\n\n**Biased from fair (probability 1/3).** Generate fair bits to form a binary fraction and compare to $1/3$; simplest: read 2 fair bits as a number in $\\{00,01,10,11\\}$. Map $00\\to$ 'success', $01,10\\to$ 'fail', and **reject** $11$ (reflip) — that gives $P(\\text{success})=1/3$. In general, to hit probability $a/b$, draw $\\lceil\\log_2 b\\rceil$ bits, accept the value if $<a$, retry if $\\ge b$.",
    keyInsight:
      "Pair flips: HT vs TH are equiprobable for any bias — reject ties. Rejection sampling converts between any two distributions.",
  },
  {
    id: "lru-cache",
    track: "programming",
    title: "Design an LRU Cache",
    difficulty: "core",
    tags: ["data structures", "hash map", "doubly linked list"],
    source: "Classic",
    prompt:
      "Design a cache with $O(1)$ `get` and `put` that evicts the least-recently-used entry when it exceeds capacity.",
    solution:
      "Combine a **hash map** (key → node) with a **doubly linked list** ordered by recency (most-recent at the head, LRU at the tail).\n\n- `get(key)`: look up the node in the map, move it to the head, return its value.\n- `put(key,val)`: if present, update and move to head; else insert at head. If over capacity, remove the tail node and delete its key from the map.\n\nBoth operations touch only $O(1)$ nodes. The linked list gives $O(1)$ splice/remove; the map gives $O(1)$ lookup.\n\n```python\nfrom collections import OrderedDict\nclass LRUCache:\n    def __init__(self, cap):\n        self.cap, self.d = cap, OrderedDict()\n    def get(self, k):\n        if k not in self.d: return -1\n        self.d.move_to_end(k)          # mark most-recent\n        return self.d[k]\n    def put(self, k, v):\n        if k in self.d: self.d.move_to_end(k)\n        self.d[k] = v\n        if len(self.d) > self.cap:\n            self.d.popitem(last=False)  # evict LRU\n```\n\n(`OrderedDict` is a map + linked list under the hood — exactly the intended structure.)",
    keyInsight:
      "Hash map for O(1) lookup + doubly-linked list for O(1) recency reordering; the tail is always the eviction victim.",
  },
  {
    id: "sample-uniform-from-stream-weighted",
    track: "programming",
    title: "Rejection vs Inverse-CDF Sampling",
    difficulty: "hard",
    tags: ["sampling", "Monte Carlo"],
    source: "Classic",
    prompt:
      "You have a uniform RNG on $[0,1]$. How do you sample from an exponential distribution? How do you sample from an arbitrary discrete distribution in $O(1)$?",
    solution:
      "**Continuous — inverse CDF.** If $U\\sim\\text{Unif}(0,1)$ and $F$ is a CDF, then $X = F^{-1}(U)$ has distribution $F$ (since $P(F^{-1}(U)\\le x) = P(U\\le F(x)) = F(x)$). For exponential rate $\\lambda$, $F(x) = 1 - e^{-\\lambda x}$, so\n$$X = -\\frac{1}{\\lambda}\\ln(1 - U) \\;\\stackrel{d}{=}\\; -\\frac{1}{\\lambda}\\ln U.$$\n\n**Discrete in $O(1)$ — the Alias method.** Naively, inverse-CDF over $n$ outcomes costs $O(\\log n)$ per draw (binary search on cumulative probs). The **alias method** preprocesses the distribution in $O(n)$ into $n$ 'buckets', each holding at most two outcomes with a threshold. To sample: pick a bucket uniformly ($O(1)$), then flip a biased coin against its threshold to choose between the two outcomes — $O(1)$ per draw. Ideal when you sample the same distribution millions of times (e.g. Monte Carlo).",
    keyInsight:
      "Inverse-CDF (X=F⁻¹(U)) samples any 1-D law; the alias method makes repeated discrete sampling O(1) after O(n) setup.",
  },
  {
    id: "fibonacci-matrix",
    track: "programming",
    title: "Fibonacci in O(log n)",
    difficulty: "hard",
    tags: ["matrix exponentiation", "recurrence"],
    source: "Classic",
    prompt:
      "Compute the $n$-th Fibonacci number in $O(\\log n)$ arithmetic operations.",
    solution:
      "Write the recurrence in matrix form:\n$$\\begin{pmatrix} F_{n+1} \\\\ F_n\\end{pmatrix} = \\begin{pmatrix} 1 & 1\\\\ 1 & 0\\end{pmatrix}\\begin{pmatrix} F_n \\\\ F_{n-1}\\end{pmatrix}\\;\\Rightarrow\\; \\begin{pmatrix} F_{n+1} & F_n\\\\ F_n & F_{n-1}\\end{pmatrix} = \\begin{pmatrix} 1 & 1\\\\ 1 & 0\\end{pmatrix}^{\\!n}.$$\n\nRaising the matrix to the $n$-th power by **fast exponentiation** (repeated squaring) takes $O(\\log n)$ matrix multiplies:\n\n```python\ndef fib(n):\n    def mul(A, B):\n        return (A[0]*B[0]+A[1]*B[2], A[0]*B[1]+A[1]*B[3],\n                A[2]*B[0]+A[3]*B[2], A[2]*B[1]+A[3]*B[3])\n    result, base = (1,0,0,1), (1,1,1,0)   # identity, M\n    while n:\n        if n & 1: result = mul(result, base)\n        base = mul(base, base); n >>= 1\n    return result[1]                       # F_n\n```\n\nExponentiation by squaring turns $M^n$ into $O(\\log n)$ products via the binary expansion of $n$.",
    keyInsight:
      "Linear recurrences are matrix powers; repeated squaring evaluates Mⁿ in O(log n) multiplies.",
  },
  {
    id: "merge-k-sorted",
    track: "programming",
    title: "Merge k Sorted Lists",
    difficulty: "core",
    tags: ["heap", "merging"],
    source: "Classic",
    prompt:
      "Merge $k$ sorted lists with $N$ total elements into one sorted list efficiently.",
    solution:
      "Use a **min-heap** of size $k$ holding the current front of each list. Repeatedly pop the smallest and push the next element from that element's list.\n\n```python\nimport heapq\ndef merge_k(lists):\n    h = [(l[0], i, 0) for i, l in enumerate(lists) if l]\n    heapq.heapify(h)\n    out = []\n    while h:\n        val, i, j = heapq.heappop(h)\n        out.append(val)\n        if j + 1 < len(lists[i]):\n            heapq.heappush(h, (lists[i][j+1], i, j+1))\n    return out\n```\n\n**Complexity:** each of the $N$ elements is pushed/popped once, and heap ops cost $O(\\log k)$, so total $O(N\\log k)$ — better than $O(Nk)$ for naive repeated-min and better than concatenating-then-sorting $O(N\\log N)$ when $k\\ll N$. This is the merge step behind external sorting of data too large for memory.",
    keyInsight:
      "A size-k heap of list heads yields O(N log k) — the standard external-merge pattern.",
  },
];
