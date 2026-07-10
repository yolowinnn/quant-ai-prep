import type { Problem } from "../types";

export const brainteasers: Problem[] = [
  {
    id: "screwy-pirates",
    track: "brainteasers",
    title: "Screwy Pirates (Splitting 100 Coins)",
    difficulty: "core",
    tags: ["game theory", "backward induction"],
    source: "A Practical Guide to Quantitative Finance Interviews (Zhou)",
    prompt:
      "Five rational, greedy pirates $P_1,\\dots,P_5$ ranked by seniority ($P_5$ most senior) must split 100 gold coins. The most senior pirate proposes an allocation; **all** pirates (including the proposer) vote. If **at least half** approve, the split stands; otherwise the proposer is thrown overboard and the next-most-senior proposes. Each pirate prioritizes, in order: (1) staying alive, (2) maximizing coins, (3) throwing others overboard. What should $P_5$ propose?",
    solution:
      "Solve by **backward induction**, from the smallest sub-game up.\n\n- **2 pirates ($P_1,P_2$):** $P_2$ proposes and votes for himself. One vote out of two is $\\ge 50\\%$, so he takes everything: $(P_1,P_2)=(0,100)$.\n- **3 pirates:** $P_3$ needs one more vote. $P_1$ gets $0$ in the 2-pirate game, so bribing him with $1$ coin buys his vote: $(1,0,99)$.\n- **4 pirates:** $P_4$ needs one extra vote (2 of 4). In the 3-pirate game $P_2$ gets $0$, so give $P_2$ one coin: $(0,1,0,99)$.\n- **5 pirates:** $P_5$ needs two extra votes (3 of 5). Bribe the two pirates who get $0$ in the 4-pirate game, namely $P_1$ and $P_3$, with one coin each: $(1,0,1,0,98)$.\n\n**Answer:** $P_5$ proposes $\\boxed{(P_1,P_2,P_3,P_4,P_5) = (1,0,1,0,98)}$ and it passes with the votes of $P_1,P_3,P_5$.",
    keyInsight:
      "Bribe exactly the pirates who would get nothing in the next sub-game — never the proposer's rivals.",
  },
  {
    id: "burning-ropes",
    track: "brainteasers",
    title: "Two Burning Ropes → 45 Minutes",
    difficulty: "warmup",
    tags: ["invariant", "construction"],
    source: "Classic",
    prompt:
      "You have two ropes and a lighter. Each rope takes exactly 60 minutes to burn end-to-end, but burns **non-uniformly** (half the rope may not take 30 minutes). Measure exactly **45 minutes**.",
    solution:
      "The trick: lighting a rope at **both ends** always consumes it in 30 minutes, regardless of density, because the two flames together traverse the whole rope.\n\n1. At $t=0$: light rope A at **both** ends and rope B at **one** end.\n2. Rope A finishes at $t=30$ (both-ends burn). At that instant rope B has 30 minutes of length left.\n3. At $t=30$, light rope B's **other** end too. The remaining 30-minute length now burns from both ends, finishing in 15 minutes.\n4. Rope B finishes at $t=30+15 = 45$. ✅",
    keyInsight:
      "Burning from both ends halves the remaining time — the density irregularity cancels out.",
  },
  {
    id: "defective-ball-12",
    track: "brainteasers",
    title: "12 Balls, One Defective, 3 Weighings",
    difficulty: "hard",
    tags: ["information theory", "search"],
    source: "Classic",
    prompt:
      "You have 12 identical-looking balls; exactly one is defective (either heavier **or** lighter — you don't know which). Using a balance scale **three** times, identify the defective ball **and** whether it is heavy or light.",
    solution:
      "There are $12\\times 2 = 24$ possible outcomes (which ball, heavy/light). Three weighings give $3^3=27$ distinguishable results, so it is information-theoretically possible.\n\nLabel balls $1$–$12$.\n\n**Weighing 1:** $\\{1,2,3,4\\}$ vs $\\{5,6,7,8\\}$.\n\n- **Balanced** ⇒ defective is in $\\{9,10,11,12\\}$.\n  - **W2:** $\\{9,10,11\\}$ vs $\\{1,2,3\\}$ (known-good).\n    - Balanced ⇒ ball 12 is defective; **W3:** $12$ vs $1$ tells heavy/light.\n    - Tips ⇒ we know the group is (say) heavy or light; **W3:** $9$ vs $10$ isolates which of $9,10,11$ and the known direction gives heavy/light.\n- **Left heavy** (or symmetric) ⇒ defective is a heavy ball in $\\{1,2,3,4\\}$ or a light ball in $\\{5,6,7,8\\}$.\n  - **W2:** $\\{1,2,5\\}$ vs $\\{3,4,6\\}$.\n    - Balanced ⇒ defective is $7$ or $8$ (light); **W3:** $7$ vs $8$.\n    - Left heavy ⇒ either $1$/$2$ heavy or $6$ light; **W3:** $1$ vs $2$ resolves ($6$ light if balanced).\n    - Right heavy ⇒ either $3$/$4$ heavy or $5$ light; **W3:** $3$ vs $4$ resolves.\n\nEvery branch pins down the ball and its direction in three weighings.",
    keyInsight:
      "Each weighing has 3 outcomes, so 3 weighings resolve up to 27 states — design splits that keep every branch ≤ 3^(remaining).",
  },
  {
    id: "25-horses",
    track: "brainteasers",
    title: "25 Horses, 5 Tracks, Top 3",
    difficulty: "core",
    tags: ["sorting", "tournament"],
    source: "Classic (Google/quant)",
    prompt:
      "You have 25 horses and a track that races exactly 5 at a time, giving only the finishing order (no timer). Find the **top 3** fastest horses in the fewest races.",
    solution:
      "**Answer: 7 races.**\n\n1. **Races 1–5:** Split into 5 groups of 5; race each. Label the ranked results so horse $A_1$ won group A, $B_2$ came 2nd in group B, etc.\n2. **Race 6:** Race the five group winners $A_1,B_1,C_1,D_1,E_1$. Say the order is $A_1>B_1>C_1>D_1>E_1$. Then:\n   - $A_1$ is the overall fastest. ✅\n   - $D_1,E_1$ and their whole groups are eliminated (each is behind ≥3 faster horses).\n   - $C_1$ could be 3rd but nothing behind it can be top-3, so only $C_1$ survives from group C.\n   - From B, only $B_1,B_2$ can reach top-3; from A, only $A_2,A_3$.\n3. **Race 7:** Race the 5 candidates $A_2,A_3,B_1,B_2,C_1$. The top **two** here are the overall 2nd and 3rd (since $A_1$ already took 1st).\n\nTotal $=5+1+1=7$.",
    keyInsight:
      "After finding the winner, only horses within 2 positions of a faster-verified horse can still place — that prunes 25 down to 5.",
  },
  {
    id: "poison-wine",
    track: "brainteasers",
    title: "1000 Bottles, 1 Poisoned, 10 Testers",
    difficulty: "core",
    tags: ["binary encoding", "information theory"],
    source: "Classic",
    prompt:
      "You have 1000 bottles of wine; exactly one is poisoned. A tiny sip kills a tester after 24 hours. You have 24 hours before a banquet. What is the minimum number of testers needed to guarantee identifying the poisoned bottle?",
    solution:
      "**Answer: 10 testers.**\n\nSince $2^{10}=1024 \\ge 1000$, encode each bottle's index in **binary** with 10 bits. Assign tester $k$ ($k=0,\\dots,9$) to sip from **every bottle whose $k$-th bit is 1**.\n\nAfter 24 hours, read which testers died. Their death pattern is exactly the binary representation of the poisoned bottle's index: tester $k$ dead ⇔ bit $k = 1$. Decode to recover the unique bottle.\n\nWith $n$ testers you can distinguish $2^n$ bottles, so $\\lceil \\log_2 1000\\rceil = 10$ is both sufficient and necessary.",
    keyInsight:
      "Each tester is one bit of information; n testers resolve 2^n outcomes in a single parallel round.",
  },
  {
    id: "bridge-crossing",
    track: "brainteasers",
    title: "Bridge & Torch (4 People, 17 Minutes)",
    difficulty: "core",
    tags: ["greedy", "optimization"],
    source: "Classic",
    prompt:
      "Four people must cross a rickety bridge at night. They have one torch; at most two can cross at a time, and any crossing goes at the slower person's pace. Their times are 1, 2, 5, and 10 minutes. Minimize total crossing time.",
    solution:
      "**Answer: 17 minutes.** The key insight: get the two slowest (5 and 10) across **together** so their times overlap, using the fastest person as a torch-runner.\n\n| Step | Crossing | Time | Total |\n|---|---|---|---|\n| 1 | 1 & 2 cross → | 2 | 2 |\n| 2 | 1 returns ← | 1 | 3 |\n| 3 | 5 & 10 cross → | 10 | 13 |\n| 4 | 2 returns ← | 2 | 15 |\n| 5 | 1 & 2 cross → | 2 | 17 |\n\nThe naive strategy of shuttling with person 1 gives $10+1+5+1+2 = 19$. Pairing the two slow people saves the extra slow return trip.",
    keyInsight:
      "Send the two slowest together; use your two fastest as the shuttle so a slow person never returns.",
  },
  {
    id: "two-egg-drop",
    track: "brainteasers",
    title: "Two Eggs, 100 Floors",
    difficulty: "hard",
    tags: ["dynamic programming", "minimax"],
    source: "Classic",
    prompt:
      "A building has 100 floors. There is a critical floor $f$ such that an egg dropped from floor $f$ or above breaks, and from below $f$ survives. With only **two** eggs, find the minimum number of drops that **guarantees** identifying $f$ in the worst case.",
    solution:
      "**Answer: 14 drops.**\n\nIf the first egg's initial drop is floor $d$, and it breaks, you must linearly test floors $1..d-1$ with the second egg — that's $d-1$ more drops. To keep the worst case constant at $D$, each successive first-egg jump must shrink by one:\n\n$$d + (d-1) + (d-2) + \\dots + 1 \\ge 100.$$\n\nSo $\\frac{d(d+1)}{2}\\ge 100 \\Rightarrow d\\ge 14$ (since $\\frac{13\\cdot14}{2}=91<100\\le \\frac{14\\cdot15}{2}=105$).\n\nDrop the first egg from floors $14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100$. Whichever interval it breaks in, the second egg scans that block linearly, and the total never exceeds **14**.",
    keyInsight:
      "Balance the two failure modes: make the first-egg jump shrink by 1 each time so every path costs the same worst-case D, giving D(D+1)/2 ≥ n.",
  },
  {
    id: "ants-triangle",
    track: "brainteasers",
    title: "Ants on a Triangle",
    difficulty: "warmup",
    tags: ["probability", "symmetry"],
    source: "Classic",
    prompt:
      "Three ants sit on the three corners of a triangle. Each independently picks one of the two edges from its corner uniformly at random and starts walking. What is the probability that **no two ants collide**?",
    solution:
      "No collision happens only if **all three ants walk in the same rotational direction** — all clockwise, or all counterclockwise. Any other configuration forces at least one pair onto the same edge.\n\nEach ant independently chooses one of 2 directions, so there are $2^3=8$ equally likely outcomes. Exactly $2$ of them are collision-free (all-CW, all-CCW).\n\n$$P(\\text{no collision}) = \\frac{2}{8} = \\frac{1}{4}.$$\n\nThe same reasoning on an $n$-gon gives $2/2^n = 2^{1-n}$.",
    keyInsight:
      "Collision-free ⇔ globally consistent rotation; only 2 of 2^n direction assignments qualify.",
  },
  {
    id: "trailing-zeros-100",
    track: "brainteasers",
    title: "Trailing Zeros of 100!",
    difficulty: "warmup",
    tags: ["number theory", "counting"],
    source: "Classic",
    prompt:
      "How many trailing zeros does $100!$ (100 factorial) have?",
    solution:
      "A trailing zero comes from a factor of $10 = 2\\times 5$. Factors of 2 are far more plentiful than 5s, so the count of trailing zeros equals the number of times **5** divides $100!$. By **Legendre's formula**:\n\n$$\\left\\lfloor \\frac{100}{5}\\right\\rfloor + \\left\\lfloor \\frac{100}{25}\\right\\rfloor + \\left\\lfloor \\frac{100}{125}\\right\\rfloor = 20 + 4 + 0 = 24.$$\n\n**Answer: 24.** (The 4 comes from 25, 50, 75, 100 each contributing a *second* factor of 5.)",
    keyInsight:
      "Trailing zeros = exponent of 5 in n! = Σ⌊n/5^k⌋; 2s are never the bottleneck.",
  },
  {
    id: "100-prisoners-hats",
    track: "brainteasers",
    title: "Prisoners & Hats (Parity Strategy)",
    difficulty: "hard",
    tags: ["parity", "information"],
    source: "Classic",
    prompt:
      "100 prisoners stand in a line, each wearing a black or white hat. Each sees all hats **in front** of them but not their own or those behind. Starting from the back, each must guess their own hat color out loud (everyone hears). They may agree on a strategy beforehand. Maximize the number **guaranteed** saved.",
    solution:
      "**Answer: 99 guaranteed** (the last prisoner is a coin flip).\n\nStrategy: the rear prisoner (who sees all 99 ahead) announces the **parity** of black hats he sees — say 'black' if he counts an odd number of black hats, else 'white'. He may die (50/50), sacrificing himself to broadcast one bit.\n\nNow every other prisoner can deduce their own hat. Prisoner $k$ knows:\n- the initial announced parity,\n- the colors already **called out** behind him (all correct),\n- the hats he **sees** in front.\n\nThe parity of black hats among the still-unknown set (himself + those ahead) is fixed. Subtracting the black hats he sees ahead and the corrections behind, he recovers his own hat's color exactly. All 99 in front are saved with certainty.",
    keyInsight:
      "One prisoner spends himself to broadcast a global parity bit; everyone else subtracts what they see and hear to recover their own color.",
  },
  {
    id: "clock-overlaps",
    track: "brainteasers",
    title: "How Often Do Clock Hands Overlap?",
    difficulty: "warmup",
    tags: ["rates", "counting"],
    source: "Classic",
    prompt:
      "In a 12-hour period, how many times do the hour hand and minute hand of an analog clock exactly overlap?",
    solution:
      "The minute hand laps the hour hand. Relative angular speed: minute hand does $360°/\\text{hr}\\times 12 = ...$ — more simply, the minute hand completes 12 laps in 12 hours while the hour hand completes 1, so the minute hand **gains** $12-1 = 11$ full laps on the hour hand.\n\nEach relative lap produces exactly one overlap, so there are **11 overlaps in 12 hours** (occurring every $12/11 \\approx 65.45$ minutes, starting at 12:00).\n\nOver **24 hours** that is $\\boxed{22}$ overlaps.",
    keyInsight:
      "Overlaps per 12h = (laps of fast hand) − (laps of slow hand) = 12 − 1 = 11.",
  },
  {
    id: "mislabeled-jars",
    track: "brainteasers",
    title: "Three Mislabeled Jars",
    difficulty: "warmup",
    tags: ["logic", "invariant"],
    source: "Classic",
    prompt:
      "Three jars are labeled 'Apples', 'Oranges', and 'Apples & Oranges'. **Every** label is wrong. By drawing fruit from just **one** jar (without looking inside), correctly relabel all three.",
    solution:
      "Draw from the jar labeled **'Apples & Oranges'**. Since its label is wrong, it is *not* mixed — it is pure. Say you draw an apple; then this jar is **Apples**.\n\nNow the jar labeled 'Oranges' cannot be Oranges (wrong) and cannot be Apples (already assigned), so it must be **Apples & Oranges**. The remaining jar labeled 'Apples' is therefore **Oranges**.\n\nThe single draw from the *mixed* label is decisive because it's the only jar guaranteed to be pure.",
    keyInsight:
      "The 'all wrong' constraint makes the mixed-labeled jar the unique fully-determined starting point.",
  },
];
