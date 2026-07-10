import type { Problem } from "../types";

export const mlDeep: Problem[] = [
  {
    id: "backpropagation",
    track: "ml-deep",
    title: "Backpropagation from Scratch",
    difficulty: "core",
    tags: ["backprop", "chain rule", "autodiff"],
    source: "Classic DL interview",
    prompt:
      "Derive backpropagation for a feedforward network. Why is it $O(\\text{network size})$ rather than exponential?",
    solution:
      "A layer computes $z^{(l)} = W^{(l)}a^{(l-1)} + b^{(l)}$, $a^{(l)} = \\phi(z^{(l)})$. Define the error signal $\\delta^{(l)} = \\partial \\mathcal L/\\partial z^{(l)}$.\n\n**Backward recursion** (chain rule):\n$$\\delta^{(L)} = \\nabla_a\\mathcal L \\odot \\phi'(z^{(L)}),\\qquad \\delta^{(l)} = \\big(W^{(l+1)\\top}\\delta^{(l+1)}\\big)\\odot \\phi'(z^{(l)}).$$\n\nThe parameter gradients are then\n$$\\frac{\\partial\\mathcal L}{\\partial W^{(l)}} = \\delta^{(l)}a^{(l-1)\\top},\\qquad \\frac{\\partial\\mathcal L}{\\partial b^{(l)}} = \\delta^{(l)}.$$\n\n**Why linear cost?** Backprop is **reverse-mode automatic differentiation**: it reuses each $\\delta^{(l)}$ for every parameter in that layer instead of recomputing paths. A naive 'differentiate each weight separately' would traverse exponentially many paths; caching the shared intermediate $\\delta$'s makes one forward + one backward pass suffice, costing $O(\\#\\text{edges})$. This shared-subexpression reuse is exactly dynamic programming on the computation graph.",
    keyInsight:
      "Backprop = reverse-mode autodiff: cache the per-layer error δ and reuse it, turning an exponential path sum into one linear backward pass.",
  },
  {
    id: "vanishing-gradients",
    track: "ml-deep",
    title: "Vanishing & Exploding Gradients",
    difficulty: "core",
    tags: ["optimization", "activations", "residual"],
    source: "Classic DL interview",
    prompt:
      "Why do deep networks suffer vanishing/exploding gradients? List the main fixes and why each works.",
    solution:
      "Backprop multiplies many Jacobians: $\\delta^{(l)} = \\prod_{k>l} (W^{(k)\\top}\\,\\text{diag}(\\phi'))\\,\\delta^{(L)}$. If the typical factor magnitude is $<1$, the product **vanishes** exponentially in depth; if $>1$, it **explodes**. Sigmoid/tanh make this worse because their derivative saturates near 0 for large activations.\n\n**Fixes.**\n- **ReLU** (and variants): derivative is exactly 1 on the active side — no shrinking factor, so gradients propagate. (Downside: dead units; Leaky/GELU mitigate.)\n- **Careful initialization** (Xavier/He): scale initial weights so the variance of activations and gradients is preserved layer-to-layer (He: $\\text{Var}(W)=2/n_{\\text{in}}$ for ReLU).\n- **Batch/Layer normalization**: re-center and re-scale activations, keeping them in the well-conditioned regime and smoothing the loss landscape.\n- **Residual connections**: $a^{(l)} = a^{(l-1)} + F(a^{(l-1)})$ gives the gradient an identity path $\\partial a^{(l)}/\\partial a^{(l-1)} = I + \\dots$, so signal flows even when $F$'s Jacobian is tiny — this is what enabled 100+ layer nets.\n- **Gradient clipping**: caps the norm to tame explosions (essential for RNNs).",
    keyInsight:
      "Deep chains multiply Jacobians; ReLU, He init, normalization, and residual identity-paths each keep that product near 1.",
  },
  {
    id: "batchnorm",
    track: "ml-deep",
    title: "Batch Normalization",
    difficulty: "core",
    tags: ["normalization", "training dynamics"],
    source: "Ioffe & Szegedy",
    prompt:
      "What does batch normalization compute, and why does it help? What changes between training and inference?",
    solution:
      "For each feature in a mini-batch, BatchNorm standardizes then rescales:\n$$\\hat x = \\frac{x - \\mu_B}{\\sqrt{\\sigma_B^2 + \\epsilon}},\\qquad y = \\gamma\\hat x + \\beta,$$\nwhere $\\mu_B,\\sigma_B^2$ are the batch mean/variance and $\\gamma,\\beta$ are learned (letting the net recover the identity if needed).\n\n**Why it helps.** It keeps activations in a well-conditioned range (mitigating vanishing/exploding gradients), allows **higher learning rates**, and acts as a mild **regularizer** (the batch statistics inject noise). The original 'internal covariate shift' story is debated; a widely accepted explanation is that BN **smooths the loss landscape**, making gradients more predictable.\n\n**Train vs inference.** During training it uses per-batch statistics and updates running averages. At inference there's no batch, so it uses the **stored running mean/variance** — making the transform a fixed affine map (foldable into the preceding layer). Forgetting to switch to eval mode is a classic bug (e.g. `model.eval()` in PyTorch). LayerNorm (normalizing across features, not the batch) is preferred for sequence models / Transformers where batch stats are unstable.",
    keyInsight:
      "BN standardizes per-batch then rescales with learned γ,β; it smooths optimization and must switch to running stats at inference.",
  },
  {
    id: "dropout",
    track: "ml-deep",
    title: "Dropout as Ensembling",
    difficulty: "warmup",
    tags: ["regularization", "ensembles"],
    source: "Srivastava et al.",
    prompt:
      "How does dropout regularize a network? What is the inverted-dropout scaling and why is it needed?",
    solution:
      "During training, dropout randomly zeroes each unit with probability $p$ (keep prob $1-p$) independently per forward pass. Each pass trains a different **thinned subnetwork**; at test time using the full network approximates **averaging an exponential ensemble** of these subnetworks — a cheap ensemble that reduces variance and prevents co-adaptation (units can't rely on specific partners).\n\n**Inverted dropout scaling.** If we drop units with keep prob $q=1-p$, the expected input to the next layer shrinks by factor $q$. To keep the expectation consistent between train and test, **inverted dropout** divides the surviving activations by $q$ during training:\n$$a \\leftarrow \\frac{a\\odot \\text{mask}}{q}.$$\nThen test time needs **no** rescaling (the network runs at full capacity unchanged). Dropout is less common in modern Transformers on the attention weights but still used on feed-forward/embedding layers; BatchNorm often reduces the need for it.",
    keyInsight:
      "Dropout trains an exponential ensemble of subnetworks; inverted scaling by keep-prob keeps train/test expectations matched so inference needs no change.",
  },
  {
    id: "cnn-fundamentals",
    track: "ml-deep",
    title: "Convolutions: Parameters & Receptive Field",
    difficulty: "core",
    tags: ["CNN", "parameter sharing", "receptive field"],
    source: "Classic DL interview",
    prompt:
      "Why are CNNs preferred over fully-connected nets for images? Count the parameters of a conv layer and explain the receptive field.",
    solution:
      "**Why conv, not dense.** Two inductive biases suit images: **locality** (nearby pixels correlate) and **translation equivariance** (a cat is a cat anywhere). A convolution slides the *same* small filter across all positions — **parameter sharing** — so it uses vastly fewer weights than a dense layer and generalizes across spatial location.\n\n**Parameter count.** A conv layer with $C_{in}$ input channels, $C_{out}$ filters, and kernel $k\\times k$ has\n$$k\\cdot k\\cdot C_{in}\\cdot C_{out} + C_{out}\\ (\\text{biases})$$\nparameters — **independent of the input's spatial size**. A dense layer connecting two $224\\times224\\times3$ tensors would need billions; a $3\\times3\\times3\\times64$ conv needs $\\approx 1{,}792$.\n\n**Receptive field.** The region of input that influences one output unit. It grows with depth: stacking $L$ layers of $3\\times3$ convs (stride 1) gives a receptive field of $1 + 2L$. Pooling/striding/dilation enlarge it faster, letting deep layers 'see' the whole image while early layers capture edges and textures.",
    keyInsight:
      "Parameter sharing makes conv weight counts independent of image size; depth compounds small kernels into a large receptive field.",
  },
  {
    id: "self-attention",
    track: "ml-deep",
    title: "Self-Attention & the Transformer",
    difficulty: "hard",
    tags: ["attention", "transformer", "QKV"],
    source: "Vaswani et al., 'Attention Is All You Need'",
    prompt:
      "Explain scaled dot-product self-attention. Why the $\\sqrt{d_k}$ scaling? Why multi-head? What is the complexity, and how does it compare to RNNs?",
    solution:
      "Each token is projected into a **query, key, value**: $Q=XW_Q,\\ K=XW_K,\\ V=XW_V$. Attention mixes values by query–key similarity:\n$$\\text{Attn}(Q,K,V) = \\text{softmax}\\!\\Big(\\frac{QK^\\top}{\\sqrt{d_k}}\\Big)V.$$\n\n**Why $\\sqrt{d_k}$?** For unit-variance $q,k$, the dot product $q\\cdot k$ has variance $d_k$. Without scaling, large $d_k$ pushes softmax into saturated regions where gradients vanish. Dividing by $\\sqrt{d_k}$ normalizes the variance to $\\approx 1$, keeping softmax in a well-behaved range.\n\n**Multi-head.** Run $h$ attention functions in parallel on lower-dimensional projections and concatenate. Different heads specialize (syntax, coreference, position), giving the model multiple 'representation subspaces' rather than one averaged attention.\n\n**Complexity.** Self-attention is $O(n^2 d)$ in sequence length $n$ — every token attends to every other. That's the quadratic bottleneck (motivating FlashAttention, sparse/linear attention). Versus RNNs: attention has **$O(1)$ path length** between any two tokens and is fully parallelizable across positions, whereas RNNs are $O(n)$ sequential and struggle with long-range dependencies. Position information must be injected separately (positional encodings) since attention is permutation-equivariant.",
    keyInsight:
      "Attention is a softmax-weighted average of values keyed by query–key similarity; √dₖ keeps softmax unsaturated, multi-head gives diverse subspaces, and O(1) path length beats RNN recurrence at the cost of O(n²).",
  },
  {
    id: "softmax-cross-entropy-grad",
    track: "ml-deep",
    title: "The Softmax + Cross-Entropy Gradient",
    difficulty: "core",
    tags: ["softmax", "cross-entropy", "gradients"],
    source: "Classic DL interview",
    prompt:
      "Show that the gradient of cross-entropy loss with respect to the softmax logits is simply $\\hat y - y$. Why is this numerically convenient?",
    solution:
      "Softmax: $\\hat y_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}$. Cross-entropy with one-hot target $y$: $\\mathcal L = -\\sum_i y_i\\ln\\hat y_i$.\n\nThe softmax Jacobian is $\\frac{\\partial\\hat y_i}{\\partial z_k} = \\hat y_i(\\delta_{ik} - \\hat y_k)$. Then\n$$\\frac{\\partial\\mathcal L}{\\partial z_k} = -\\sum_i \\frac{y_i}{\\hat y_i}\\frac{\\partial\\hat y_i}{\\partial z_k} = -\\sum_i y_i(\\delta_{ik} - \\hat y_k) = -y_k + \\hat y_k\\sum_i y_i = \\hat y_k - y_k,$$\nusing $\\sum_i y_i = 1$. So\n$$\\nabla_z\\mathcal L = \\hat y - y.$$\n\n**Why convenient.** The gradient is just predicted-minus-true probabilities — the same clean 'residual' form as logistic regression, avoiding the exploding/vanishing factors you'd get differentiating softmax and log separately. Implementations fuse the two (`log_softmax` + NLL, or `CrossEntropyLoss`) for **numerical stability**, subtracting $\\max_j z_j$ inside the exponent to prevent overflow.",
    keyInsight:
      "∂(cross-entropy)/∂logits = ŷ − y — a clean residual that fused log-softmax implementations exploit for stability.",
  },
  {
    id: "optimizers-adam",
    track: "ml-deep",
    title: "SGD, Momentum, and Adam",
    difficulty: "core",
    tags: ["optimization", "Adam", "momentum"],
    source: "Classic DL interview",
    prompt:
      "Explain momentum and Adam. What problem does each solve over plain SGD? What is bias correction in Adam?",
    solution:
      "**Plain SGD:** $\\theta \\leftarrow \\theta - \\eta\\, g_t$. It zig-zags in ravines (high curvature in one direction, low in another) and is sensitive to the learning rate.\n\n**Momentum** accumulates an exponential average of gradients:\n$$v_t = \\beta v_{t-1} + (1-\\beta)g_t,\\qquad \\theta\\leftarrow\\theta - \\eta v_t.$$\nIt damps oscillations across the ravine and accelerates along consistent directions — like a heavy ball rolling downhill.\n\n**Adam** combines momentum with **per-parameter** adaptive step sizes. It tracks first and second moments:\n$$m_t = \\beta_1 m_{t-1} + (1-\\beta_1)g_t,\\quad v_t = \\beta_2 v_{t-1} + (1-\\beta_2)g_t^2,$$\n$$\\hat m_t = \\frac{m_t}{1-\\beta_1^t},\\ \\hat v_t = \\frac{v_t}{1-\\beta_2^t},\\qquad \\theta\\leftarrow\\theta - \\eta\\frac{\\hat m_t}{\\sqrt{\\hat v_t}+\\epsilon}.$$\nDividing by $\\sqrt{\\hat v_t}$ gives large steps for rarely-updated (small-gradient) parameters and small steps for volatile ones — great for sparse features and heterogeneous scales.\n\n**Bias correction.** $m_t, v_t$ start at 0, so early estimates are biased toward 0. Dividing by $1-\\beta^t$ (which $\\to 1$ over time) removes this warm-up bias, preventing huge or tiny initial steps. AdamW decouples weight decay from the adaptive term for better generalization.",
    keyInsight:
      "Momentum averages gradients to cut oscillation; Adam adds per-parameter 1/√(second moment) scaling, with 1/(1−βᵗ) correcting the cold-start bias.",
  },
  {
    id: "weight-init",
    track: "ml-deep",
    title: "Weight Initialization (Xavier / He)",
    difficulty: "core",
    tags: ["initialization", "variance"],
    source: "Glorot & Bengio; He et al.",
    prompt:
      "Why can't we initialize all weights to zero? Derive the variance-preserving initialization for a linear layer.",
    solution:
      "**Not all zeros.** If every weight is identical, all units in a layer compute the same output and receive the same gradient — they stay identical forever (**symmetry**). The network effectively has one neuron per layer. Random init breaks symmetry.\n\n**Variance preservation.** For $y = \\sum_{i=1}^{n_{in}} w_i x_i$ with independent zero-mean $w,x$:\n$$\\operatorname{Var}(y) = n_{in}\\operatorname{Var}(w)\\operatorname{Var}(x).$$\nTo keep $\\operatorname{Var}(y)=\\operatorname{Var}(x)$ (so signals neither blow up nor vanish through depth), set $\\operatorname{Var}(w) = 1/n_{in}$. Balancing the **backward** pass too (which depends on $n_{out}$) gives **Xavier/Glorot**: $\\operatorname{Var}(w) = 2/(n_{in}+n_{out})$, ideal for tanh.\n\n**ReLU (He init).** ReLU zeros half the activations, halving the variance, so compensate with $\\operatorname{Var}(w) = 2/n_{in}$. Using the wrong scheme (e.g. Xavier with ReLU) leaves signals decaying by $\\sqrt 2$ per layer — noticeable in very deep nets. Modern nets also lean on normalization + residuals, which make training more robust to init choice.",
    keyInsight:
      "Zero init freezes symmetry; scale Var(w)=1/n_in (Xavier) or 2/n_in (He, for ReLU's halving) to hold activation variance steady through depth.",
  },
];
