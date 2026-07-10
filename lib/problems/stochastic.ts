import type { Problem } from "../types";

export const stochastic: Problem[] = [
  {
    id: "bm-basics",
    track: "stochastic",
    title: "Brownian Motion: Moments & Covariance",
    difficulty: "warmup",
    tags: ["Brownian motion", "covariance"],
    source: "A Practical Guide to Quantitative Finance Interviews (Zhou)",
    prompt:
      "Let $W_t$ be a standard Brownian motion. State and justify $E[W_t]$, $\\operatorname{Var}(W_t)$, and $\\operatorname{Cov}(W_s, W_t)$.",
    solution:
      "By definition $W_0=0$, increments are independent and stationary, and $W_t - W_s \\sim \\mathcal N(0, t-s)$ for $s<t$, with continuous paths.\n\n- $E[W_t] = 0$ (each increment is mean zero).\n- $\\operatorname{Var}(W_t) = t$ (variance accumulates linearly).\n- For $s<t$, write $W_t = W_s + (W_t - W_s)$ with the increment independent of $W_s$:\n$$\\operatorname{Cov}(W_s,W_t) = \\operatorname{Cov}(W_s, W_s) + \\operatorname{Cov}(W_s, W_t - W_s) = s + 0 = s.$$\n\nIn general $\\operatorname{Cov}(W_s, W_t) = \\min(s,t)$.",
    keyInsight:
      "Independent increments ⇒ Cov(W_s,W_t) = min(s,t); variance grows linearly in time.",
  },
  {
    id: "itos-lemma-gbm",
    track: "stochastic",
    title: "Itô's Lemma on Geometric Brownian Motion",
    difficulty: "core",
    tags: ["Ito's lemma", "GBM", "lognormal"],
    source: "Classic",
    prompt:
      "Stock price follows $dS_t = \\mu S_t\\,dt + \\sigma S_t\\,dW_t$. Solve for $S_t$ and compute $E[S_t]$.",
    solution:
      "Apply Itô's lemma to $f(S)=\\ln S$. With $f'=1/S$, $f''=-1/S^2$:\n$$d(\\ln S_t) = \\frac{1}{S_t}dS_t - \\frac{1}{2S_t^2}(dS_t)^2.$$\n\nSince $(dS_t)^2 = \\sigma^2 S_t^2\\,dt$:\n$$d(\\ln S_t) = \\Big(\\mu - \\tfrac12\\sigma^2\\Big)dt + \\sigma\\,dW_t.$$\n\nIntegrating from 0 to $t$ and exponentiating:\n$$S_t = S_0\\exp\\!\\Big(\\big(\\mu - \\tfrac12\\sigma^2\\big)t + \\sigma W_t\\Big).$$\n\nSo $\\ln S_t$ is normal ⇒ $S_t$ is **lognormal**. Using $E[e^{\\sigma W_t}] = e^{\\sigma^2 t/2}$:\n$$E[S_t] = S_0 e^{\\mu t}.$$\n\nNote the $-\\tfrac12\\sigma^2$ drift correction (the Itô term) is exactly cancelled inside the expectation — the *median* grows at $\\mu-\\tfrac12\\sigma^2$ but the *mean* grows at $\\mu$.",
    keyInsight:
      "log-transform turns GBM into a Brownian motion with drift μ−½σ²; the ½σ² is the Itô correction.",
  },
  {
    id: "e-wt4",
    track: "stochastic",
    title: "Compute E[W_t⁴]",
    difficulty: "core",
    tags: ["moments", "Gaussian"],
    source: "Classic",
    prompt: "For standard Brownian motion $W_t$, compute $E[W_t^4]$.",
    solution:
      "$W_t\\sim\\mathcal N(0,t)$. For a mean-zero normal with variance $\\sigma^2$, the fourth moment is $3\\sigma^4$ (from the Gaussian moment formula $E[Z^{2n}] = (2n-1)!!\\,\\sigma^{2n}$, and $3!!=3$).\n\nWith $\\sigma^2 = t$:\n$$E[W_t^4] = 3t^2.$$\n\n**Itô cross-check:** apply Itô to $W_t^4$: $d(W_t^4) = 4W_t^3 dW_t + 6W_t^2\\,dt$. Taking expectations kills the martingale term, giving $\\frac{d}{dt}E[W_t^4] = 6E[W_t^2] = 6t$, so $E[W_t^4]=3t^2$. ✓",
    keyInsight:
      "Gaussian even moments: E[W_t^{2n}] = (2n−1)!!·t^n, so E[W_t⁴]=3t².",
  },
  {
    id: "quadratic-variation",
    track: "stochastic",
    title: "Quadratic Variation of Brownian Motion",
    difficulty: "hard",
    tags: ["quadratic variation", "dW²=dt"],
    source: "Classic",
    prompt:
      "Show that the quadratic variation of Brownian motion over $[0,t]$ equals $t$, i.e. justify the heuristic $(dW)^2 = dt$.",
    solution:
      "Partition $[0,t]$ into $n$ equal steps $\\Delta t = t/n$ with increments $\\Delta W_i \\sim \\mathcal N(0,\\Delta t)$, independent. Define $Q_n = \\sum_{i=1}^n (\\Delta W_i)^2$.\n\n**Mean:** $E[Q_n] = \\sum_i E[(\\Delta W_i)^2] = n\\,\\Delta t = t.$\n\n**Variance:** $\\operatorname{Var}((\\Delta W_i)^2) = E[(\\Delta W_i)^4] - (\\Delta t)^2 = 3(\\Delta t)^2 - (\\Delta t)^2 = 2(\\Delta t)^2.$ By independence,\n$$\\operatorname{Var}(Q_n) = n\\cdot 2(\\Delta t)^2 = 2t\\,\\Delta t = \\frac{2t^2}{n} \\xrightarrow{n\\to\\infty} 0.$$\n\nSo $Q_n \\to t$ in $L^2$ (and in probability). The variance vanishing is why $(dW)^2$ behaves like the *deterministic* quantity $dt$, unlike ordinary calculus where $(dx)^2$ is negligible.",
    keyInsight:
      "Σ(ΔW)² has mean t and variance → 0, so it converges to the constant t — the rigorous meaning of dW²=dt.",
  },
  {
    id: "wt2-minus-t-martingale",
    track: "stochastic",
    title: "Is W_t² − t a Martingale?",
    difficulty: "core",
    tags: ["martingale", "conditional expectation"],
    source: "Classic",
    prompt:
      "Determine whether $M_t = W_t^2 - t$ is a martingale with respect to the Brownian filtration.",
    solution:
      "Check $E[M_t \\mid \\mathcal F_s] = M_s$ for $s<t$. Write $W_t = W_s + (W_t - W_s)$ with the increment independent of $\\mathcal F_s$ and mean 0, variance $t-s$:\n$$E[W_t^2\\mid \\mathcal F_s] = W_s^2 + 2W_s\\underbrace{E[W_t-W_s]}_{0} + \\underbrace{E[(W_t-W_s)^2]}_{t-s} = W_s^2 + (t-s).$$\n\nTherefore\n$$E[W_t^2 - t\\mid \\mathcal F_s] = W_s^2 + (t-s) - t = W_s^2 - s = M_s.$$\n\n**Yes**, $W_t^2 - t$ is a martingale. (Equivalently, $d(W_t^2 - t) = 2W_t\\,dW_t$ has no drift term.)",
    keyInsight:
      "Subtracting the quadratic-variation term t removes the drift, turning W_t² into a martingale.",
  },
  {
    id: "ou-process",
    track: "stochastic",
    title: "Ornstein–Uhlenbeck Process",
    difficulty: "hard",
    tags: ["mean reversion", "SDE", "integrating factor"],
    source: "Classic",
    prompt:
      "Solve the mean-reverting SDE $dX_t = \\theta(\\mu - X_t)\\,dt + \\sigma\\,dW_t$ and give the stationary distribution.",
    solution:
      "Use the integrating factor $e^{\\theta t}$. Consider $d(e^{\\theta t}X_t)$:\n$$d(e^{\\theta t}X_t) = \\theta e^{\\theta t}X_t\\,dt + e^{\\theta t}dX_t = \\theta\\mu e^{\\theta t}\\,dt + \\sigma e^{\\theta t}dW_t.$$\n\nIntegrate from 0 to $t$:\n$$X_t = X_0 e^{-\\theta t} + \\mu(1-e^{-\\theta t}) + \\sigma\\int_0^t e^{-\\theta(t-s)}\\,dW_s.$$\n\nThe stochastic integral is Gaussian (Itô isometry) with mean 0 and variance\n$$\\sigma^2\\int_0^t e^{-2\\theta(t-s)}\\,ds = \\frac{\\sigma^2}{2\\theta}\\big(1-e^{-2\\theta t}\\big).$$\n\nAs $t\\to\\infty$ the process forgets $X_0$ and settles to the **stationary law**\n$$X_\\infty \\sim \\mathcal N\\!\\Big(\\mu, \\frac{\\sigma^2}{2\\theta}\\Big).$$\n\nOU is the continuous-time analog of an AR(1) — the workhorse model for interest rates (Vasicek) and spreads.",
    keyInsight:
      "Integrating factor e^{θt} linearizes the SDE; the process is Gaussian and mean-reverts to N(μ, σ²/2θ).",
  },
  {
    id: "reflection-principle",
    track: "stochastic",
    title: "Reflection Principle & Running Maximum",
    difficulty: "elite",
    tags: ["reflection principle", "hitting time"],
    source: "Classic",
    prompt:
      "Let $M_t = \\max_{0\\le s\\le t} W_s$ be the running maximum of Brownian motion. Show $P(M_t \\ge a) = 2P(W_t \\ge a)$ for $a>0$, and give the density of $M_t$.",
    solution:
      "**Reflection principle.** Let $\\tau_a = \\inf\\{s: W_s = a\\}$ be the first hitting time of level $a$. If $M_t \\ge a$ then $\\tau_a \\le t$. After hitting $a$, Brownian motion is symmetric: the reflected path $\\tilde W_s = 2a - W_s$ (for $s>\\tau_a$) is equally likely. Reflection pairs each path ending above $a$ with one ending below, so\n$$P(M_t\\ge a) = P(M_t \\ge a,\\, W_t \\ge a) + P(M_t\\ge a,\\, W_t < a) = 2P(W_t\\ge a),$$\nsince $\\{W_t \\ge a\\}\\subseteq\\{M_t \\ge a\\}$ and the two events on the right are equal by reflection.\n\nThus $P(M_t \\ge a) = 2\\,P(W_t\\ge a) = 2\\big(1-\\Phi(a/\\sqrt t)\\big)$, meaning $M_t \\stackrel{d}{=} |W_t|$. Differentiating,\n$$f_{M_t}(a) = \\frac{2}{\\sqrt{2\\pi t}}\\,e^{-a^2/(2t)},\\quad a\\ge 0.$$",
    keyInsight:
      "Reflecting the path after it hits a shows M_t has the same law as |W_t| — the basis for barrier-option pricing.",
  },
  {
    id: "ito-isometry",
    track: "stochastic",
    title: "Itô Isometry",
    difficulty: "core",
    tags: ["Ito integral", "variance"],
    source: "Classic",
    prompt:
      "State the Itô isometry and use it to compute $\\operatorname{Var}\\!\\big(\\int_0^T W_s\\,dW_s\\big)$... and while you're at it, evaluate $\\int_0^T W_s\\,dW_s$ in closed form.",
    solution:
      "**Itô isometry:** for a suitable adapted integrand $H$,\n$$E\\Big[\\Big(\\int_0^T H_s\\,dW_s\\Big)^2\\Big] = E\\Big[\\int_0^T H_s^2\\,ds\\Big].$$\n\n**Closed form.** Apply Itô to $W_t^2$: $d(W_t^2) = 2W_t\\,dW_t + dt$, so\n$$\\int_0^T W_s\\,dW_s = \\tfrac12 W_T^2 - \\tfrac12 T.$$\n(Note the $-\\tfrac12 T$ — ordinary calculus would give just $\\tfrac12 W_T^2$; the correction is the Itô term.)\n\n**Variance.** With $H_s = W_s$ the isometry gives $E[(\\int_0^T W_s dW_s)^2] = \\int_0^T E[W_s^2]\\,ds = \\int_0^T s\\,ds = \\tfrac{T^2}{2}$. The integral has mean 0, so $\\operatorname{Var} = \\tfrac{T^2}{2}$.",
    keyInsight:
      "Itô isometry converts the variance of a stochastic integral into an ordinary time integral of E[H²].",
  },
  {
    id: "correlated-bms",
    track: "stochastic",
    title: "Building Correlated Brownian Motions",
    difficulty: "core",
    tags: ["correlation", "Cholesky"],
    source: "Classic",
    prompt:
      "Given two independent Brownian motions $W^1, W^2$, construct a Brownian motion $B$ that has correlation $\\rho$ with $W^1$. Generalize to simulating a correlated vector.",
    solution:
      "Set\n$$B_t = \\rho\\,W^1_t + \\sqrt{1-\\rho^2}\\,W^2_t.$$\n\nThen $B$ is a Brownian motion: it is a linear combination of independent BMs, so Gaussian with $E[B_t]=0$ and\n$$\\operatorname{Var}(B_t) = \\rho^2 t + (1-\\rho^2)t = t.$$\nIts correlation with $W^1$:\n$$\\operatorname{Corr}(dB, dW^1) = \\frac{E[dB\\,dW^1]}{dt} = \\rho\\,\\frac{E[(dW^1)^2]}{dt} = \\rho.$$\n\n**Vector case:** to simulate $d\\mathbf W$ with correlation matrix $\\Sigma$, take the **Cholesky** factor $\\Sigma = LL^\\top$ and set $d\\mathbf W = L\\,d\\mathbf Z$ where $d\\mathbf Z$ are independent. This is the standard recipe for multi-asset Monte Carlo.",
    keyInsight:
      "ρ·W¹ + √(1−ρ²)·W² injects exactly correlation ρ; Cholesky generalizes it to any correlation matrix.",
  },
];
