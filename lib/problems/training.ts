import type { Problem } from "../types";

export const training: Problem[] = [
  {
    id: "train-lr-warmup-schedule",
    track: "training",
    title: "Learning-Rate Warmup & Decay Schedules",
    difficulty: "warmup",
    tags: ["optimization", "learning rate", "schedules"],
    source: "Attention Is All You Need (Vaswani et al., 2017)",
    prompt:
      "Why do transformer / Adam training runs almost always use a learning-rate **warmup**, and what schedule follows it? Contrast linear-warmup + cosine decay with the original transformer inverse-sqrt schedule.",
    solution:
      "A schedule ramps the learning rate **up** from near zero over the first few hundred–thousand steps (warmup), then **decays** it toward the end of training.\n\n**Why warmup.**\n1. **Adam's variance at init.** Adam divides the gradient by $\\sqrt{\\hat v_t}$, an estimate of the second moment. Early on it is computed from a handful of samples, so it has enormous variance — the effective per-parameter step size is unreliable and can be wildly too large. Warmup keeps steps small until $\\hat v_t$ stabilizes (this is exactly the pathology RAdam formalizes and rectifies).\n2. **Bad early geometry.** At initialization the model is far from any good region and gradients are large; with LayerNorm + residual streams, a big first step can blow up activations and diverge. Small early steps keep the trajectory in a well-behaved region.\n\n**Decay after warmup.** The modern default is **cosine decay** to a small floor:\n$$\\eta(t) = \\eta_{\\min} + \\tfrac{1}{2}(\\eta_{\\max}-\\eta_{\\min})\\left(1 + \\cos\\frac{\\pi t}{T}\\right)$$\nIt spends time near the peak LR then anneals smoothly, which empirically finds flatter minima. Linear decay to $0$ is a common alternative.\n\n**Original transformer schedule** (Vaswani): linear warmup then **inverse-square-root** decay,\n$$\\eta = d_{\\text{model}}^{-0.5}\\cdot\\min\\!\\left(t^{-0.5},\\; t\\cdot t_{\\text{warmup}}^{-1.5}\\right).$$\n\n**Practical notes.** Cosine needs the total step budget $T$ up front — stop early and you never reach $\\eta_{\\min}$, so it is awkward for open-ended runs (WSD / warmup-stable-decay schedules decouple this). Warmup length is typically a small percentage of total steps and should grow with batch size (pairs with the linear LR-scaling rule).",
    keyInsight:
      "Warmup exists because Adam's second-moment estimate is high-variance at init and early gradients are large; ramp up, then cosine-decay to a floor.",
  },
  {
    id: "train-determinism-reproducibility",
    track: "training",
    title: "Checkpointing, Determinism & Reproducibility",
    difficulty: "warmup",
    tags: ["reproducibility", "checkpointing", "determinism"],
    source: "ML systems interview",
    prompt:
      "How do you make a training run **reproducible** and correctly **resumable** from a checkpoint? Exactly what state must be saved, and what is the cost of forcing fully deterministic kernels?",
    solution:
      "**Reproducibility (same run twice → same result).** Seed *every* source of randomness, not just one:\n- Python `random`, NumPy, and PyTorch CPU + CUDA (`torch.manual_seed`, `torch.cuda.manual_seed_all`), plus `PYTHONHASHSEED`.\n- The **DataLoader**: worker processes each need a derived seed (`worker_init_fn` / a `generator`) or shuffling and augmentation diverge.\n\n**Deterministic kernels.** `torch.use_deterministic_algorithms(True)`, `cudnn.deterministic=True`, `cudnn.benchmark=False`, and set `CUBLAS_WORKSPACE_CONFIG`. **Trade-off:** several fast kernels use `atomicAdd`, whose float accumulation order is nondeterministic; the deterministic replacements are slower or, for some ops, unavailable. Even fully seeded, **multi-GPU all-reduce** reorders non-associative float additions, so bitwise determinism across ranks is not guaranteed.\n\n**Correct resume.** A resumed run equals an uninterrupted one only if you checkpoint the *entire* training state:\n\n| Must save | Why |\n|---|---|\n| Model weights | obvious |\n| Optimizer state ($m$, $v$, step count) | Adam momentum is stateful; dropping it perturbs the trajectory |\n| LR scheduler state | otherwise LR resets and the schedule is wrong |\n| AMP grad-scaler state | preserves the fp16 loss-scale factor |\n| RNG states (python/numpy/torch cpu+cuda) | dropout, augmentation, sampling continue identically |\n| DataLoader / sampler position + epoch | avoid re-seeing or skipping samples; shuffle seed depends on epoch |\n| Global step / epoch + config | anchors everything above |\n\n**Common bug:** restoring weights but resetting the LR scheduler or RNG — the run looks fine but is *not* equivalent, and the loss curve visibly kinks at the resume point.\n\n**Practice.** Save every $N$ steps; keep last-$k$ + best; **atomic write** (temp file then rename) so a crash mid-write can't corrupt the checkpoint; for FSDP/ZeRO use **sharded** (each rank saves its shard) and asynchronous checkpointing. Exact reproducibility across different GPUs / library versions is generally not achievable — target within-environment reproducibility.",
    keyInsight:
      "Resuming correctly means checkpointing weights + optimizer + scheduler + grad-scaler + all RNG + dataloader position — not just the weights; and determinism trades speed for exactness.",
  },
  {
    id: "train-mixed-precision",
    track: "training",
    title: "Mixed-Precision Training: fp16 vs bf16",
    difficulty: "core",
    tags: ["mixed precision", "numerics", "loss scaling"],
    source: "Mixed Precision Training (Micikevicius et al., 2018)",
    prompt:
      "Explain mixed-precision training. Contrast **fp16** and **bf16**, and explain precisely why fp16 needs dynamic loss scaling but bf16 usually does not. What is the role of the **master fp32 weights**?",
    solution:
      "Mixed precision runs the **forward and backward passes in a 16-bit format** (fp16 or bf16) — halving activation/gradient memory and using tensor cores — while keeping a **master copy of the weights in fp32** for the optimizer update.\n\n**The formats** (1 sign bit + exponent + mantissa):\n\n| Format | Exp bits | Mantissa | Max value | Smallest normal |\n|---|---|---|---|---|\n| fp32 | 8 | 23 | $\\sim3.4\\times10^{38}$ | $\\sim1.2\\times10^{-38}$ |\n| fp16 | 5 | 10 | $65504$ | $\\sim6\\times10^{-5}$ |\n| bf16 | 8 | 7 | $\\sim3.4\\times10^{38}$ | $\\sim1.2\\times10^{-38}$ |\n\n**Why fp16 needs loss scaling.** Gradients are frequently tiny ($10^{-7}$–$10^{-4}$). fp16's smallest normal is $\\sim6\\times10^{-5}$, so a large fraction of gradient values **underflow to zero** and the signal is lost. Fix: multiply the loss by a scale $S$ (e.g. $2^{15}$) before `backward()`; by the chain rule every gradient is scaled by $S$ into fp16's representable range; **unscale** (divide by $S$) in fp32 before the optimizer step. **Dynamic loss scaling** tunes $S$ automatically: if a step produces `inf`/`NaN` (overflow) it is skipped and $S$ is halved; after many clean steps $S$ is doubled.\n\n**Why bf16 usually does not.** bf16 keeps fp32's **8-bit exponent**, so its dynamic range is the same as fp32 — gradients essentially never underflow or overflow, so loss scaling is unnecessary. The price is only **7 mantissa bits** (~2 decimal digits) vs fp16's 10, but deep-learning training tolerates coarse precision far better than it tolerates a narrow range. This is why bf16 is the default on modern accelerators.\n\n**Master fp32 weights.** The update $w \\leftarrow w - \\eta g$ can be as small as $\\eta g \\sim 10^{-6}$ while $w \\sim 1$. In fp16 the spacing between representable values near $1$ is $\\sim10^{-3}$, so adding $10^{-6}$ **rounds straight back to $1$** — the update is *swamped* and lost. Keeping the weights and the update in fp32 preserves these small increments; the fp32 master is cast down to bf16/fp16 only to feed the next forward pass.",
    keyInsight:
      "bf16 shares fp32's exponent range so gradients don't under/overflow (no loss scaling); fp16's narrow range forces dynamic loss scaling — and fp32 master weights stop tiny updates from being rounded away.",
  },
  {
    id: "train-gradient-accumulation",
    track: "training",
    title: "Gradient Accumulation & Effective Batch Size",
    difficulty: "core",
    tags: ["gradient accumulation", "batch size", "optimization"],
    source: "ML systems interview",
    prompt:
      "Your GPU only fits a micro-batch of 8, but you want an effective batch of 512. Explain gradient accumulation, and the three things people get wrong: the **loss reduction**, **BatchNorm**, and **LR scaling**.",
    solution:
      "**Mechanism.** Gradients live in `param.grad` and *accumulate* (add) across `backward()` calls until you zero them. So run $K$ micro-batches, calling `backward()` each time, and step the optimizer only once every $K$ steps:\n\n```python\noptimizer.zero_grad()\nfor i, batch in enumerate(loader):\n    loss = model(batch).loss / ACCUM_STEPS   # <-- scale the loss\n    loss.backward()                          # grads accumulate in .grad\n    if (i + 1) % ACCUM_STEPS == 0:\n        optimizer.step()\n        optimizer.zero_grad()\n```\n\nThe **effective batch size** is\n$$B_{\\text{eff}} = b_{\\text{micro}} \\times K \\times N_{\\text{data-parallel}}.$$\nActivations are only ever held for one micro-batch, so memory stays flat while the batch grows.\n\n**1. Loss reduction (the classic bug).** If the per-micro-batch loss is a **mean**, then $\\sum_{k=1}^{K}\\nabla \\bar L_k = K\\cdot(\\text{avg gradient})$, which is $K\\times$ too large — equivalent to secretly multiplying the LR by $K$. Divide the loss by `ACCUM_STEPS` (as above) so the accumulated gradient equals the gradient of the mean over the full batch.\n\n**2. BatchNorm.** Accumulation is mathematically identical to one big batch **only for per-sample-independent computation**. BatchNorm is not: its statistics are computed over the micro-batch of 8, *not* the 512 you are simulating, so normalization differs from a true batch-512 step. Remedies: use **LayerNorm/GroupNorm** (batch-independent), **SyncBatchNorm**, or accept the discrepancy. (Dropout also differs per micro-batch, but that is just extra stochasticity and harmless.)\n\n**3. LR scaling.** A larger batch gives a lower-variance gradient estimate, so you can afford a larger step. The **linear scaling rule** (Goyal et al.): scale $\\eta \\propto B_{\\text{eff}}$, combined with warmup to survive the aggressive early steps; for Adam a $\\sqrt{B}$ rule is sometimes used instead. Failing to raise the LR wastes the variance reduction the big batch bought you.",
    keyInsight:
      "Accumulate grads over K micro-batches and step once — but divide the mean loss by K, remember BatchNorm still only sees the micro-batch, and scale the LR up with the effective batch.",
  },
  {
    id: "train-activation-checkpointing",
    track: "training",
    title: "Activation / Gradient Checkpointing",
    difficulty: "core",
    tags: ["memory", "activation checkpointing", "backprop"],
    source: "Training Deep Nets with Sublinear Memory Cost (Chen et al., 2016)",
    prompt:
      "Backprop must retain forward activations to compute gradients, and for deep or long-context models these dominate memory. Explain **activation checkpointing** and the $O(\\sqrt{n})$ memory result, including the compute cost.",
    solution:
      "**Why activations dominate.** The backward pass needs each layer's forward activation to compute its gradient (chain rule). Storing all of them costs memory linear in depth (and, for attention, in sequence length) — often larger than the weights themselves for long-context transformers.\n\n**The idea.** In the forward pass, keep activations only at a few **checkpoint** boundaries and *discard the rest*. In the backward pass, when a discarded activation is needed, **recompute** it by re-running the forward from the nearest stored checkpoint. This trades extra compute for much lower memory.\n\n**The $\\sqrt{n}$ math.** Split $n$ layers into $\\sqrt{n}$ segments of $\\sqrt{n}$ layers. Store only the $\\sqrt{n}$ segment boundaries $\\Rightarrow O(\\sqrt{n})$ checkpoint memory. During backward, recompute **one segment at a time**, materializing at most $\\sqrt{n}$ activations at once $\\Rightarrow$ peak activation memory $O(\\sqrt{n})$ instead of $O(n)$.\n\n**Compute cost.** Every discarded activation is recomputed exactly once, i.e. **one extra forward pass**. Since a training step is normally forward + backward $\\approx 1 + 2 = 3$ units of forward-cost, adding one recompute makes it $\\approx 4$ — roughly a **33% compute overhead** for a large memory reduction.\n\n**In practice.** Transformers checkpoint at the **per-block** granularity (PyTorch `checkpoint` / `checkpoint_sequential`), which is what makes long sequences and large batches fit. **Selective / selective activation recomputation** (Korthikanti et al.) goes further: keep the cheap-to-store activations and only recompute the expensive-to-store ones (e.g. avoid recomputing the big attention matmul), getting most of the memory win for a fraction of the overhead. It composes cleanly with mixed precision, ZeRO/FSDP, and tensor/pipeline parallelism.",
    keyInsight:
      "Store activations only at √n checkpoints and recompute the rest in backward: activation memory drops from O(n) to O(√n) for one extra forward pass (~33% compute).",
  },
  {
    id: "train-lora-qlora",
    track: "training",
    title: "Parameter-Efficient Fine-Tuning: LoRA & QLoRA",
    difficulty: "core",
    tags: ["PEFT", "LoRA", "QLoRA", "fine-tuning"],
    source: "LoRA (Hu et al., 2021)",
    prompt:
      "Explain **LoRA** and **QLoRA**. Why is a *low-rank* update sufficient, how many parameters do you actually train, and what specifically does QLoRA add on top?",
    solution:
      "**Full fine-tuning is expensive** not because of the forward pass but because Adam must store first and second moments for *every* weight — roughly $12$ bytes/param of optimizer state on top of the model. LoRA removes almost all of it.\n\n**LoRA.** Freeze the pretrained weight $W \\in \\mathbb{R}^{d\\times k}$ and learn a **low-rank update**\n$$W' = W + \\Delta W, \\qquad \\Delta W = \\tfrac{\\alpha}{r} B A,\\quad B\\in\\mathbb{R}^{d\\times r},\\; A\\in\\mathbb{R}^{r\\times k},\\; r\\ll\\min(d,k).$$\nOnly $A$ and $B$ are trained. Initialize $B=0$ so $\\Delta W=0$ at the start (training begins exactly at the pretrained model) and $A$ with small random values. The forward pass is $h = Wx + \\tfrac{\\alpha}{r}B(Ax)$.\n\n**Trainable parameter count.** $r(d+k)$ instead of $d\\cdot k$. For $d=k=4096,\\ r=8$: $2\\cdot8\\cdot4096 \\approx 65\\text{k}$ vs $16.7\\text{M}$ — about $0.4\\%$ per matrix, and typically **well under 1%** of the model overall.\n\n**Why low rank is enough.** Adapting a well-pretrained model to a downstream task has low **intrinsic rank** — the required weight delta lives in a small subspace, so a rank-$4$ to $64$ update matches full fine-tuning on many tasks. Bonus: at inference you can **merge** $\\tfrac{\\alpha}{r}BA$ into $W$, so unlike bottleneck adapters LoRA adds **zero** serving latency.\n\n**QLoRA** stacks two ideas to fit huge models on one GPU:\n1. **4-bit NF4 base weights.** Quantize the frozen $W$ to **NormalFloat-4**, a 4-bit type whose quantization levels are the quantiles of a normal distribution (information-theoretically near-optimal for the roughly-Gaussian weights). Backprop flows *through* the frozen 4-bit weights into the bf16 LoRA adapters.\n2. **Double quantization** (quantize the per-block quantization constants) and **paged optimizers** (page optimizer state to CPU to absorb memory spikes).\n\n| Method | Trainable params | Base weights | Fits 65B on |\n|---|---|---|---|\n| Full FT | 100% (+Adam states) | bf16 | many GPUs |\n| LoRA | <1% | bf16/fp16 | fewer GPUs |\n| QLoRA | <1% | 4-bit NF4 | a single 48 GB GPU |\n\nThe base weights stay frozen and quantized; quality is preserved because gradients only train the small high-precision adapters.",
    keyInsight:
      "LoRA freezes W and learns a rank-r update BA (<1% of params, mergeable at inference); QLoRA additionally stores the frozen base in 4-bit NF4 so a 65B model fine-tunes on one GPU.",
  },
  {
    id: "train-debugging-instability",
    track: "training",
    title: "Debugging Training Instability & Low Utilization",
    difficulty: "core",
    tags: ["debugging", "stability", "MFU"],
    source: "ML systems interview",
    prompt:
      "A large run shows intermittent **loss spikes**, occasional **NaNs**, sometimes **OOMs**, and only **~25% GPU utilization**. Walk through how you diagnose and fix each.",
    solution:
      "Attack them as four separate failure modes.\n\n**1. Loss spikes / divergence.** Causes: LR too high, missing/too-short warmup, unclipped gradients, a pathological batch, or fp16 overflow. The single most useful signal is the **global gradient norm** — a spike in grad-norm reliably *precedes* the loss spike. Fixes: **gradient clipping** by global norm (e.g. $1.0$); lower the peak LR / lengthen warmup; skip-or-rollback on a detected spike; QK-LayerNorm or a **z-loss** to tame exploding logits; careful init and residual scaling. Loss spikes are common at scale (PaLM/OPT logs document them).\n\n**2. NaNs from fp16 overflow.** Attention logits or activations exceed fp16's max ($65504$) $\\to$ `inf` $\\to$ `NaN`. Diagnose with `torch.autograd.set_detect_anomaly`, and log per-layer activation/grad norms to bisect the first offending layer. Fixes: switch to **bf16** (wider range), enable **loss scaling** if staying on fp16, compute **softmax in fp32**, and clamp logits.\n\n**3. OOM.** Distinguish *steady* OOM (model genuinely too big) from *spiky* OOM (a long sequence or memory fragmentation). Levers, cheapest first: smaller micro-batch + **gradient accumulation**, **activation checkpointing**, **ZeRO/FSDP** sharding, CPU/NVMe offload, mixed precision. For fragmentation, set `PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb` and bucket by sequence length.\n\n**4. Low GPU utilization / MFU.** **Model FLOPs Utilization** $=\\dfrac{\\text{achieved FLOPs/s}}{\\text{peak FLOPs/s}}\\approx\\dfrac{6\\,N\\,(\\text{tokens/s})}{\\text{peak}}$. 25% means the GPU is starved or stalling — profile with the torch profiler / `nsys`. Usual suspects:\n- **Data pipeline** starving the GPU $\\to$ more dataloader workers, prefetch, faster storage, pre-tokenize.\n- **CPU$\\leftrightarrow$GPU sync points** (`.item()`, per-step logging, `.cpu()`) that serialize the stream $\\to$ log every $N$ steps, keep tensors on device.\n- **Communication not overlapped** with compute (DP all-reduce, ZeRO all-gather) $\\to$ bucket gradients and overlap comm with backward.\n- **Kernel inefficiency / tiny matmuls** $\\to$ fused optimizer, **FlashAttention**, larger batch so matmuls are big enough to saturate tensor cores.\n\nGood large-model runs land around 40–55% MFU; well under that is almost always input pipeline or communication, not the math.",
    keyInsight:
      "Watch grad-norm (spikes precede loss spikes) and clip; kill fp16 NaNs with bf16/fp32-softmax; fix OOM with accumulation+checkpointing+FSDP; and low MFU is nearly always the data pipeline or un-overlapped comm, not the GPU.",
  },
  {
    id: "train-parallelism-taxonomy",
    track: "training",
    title: "Data vs Tensor vs Pipeline Parallelism",
    difficulty: "hard",
    tags: ["distributed training", "parallelism", "systems"],
    source: "Megatron-LM (Shoeybi et al., 2019)",
    prompt:
      "Distinguish **data**, **tensor**, and **pipeline** parallelism. When does each apply, what is its communication pattern, and what is a **pipeline bubble**?",
    solution:
      "Three orthogonal ways to split a training job; large runs combine all three (\"3D parallelism\").\n\n**Data parallelism (DP).** Replicate the *whole model* on each GPU, split the *batch*. Each replica computes gradients on its shard, then an **all-reduce** averages gradients across replicas every step. Communication $\\approx$ the full gradient (ring all-reduce moves $\\sim 2\\frac{N-1}{N}$ params). Simple and scales throughput — but **requires the model to fit on one GPU** and is bandwidth-bound on the gradient sync.\n\n**Tensor / model parallelism (TP).** Split *individual layers* across GPUs: shard the attention and MLP weight matrices column- then row-wise (Megatron) so each GPU holds a slice of the matmul. This needs an **all-reduce (or all-gather) inside every forward and backward** of each block — two all-reduces per transformer layer. Extremely communication-heavy, so keep TP **within a node** over NVLink. Use it when a single layer is too big for one GPU.\n\n**Pipeline parallelism (PP).** Split the model **by depth** into stages, one group of layers per GPU; micro-batches flow through like an assembly line. Communication is cheap **point-to-point** activations passed between adjacent stages. This is how you span models **across nodes**.\n\n| | Splits | Comm pattern | Keep it… | Use when |\n|---|---|---|---|---|\n| DP | batch | all-reduce gradients | anywhere | model fits on 1 GPU |\n| TP | each matrix | all-reduce inside each layer | within a node | a layer too big |\n| PP | layers/stages | P2P activations | across nodes | model too deep for a node |\n\n**Pipeline bubble.** While the pipeline fills at the start and drains at the end, some stages sit idle. With $p$ stages and $m$ micro-batches the idle fraction is\n$$\\text{bubble} \\approx \\frac{p-1}{m + p - 1}.$$\nShrink it by using **more micro-batches** ($m \\gg p$) and smarter schedules (**1F1B** / interleaved), which also cut activation memory. Rule of thumb for combining: **TP within a node**, **PP across nodes**, **DP (or ZeRO) on the outside**.",
    keyInsight:
      "DP splits the batch (all-reduce grads, model must fit); TP splits each matrix (heavy intra-layer comm, keep on NVLink); PP splits layers (cheap P2P, but a (p-1)/(m+p-1) bubble you shrink with more micro-batches).",
  },
  {
    id: "train-zero-fsdp",
    track: "training",
    title: "ZeRO / FSDP Memory Sharding",
    difficulty: "hard",
    tags: ["ZeRO", "FSDP", "memory", "distributed training"],
    source: "ZeRO (Rajbhandari et al., 2020)",
    prompt:
      "Plain data-parallel replicates the optimizer states, gradients, and parameters on *every* GPU. Explain how **ZeRO stages 1–3** (and **FSDP**) shard these, and give the per-GPU memory math for a model with $\\Psi$ parameters trained with Adam in mixed precision.",
    solution:
      "**The memory bill.** Adam mixed precision costs, per parameter:\n\n| Component | Bytes/param |\n|---|---|\n| fp16 parameter | 2 |\n| fp16 gradient | 2 |\n| fp32 master weight | 4 |\n| Adam $m$ (fp32) | 4 |\n| Adam $v$ (fp32) | 4 |\n| **Total** | **16** |\n\nThe last three (the fp32 master + $m$ + $v$ = $12\\Psi$) are the **optimizer states**. Plain data-parallel replicates the whole $16\\Psi$ on *every* one of $N$ GPUs — pure waste, since each GPU only needs its slice to do the update.\n\n**ZeRO progressively shards** this redundant state across the $N$ data-parallel ranks:\n\n| Stage | Shards | Per-GPU memory |\n|---|---|---|\n| DP (baseline) | nothing | $16\\Psi$ |\n| ZeRO-1 | optimizer states | $2\\Psi + 2\\Psi + \\dfrac{12\\Psi}{N}$ |\n| ZeRO-2 | + gradients | $2\\Psi + \\dfrac{14\\Psi}{N}$ |\n| ZeRO-3 / FSDP | + parameters | $\\dfrac{16\\Psi}{N}$ |\n\n**ZeRO-3 / FSDP** hold only a $1/N$ shard of the parameters; just before a layer's forward (and again in backward) they **all-gather** that layer's full weights just-in-time, use them, then **discard** the non-owned shards. Gradients are reduce-scattered so each rank keeps only its shard. FSDP is PyTorch's native implementation of this fully-sharded (ZeRO-3) design.\n\n**Communication trade-off.** ZeRO-1/2 have essentially the **same** volume as vanilla DP (a reduce-scatter of gradients + an all-gather of the updated parameters). ZeRO-3 adds a parameter all-gather in **both** forward and backward, so $\\sim1.5\\times$ DP communication — the price for near-linear memory reduction. You overlap that all-gather with compute (prefetch the next layer) to hide most of the latency.\n\n**Concrete numbers.** A $7.5\\text{B}$-param model $\\Rightarrow 16 \\times 7.5\\text{B} = 120\\ \\text{GB}$ of model states, impossible on one 80 GB GPU. On $64$ GPUs, ZeRO-3 gives $120/64 \\approx 1.9\\ \\text{GB}$ per GPU for states — leaving room for activations and a real batch.",
    keyInsight:
      "Adam mixed precision is 16Ψ bytes (12Ψ of it optimizer state); ZeRO-1/2/3 shard optimizer→+grads→+params across N GPUs, taking per-GPU memory from 16Ψ down to 16Ψ/N — ZeRO-3/FSDP for ~1.5× the comm.",
  },
  {
    id: "train-scaling-laws-chinchilla",
    track: "training",
    title: "Scaling Laws & Compute-Optimal Training (Chinchilla)",
    difficulty: "hard",
    tags: ["scaling laws", "Chinchilla", "compute budget"],
    source: "Training Compute-Optimal LLMs (Hoffmann et al., 2022)",
    prompt:
      "Given a fixed compute budget $C$, how should you split it between model size $N$ and training tokens $D$? Derive $C\\approx 6ND$, state the Chinchilla finding, and explain what it implies about GPT-3 and about inference.",
    solution:
      "**The compute identity.** For a dense transformer, one training step costs about\n$$C \\approx 6\\,N\\,D \\ \\text{FLOPs},$$\nwhere $N$ = parameters, $D$ = tokens seen. The $6$ decomposes as $2 \\times 3$: each parameter does one **multiply-add** per token ($\\times 2$ FLOPs), and the **backward pass costs $2\\times$ the forward** (gradients w.r.t. both inputs and weights), so forward+backward $= 3\\times$ forward. Hence forward $\\approx 2ND$, backward $\\approx 4ND$.\n\n**Chinchilla's fit.** Model the loss as\n$$L(N, D) = E + \\frac{A}{N^{\\alpha}} + \\frac{B}{D^{\\beta}},$$\nan irreducible term $E$ plus power-law penalties for finite model and finite data. Minimizing $L$ subject to the constraint $C = 6ND$ gives\n$$N_{\\text{opt}} \\propto C^{a},\\qquad D_{\\text{opt}} \\propto C^{b},\\qquad a \\approx b \\approx 0.5.$$\nSo for each extra unit of compute you should grow **model size and tokens roughly equally**. The empirical compute-optimal ratio is about\n$$\\boxed{D/N \\approx 20\\ \\text{tokens per parameter}.}$$\n\n**Implication for GPT-3.** GPT-3 was $175\\text{B}$ params trained on $\\sim300\\text{B}$ tokens $\\Rightarrow \\sim1.7$ tokens/param — *massively* undertrained relative to $20$. Chinchilla ($70\\text{B}$ params, $1.4\\text{T}$ tokens $= 20$/param) **beat** the $280\\text{B}$ Gopher at the *same* compute, showing the earlier Kaplan-era recipe over-invested in parameters and starved models of data.\n\n| Model | Params | Tokens | Tokens/param |\n|---|---|---|---|\n| GPT-3 | 175B | ~300B | ~1.7 |\n| Gopher | 280B | 300B | ~1.1 |\n| Chinchilla | 70B | 1.4T | 20 |\n\n**The inference caveat.** \"Compute-optimal\" counts **training** FLOPs only. If you will serve the model to millions of users, inference cost dominates lifetime compute, so you deliberately **overtrain a *smaller* model** far past $20$ tokens/param (e.g. Llama-style). Training is then sub-optimal, but the resulting model is smaller and cheaper on every single inference call — the right global optimum once serving is included.",
    keyInsight:
      "C ≈ 6ND, and for fixed C you scale params and tokens ~equally (≈20 tokens/param); GPT-3 was undertrained, but if you serve a lot you overtrain a smaller model to save inference.",
  },
  {
    id: "train-rlhf-pipeline",
    track: "training",
    title: "The RLHF Pipeline & the KL Penalty",
    difficulty: "hard",
    tags: ["RLHF", "PPO", "alignment"],
    source: "InstructGPT (Ouyang et al., 2022)",
    prompt:
      "Describe the three-stage **RLHF** pipeline (SFT $\\to$ reward model $\\to$ PPO). Write the PPO objective with its **KL penalty** and explain precisely why the KL term is necessary.",
    solution:
      "**Stage 1 — Supervised fine-tuning (SFT).** Fine-tune the pretrained LM on curated high-quality demonstrations to get $\\pi^{\\text{SFT}}$. This is the launch point and, crucially, the **reference policy** $\\pi_{\\text{ref}}$ used later.\n\n**Stage 2 — Reward model (RM).** Collect human **preference pairs**: for a prompt $x$, show two responses and record which the labeler prefers, $y_w \\succ y_l$. Train a scalar reward $r_\\phi(x,y)$ (usually the SFT model with a scalar head) under the **Bradley–Terry** model:\n$$\\mathcal{L}_{\\text{RM}} = -\\,\\mathbb{E}_{(x,y_w,y_l)}\\big[\\log \\sigma\\big(r_\\phi(x,y_w) - r_\\phi(x,y_l)\\big)\\big].$$\nPreferences are cheaper and more reliable than absolute-score labels, which is why the RM learns from *comparisons*.\n\n**Stage 3 — PPO.** Optimize the policy $\\pi_\\theta$ to earn reward while staying near the reference:\n$$\\max_{\\theta}\\ \\mathbb{E}_{x,\\,y\\sim\\pi_\\theta}\\Big[\\, r_\\phi(x,y) \\;-\\; \\beta\\,\\mathrm{KL}\\big(\\pi_\\theta(\\cdot\\mid x)\\,\\|\\,\\pi_{\\text{ref}}(\\cdot\\mid x)\\big)\\Big].$$\nIn practice the KL is folded into a **per-token reward**:\n$$r_{\\text{total}}(x,y) = r_\\phi(x,y) - \\beta\\,\\log\\frac{\\pi_\\theta(y\\mid x)}{\\pi_{\\text{ref}}(y\\mid x)},$$\nand PPO's clipped surrogate maximizes it using a value network for advantages.\n\n**Why the KL term is essential.**\n1. **Reward hacking (Goodhart).** $r_\\phi$ is an *imperfect proxy* trained on finite data. Without a leash, PPO discovers adversarial inputs that score high on the RM but are degenerate — repetition, sycophancy, exploiting RM blind spots. The KL penalty bounds how far the policy can drift to find these exploits.\n2. **The RM is only valid on-distribution.** It was trained on samples near $\\pi^{\\text{SFT}}$; its scores on wildly off-distribution text are meaningless. KL keeps generations in the region where the RM's judgments are trustworthy.\n3. **Preserve capability and diversity.** It prevents mode collapse and retains fluency and knowledge from pretraining. $\\beta$ tunes the reward-vs-faithfulness trade-off; too small $\\to$ reward hacking, too large $\\to$ no learning. InstructGPT also mixes in a pretraining gradient (**PPO-ptx**) to further guard against capability regression.",
    keyInsight:
      "RLHF = SFT → Bradley-Terry reward model from preference pairs → PPO maximizing reward minus β·KL to the SFT reference; the KL leash is what stops the policy from reward-hacking an imperfect, only-locally-valid reward model.",
  },
  {
    id: "train-dpo",
    track: "training",
    title: "Direct Preference Optimization (DPO)",
    difficulty: "elite",
    tags: ["DPO", "alignment", "preference optimization"],
    source: "Direct Preference Optimization (Rafailov et al., 2023)",
    prompt:
      "DPO fine-tunes directly on preference data with **no separate reward model and no RL sampling**. Derive the closed-form link between the optimal RLHF policy and the reward, and show how it collapses into the DPO loss.",
    solution:
      "DPO's insight: the RLHF objective has a **closed-form optimum**, and you can reparameterize the reward in terms of the policy itself — eliminating both the reward model and PPO.\n\n**Step 1 — the KL-regularized optimum.** The RLHF objective\n$$\\max_{\\pi}\\ \\mathbb{E}_{y\\sim\\pi}[r(x,y)] - \\beta\\,\\mathrm{KL}(\\pi\\,\\|\\,\\pi_{\\text{ref}})$$\nhas the exact solution (a standard result for KL-penalized reward maximization)\n$$\\pi^{*}(y\\mid x) = \\frac{1}{Z(x)}\\,\\pi_{\\text{ref}}(y\\mid x)\\,\\exp\\!\\Big(\\tfrac{1}{\\beta}\\,r(x,y)\\Big),\\qquad Z(x)=\\sum_{y}\\pi_{\\text{ref}}(y\\mid x)\\,e^{r(x,y)/\\beta}.$$\n\n**Step 2 — invert for the reward.** Solve for $r$:\n$$r(x,y) = \\beta\\,\\log\\frac{\\pi^{*}(y\\mid x)}{\\pi_{\\text{ref}}(y\\mid x)} + \\beta\\,\\log Z(x).$$\nThe intractable partition function $Z(x)$ appears only as an additive term that **depends on $x$ alone**, not on $y$.\n\n**Step 3 — plug into Bradley–Terry.** The preference model is $P(y_w\\succ y_l) = \\sigma\\big(r(x,y_w)-r(x,y_l)\\big)$. Substituting the expression above, the $\\beta\\log Z(x)$ terms **cancel** (same $x$ for both responses):\n$$P(y_w\\succ y_l\\mid x) = \\sigma\\!\\Big(\\beta\\log\\frac{\\pi_\\theta(y_w\\mid x)}{\\pi_{\\text{ref}}(y_w\\mid x)} - \\beta\\log\\frac{\\pi_\\theta(y_l\\mid x)}{\\pi_{\\text{ref}}(y_l\\mid x)}\\Big).$$\n\n**Step 4 — the DPO loss.** Maximize the likelihood of the observed preferences — an ordinary supervised classification loss:\n$$\\mathcal{L}_{\\text{DPO}} = -\\,\\mathbb{E}_{(x,y_w,y_l)}\\Big[\\log\\sigma\\Big(\\beta\\log\\tfrac{\\pi_\\theta(y_w\\mid x)}{\\pi_{\\text{ref}}(y_w\\mid x)} - \\beta\\log\\tfrac{\\pi_\\theta(y_l\\mid x)}{\\pi_{\\text{ref}}(y_l\\mid x)}\\Big)\\Big].$$\nThe policy is its **own implicit reward**, $\\hat r(x,y) = \\beta\\log\\frac{\\pi_\\theta(y\\mid x)}{\\pi_{\\text{ref}}(y\\mid x)}$. No reward model, no sampling, no PPO — just forward passes of $\\pi_\\theta$ and the frozen $\\pi_{\\text{ref}}$ on the fixed preference dataset.\n\n**Gradient intuition.** $\\nabla\\mathcal{L}$ scales each pair by how badly the *current* implicit reward mis-ranks it, pushing up $\\log\\pi_\\theta(y_w)$ and down $\\log\\pi_\\theta(y_l)$; a correctly, confidently ranked pair contributes almost no gradient.\n\n**Trade-offs.** Far simpler and more stable than PPO, and cheap (no online generation, no RM to train). But DPO is **offline / off-policy** on a fixed dataset — it never explores new responses, is sensitive to how well the preference data covers $\\pi_{\\text{ref}}$'s support, and can over-fit deterministic preferences (motivating **IPO**), while variants like **KTO** (unpaired) and **online DPO** relax those limits.",
    keyInsight:
      "Because the KL-regularized RLHF optimum gives r = β·log(π/π_ref) + β·logZ and the logZ cancels in Bradley-Terry, preferences reduce to a simple classification loss on log-ratios — no reward model, no sampling, no RL.",
  },
];
