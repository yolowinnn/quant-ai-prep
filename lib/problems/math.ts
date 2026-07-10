import type { Problem } from "../types";

export const math: Problem[] = [
  {
    id: "gaussian-integral",
    track: "math",
    title: "The Gaussian Integral",
    difficulty: "core",
    tags: ["integration", "polar coordinates"],
    source: "Classic",
    prompt:
      "Evaluate $I = \\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx$ without antiderivatives.",
    solution:
      "Square it and switch to polar coordinates:\n$$I^2 = \\int_{-\\infty}^{\\infty} e^{-x^2}dx\\int_{-\\infty}^{\\infty} e^{-y^2}dy = \\iint_{\\mathbb R^2} e^{-(x^2+y^2)}\\,dx\\,dy.$$\n\nWith $x=r\\cos\\theta, y=r\\sin\\theta$, $dx\\,dy = r\\,dr\\,d\\theta$:\n$$I^2 = \\int_0^{2\\pi}\\!\\!\\int_0^{\\infty} e^{-r^2} r\\,dr\\,d\\theta = 2\\pi\\cdot \\Big[-\\tfrac12 e^{-r^2}\\Big]_0^\\infty = 2\\pi\\cdot\\tfrac12 = \\pi.$$\n\nHence $I = \\sqrt\\pi$. Rescaling gives $\\int e^{-x^2/(2\\sigma^2)}dx = \\sqrt{2\\pi}\\,\\sigma$, the normalizing constant of the normal density.",
    keyInsight:
      "Squaring turns a 1-D integral into a 2-D one that separates in polar coordinates; the extra r makes it elementary.",
  },
  {
    id: "psd-covariance",
    track: "math",
    title: "Why Covariance Matrices Are PSD",
    difficulty: "core",
    tags: ["positive semidefinite", "covariance"],
    source: "Classic",
    prompt:
      "Prove that any covariance matrix $\\Sigma$ is positive semidefinite. What does a zero eigenvalue mean?",
    solution:
      "Let $\\mathbf X$ be a random vector with covariance $\\Sigma = E[(\\mathbf X - \\mu)(\\mathbf X-\\mu)^\\top]$. For any fixed vector $\\mathbf a$:\n$$\\mathbf a^\\top \\Sigma \\mathbf a = \\mathbf a^\\top E[(\\mathbf X-\\mu)(\\mathbf X-\\mu)^\\top]\\mathbf a = E\\big[(\\mathbf a^\\top(\\mathbf X-\\mu))^2\\big] = \\operatorname{Var}(\\mathbf a^\\top \\mathbf X) \\ge 0.$$\n\nSince this holds for all $\\mathbf a$, $\\Sigma \\succeq 0$ — positive semidefinite.\n\n**Zero eigenvalue:** if $\\mathbf a^\\top\\Sigma\\mathbf a = 0$ for some $\\mathbf a\\ne 0$, then $\\operatorname{Var}(\\mathbf a^\\top\\mathbf X)=0$, i.e. $\\mathbf a^\\top\\mathbf X$ is (almost surely) constant — a **linear dependence** among the components. The data lives on a lower-dimensional subspace, which is exactly what PCA exploits and why a singular $\\Sigma$ breaks portfolio optimizers that invert it.",
    keyInsight:
      "aᵀΣa = Var(aᵀX) ≥ 0 forces PSD; a null eigenvector is an exact linear dependence in the variables.",
  },
  {
    id: "quadratic-form-gradient",
    track: "math",
    title: "Gradient of a Quadratic Form",
    difficulty: "warmup",
    tags: ["matrix calculus", "gradient"],
    source: "Classic",
    prompt:
      "Compute $\\nabla_{\\mathbf x}(\\mathbf x^\\top A\\mathbf x)$ and $\\nabla_{\\mathbf x}(\\mathbf b^\\top \\mathbf x)$. Use them to minimize $f(\\mathbf x)=\\tfrac12\\mathbf x^\\top A\\mathbf x - \\mathbf b^\\top\\mathbf x$ for symmetric positive-definite $A$.",
    solution:
      "Write $\\mathbf x^\\top A\\mathbf x = \\sum_{i,j}A_{ij}x_ix_j$; differentiating w.r.t. $x_k$ gives $\\sum_j A_{kj}x_j + \\sum_i A_{ik}x_i$, i.e.\n$$\\nabla_{\\mathbf x}(\\mathbf x^\\top A\\mathbf x) = (A + A^\\top)\\mathbf x,\\qquad \\nabla_{\\mathbf x}(\\mathbf b^\\top\\mathbf x) = \\mathbf b.$$\nFor symmetric $A$ the first is $2A\\mathbf x$.\n\n**Minimization:** $\\nabla f = A\\mathbf x - \\mathbf b = 0 \\Rightarrow \\mathbf x^\\star = A^{-1}\\mathbf b$. Because $A\\succ 0$, the Hessian $A$ is positive definite, so this stationary point is the unique global minimum. This is the linear-algebra core of ridge regression, GLS, and mean–variance optimization.",
    keyInsight:
      "∇(xᵀAx) = (A+Aᵀ)x = 2Ax for symmetric A; minimizing ½xᵀAx − bᵀx gives x = A⁻¹b.",
  },
  {
    id: "lagrange-portfolio",
    track: "math",
    title: "Minimum-Variance Portfolio (Lagrange)",
    difficulty: "hard",
    tags: ["Lagrange multipliers", "optimization", "portfolio"],
    source: "Markowitz",
    prompt:
      "With asset covariance $\\Sigma\\succ 0$, find the fully-invested portfolio $\\mathbf w$ ($\\mathbf 1^\\top\\mathbf w = 1$) that minimizes variance $\\mathbf w^\\top\\Sigma\\mathbf w$.",
    solution:
      "Form the Lagrangian\n$$\\mathcal L = \\tfrac12\\mathbf w^\\top\\Sigma\\mathbf w - \\lambda(\\mathbf 1^\\top\\mathbf w - 1).$$\nStationarity: $\\nabla_{\\mathbf w}\\mathcal L = \\Sigma\\mathbf w - \\lambda\\mathbf 1 = 0 \\Rightarrow \\mathbf w = \\lambda\\Sigma^{-1}\\mathbf 1$.\n\nApply the constraint $\\mathbf 1^\\top\\mathbf w = 1$: $\\lambda\\,\\mathbf 1^\\top\\Sigma^{-1}\\mathbf 1 = 1$, so $\\lambda = 1/(\\mathbf 1^\\top\\Sigma^{-1}\\mathbf 1)$. Therefore\n$$\\boxed{\\ \\mathbf w^\\star = \\frac{\\Sigma^{-1}\\mathbf 1}{\\mathbf 1^\\top\\Sigma^{-1}\\mathbf 1}\\ }.$$\n\nThe minimized variance is $\\sigma^2_{\\min} = 1/(\\mathbf 1^\\top\\Sigma^{-1}\\mathbf 1)$. In practice $\\Sigma^{-1}$ is unstable when assets are collinear (near-singular $\\Sigma$), which is why practitioners shrink $\\Sigma$ (Ledoit–Wolf) before inverting.",
    keyInsight:
      "Minimum-variance weights ∝ Σ⁻¹𝟙; the inverse covariance is the whole story — and its instability is the practical catch.",
  },
  {
    id: "eigen-power-iteration",
    track: "math",
    title: "Power Iteration & the Dominant Eigenvector",
    difficulty: "core",
    tags: ["eigenvalues", "iteration", "PageRank"],
    source: "Classic",
    prompt:
      "Explain power iteration for finding the largest-magnitude eigenvalue of a matrix $A$. When does it converge, and how fast?",
    solution:
      "Start from a random $\\mathbf v_0$ and repeat $\\mathbf v_{k+1} = A\\mathbf v_k / \\|A\\mathbf v_k\\|$.\n\nExpand $\\mathbf v_0 = \\sum_i c_i \\mathbf u_i$ in the eigenbasis ($A\\mathbf u_i = \\lambda_i\\mathbf u_i$, $|\\lambda_1|>|\\lambda_2|\\ge\\dots$). Then\n$$A^k\\mathbf v_0 = \\sum_i c_i\\lambda_i^k \\mathbf u_i = \\lambda_1^k\\Big(c_1\\mathbf u_1 + \\sum_{i\\ge 2}c_i(\\lambda_i/\\lambda_1)^k\\mathbf u_i\\Big).$$\nSince $|\\lambda_i/\\lambda_1|<1$, all terms but the first decay, so $\\mathbf v_k \\to \\mathbf u_1$ (up to sign/scale). The Rayleigh quotient $\\mathbf v_k^\\top A\\mathbf v_k$ gives $\\lambda_1$.\n\n**Convergence** requires $c_1\\ne 0$ (generic) and a strict gap $|\\lambda_1|>|\\lambda_2|$; the error shrinks geometrically at rate $|\\lambda_2/\\lambda_1|$ — a small spectral gap means slow convergence. This is exactly the algorithm behind **PageRank** (dominant eigenvector of the web transition matrix).",
    keyInsight:
      "Repeated multiplication amplifies the top eigencomponent; convergence rate is the spectral gap |λ₂/λ₁|.",
  },
  {
    id: "svd-pca",
    track: "math",
    title: "SVD and PCA",
    difficulty: "core",
    tags: ["SVD", "PCA", "dimensionality reduction"],
    source: "Classic",
    prompt:
      "State the singular value decomposition and explain its connection to PCA. Why is the best low-rank approximation given by the top singular vectors?",
    solution:
      "Any $A\\in\\mathbb R^{m\\times n}$ factors as $A = U\\Sigma V^\\top$ with orthonormal $U,V$ and non-negative singular values $\\sigma_1\\ge\\sigma_2\\ge\\dots$ on the diagonal of $\\Sigma$.\n\n**Link to PCA:** for centered data $X$, the covariance is $\\tfrac1n X^\\top X = V(\\tfrac1n\\Sigma^2)V^\\top$. So the right singular vectors $V$ are the **principal directions** and $\\sigma_i^2/n$ are the variances (eigenvalues of the covariance). Projecting onto the top-$k$ columns of $V$ gives PCA.\n\n**Eckart–Young:** the rank-$k$ truncation $A_k = \\sum_{i=1}^k \\sigma_i u_i v_i^\\top$ is the *closest* rank-$k$ matrix to $A$ in both Frobenius and spectral norm, with error $\\|A - A_k\\|_F^2 = \\sum_{i>k}\\sigma_i^2$. Keeping the largest singular values captures the most variance/energy — the foundation of compression, denoising, and latent-factor models.",
    keyInsight:
      "SVD's right singular vectors are PCA directions; Eckart–Young makes truncation the optimal low-rank fit.",
  },
  {
    id: "newton-method",
    track: "math",
    title: "Newton's Method & Quadratic Convergence",
    difficulty: "core",
    tags: ["root finding", "optimization", "convergence"],
    source: "Classic",
    prompt:
      "Derive Newton's method for solving $f(x)=0$ and explain why it converges quadratically near a simple root. Use it to compute $\\sqrt{a}$.",
    solution:
      "Linearize $f$ at $x_n$: $f(x)\\approx f(x_n) + f'(x_n)(x-x_n)$. Setting the linear model to 0 gives\n$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}.$$\n\n**Quadratic convergence:** let $e_n = x_n - x^\\star$. Taylor-expanding around the root and using $f(x^\\star)=0$,\n$$e_{n+1} = \\frac{f''(\\xi)}{2f'(x_n)}e_n^2 \\;\\Rightarrow\\; |e_{n+1}| \\le C e_n^2.$$\nThe error squares each step (roughly *doubling correct digits*), provided $f'(x^\\star)\\ne 0$ and the start is close enough.\n\n**Square root:** solve $f(x)=x^2 - a = 0$: $x_{n+1} = x_n - \\frac{x_n^2 - a}{2x_n} = \\tfrac12\\big(x_n + \\tfrac{a}{x_n}\\big)$ — the classic Babylonian iteration, converging quadratically to $\\sqrt a$.",
    keyInsight:
      "Newton fits a tangent line each step; near a simple root the error squares, doubling accurate digits per iteration.",
  },
  {
    id: "trace-determinant-eigen",
    track: "math",
    title: "Trace, Determinant & Eigenvalues",
    difficulty: "warmup",
    tags: ["trace", "determinant", "eigenvalues"],
    source: "Classic",
    prompt:
      "For an $n\\times n$ matrix with eigenvalues $\\lambda_1,\\dots,\\lambda_n$, relate the trace and determinant to the eigenvalues. Why is $\\operatorname{tr}(AB)=\\operatorname{tr}(BA)$?",
    solution:
      "From the characteristic polynomial $\\det(A - \\lambda I) = \\prod_i(\\lambda_i - \\lambda)$, matching coefficients gives\n$$\\operatorname{tr}(A) = \\sum_i \\lambda_i,\\qquad \\det(A) = \\prod_i \\lambda_i.$$\nThe trace is the sum, the determinant the product of eigenvalues (counted with multiplicity). A zero eigenvalue ⇔ singular matrix ⇔ $\\det = 0$.\n\n**Cyclic property:** $\\operatorname{tr}(AB) = \\sum_i\\sum_j A_{ij}B_{ji} = \\sum_j\\sum_i B_{ji}A_{ij} = \\operatorname{tr}(BA)$. This invariance under cyclic permutation implies trace is basis-independent: $\\operatorname{tr}(P^{-1}AP) = \\operatorname{tr}(APP^{-1}) = \\operatorname{tr}(A)$, consistent with it being the eigenvalue sum.",
    keyInsight:
      "trace = Σλ, det = Πλ; the cyclic identity tr(AB)=tr(BA) makes trace similarity-invariant.",
  },
  {
    id: "lhopital-limit",
    track: "math",
    title: "A Limit That Needs Care",
    difficulty: "warmup",
    tags: ["limits", "exponential"],
    source: "Classic",
    prompt:
      "Evaluate $\\lim_{n\\to\\infty}\\left(1 + \\frac{x}{n}\\right)^n$ and, as a follow-up, $\\lim_{x\\to 0^+} x^x$.",
    solution:
      "**First limit.** Take logs: $n\\ln(1 + x/n)$. As $n\\to\\infty$, $\\ln(1+x/n) = \\frac{x}{n} - \\frac{x^2}{2n^2}+\\dots$, so $n\\ln(1+x/n)\\to x$. Exponentiating,\n$$\\lim_{n\\to\\infty}\\Big(1+\\frac xn\\Big)^n = e^{x}.$$\n(This is the continuous-compounding limit: \\$1 at rate $x$ compounded infinitely often grows to $e^x$.)\n\n**Second limit.** Write $x^x = e^{x\\ln x}$. As $x\\to 0^+$, $x\\ln x \\to 0$ (the $x$ beats the $\\ln x\\to-\\infty$; formally $\\lim x\\ln x = \\lim \\frac{\\ln x}{1/x} = \\lim \\frac{1/x}{-1/x^2} = \\lim(-x) = 0$ by L'Hôpital). Hence\n$$\\lim_{x\\to 0^+} x^x = e^0 = 1.$$",
    keyInsight:
      "Take logs to tame powers: (1+x/n)ⁿ → eˣ and xˣ → 1 because x·ln x → 0.",
  },
];
