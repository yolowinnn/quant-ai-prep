import type { Problem } from "../types";

export const probability: Problem[] = [
  {
    id: "two-children-boy",
    track: "probability",
    title: "Boy or Girl (Conditioning Traps)",
    difficulty: "warmup",
    tags: ["conditional probability", "Bayes"],
    source: "Classic",
    prompt:
      "A family has two children. **(a)** Given that at least one is a boy, what is the probability both are boys? **(b)** Given that the *elder* is a boy, what is the probability both are boys?",
    solution:
      "The equally likely sample space (birth order matters) is $\\{BB, BG, GB, GG\\}$.\n\n**(a)** 'At least one boy' rules out $GG$, leaving $\\{BB,BG,GB\\}$. Only $BB$ has two boys:\n$$P(BB\\mid \\text{≥1 boy}) = \\frac{1}{3}.$$\n\n**(b)** 'Elder is a boy' leaves $\\{BB, BG\\}$ (elder first). Only $BB$ qualifies:\n$$P(BB \\mid \\text{elder boy}) = \\frac{1}{2}.$$\n\nThe difference is the classic trap: naming a *specific* child (the elder) carries more information than the mere existence of a boy.",
    keyInsight:
      "Conditioning on 'at least one' vs a specific labeled child gives 1/3 vs 1/2 — always write out the sample space.",
  },
  {
    id: "monty-hall",
    track: "probability",
    title: "Monty Hall",
    difficulty: "warmup",
    tags: ["conditional probability", "Bayes"],
    source: "Classic",
    prompt:
      "Three doors hide one car and two goats. You pick a door. The host — who knows the layout — opens a *different* door revealing a goat, then offers you the chance to switch. Should you switch?",
    solution:
      "**Yes — switching wins with probability $2/3$.**\n\nYour initial pick is correct with probability $1/3$; the car is behind one of the other two doors with probability $2/3$. The host's action never opens the car and never opens your door, so all of that $2/3$ collapses onto the single remaining unopened door.\n\nFormally, condition on the car location. If you initially chose a goat (prob $2/3$), the host is *forced* to reveal the other goat, so switching lands on the car. If you initially chose the car (prob $1/3$), switching loses. Hence $P(\\text{win}\\mid \\text{switch}) = 2/3$.\n\nThe host's knowledge is essential — if he opened a door at random (sometimes revealing the car), the surviving-game probability would be $1/2$.",
    keyInsight:
      "The host injects information by never opening the car; switching inherits the full 2/3 that wasn't your door.",
  },
  {
    id: "expected-tosses-hh-ht",
    track: "probability",
    title: "Expected Tosses for HH vs HT",
    difficulty: "core",
    tags: ["expectation", "Markov chain", "patterns"],
    source: "A Practical Guide to Quantitative Finance Interviews (Zhou)",
    prompt:
      "Flip a fair coin repeatedly. What is the expected number of flips to first see the pattern **HH**? And to first see **HT**? Why are they different?",
    solution:
      "Set up states by the useful suffix already matched and solve first-step equations.\n\n**HT.** Let $E$ = expected flips from scratch.\n- First flip: T (prob ½) → back to start, or H (prob ½) → state 'H'.\n- From 'H': T (½) → done, H (½) → stay in 'H'.\n\nLet $a=E[\\text{from H}]$. Then $a = 1 + \\tfrac12(0) + \\tfrac12 a \\Rightarrow a = 2$. And $E = 1 + \\tfrac12 E + \\tfrac12 a$. Solving: $E = 1 + \\tfrac12 E + 1 \\Rightarrow \\tfrac12 E = 2 \\Rightarrow E = 4$.\n\n**HH.** Let $b=E[\\text{from H}]$. From 'H': H (½) → done, T (½) → restart. So $b = 1 + \\tfrac12(0) + \\tfrac12 E$. And $E = 1 + \\tfrac12 E + \\tfrac12 b$. Substituting $b$: $E = 1 + \\tfrac12 E + \\tfrac12(1 + \\tfrac12 E) = \\tfrac32 + \\tfrac34 E \\Rightarrow \\tfrac14 E = \\tfrac32 \\Rightarrow E = 6$.\n\n**HH takes 6, HT takes 4.** For HT, a stray H is never wasted — it becomes the start of a new HT. For HH, a T after an H throws you all the way back, so 'near misses' cost more. (Slick check via the Conway leading-number / ABRACADABRA martingale: $E[\\text{HH}] = 2^2 + 2^1 = 6$ because HH overlaps itself; $E[\\text{HT}] = 2^2 = 4$ because HT has no self-overlap.)",
    keyInsight:
      "Self-overlapping patterns (HH) take longer than non-overlapping ones (HT): overlap = wasted near-misses.",
  },
  {
    id: "broken-stick-triangle",
    track: "probability",
    title: "Broken Stick Forms a Triangle",
    difficulty: "core",
    tags: ["geometric probability", "uniform"],
    source: "Classic",
    prompt:
      "A stick of length 1 is broken at two points chosen independently and uniformly at random. What is the probability the three pieces can form a triangle?",
    solution:
      "Let the two break points be $X,Y\\sim \\text{Unif}(0,1)$, independent. The pieces form a triangle iff every piece is shorter than $\\tfrac12$ (each length less than the sum of the other two).\n\nWork in the unit square $(X,Y)$. Suppose $X<Y$; pieces are $X,\\; Y-X,\\; 1-Y$. The triangle inequalities become:\n$$X<\\tfrac12,\\quad Y-X<\\tfrac12,\\quad 1-Y<\\tfrac12\\ (\\text{i.e. } Y>\\tfrac12).$$\n\nThis region is a triangle with vertices $(0,\\tfrac12),(\\tfrac12,\\tfrac12),(\\tfrac12,1)$ of area $\\tfrac18$. By symmetry the case $Y<X$ contributes another $\\tfrac18$.\n\n$$P = \\tfrac18 + \\tfrac18 = \\frac14.$$",
    keyInsight:
      "Triangle ⇔ no piece exceeds ½; map to the unit square and measure the favorable region.",
  },
  {
    id: "coupon-collector",
    track: "probability",
    title: "Coupon Collector",
    difficulty: "core",
    tags: ["expectation", "geometric", "harmonic"],
    source: "Classic",
    prompt:
      "Each cereal box contains one of $n$ distinct coupons, uniformly at random. What is the expected number of boxes to collect **all** $n$ coupons?",
    solution:
      "Decompose by 'stages'. After you already hold $k-1$ distinct coupons, each new box is a *new* coupon with probability $\\frac{n-(k-1)}{n}$. The number of boxes to get the $k$-th new coupon is **Geometric** with that success probability, so its mean is $\\frac{n}{n-k+1}$.\n\nSumming over $k=1,\\dots,n$ (linearity of expectation):\n$$E[T] = \\sum_{k=1}^{n}\\frac{n}{n-k+1} = n\\sum_{j=1}^{n}\\frac1j = n H_n \\approx n(\\ln n + \\gamma).$$\n\nFor $n=6$ (a die), $E[T] = 6H_6 = 14.7$.",
    keyInsight:
      "Break into geometric stages; the last few coupons dominate, giving the n·ln n growth.",
  },
  {
    id: "gamblers-ruin",
    track: "probability",
    title: "Gambler's Ruin",
    difficulty: "core",
    tags: ["random walk", "difference equations"],
    source: "Classic",
    prompt:
      "You start with $\\$i$ and bet $\\$1$ on each fair coin flip, winning or losing $\\$1$. You stop at $\\$0$ (ruin) or $\\$N$ (goal). What is the probability of reaching $N$ before $0$? What if each bet wins with probability $p\\ne \\tfrac12$?",
    solution:
      "Let $P_i$ be the probability of hitting $N$ before $0$ from wealth $i$, with $P_0=0,\\ P_N=1$.\n\n**Fair case ($p=\\tfrac12$):** $P_i = \\tfrac12 P_{i-1} + \\tfrac12 P_{i+1}$, so $P_i$ is linear in $i$. With the boundary conditions:\n$$P_i = \\frac{i}{N}.$$\n\n**Biased case:** with $q=1-p$ and $r=q/p$, the recurrence $P_i = pP_{i+1}+qP_{i-1}$ has solution\n$$P_i = \\frac{1-r^{\\,i}}{1-r^{\\,N}}.$$\n\nAgainst the house ($p<\\tfrac12$, so $r>1$) and large $N$, $P_i \\approx 1 - r^{-(N-i)}\\to$ small — ruin is nearly certain. This is why a small edge compounds decisively over many bets.",
    keyInsight:
      "Fair walk ⇒ hitting probability is linear (i/N); a bias turns it into a geometric ratio that crushes the underdog.",
  },
  {
    id: "expected-fixed-points",
    track: "probability",
    title: "Expected Number of Fixed Points",
    difficulty: "core",
    tags: ["linearity", "indicators", "derangements"],
    source: "Classic",
    prompt:
      "$n$ people throw their hats into a pile; the hats are then handed back uniformly at random (a random permutation). What is the expected number of people who get their **own** hat back? What is the probability **nobody** does?",
    solution:
      "**Expectation.** Let $X_i=1$ if person $i$ gets their own hat. Then $P(X_i=1)=\\frac1n$, and by linearity:\n$$E\\Big[\\sum_i X_i\\Big] = \\sum_i \\frac1n = 1,$$\nregardless of $n$. (Note the $X_i$ are *not* independent, but linearity doesn't care.)\n\n**Nobody matches (derangement).** By inclusion–exclusion,\n$$P(\\text{no fixed point}) = \\sum_{k=0}^n \\frac{(-1)^k}{k!} \\xrightarrow{n\\to\\infty} e^{-1} \\approx 0.368.$$\n\nSo the count of fixed points is approximately Poisson(1): mean 1, and $P(0)\\approx 1/e$.",
    keyInsight:
      "Linearity of expectation gives E = 1 with zero dependence on n; the whole count is ≈ Poisson(1).",
  },
  {
    id: "abracadabra-martingale",
    track: "probability",
    title: "ABRACADABRA (Martingale Method)",
    difficulty: "elite",
    tags: ["martingale", "optional stopping", "patterns"],
    source: "Li & Williams / Green Book",
    prompt:
      "A monkey types letters uniformly at random from a 26-letter alphabet. What is the expected number of keystrokes until the string **ABRACADABRA** first appears?",
    solution:
      "Use the **gambler / martingale** trick. Before each keystroke a new gambler arrives and bets \\$1 that the pattern starts *now*, then parlays winnings letter-by-letter at fair $26{:}1$ odds, cashing out the instant a bet loses.\n\nBecause every bet is fair, the total casino balance is a martingale. At the stopping time $T$ (pattern completes), the expected total paid in equals the expected total paid out.\n\n- Total wagered $= E[T]$ (one gambler per keystroke, \\$1 each).\n- Total held by *still-alive* gamblers when ABRACADABRA completes: a gambler is alive iff a suffix of the typed string equals a prefix of the pattern that also matches. The self-overlaps of ABRACADABRA are the whole word (length 11), and the prefixes **ABRA** (length 4) and **A** (length 1). Each surviving gambler holds $26^{\\ell}$ for overlap length $\\ell$.\n\n$$E[T] = 26^{11} + 26^{4} + 26^{1}.$$\n\nThe overlap structure (not just the length) determines the waiting time — that's the whole point.",
    keyInsight:
      "Expected wait for a pattern = Σ 26^(overlap length) over its self-overlaps; a fair-betting martingale proves it.",
  },
  {
    id: "birthday-problem",
    track: "probability",
    title: "Birthday Problem",
    difficulty: "warmup",
    tags: ["complement", "approximation"],
    source: "Classic",
    prompt:
      "In a room of $k$ people, what is the probability that at least two share a birthday (365 equally likely days)? Roughly how many people make it more likely than not?",
    solution:
      "Use the complement. The probability **all distinct** is\n$$P(\\text{all distinct}) = \\prod_{i=0}^{k-1}\\frac{365-i}{365} = \\frac{365!}{(365-k)!\\,365^k}.$$\n\nSo $P(\\text{match}) = 1 - $ that. A clean approximation: since $1-x\\approx e^{-x}$,\n$$P(\\text{all distinct}) \\approx \\exp\\!\\Big(-\\frac{k(k-1)}{2\\cdot 365}\\Big).$$\n\nSetting this to $\\tfrac12$ gives $k(k-1)\\approx 2\\cdot 365\\cdot \\ln 2 \\approx 506$, so $k\\approx 23$. Indeed at $k=23$, $P(\\text{match})\\approx 0.507$.",
    keyInsight:
      "There are C(k,2) pairs, so the ~√n scaling means just 23 people cross 50% — always compute via the complement.",
  },
  {
    id: "sum-uniforms-exceed-1",
    track: "probability",
    title: "Uniforms Until the Sum Exceeds 1",
    difficulty: "hard",
    tags: ["expectation", "uniform", "e"],
    source: "Classic",
    prompt:
      "Draw i.i.d. $U_1,U_2,\\dots \\sim \\text{Unif}(0,1)$ and stop as soon as the running sum exceeds 1. Let $N$ be the number of draws. Find $E[N]$.",
    solution:
      "Let $p_n = P(N > n) = P(U_1+\\dots+U_n \\le 1)$. The volume of the simplex $\\{x_i\\ge 0,\\ \\sum x_i \\le 1\\}$ in $n$ dimensions is $\\frac{1}{n!}$, so\n$$P(U_1+\\dots+U_n \\le 1) = \\frac{1}{n!}.$$\n\nUsing the tail-sum formula $E[N] = \\sum_{n\\ge 0} P(N>n)$:\n$$E[N] = \\sum_{n=0}^{\\infty} \\frac{1}{n!} = e \\approx 2.718.$$\n\nA memorable result: on average it takes $e$ uniform draws to break 1.",
    keyInsight:
      "P(sum of n uniforms ≤ 1) = 1/n! (simplex volume); the tail-sum telescopes to e.",
  },
  {
    id: "gaussian-max-expectation",
    track: "probability",
    title: "Expected Max of Two Correlated Normals",
    difficulty: "hard",
    tags: ["Gaussian", "order statistics"],
    source: "Quant interview",
    prompt:
      "Let $X,Y$ be standard normal with correlation $\\rho$. Find $E[\\max(X,Y)]$.",
    solution:
      "Use the identity $\\max(X,Y) = \\frac{X+Y}{2} + \\frac{|X-Y|}{2}$.\n\nTaking expectations, $E\\big[\\tfrac{X+Y}{2}\\big]=0$, so we need $\\tfrac12 E|X-Y|$.\n\nNow $X-Y$ is normal with mean 0 and variance $\\operatorname{Var}(X)+\\operatorname{Var}(Y)-2\\rho = 2-2\\rho = 2(1-\\rho)$. For a mean-zero normal with standard deviation $\\sigma$, $E|Z| = \\sigma\\sqrt{2/\\pi}$. Here $\\sigma = \\sqrt{2(1-\\rho)}$, so\n$$E|X-Y| = \\sqrt{2(1-\\rho)}\\cdot\\sqrt{\\tfrac2\\pi} = 2\\sqrt{\\tfrac{1-\\rho}{\\pi}}.$$\n\nTherefore\n$$E[\\max(X,Y)] = \\sqrt{\\frac{1-\\rho}{\\pi}}.$$\n\nSanity checks: $\\rho=1\\Rightarrow 0$ (identical variables), and $\\rho=0\\Rightarrow \\frac{1}{\\sqrt\\pi}\\approx 0.564$.",
    keyInsight:
      "max(X,Y) = average + half the absolute gap; reduce E[max] to E|X−Y| via the folded-normal mean σ√(2/π).",
  },
  {
    id: "st-petersburg",
    track: "probability",
    title: "St. Petersburg Paradox",
    difficulty: "core",
    tags: ["expectation", "utility", "divergence"],
    source: "Classic",
    prompt:
      "A fair coin is flipped until the first head. If the first head is on flip $k$, you win $\\$2^k$. What is the fair price to play? Why won't anyone pay it?",
    solution:
      "The expected payout is\n$$E[\\text{win}] = \\sum_{k=1}^{\\infty} \\underbrace{2^{-k}}_{P(\\text{head on }k)}\\cdot 2^{k} = \\sum_{k=1}^{\\infty} 1 = \\infty.$$\n\nSo the 'fair' price is infinite — yet nobody pays more than a few dollars. The resolution: expected *money* is the wrong objective when payoffs have tiny probabilities of astronomical size.\n\nUnder **log utility** (Bernoulli's resolution), the value is\n$$\\sum_{k=1}^\\infty 2^{-k}\\ln(2^k) = \\ln 2\\sum_k k\\,2^{-k} = 2\\ln 2,$$\nfinite and modest. Real players are risk-averse and any real bank has finite reserves, both of which cap the value. It's the canonical warning that expectation alone can mislead.",
    keyInsight:
      "Infinite EV, finite worth — bounded utility (or a finite counterparty) tames the divergent tail.",
  },
];
