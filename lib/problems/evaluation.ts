import type { Problem } from "../types";

export const evaluation: Problem[] = [
  {
    id: "eval-golden-regression-ci",
    track: "evaluation",
    title: "Golden Sets & Regression Testing in CI",
    difficulty: "warmup",
    tags: ["regression testing", "CI/CD", "golden set"],
    source: "ML systems interview",
    prompt:
      "What is a golden/regression test suite for an ML/LLM product, and how does it gate deploys in CI?",
    solution:
      "A **golden set** is a small, hand-curated suite of inputs with known-correct expected outputs — think **unit tests for model behavior** rather than a benchmark for ranking. Its job is to guarantee that critical behaviors **never regress** as you change prompts, models, retrieval, or post-processing.\n\n**Properties.**\n- **Small and hand-verified** (tens to a few hundred cases) so it runs in seconds and every expected answer is trustworthy.\n- **Deterministic**: temperature 0 / fixed seed, so a red result means a real change, not sampling noise.\n- **High coverage of what matters**: core happy-path cases, tricky edge cases, and — importantly — a **regression case for every past bug**, so fixed bugs cannot silently return.\n- **Safety must-nots**: prompts that must be refused or handled safely.\n\n**CI integration.** Run the suite on every PR, prompt change, or model bump. Assertions can be exact match, schema validation, or a scored threshold (e.g. must stay $\\ge$ baseline). A failure **blocks the deploy** — the deploy is *gated* on the golden set, exactly like failing unit tests block a merge. Keep it separate from your large offline benchmarks: benchmarks tell you *which model is better on average*; the golden set tells you *this specific change did not break something we promised works*.",
    keyInsight:
      "Treat a small, deterministic, hand-verified golden set as unit tests for model behavior — one regression case per past bug — and gate deploys on it so no change silently breaks a promised behavior.",
  },
  {
    id: "eval-harness-design",
    track: "evaluation",
    title: "Designing an Evaluation Harness",
    difficulty: "core",
    tags: ["eval harness", "reproducibility", "tooling"],
    source: "lm-evaluation-harness / HELM",
    prompt:
      "Design a reusable evaluation harness for LLMs. What are the core abstractions, and how do you make results reproducible across models and over time?",
    solution:
      "A good harness cleanly separates **what** you evaluate (the task) from **who** you evaluate (the model), so any model plugs into any task. This mirrors Eleuther's **lm-evaluation-harness** and Stanford **HELM**.\n\n**1. Task abstraction.** A `Task` bundles four things: a **dataset loader**, a **prompt template** (`doc_to_text`), a **target/answer key** (`doc_to_target`), and one or more **metrics**. The model exposes a narrow interface — typically `generate(prompt)` for free-form and `loglikelihood(prompt, continuation)` for multiple-choice scoring — and knows nothing about the task.\n\n**2. Prompt/answer templating.** Render each example through a versioned template that also controls **few-shot** formatting (k in-context exemplars, separators, system prompt). The exact template is part of the score: changing the phrasing or shot count changes results, so it must be pinned.\n\n**3. Robust output parsing.** Free-form generations are messy. Parse defensively: normalize whitespace/case, strip markdown, extract with a tolerant regex (e.g. `answer is (\\d+)`), prefer **constrained/structured decoding** (JSON schema, choice-restricted logits) when possible, and always have a fallback that records *unparseable* rather than silently scoring 0 — otherwise parser bugs masquerade as model failures.\n\n**4. Per-task metrics.** Each task declares its own metric(s): normalized exact-match and token-F1 for QA, accuracy for multiple-choice (argmax log-likelihood over options), pass@k for code, or an LLM-judge score for open-ended tasks. Aggregate per task, then optionally macro-average across a suite — never silently average incommensurable metrics.\n\n**5. Versioning eval sets.** Reproducibility requires pinning and hashing everything that moves the number: dataset **version + content hash**, prompt-template version, few-shot seed and count, decoding params (temperature, max tokens, stop sequences), and the harness/git commit. Store this as a **run manifest** so two scores are only ever compared when their configs match, and bump a task **version** whenever you fix a bug or change the template so historical numbers are not silently compared across definitions.",
    keyInsight:
      "Separate the task (data + template + parser + metric) from the model interface, and pin + hash every knob — dataset, template, shots, decoding — so a score is reproducible and comparable over time.",
  },
  {
    id: "eval-batch-throughput",
    track: "evaluation",
    title: "High-Throughput Batch Evaluation at Scale",
    difficulty: "hard",
    tags: ["batching", "concurrency", "caching", "sharding"],
    source: "ML systems interview",
    prompt:
      "You need to evaluate a model on millions of examples as cheaply and quickly as possible. Walk through the system: batching, async concurrency, caching, and sharding.",
    solution:
      "You are compute- and dollar-bound, so the goal is to keep every accelerator (or API rate-limit budget) saturated while never doing the same work twice. Six levers, roughly in order of impact:\n\n**1. Sharding (data parallelism).** Evaluation is **embarrassingly parallel** across examples. Split the dataset into $N$ shards and run one worker per GPU/process on each shard, then merge. This scales roughly linearly and is the first thing to reach for. Reserve **tensor/pipeline parallelism** for models too large to fit on one device — it adds communication overhead and is about *fitting* the model, not throughput.\n\n**2. Request batching.** Feed many prompts per forward pass. Padding wastes compute, so **bucket by length** (sort/group similar-length sequences) to minimize pad tokens. For local serving, **continuous (in-flight) batching** (vLLM) is the big win: it swaps finished sequences out and new ones in every step instead of waiting for the slowest sequence in a static batch.\n\n**3. Async concurrency (for API models).** Here you are latency-bound, not compute-bound, so overlap requests. Use `asyncio` with a **semaphore** to cap in-flight calls at the provider's rate limit, and **exponential backoff with jitter** on 429s. A few hundred concurrent requests turns a week-long serial run into hours.\n\n**4. Caching.** Content-address every result by `hash(model, prompt, decoding_params)` and skip anything already computed — essential when you re-run a suite after fixing one task. At the model level, **prefix/KV caching** amortizes a shared system prompt or RAG context across the batch.\n\n**5. Resumability / checkpointing.** Write results incrementally to append-only **JSONL keyed by example id**, so a crash at example 900k resumes instead of restarting. Idempotent, id-keyed writes also make sharded merges trivial.\n\n**6. Spend only where signal is.** To 'evaluate millions cheaply', question whether you need all of them: a **random subsample** with a bootstrap CI often separates two models to sufficient precision at a fraction of the cost; use the full set only for final/regression numbers. Route to the **cheapest sufficient model** (a small judge, a quantized target) and reserve the expensive path for hard or disputed cases.\n\n| Technique | Bottleneck it attacks | Notes |\n| --- | --- | --- |\n| Sharding | wall-clock | linear, embarrassingly parallel |\n| Length bucketing | wasted pad FLOPs | sort by token length |\n| Continuous batching | GPU idle between requests | vLLM / PagedAttention |\n| Async + semaphore | API round-trip latency | cap at rate limit, backoff+jitter |\n| Result cache | recomputation | key = hash(model, prompt, params) |\n| Subsampling | needless volume | bootstrap CI for precision |\n\nRoughly, $\\text{cost} \\approx N \\cdot \\bar{t} \\cdot (\\text{price/token})$ and $\\text{wall-clock} \\approx \\dfrac{N \\cdot \\bar{t}}{\\text{throughput}}$, so the two independent dials are *fewer tokens per example* and *more parallel throughput*.\n\n```python\nimport asyncio, random\nfrom hashlib import sha256\n\nsem = asyncio.Semaphore(256)          # cap in-flight requests at the rate limit\ncache = {}                            # content-addressed result cache\n\nasync def eval_one(client, ex):\n    key = sha256((MODEL + '|' + ex['prompt']).encode()).hexdigest()\n    if key in cache:                  # never recompute\n        return cache[key]\n    async with sem:\n        for attempt in range(6):      # exponential backoff + jitter on 429\n            try:\n                out = await client.generate(ex['prompt'])\n                break\n            except RateLimit:\n                await asyncio.sleep(2 ** attempt + random.random())\n    cache[key] = score(out, ex['answer'])\n    return cache[key]\n\nasync def run(shard):                 # one shard per worker / GPU\n    return await asyncio.gather(*(eval_one(client, ex) for ex in shard))\n```",
    keyInsight:
      "Eval is embarrassingly parallel — shard across workers, batch by length (or continuous-batch), overlap API calls under a rate-limit semaphore, cache by content hash, and checkpoint id-keyed results so you never recompute; subsample when a CI already separates the models.",
  },
  {
    id: "eval-continuous-training",
    track: "evaluation",
    title: "Continuous Evaluation During Training",
    difficulty: "hard",
    tags: ["training loop", "probe set", "regression detection"],
    source: "ML systems interview",
    prompt:
      "How do you evaluate a model continuously during a long pretraining/fine-tuning run to catch regressions early without burning too much compute?",
    solution:
      "Training runs are long and eval is not free, so you spend an eval budget to buy an early-warning signal. Design it as a **hierarchy of signals at different cadences**.\n\n**Cadence hierarchy.**\n- **Every step (nearly free):** training loss and **held-out validation loss** on a fixed shard. Cheap and low-latency, but only a proxy — loss can keep dropping while a downstream capability saturates or the model simply memorizes.\n- **Every few hundred to few thousand steps:** a **fixed probe set** — a few hundred to a few thousand curated downstream examples (MCQA accuracy, a small code subset, a short generation set). This is the eval-in-the-loop signal that actually tracks capability.\n- **Occasionally / at checkpoints:** the full expensive benchmark suite and any LLM-judge or human eval, used to confirm the probe-set trend and for checkpoint selection.\n\n**Cost vs signal.** Keep total eval spend to a small fraction (rule of thumb, a few percent) of training compute. The probe set must be **large enough for a tight confidence interval** — a 200-item set has a $\\pm$ several-point sampling error, far too noisy to see a 1% regression — yet small enough to run often. Evaluate **deterministically** (greedy / temperature 0, fixed prompt and shots) so run-to-run changes reflect the model, not sampling noise.\n\n**Fixed probe-set discipline.** The probe set is frozen and **versioned**, and — critically — must be **decontaminated from the training data**, or the metric measures memorization instead of generalization. Never let it leak into the training mix.\n\n**Catching regressions early.** Track **per-capability** curves (not one scalar) on a dashboard, smooth with an EMA, and **compare against the previous checkpoint or a baseline run**; alert on a statistically meaningful drop. Because it runs on a fixed set every $N$ steps, a capability cliff — a data-pipeline bug poisoning one domain, or a bad LR spike — shows up within a single eval interval instead of at the end of the run. Use the probe metric, not loss alone, for **checkpoint selection and early stopping**, since loss and task accuracy routinely diverge.",
    keyInsight:
      "Run a tiered signal — loss every step, a frozen decontaminated probe set every N steps, full suite occasionally — sized for a tight CI and evaluated deterministically, so a capability regression surfaces within one interval instead of at the run's end.",
  },
  {
    id: "eval-llm-as-judge",
    track: "evaluation",
    title: "LLM-as-a-Judge: Modes and Biases",
    difficulty: "core",
    tags: ["LLM judge", "pairwise", "bias mitigation"],
    source: "Judging LLM-as-a-Judge (MT-Bench / Chatbot Arena)",
    prompt:
      "You want to use a strong LLM as an automatic judge of open-ended responses. Compare pointwise vs pairwise judging, and enumerate the judge's biases and how to mitigate them.",
    solution:
      "**Pointwise vs pairwise.**\n- **Pointwise**: the judge scores a single response against a rubric (e.g. 1-10, or pass/fail per criterion). Scalable and gives absolute numbers, but absolute scores are **noisy and drift** — the same response gets different numbers across runs, and the scale is uncalibrated.\n- **Pairwise**: the judge sees two responses and picks the better (or a tie). Relative judgments are **more reliable and consistent** — both humans and LLMs are better at comparison than absolute scoring — and they feed directly into Elo/Bradley-Terry rankings (this is how Chatbot Arena and MT-Bench work). The cost is $O(n^2)$ comparisons, mitigated by sampling pairs.\n\n**Rubric design.** Give explicit, decomposed criteria; provide the **reference answer** when one exists; require the judge to **reason before verdict** (write a critique, then emit a structured final label), which measurably improves reliability; add a few calibrated exemplars. Force a machine-parseable verdict (JSON or a fixed token) so parsing never fails.\n\n**Biases and mitigations.**\n\n| Bias | Symptom | Mitigation |\n| --- | --- | --- |\n| **Position bias** | favors whichever answer is first (or second) | **swap order** and average both passes; count a win only if it survives the swap |\n| **Verbosity bias** | prefers longer answers regardless of quality | normalize/control for length; instruct to ignore length; length-matched pairs |\n| **Self-preference** | rates its own / same-family style higher | use a different-family judge, or an ensemble; anchor to human labels |\n| **Style/format bias** | rewards confident tone, markdown, formatting | rubric that scores substance; strip formatting before judging |\n\nOther safeguards: **calibrate** the judge against a human-labeled gold set and report judge-human agreement (strong judges reach roughly 80% agreement with humans, comparable to human-human); take a **majority vote** across multiple judges or samples; and treat the judge itself as a **versioned, evaluated component** — a new judge model can silently move all your scores.",
    keyInsight:
      "Prefer pairwise (relative) over pointwise (absolute) judging, force reason-then-verdict, and neutralize position/verbosity/self-preference bias by swapping order, controlling length, and using a different-family judge calibrated against human labels.",
  },
  {
    id: "eval-benchmark-contamination",
    track: "evaluation",
    title: "Benchmark Contamination & Decontamination",
    difficulty: "core",
    tags: ["contamination", "data leakage", "decontamination"],
    source: "Language Models are Few-Shot Learners (GPT-3, 2020)",
    prompt:
      "What is benchmark contamination, why does it inflate leaderboard scores, and how do you detect and decontaminate?",
    solution:
      "**What it is.** Benchmark contamination (eval-set leakage) is when test examples end up in the pretraining corpus — web scrapes routinely ingest the very benchmarks used to score the model. The model then partly **memorizes** answers, so the benchmark measures recall of seen data rather than generalization, and the reported score is inflated.\n\n**Why leaderboards inflate.** Two compounding effects: (1) direct contamination as above; (2) **adaptive overfitting** — when a public test set is optimized against by the whole community for years, models drift to fit that specific set even without leakage. Both make public leaderboard numbers optimistic relative to fresh, private data.\n\n**Detection.**\n- **n-gram / substring overlap** between each eval item and the training corpus (flag an example if a long n-gram or a normalized substring appears in training).\n- **Canary strings**: benchmarks embed a unique GUID (the BIG-bench canary) — if the model can reproduce it, that data was trained on.\n- **Memorization probes**: give the first half of a test item and check whether the model completes it verbatim; or compare loss/perplexity on the test set vs comparable unseen data (anomalously low loss implies it was seen).\n- **Post-cutoff evaluation**: score on data **created after the training cutoff**; a large drop versus older data signals contamination.\n\n**Decontamination.**\n- Filter training documents that overlap any eval set — GPT-3 removed documents sharing a **13-gram** with test data (plus partial-overlap analysis); many pipelines use substring or MinHash dedup.\n- Prefer **private, held-out** test sets and **continuously refreshed** evals (new items collected after each model's cutoff) so contamination cannot accumulate.\n- When possible, report results on both raw and decontaminated splits so the gap is visible.",
    keyInsight:
      "Web-scraped pretraining ingests benchmarks, so scores measure memorization; detect with n-gram overlap, canary GUIDs, verbatim-completion probes, and post-cutoff drops — and defend with n-gram decontamination plus private, freshly-collected test sets.",
  },
  {
    id: "eval-generation-metrics",
    track: "evaluation",
    title: "Metrics for Generation: BLEU to pass@k to Elo",
    difficulty: "hard",
    tags: ["metrics", "pass@k", "Bradley-Terry", "Elo"],
    source: "Evaluating Large Language Models Trained on Code (Codex, 2021)",
    prompt:
      "Survey metrics for evaluating generation: why BLEU/ROUGE are weak, how pass@k works for code (with its unbiased estimator), and how Elo/Bradley-Terry rank models from pairwise comparisons.",
    solution:
      "**Why BLEU/ROUGE are weak.** Both are **n-gram overlap** against references — BLEU is precision-oriented with a brevity penalty (machine translation), ROUGE is recall-oriented (summarization). They reward surface form and **penalize valid paraphrases** (a correct answer in different words scores low), miss semantics and factuality, and correlate weakly with human judgment on open-ended generation. Fine as cheap regression signals; poor as ground truth.\n\n**Exact match / F1.** For short-answer QA, **normalized exact match** (lowercase, strip articles/punctuation) and **token-level F1** are standard (SQuAD). Simple and reliable when the answer space is narrow, brittle when it is not.\n\n**pass@k for code.** Generate $n \\ge k$ samples per problem, run unit tests, and count the $c$ that pass. pass@k is the probability that at least one of $k$ random samples is correct. The naive estimate $1-(1-\\hat{p})^k$ is **biased** with high variance; the Codex paper's **unbiased estimator** is\n$$\\text{pass@}k = \\mathbb{E}_{\\text{problems}}\\left[\\, 1 - \\frac{\\binom{n-c}{k}}{\\binom{n}{k}} \\,\\right]$$\ncomputed with a numerically stable product to avoid overflow. Sampling $n$ larger than $k$ and using this estimator gives a low-variance measurement.\n\n**Elo / Bradley-Terry for ranking.** To rank models from **pairwise** win/loss (human or judge votes), fit the **Bradley-Terry** model, which assigns each model a strength $\\beta_i$ with\n$$P(i \\succ j) = \\frac{1}{1 + e^{-(\\beta_i - \\beta_j)}} = \\frac{e^{\\beta_i}}{e^{\\beta_i} + e^{\\beta_j}}$$\nfit by maximum likelihood over all recorded comparisons. **Elo** is the online approximation: after a game, $R' = R + K\\,(S - E)$ with expected score $E = \\dfrac{1}{1 + 10^{(R_{\\text{opp}} - R)/400}}$. Chatbot Arena uses exactly this to turn crowd-sourced pairwise votes into a global leaderboard — always report **confidence intervals** on the ratings, since the ordering between close models is frequently not significant.",
    keyInsight:
      "n-gram metrics (BLEU/ROUGE) punish paraphrase and miss semantics; use exact-match/F1 for narrow QA, the Codex unbiased pass@k estimator for code, and Bradley-Terry/Elo (with CIs) to rank models from pairwise votes.",
  },
  {
    id: "eval-offline-vs-online",
    track: "evaluation",
    title: "Offline vs Online Evaluation",
    difficulty: "core",
    tags: ["A/B testing", "proxy metrics", "off-policy"],
    source: "ML systems interview",
    prompt:
      "When should you trust an offline benchmark vs an online A/B test? Why do offline gains often fail to transfer online?",
    solution:
      "**The two regimes.** **Offline** evaluation scores a model on a fixed logged dataset with proxy metrics (AUC, NDCG, accuracy, BLEU) — cheap, fast, reproducible, great for iteration and gating. **Online** evaluation runs the model on live traffic in an **A/B test** and measures the true objective (engagement, retention, revenue, task success).\n\n**Why offline gains do not always transfer.**\n- **Proxy-objective gap (Goodhart).** The offline metric is a stand-in for what you actually care about; optimizing it can diverge from the real goal (higher click-AUC but more clickbait and worse retention).\n- **Selection/exposure bias in logs.** You only observe outcomes for items the *old* system chose to show, so a new policy that surfaces different items is scored on a biased, partly counterfactual distribution. **Off-policy estimators** (IPS, doubly-robust) try to correct with importance weights, but the variance explodes when the policies differ a lot.\n- **Feedback loops and behavior change.** Deploying the model changes user behavior and the future data distribution — an effect no static dataset can capture.\n- **Train/serve skew** and stale features widen the gap further.\n\n**When to trust which.** Use offline for **fast, cheap iteration** and as a **gate** (a model that regresses offline rarely deserves an online test). Trust the **online A/B test as the source of truth** whenever the decision affects real user behavior or long-term outcomes — i.e. for the final ship decision. The healthy loop is: iterate offline, gate on a golden set, confirm online — and continuously check how well the offline proxy *predicts* online movement so you know how much to trust it next time.",
    keyInsight:
      "Offline metrics are cheap proxies distorted by Goodhart and logged-exposure bias; use them to iterate and gate, but let the online A/B test — which captures real behavior and feedback loops — make the ship decision.",
  },
  {
    id: "eval-calibration",
    track: "evaluation",
    title: "Model Calibration: ECE & Temperature Scaling",
    difficulty: "core",
    tags: ["calibration", "ECE", "temperature scaling"],
    source: "On Calibration of Modern Neural Networks (Guo et al., 2017)",
    prompt:
      "Define model calibration. How do you measure it (ECE, reliability diagrams) and fix it (temperature scaling)? Why can a model be accurate but miscalibrated?",
    solution:
      "**Definition.** A model is **calibrated** if its stated confidence matches empirical accuracy: among all predictions made with confidence $p$, a fraction $p$ should be correct. Calibration is about the *quality of the probabilities*, which is separate from *accuracy* (whether the top choice is right).\n\n**Why accuracy differs from calibration.** Accuracy only looks at the argmax; calibration looks at the probability attached to it. A model can be **accurate but overconfident** — modern deep nets famously push probabilities toward 0/1 and report 99% when they are right 90% of the time — or well-ordered yet miscalibrated in magnitude. Two models with identical accuracy can have very different ECE.\n\n**Measuring it.**\n- **Reliability diagram**: bin predictions by confidence, plot **accuracy vs mean confidence** per bin; the diagonal is perfect calibration, bars below it indicate overconfidence.\n- **Expected Calibration Error (ECE)**: the average gap between confidence and accuracy, weighted by bin population:\n$$\\text{ECE} = \\sum_{m=1}^{M} \\frac{|B_m|}{n}\\,\\big|\\, \\text{acc}(B_m) - \\text{conf}(B_m) \\,\\big|$$\nAlso report the **Brier score** or **NLL**, which are proper scoring rules and do not depend on binning.\n\n**Fixing it: temperature scaling.** A one-parameter **post-hoc** fix: divide logits by a learned temperature $T$ before the softmax, $\\hat{p} = \\text{softmax}(z/T)$, choosing $T$ to minimize validation NLL. $T > 1$ softens overconfident probabilities. Crucially it **leaves accuracy unchanged** — a single positive $T$ does not move the argmax — it only rescales confidence. For richer miscalibration use Platt scaling or isotonic regression. Always fit on a held-out split, and remember calibration can **drift** in production and need re-fitting.",
    keyInsight:
      "Calibration measures whether stated confidence matches accuracy (via reliability diagrams / ECE) and is orthogonal to accuracy — deep nets are often accurate yet overconfident; temperature scaling rescales confidence without changing the argmax.",
  },
  {
    id: "eval-inter-annotator-agreement",
    track: "evaluation",
    title: "Human Eval & Inter-Annotator Agreement",
    difficulty: "core",
    tags: ["human eval", "kappa", "krippendorff alpha"],
    source: "Krippendorff / Cohen's kappa",
    prompt:
      "You are running a human evaluation. How do you measure inter-annotator agreement, and what do you do when annotators disagree?",
    solution:
      "Human labels are only as trustworthy as the **agreement between annotators**; low agreement means your metric is measuring annotator noise, not model quality.\n\n**Chance-corrected agreement.**\n- **Cohen's $\\kappa$** (two annotators, categorical): $\\kappa = \\dfrac{p_o - p_e}{1 - p_e}$, where $p_o$ is observed agreement and $p_e$ the agreement expected by chance from each rater's marginals. $\\kappa = 1$ is perfect, $0$ is chance-level, $< 0$ is worse than chance.\n- **Fleiss' $\\kappa$**: generalizes to **more than two** raters (not necessarily the same ones per item).\n- **Krippendorff's $\\alpha$**: the most general — any number of annotators, **missing data**, and any measurement level (nominal/ordinal/interval) via a distance metric: $\\alpha = 1 - \\dfrac{D_o}{D_e}$ (observed vs expected disagreement).\n\n**Interpreting $\\kappa$ (Landis & Koch):**\n\n| $\\kappa$ | Agreement |\n| --- | --- |\n| < 0.20 | slight |\n| 0.21 - 0.40 | fair |\n| 0.41 - 0.60 | moderate |\n| 0.61 - 0.80 | substantial |\n| 0.81 - 1.00 | almost perfect |\n\n**Why raw % agreement misleads:** on a skewed label distribution, two raters can agree 95% of the time purely by both guessing the majority class; $\\kappa$ and $\\alpha$ subtract that chance floor.\n\n**Guidelines and reconciliation.** Low agreement is usually a **guidelines problem**, not bad annotators: write precise definitions with positive and negative examples and explicit edge-case rules, run a calibration round, and iterate the rubric. Reconcile disagreements by **adjudication** (a senior annotator or discussion-to-consensus) or **majority vote**, and report the label set together with its agreement so downstream consumers know the ceiling on achievable model accuracy.",
    keyInsight:
      "Report chance-corrected agreement (Cohen/Fleiss kappa, Krippendorff alpha), not raw % — low agreement means the rubric, not the model, is the problem; fix it with sharper guidelines and adjudicate residual disagreement.",
  },
  {
    id: "eval-statistical-significance",
    track: "evaluation",
    title: "Statistical Significance for Model Comparison",
    difficulty: "elite",
    tags: ["bootstrap", "paired tests", "McNemar"],
    source: "Dror et al., 2018 (statistical significance in NLP)",
    prompt:
      "Model A scores 71.2% and model B 70.1% on a 2,000-item benchmark. Is the difference real? Lay out the right statistical machinery — bootstrap CIs, paired tests, and McNemar.",
    solution:
      "A 1.1-point gap on 2,000 items may be **within noise**. Treat eval numbers as estimates with uncertainty, and exploit the fact that both models were scored on the **same items** (paired data) for more power.\n\n**Bootstrap confidence intervals.** Resample the $n$ test items **with replacement** $B$ times (say $B = 10{,}000$); recompute each model's metric on each resample; the 2.5 / 97.5 percentiles give a CI on the score. Crucially, bootstrap the **per-item difference** $A_i - B_i$ on the *same* resampled indices — if that difference's CI excludes 0, the gap is significant. This is nonparametric and works for any metric (accuracy, F1, BLEU).\n\n**Paired tests (use the pairing!).** Comparing on identical items removes item-difficulty variance, so paired tests are far more powerful than treating the two runs as independent samples:\n- **Paired permutation test**: randomly swap each item's A/B labels and recompute the difference to build a null distribution.\n- **Wilcoxon signed-rank** or a paired $t$-test on the per-item score differences.\n\n**McNemar's test** (two classifiers, binary correct/incorrect on the same items). Build the discordant counts: $b$ = A correct & B wrong, $c$ = A wrong & B correct. Items both get right, or both get wrong, carry **no** information; only the discordant pairs do:\n$$\\chi^2 = \\frac{(b - c)^2}{b + c}$$\ncompared against $\\chi^2_1$ — use the exact binomial when $b + c$ is small. Example: if only $b + c = 40$ items differ, even a visible accuracy gap can fail to reach significance.\n\n**Practicalities.** Report **effect size and CI**, not just a p-value; when comparing across **many benchmarks**, correct for multiple comparisons (Bonferroni / FDR); and respect the resolution floor — a few-hundred-item benchmark simply cannot certify a 1% difference.",
    keyInsight:
      "Eval scores are estimates: bootstrap a CI on the per-item difference, exploit pairing (permutation/Wilcoxon, or McNemar on discordant pairs) for power, and accept that small test sets cannot resolve sub-point gaps.",
  },
  {
    id: "eval-red-teaming-safety",
    track: "evaluation",
    title: "Red-Teaming & Safety/Robustness Evaluation",
    difficulty: "hard",
    tags: ["red-teaming", "safety", "adversarial", "robustness"],
    source: "Red Teaming Language Models with Language Models (Perez et al., 2022)",
    prompt:
      "Design a red-teaming / safety evaluation for a deployed LLM. How do you balance coverage vs cost, and how does automated red-teaming work?",
    solution:
      "**Goal.** Safety/robustness evaluation measures how often the model can be **made to misbehave** (produce harmful, unsafe, or policy-violating output) under adversarial pressure — and, symmetrically, how often it **over-refuses** benign requests. Both directions matter: a model that refuses everything is 'safe' and useless.\n\n**Threat surface.** Direct harmful requests, **jailbreaks** (roleplay, hypotheticals, obfuscation/encoding, many-shot jailbreaking), **prompt injection** (adversarial instructions hidden in retrieved or tool content), and distribution-shift robustness (typos, translations, unusual formats).\n\n**Coverage vs cost.** **Manual** red-teaming by experts is high-quality and creative but expensive and low-throughput — it cannot cover a broad harm taxonomy. **Automated** red-teaming scales coverage cheaply. The practical answer is a **taxonomy-driven** program: enumerate harm categories, ensure each is covered, and use automation for breadth with human review for depth on the worst findings.\n\n**Automated red-teaming loop.**\n1. A **generator/attacker model** produces diverse adversarial prompts for a target harm (optionally optimized via RL or search to maximize elicited harm, or diversity-sampled to widen coverage — 'red-teaming LMs with LMs').\n2. The **target model** responds.\n3. A **classifier/judge** scores whether the response is harmful (and whether a refusal was warranted).\n4. Successful attacks are clustered, reviewed, folded back into training (RLHF / safety fine-tuning), and added to a **regression suite**.\n\n**Metrics.**\n- **Attack success rate (ASR)** per harm category and overall.\n- **Coverage** across the taxonomy — do not let a low aggregate ASR hide untested categories.\n- **Over-refusal / false-refusal rate** on a benign control set (the helpful-harmless tradeoff).\n- **Robustness** of these rates under perturbation.\n\n**Regression.** Every discovered jailbreak becomes a **permanent test case**, so patched vulnerabilities cannot silently reopen — the same golden-set discipline, applied to safety.",
    keyInsight:
      "Measure both attack-success-rate (across a harm taxonomy) and benign over-refusal; scale coverage with an attacker-model to target to judge loop, reserve humans for depth, and lock every found jailbreak into a safety regression suite.",
  },
];
