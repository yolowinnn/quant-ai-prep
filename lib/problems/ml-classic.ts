import type { Problem } from "../types";

export const mlClassic: Problem[] = [
  {
    id: "bias-variance",
    track: "ml-classic",
    title: "The Bias–Variance Decomposition",
    difficulty: "core",
    tags: ["generalization", "overfitting"],
    source: "ESL / Classic ML interview",
    prompt:
      "Derive the bias–variance decomposition of expected squared error and explain how it guides model complexity choices.",
    solution:
      "For a target $y = f(x) + \\varepsilon$ with $E[\\varepsilon]=0,\\ \\operatorname{Var}(\\varepsilon)=\\sigma^2$, and an estimator $\\hat f$ trained on a random dataset, the expected test error at $x$ is\n$$E\\big[(y - \\hat f(x))^2\\big] = \\underbrace{\\big(f(x) - E[\\hat f(x)]\\big)^2}_{\\text{Bias}^2} + \\underbrace{E\\big[(\\hat f(x) - E[\\hat f(x)])^2\\big]}_{\\text{Variance}} + \\underbrace{\\sigma^2}_{\\text{irreducible}}.$$\n\nThe cross terms vanish because $\\varepsilon$ is independent of $\\hat f$ and $\\hat f - E[\\hat f]$ is mean-zero.\n\n**Interpretation.** \n- **Bias** = error from wrong assumptions (too-simple model, underfitting).\n- **Variance** = sensitivity to the particular training sample (too-complex model, overfitting).\n- **$\\sigma^2$** = noise you can never remove.\n\nIncreasing complexity lowers bias but raises variance. The test error is U-shaped; the sweet spot minimizes bias² + variance. Regularization, more data, and ensembling all shift this tradeoff (bagging cuts variance, boosting cuts bias).",
    keyInsight:
      "Test error = bias² + variance + noise; complexity trades one for the other and the minimum sits between under- and over-fitting.",
  },
  {
    id: "l1-l2-regularization",
    track: "ml-classic",
    title: "L1 vs L2 Regularization",
    difficulty: "core",
    tags: ["regularization", "sparsity", "MAP"],
    source: "Classic ML interview",
    prompt:
      "Why does L1 (Lasso) produce sparse weights while L2 (Ridge) does not? Give both a geometric and a Bayesian explanation.",
    solution:
      "**Geometric.** Minimizing loss subject to a norm budget means the loss contours first touch the constraint region. The L1 ball $\\|w\\|_1\\le t$ is a diamond with **corners on the axes**; contours tend to hit these corners, zeroing coordinates. The L2 ball is a smooth sphere with no corners, so the optimum generically has all coordinates nonzero (just shrunk).\n\n**Subgradient view.** The L1 penalty contributes $\\lambda\\,\\text{sign}(w)$ — a constant push toward zero that can drive a weight *exactly* to 0 and hold it there. L2 contributes $2\\lambda w$, a force that vanishes as $w\\to 0$, so it never quite reaches zero.\n\n**Bayesian (MAP).** Ridge = Gaussian prior on weights ($\\propto e^{-\\lambda\\|w\\|_2^2}$); Lasso = Laplace prior ($\\propto e^{-\\lambda\\|w\\|_1}$). The Laplace prior's sharp peak at 0 puts substantial mass exactly there, yielding sparse MAP estimates.\n\nUse L1 for feature selection / interpretability, L2 for stability and correlated features (or elastic net for both).",
    keyInsight:
      "L1's diamond corners and constant gradient zero out weights (Laplace prior); L2's smooth sphere only shrinks them (Gaussian prior).",
  },
  {
    id: "logistic-mle",
    track: "ml-classic",
    title: "Logistic Regression = MLE with Cross-Entropy",
    difficulty: "core",
    tags: ["logistic regression", "MLE", "cross-entropy"],
    source: "Classic ML interview",
    prompt:
      "Show that training logistic regression by maximum likelihood is equivalent to minimizing cross-entropy, and derive the gradient. Why not use squared error?",
    solution:
      "Model $P(y=1\\mid x) = \\sigma(w^\\top x)$ with $\\sigma(z)=1/(1+e^{-z})$. The likelihood of labels $y_i\\in\\{0,1\\}$ is $\\prod_i p_i^{y_i}(1-p_i)^{1-y_i}$. Negative log-likelihood:\n$$\\mathcal L = -\\sum_i\\big[y_i\\ln p_i + (1-y_i)\\ln(1-p_i)\\big],$$\nwhich is exactly the **binary cross-entropy**.\n\n**Gradient.** Using $\\sigma' = \\sigma(1-\\sigma)$, the per-example gradient collapses beautifully:\n$$\\nabla_w \\mathcal L = \\sum_i (p_i - y_i)\\,x_i.$$\nThe update is proportional to the *residual* $p_i - y_i$ — clean and convex (no local minima).\n\n**Why not squared error?** MSE on top of a sigmoid is **non-convex** and its gradient contains a $\\sigma'(z)$ factor that vanishes for confident-but-wrong predictions ($z$ large), causing **vanishing gradients** and slow learning. Cross-entropy's gradient stays proportional to the error, so it trains faster and is the proper scoring rule for probabilities.",
    keyInsight:
      "Cross-entropy is the negative log-likelihood; its gradient (p−y)x avoids the sigmoid-saturation vanishing that plagues MSE.",
  },
  {
    id: "svm-margin-kernel",
    track: "ml-classic",
    title: "SVM: Max Margin & the Kernel Trick",
    difficulty: "hard",
    tags: ["SVM", "kernels", "duality"],
    source: "Classic ML interview",
    prompt:
      "What does an SVM optimize, and why is the *maximum-margin* hyperplane desirable? Explain the kernel trick.",
    solution:
      "**Max margin.** A linear SVM finds the separating hyperplane $w^\\top x + b = 0$ that maximizes the distance to the nearest points. The margin equals $2/\\|w\\|$, so it solves\n$$\\min_{w,b}\\tfrac12\\|w\\|^2\\ \\text{ s.t. } y_i(w^\\top x_i + b)\\ge 1.$$\nA wide margin means the decision boundary is maximally robust to perturbations — this connects to better generalization (margin bounds). Only the **support vectors** (points on the margin) determine $w$.\n\n**Dual & kernels.** The dual depends on data only through inner products $x_i^\\top x_j$:\n$$\\max_\\alpha \\sum_i\\alpha_i - \\tfrac12\\sum_{i,j}\\alpha_i\\alpha_j y_i y_j\\, x_i^\\top x_j,\\quad 0\\le\\alpha_i\\le C.$$\n\nThe **kernel trick** replaces $x_i^\\top x_j$ with $K(x_i,x_j) = \\phi(x_i)^\\top\\phi(x_j)$ for a feature map $\\phi$ into a high- (even infinite-) dimensional space — *without ever computing $\\phi$*. E.g. the RBF kernel $K = \\exp(-\\gamma\\|x_i-x_j\\|^2)$ corresponds to an infinite-dimensional space. Any positive-semidefinite $K$ (Mercer's condition) is a valid inner product, letting a linear method carve nonlinear boundaries.",
    keyInsight:
      "SVMs maximize the margin (robustness) and depend only on inner products, so kernels buy nonlinearity without materializing the feature space.",
  },
  {
    id: "bagging-vs-boosting",
    track: "ml-classic",
    title: "Bagging vs Boosting (Random Forest vs GBM)",
    difficulty: "core",
    tags: ["ensembles", "random forest", "gradient boosting"],
    source: "Classic ML interview",
    prompt:
      "Contrast bagging and boosting. Why does a random forest reduce variance while gradient boosting reduces bias? Why does RF add feature subsampling?",
    solution:
      "**Bagging (Random Forest).** Train many deep trees **in parallel**, each on a bootstrap sample, and average. Averaging $B$ estimators with pairwise correlation $\\rho$ has variance\n$$\\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2.$$\nMore trees drive the second term to 0, so the key is making trees **less correlated**. That's why RF also samples a random subset of features at each split — it decorrelates the trees, pushing $\\rho$ down. Deep trees are low-bias/high-variance individually; averaging kills the variance.\n\n**Boosting (GBM).** Train shallow trees **sequentially**, each fitting the *residual* (negative gradient) of the current ensemble. Each stage corrects the errors of the last, systematically reducing **bias**. A learning rate shrinks each step to avoid overfitting. Because it's sequential and fits residuals, boosting is more prone to overfitting noise and needs careful regularization (depth, shrinkage, subsampling).\n\n**Summary:** bagging = parallel + variance reduction via decorrelation; boosting = sequential + bias reduction via residual fitting.",
    keyInsight:
      "Bagging averages independent high-variance trees (RF decorrelates them via feature sampling); boosting sequentially fits residuals to cut bias.",
  },
  {
    id: "precision-recall-roc",
    track: "ml-classic",
    title: "Precision, Recall, ROC-AUC",
    difficulty: "core",
    tags: ["evaluation", "imbalanced data", "metrics"],
    source: "Classic ML interview",
    prompt:
      "Define precision, recall, F1, and ROC-AUC. When is accuracy misleading, and when should you prefer PR-AUC over ROC-AUC?",
    solution:
      "With TP/FP/FN/TN:\n- **Precision** $= \\frac{TP}{TP+FP}$ — of predicted positives, how many are right (cost of false alarms).\n- **Recall** $= \\frac{TP}{TP+FN}$ — of actual positives, how many we caught (cost of misses).\n- **F1** $= \\frac{2\\,PR}{P+R}$ — harmonic mean, punishing imbalance between the two.\n- **ROC-AUC** = probability a random positive is ranked above a random negative; it plots TPR vs FPR across thresholds and is **threshold-independent**.\n\n**Accuracy is misleading under class imbalance:** if 1% are positive, predicting 'always negative' scores 99% accuracy while catching nothing. Use precision/recall/F1 instead.\n\n**ROC vs PR:** ROC-AUC can look deceptively high on heavily imbalanced data because the huge number of true negatives keeps FPR low. **PR-AUC** (precision vs recall) ignores true negatives, so it better reflects performance on the rare positive class — prefer it for fraud, disease, and other needle-in-haystack problems.",
    keyInsight:
      "Under heavy imbalance accuracy and ROC-AUC flatter the model; precision/recall and PR-AUC focus on the rare class that matters.",
  },
  {
    id: "kmeans-em",
    track: "ml-classic",
    title: "k-Means as Hard EM",
    difficulty: "hard",
    tags: ["clustering", "EM", "Gaussian mixtures"],
    source: "Classic ML interview",
    prompt:
      "Explain k-means and its convergence. How does it relate to the EM algorithm for Gaussian mixtures?",
    solution:
      "**k-means** alternates two steps to minimize within-cluster sum of squares $\\sum_i \\|x_i - \\mu_{c_i}\\|^2$:\n1. **Assign:** each point to its nearest centroid.\n2. **Update:** each centroid to the mean of its assigned points.\n\nBoth steps never increase the objective (assignment is optimal given centroids; mean is optimal given assignments), and there are finitely many assignments, so it **converges** — but only to a *local* optimum (hence k-means++ initialization and restarts).\n\n**Connection to EM.** k-means is the 'hard-assignment' limit of **EM for a Gaussian mixture** with equal, spherical, fixed covariances. EM's E-step computes soft responsibilities $\\gamma_{ik} = P(\\text{cluster }k\\mid x_i)$; as covariance $\\to 0$ these become 0/1 (hard) assignments. EM's M-step updates means (and, in full GMM, covariances and mixing weights) by responsibility-weighted averages. So k-means = EM with hard assignments and identity covariance; GMM generalizes it to elliptical, soft clusters with a proper likelihood.",
    keyInsight:
      "k-means is EM for a spherical GMM in the hard-assignment limit; it monotonically decreases WCSS to a local optimum.",
  },
  {
    id: "generative-vs-discriminative",
    track: "ml-classic",
    title: "Generative vs Discriminative Models",
    difficulty: "core",
    tags: ["Naive Bayes", "modeling"],
    source: "Ng & Jordan",
    prompt:
      "What is the difference between generative and discriminative classifiers? Compare Naive Bayes and logistic regression. When does each win?",
    solution:
      "- **Discriminative** models learn $P(y\\mid x)$ directly (logistic regression, SVM, neural nets) — they only care about the decision boundary.\n- **Generative** models learn the joint $P(x,y) = P(x\\mid y)P(y)$ and apply Bayes to get $P(y\\mid x)$ (Naive Bayes, GDA, HMMs) — they model how the data is generated.\n\n**Naive Bayes vs Logistic Regression** are an 'asymptotic pair' (Ng & Jordan): NB assumes features are conditionally independent given the class, giving a linear decision boundary — the *same functional form* as logistic regression, but with parameters fit generatively.\n\n- **Naive Bayes** has higher asymptotic error (its independence assumption is usually wrong) but **converges faster** — it reaches its (worse) ceiling with far less data. Great for small datasets / text.\n- **Logistic regression** has lower asymptotic error but needs more data to get there.\n\nGenerative models also give you $P(x)$ (anomaly detection, missing-data handling, sampling); discriminative models typically classify better when data is plentiful.",
    keyInsight:
      "Generative models P(x,y) and converge fast on little data; discriminative models P(y|x) win the asymptotic accuracy race with more data.",
  },
  {
    id: "curse-dimensionality",
    track: "ml-classic",
    title: "The Curse of Dimensionality",
    difficulty: "core",
    tags: ["high dimensions", "distance", "kNN"],
    source: "Classic ML interview",
    prompt:
      "What is the curse of dimensionality, and why does it break distance-based methods like k-NN?",
    solution:
      "In high dimensions, intuition from 2-D/3-D fails badly:\n\n1. **Everything is far and equidistant.** For many distributions, the ratio $\\frac{\\text{dist}_{\\max} - \\text{dist}_{\\min}}{\\text{dist}_{\\min}} \\to 0$ as dimension grows — nearest and farthest neighbors become indistinguishable, so 'nearest neighbor' loses meaning.\n2. **Volume concentrates in the shell.** In a $d$-ball, the fraction of volume within the outer $\\epsilon$-shell is $1-(1-\\epsilon)^d \\to 1$; almost all points sit near the boundary, and the center is empty.\n3. **Sampling is hopeless.** To keep a fixed density you need exponentially many points: covering $[0,1]^d$ at resolution $1/10$ needs $10^d$ samples.\n\n**Consequences:** k-NN, kernel density estimation, and clustering degrade because distances stop being informative; models overfit because the space is almost entirely empty. **Remedies:** dimensionality reduction (PCA, autoencoders), feature selection, strong priors/regularization, and using representations (embeddings) where meaningful structure is low-dimensional.",
    keyInsight:
      "As d grows, volume flees to the shell and all pairwise distances converge — distance-based learners need dimensionality reduction to survive.",
  },
];
