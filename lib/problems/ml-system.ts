import type { Problem } from "../types";

export const mlSystem: Problem[] = [
  {
    id: "recommender-two-tower",
    track: "ml-system",
    title: "Design a Recommendation System",
    difficulty: "hard",
    tags: ["recommenders", "retrieval", "ranking"],
    source: "ML system design",
    prompt:
      "Design a large-scale recommender (e.g. video feed). How do you serve relevant items from billions in real time?",
    solution:
      "Use the standard **multi-stage funnel** — you cannot score billions of items per request, so narrow progressively.\n\n**1. Candidate generation (retrieval).** Reduce billions → ~hundreds cheaply. A **two-tower** model embeds users and items into a shared space; item embeddings are precomputed and indexed with **ANN** (HNSW, ScaNN). At request time, embed the user once and do approximate nearest-neighbor lookup. Combine with heuristics (trending, followed creators, collaborative filtering).\n\n**2. Ranking.** Score the few hundred candidates with a heavy model (gradient-boosted trees or a deep net) using rich cross features (user×item interactions, context, freshness). Often **multi-task**: predict click, watch-time, like, share, then combine.\n\n**3. Re-ranking / policy.** Apply business logic: diversity (avoid 10 near-duplicates), freshness, fairness, de-duplication, ads blending.\n\n**Cross-cutting concerns.** Log features at serving time to a **feature store** to avoid training–serving skew; retrain frequently to handle drift and cold items; evaluate offline (NDCG, AUC) but decide with **online A/B tests** on real engagement; watch feedback loops (the model shapes the data it later trains on).",
    keyInsight:
      "Retrieval (two-tower + ANN) → ranking (heavy multi-task model) → re-ranking (diversity/policy): each stage shrinks the candidate set so compute scales.",
  },
  {
    id: "training-serving-skew",
    track: "ml-system",
    title: "Training–Serving Skew & Feature Stores",
    difficulty: "core",
    tags: ["MLOps", "feature store", "data leakage"],
    source: "ML system design",
    prompt:
      "What is training–serving skew, and how do feature stores and point-in-time joins prevent it?",
    solution:
      "**Training–serving skew** is any discrepancy between the features a model sees in training vs production, causing a model that looks great offline to fail live. Common causes:\n- **Different code paths** computing the same feature (a Python batch job vs a Java serving path) that subtly disagree.\n- **Data leakage / time travel**: training on information that wouldn't be available at prediction time (e.g. joining a label-influenced aggregate).\n- **Distribution drift** between the training snapshot and live traffic.\n\n**Fixes.**\n- A **feature store** provides one definition of each feature, materialized to both an **offline** store (for training) and a low-latency **online** store (for serving), guaranteeing consistency.\n- **Point-in-time (as-of) joins**: when building training data, join each label with feature values **as they were at that timestamp**, never later — this prevents leakage of the future.\n- **Log-and-wait / feature logging**: log the exact features used at serving time and train on those logs, so training data is literally what production produced.\n- Monitor live feature distributions vs training (PSI, KL) to catch drift early.",
    keyInsight:
      "Serve and train from one feature definition with point-in-time joins; logging the exact served features is the surest anti-skew guarantee.",
  },
  {
    id: "ab-testing",
    track: "ml-system",
    title: "A/B Testing a Model",
    difficulty: "core",
    tags: ["experimentation", "statistics", "causality"],
    source: "ML system design",
    prompt:
      "You have a new model that beats the old one offline. How do you validate it online with an A/B test? What are the statistical and practical pitfalls?",
    solution:
      "**Setup.** Randomly assign users (not requests — to avoid inconsistent experiences) to control (old) and treatment (new). Pre-register a primary metric (e.g. long-term engagement or revenue), a **minimum detectable effect**, and compute the required sample size / duration for adequate **power** (typically 80%) at your significance level.\n\n**Analysis.** Compare the primary metric with an appropriate test (two-sample t-test / z-test for proportions), report a confidence interval, not just a p-value. Run long enough to cover weekly seasonality and **novelty effects** (users react to *any* change initially).\n\n**Pitfalls.**\n- **Peeking / multiple looks** inflate false positives — use sequential testing or fixed horizons.\n- **Multiple metrics** → correct for multiple comparisons (Bonferroni / FDR).\n- **Network / interference effects** (marketplaces, social graphs) violate the independence assumption — use cluster or geo randomization.\n- **Simpson's paradox** across segments — analyze key segments, and check the randomization is balanced.\n- **Guardrail metrics** (latency, crash rate, complaints) must not regress even if the primary metric wins.\n- Offline–online gap: a metric like AUC may improve while real engagement doesn't — the online test is the source of truth.",
    keyInsight:
      "Randomize by user, power the test up front, decide on a pre-registered primary metric — and guard against peeking, interference, and novelty.",
  },
  {
    id: "embeddings",
    track: "ml-system",
    title: "Embeddings: Why and How",
    difficulty: "core",
    tags: ["embeddings", "representation learning"],
    source: "ML system design",
    prompt:
      "What are embeddings and why are they central to modern ML systems? How would you handle a cold-start item with no interactions?",
    solution:
      "An **embedding** maps a discrete or high-dimensional object (word, user, product, image) to a dense low-dimensional vector where **geometric proximity encodes semantic similarity**. They solve two problems: the curse of dimensionality of one-hot encodings (billions of sparse dims → a few hundred dense ones) and generalization (similar items share nearby vectors, so signal transfers between them).\n\nThey're learned as a **lookup table** trained end-to-end (e.g. via a prediction task, contrastive/two-tower objective, or matrix factorization), and power retrieval (ANN search), ranking features, and transfer learning.\n\n**Cold start.** A brand-new item has no learned embedding. Options:\n- **Content-based fallback**: derive an embedding from the item's *features* (text, image, category) via a content encoder, so new items land in the right neighborhood immediately.\n- **Hybrid model**: combine collaborative (interaction-based) and content-based signals so the system degrades gracefully to content when interactions are absent.\n- **Exploration**: deliberately show new items to gather interaction data (bandit/exploration policies), then let the learned embedding take over.\n- **Hashing / bucketing** for unseen categorical IDs to avoid OOV crashes.",
    keyInsight:
      "Embeddings turn sparse IDs into a dense space where distance = similarity; cold-start is solved by falling back to content features until interactions accrue.",
  },
  {
    id: "data-drift-monitoring",
    track: "ml-system",
    title: "Monitoring Models in Production",
    difficulty: "core",
    tags: ["monitoring", "drift", "MLOps"],
    source: "ML system design",
    prompt:
      "A model performed well at launch but degrades over weeks. What kinds of drift cause this, and how do you detect and respond?",
    solution:
      "**Types of drift.**\n- **Covariate/data drift**: the input distribution $P(x)$ shifts (new user demographics, a changed upstream feature), even if the relationship is stable.\n- **Concept drift**: the relationship $P(y\\mid x)$ itself changes (fraud tactics evolve, user tastes shift) — the most damaging.\n- **Label drift / prior shift**: the base rate $P(y)$ moves (seasonality).\n- **Upstream data quality**: a pipeline bug, unit change, or newly-null feature silently corrupts inputs.\n\n**Detection.**\n- Track **input feature distributions** vs a training baseline (PSI, KL divergence, KS test) — catches drift *before* labels arrive.\n- Track **prediction distribution** shifts.\n- Once labels land (possibly delayed), track live accuracy/AUC/calibration over rolling windows.\n- Data-quality checks: null rates, ranges, schema, freshness.\n\n**Response.**\n- **Automated retraining** on recent data (scheduled or drift-triggered); keep a champion/challenger setup.\n- **Alerting** on guardrails; a **rollback** path to the previous model.\n- Recalibrate probabilities (Platt/isotonic) if only calibration drifted.\n- Investigate root cause — drift is often an upstream data bug, not genuine world change.",
    keyInsight:
      "Distinguish covariate drift P(x) from concept drift P(y|x); monitor input distributions to catch problems before delayed labels, and keep an automated retrain + rollback path.",
  },
  {
    id: "llm-serving-cost",
    track: "ml-system",
    title: "Serving an LLM at Low Latency and Cost",
    difficulty: "hard",
    tags: ["LLM", "inference", "systems"],
    source: "ML system design",
    prompt:
      "How would you serve a large language model with acceptable latency and cost at scale? Name the main levers.",
    solution:
      "LLM inference has two distinct phases: a compute-bound **prefill** (process the prompt) and a memory-bandwidth-bound **decode** (generate tokens one at a time). The levers:\n\n**Throughput / batching.**\n- **Continuous (in-flight) batching**: merge requests dynamically as sequences finish, keeping the GPU busy — the single biggest throughput win (vLLM-style).\n- **KV-cache management**: cache past keys/values so each new token is $O(1)$ not $O(n)$; **PagedAttention** stores it in non-contiguous pages to cut fragmentation and fit more concurrent sequences.\n\n**Latency.**\n- **Quantization** (INT8/FP8/4-bit) shrinks weights and speeds memory-bound decode with minimal quality loss.\n- **Speculative decoding**: a small draft model proposes several tokens, the big model verifies them in one pass — multiple tokens per step.\n- **FlashAttention** for memory-efficient exact attention; tensor/pipeline parallelism to fit large models across GPUs.\n\n**Cost / product.**\n- **Prompt caching** for shared prefixes (system prompts, RAG context).\n- **Model routing / cascades**: send easy queries to a small cheap model, hard ones to the large model.\n- **Distillation** into a smaller task-specific model where quality permits.\n\nDesign to the SLA: interactive chat optimizes time-to-first-token (prefill + streaming); batch jobs optimize total throughput.",
    keyInsight:
      "Prefill is compute-bound, decode memory-bound; continuous batching + paged KV-cache drive throughput, while quantization and speculative decoding cut per-token latency.",
  },
];
