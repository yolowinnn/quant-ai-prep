import type { Problem } from "../types";

export const pricing: Problem[] = [
  {
    id: "put-call-parity",
    track: "pricing",
    title: "Put–Call Parity",
    difficulty: "warmup",
    tags: ["arbitrage", "replication"],
    source: "Hull / Green Book",
    prompt:
      "Derive the relationship between a European call and put with the same strike $K$ and maturity $T$ on a non-dividend stock. What arbitrage enforces it?",
    solution:
      "Consider two portfolios:\n- **A:** one call + cash $Ke^{-rT}$ (invested at the risk-free rate).\n- **B:** one put + one share of stock.\n\nAt maturity both are worth $\\max(S_T, K)$:\n- If $S_T > K$: A = $(S_T-K)+K = S_T$; B = $0 + S_T = S_T$.\n- If $S_T \\le K$: A = $0 + K = K$; B = $(K - S_T) + S_T = K$.\n\nSince they have identical payoffs in every state, they must cost the same today (else arbitrage):\n$$C + Ke^{-rT} = P + S_0.$$\n\nThis is **model-free** — it holds regardless of the price process, relying only on no-arbitrage. A violation lets you buy the cheap side and sell the dear side for a locked-in profit.",
    keyInsight:
      "C + Ke^{−rT} = P + S₀ is model-free — pure replication, no distributional assumption.",
  },
  {
    id: "black-scholes-call",
    track: "pricing",
    title: "The Black–Scholes Call Formula",
    difficulty: "core",
    tags: ["Black-Scholes", "risk-neutral"],
    source: "Black-Scholes-Merton",
    prompt:
      "State the Black–Scholes price of a European call and explain each term. What is the meaning of $N(d_1)$ and $N(d_2)$?",
    solution:
      "Under the risk-neutral measure $S_t$ is GBM with drift $r$. The European call price is\n$$C = S_0 N(d_1) - Ke^{-rT}N(d_2),$$\n$$d_1 = \\frac{\\ln(S_0/K) + (r + \\tfrac12\\sigma^2)T}{\\sigma\\sqrt T},\\qquad d_2 = d_1 - \\sigma\\sqrt T.$$\n\n**Interpretation.**\n- $N(d_2) = $ risk-neutral probability the option finishes in the money, $P^{\\mathbb Q}(S_T > K)$.\n- $S_0 N(d_1) = $ present value of receiving $S_T$ conditional on exercise (the expected stock received). $N(d_1)$ is also the option's **delta**.\n- $Ke^{-rT}N(d_2) = $ present value of paying the strike, weighted by exercise probability.\n\nThe price is the discounted risk-neutral expectation $e^{-rT}E^{\\mathbb Q}[(S_T-K)^+]$, evaluated with the lognormal density.",
    keyInsight:
      "N(d₂) = risk-neutral P(exercise); S₀N(d₁) = PV of the stock leg and also delta.",
  },
  {
    id: "risk-neutral-pricing",
    track: "pricing",
    title: "Why Risk-Neutral Pricing Works",
    difficulty: "hard",
    tags: ["risk-neutral measure", "replication", "no-arbitrage"],
    source: "Classic",
    prompt:
      "In the Black–Scholes world the real-world drift $\\mu$ of the stock does not appear in the option price — only $r$ does. Explain why.",
    solution:
      "Because the option can be **dynamically replicated** by a self-financing portfolio of stock and cash. Set up $\\Pi = V - \\Delta S$ (long option, short $\\Delta$ shares). Choosing $\\Delta = \\partial V/\\partial S$ cancels the $dW$ term via Itô:\n$$d\\Pi = \\Big(\\frac{\\partial V}{\\partial t} + \\tfrac12\\sigma^2 S^2\\frac{\\partial^2 V}{\\partial S^2}\\Big)dt.$$\n\nThe portfolio is now **riskless**, so by no-arbitrage it must earn $r$: $d\\Pi = r\\Pi\\,dt$. Equating gives the Black–Scholes PDE\n$$\\frac{\\partial V}{\\partial t} + rS\\frac{\\partial V}{\\partial S} + \\tfrac12\\sigma^2 S^2\\frac{\\partial^2 V}{\\partial S^2} - rV = 0,$$\nin which $\\mu$ is absent. Intuitively, hedging removes exposure to the stock's direction, so the *expected return* $\\mu$ is irrelevant — only volatility $\\sigma$ (which governs hedging error) and the funding rate $r$ matter. Equivalently, by Feynman–Kac the solution is $e^{-rT}E^{\\mathbb Q}[\\text{payoff}]$ where $\\mathbb Q$ replaces $\\mu$ with $r$.",
    keyInsight:
      "Delta-hedging removes directional risk, so the drift μ drops out; only σ and r survive.",
  },
  {
    id: "the-greeks",
    track: "pricing",
    title: "The Greeks",
    difficulty: "core",
    tags: ["delta", "gamma", "vega", "theta"],
    source: "Hull",
    prompt:
      "Define delta, gamma, vega, theta, and rho for an option. What is the sign of each for a long European call, and what does gamma tell a hedger?",
    solution:
      "Each Greek is a sensitivity of the option value $V$:\n\n| Greek | Definition | Long call sign |\n|---|---|---|\n| Delta $\\Delta$ | $\\partial V/\\partial S$ | $+$ ($0$ to $1$) |\n| Gamma $\\Gamma$ | $\\partial^2 V/\\partial S^2$ | $+$ |\n| Vega $\\nu$ | $\\partial V/\\partial \\sigma$ | $+$ |\n| Theta $\\Theta$ | $\\partial V/\\partial t$ | $-$ (time decay) |\n| Rho $\\rho$ | $\\partial V/\\partial r$ | $+$ |\n\n**Gamma** measures how fast delta changes, i.e. the convexity. A delta-hedged book is only *instantaneously* neutral; gamma tells you how often you must re-hedge. Long gamma benefits from large moves in either direction (you buy low / sell high while rebalancing) but pays for it via negative theta — the option's time decay is the 'rent' on that convexity. The relation $\\Theta + \\tfrac12\\sigma^2 S^2\\Gamma + rS\\Delta = rV$ ties theta and gamma together.",
    keyInsight:
      "Gamma is the convexity you pay for with theta; a delta hedge only holds to first order.",
  },
  {
    id: "american-call-no-dividend",
    track: "pricing",
    title: "Never Exercise an American Call Early",
    difficulty: "hard",
    tags: ["American options", "early exercise"],
    source: "Merton",
    prompt:
      "Prove that it is never optimal to exercise an American call on a **non-dividend-paying** stock before expiry. Why does the argument fail for puts?",
    solution:
      "Compare early exercise now (value $S_t - K$) with holding. For a European call on a non-dividend stock,\n$$C \\ge S_t - Ke^{-rT} \\ge S_t - K$$\n(the first inequality from put–call parity with $P\\ge 0$, the second since $Ke^{-rT}\\le K$). An American call is worth at least the European, so its live value $\\ge S_t - K$ = its exercise value. Exercising throws away (a) the time value of the strike ($K$ vs $Ke^{-rT}$) and (b) the insurance if the stock later drops below $K$. Better to **sell** the option than exercise.\n\n**Puts differ:** exercising a put gives you $K$ *now*, which can be invested to earn interest — an American put on a non-dividend stock *can* be optimal to exercise early (deep in the money), so it is worth strictly more than its European counterpart. Dividends also change the call story: a large dividend can make early call exercise optimal just before the ex-date.",
    keyInsight:
      "Holding a call keeps the strike's time value and the downside insurance; only dividends can override this. Puts lack the symmetric argument.",
  },
  {
    id: "forward-price",
    track: "pricing",
    title: "Forward Price by No-Arbitrage",
    difficulty: "warmup",
    tags: ["forwards", "cost of carry"],
    source: "Classic",
    prompt:
      "Derive the fair forward price $F$ for delivery of a non-dividend stock at time $T$. What if the stock pays a continuous dividend yield $q$?",
    solution:
      "**Replication:** to deliver one share at $T$, buy it now for $S_0$ funded by borrowing at rate $r$. At $T$ you owe $S_0 e^{rT}$ and hold the share, so the fair forward is\n$$F = S_0 e^{rT}.$$\nIf $F$ were higher, short the forward and buy-and-carry the stock for riskless profit; if lower, reverse. This is **cost of carry**, independent of any view on $S_T$.\n\n**Dividend yield $q$:** dividends received while carrying reduce the net funding cost, so\n$$F = S_0 e^{(r-q)T}.$$\nFor a known discrete dividend with present value $D$, instead $F = (S_0 - D)e^{rT}$.",
    keyInsight:
      "Forward = spot compounded at the net carry (r−q); pure buy-and-hold arbitrage, no probabilities.",
  },
  {
    id: "implied-vol-smile",
    track: "pricing",
    title: "Implied Volatility & the Smile",
    difficulty: "core",
    tags: ["implied volatility", "smile", "model risk"],
    source: "Classic",
    prompt:
      "What is implied volatility? Black–Scholes assumes a single constant $\\sigma$, yet market implied vols vary by strike (the 'smile'/'skew'). What does that tell you?",
    solution:
      "**Implied volatility** is the value of $\\sigma$ that, plugged into Black–Scholes, reproduces the option's *market* price. Since $C$ is strictly increasing in $\\sigma$ (vega $>0$), the inverse is unique and well-defined — it's a quoting convention, a 'wrong number in the wrong formula that gives the right price.'\n\nIf the Black–Scholes model were literally true, implied vol would be identical across all strikes. In reality it is **not**: equity index options show a **skew** (higher implied vol for low strikes / OTM puts), FX shows a symmetric **smile**. This reveals that the true return distribution has **fatter tails and negative skew** than lognormal — crashes are more likely and more severe than the model assumes. Traders exploit the smile as a compact summary of the market's implied distribution, and price exotics with models (local/stochastic vol) that fit the whole surface.",
    keyInsight:
      "A non-flat implied-vol surface is the market pricing in fat tails and skew that lognormal BS ignores.",
  },
  {
    id: "binomial-tree",
    track: "pricing",
    title: "One-Step Binomial Pricing",
    difficulty: "core",
    tags: ["binomial model", "risk-neutral", "replication"],
    source: "Cox-Ross-Rubinstein",
    prompt:
      "A stock is $S_0$ today; over one period it goes up to $uS_0$ or down to $dS_0$ ($d<e^{r\\Delta t}<u$). Price a derivative paying $f_u$ or $f_d$. Derive the risk-neutral probability.",
    solution:
      "Replicate the payoff with $\\Delta$ shares and $B$ cash. Match both states:\n$$\\Delta uS_0 + Be^{r\\Delta t} = f_u,\\qquad \\Delta dS_0 + Be^{r\\Delta t} = f_d.$$\nSubtracting, $\\Delta = \\dfrac{f_u - f_d}{(u-d)S_0}$. The derivative's price is the cost of the replicating portfolio $\\Delta S_0 + B$, which rearranges to\n$$f_0 = e^{-r\\Delta t}\\big[q f_u + (1-q) f_d\\big],\\qquad q = \\frac{e^{r\\Delta t} - d}{u - d}.$$\n\nHere $q$ is the **risk-neutral probability**: the unique weight making the *discounted* stock a martingale, $e^{-r\\Delta t}(quS_0 + (1-q)dS_0) = S_0$. The real-world up-probability never enters — same lesson as Black–Scholes. Chaining many small steps and taking $\\Delta t\\to 0$ recovers the BS formula (CRR).",
    keyInsight:
      "Price = discounted risk-neutral expectation with q = (e^{rΔt}−d)/(u−d); real probabilities are irrelevant to the hedger.",
  },
  {
    id: "digital-option",
    track: "pricing",
    title: "Digital Option & the Vega Trap",
    difficulty: "hard",
    tags: ["digital option", "greeks", "hedging"],
    source: "Quant interview",
    prompt:
      "A cash-or-nothing digital call pays \\$1 if $S_T > K$, else \\$0. Price it under Black–Scholes and explain why it is hard to hedge near expiry.",
    solution:
      "The payoff is $\\mathbf 1\\{S_T > K\\}$, so its price is the discounted risk-neutral probability of finishing in the money:\n$$D = e^{-rT}\\,P^{\\mathbb Q}(S_T > K) = e^{-rT}N(d_2).$$\n\nEquivalently a digital is the limit of a tight call spread $\\frac{C(K) - C(K+\\epsilon)}{\\epsilon} \\to -\\partial C/\\partial K$, giving $e^{-rT}N(d_2)$ directly.\n\n**Hedging difficulty:** near expiry with $S\\approx K$, the payoff approaches a step function. Delta $=\\partial D/\\partial S$ blows up (spikes toward $+\\infty$ as $T\\to 0$), so a tiny move in $S$ demands an enormous rebalance — the position has unbounded gamma right at the strike. Desks manage this by **over-hedging with a call spread** (a slightly wider payoff that is smooth), accepting a small pricing cushion in exchange for a bounded, tradeable delta.",
    keyInsight:
      "Digital = e^{−rT}N(d₂) = derivative of a call spread; its gamma explodes at the strike near expiry, so it's hedged with a spread.",
  },
];
