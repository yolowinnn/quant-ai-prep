# Quant · AI Prep — The Green Book & Beyond

An interactive study companion for **quantitative finance** and **AI/ML** interviews. It turns the classic interview canon — Xinfeng Zhou's _A Practical Guide to Quantitative Finance Interviews_ (the "Green Book"), Hull's _Options, Futures, and Other Derivatives_, and the standard machine-learning texts — into a searchable, filterable, flashcard-style practice set with **full worked solutions** and real LaTeX rendering.

🔗 **Live:** deployed on Vercel · **Source:** [github.com/yolowinnn/quant-ai-prep](https://github.com/yolowinnn/quant-ai-prep)

## Features

- **Nine tracks** across two domains — Quant (brainteasers, probability, stochastic calculus, derivatives pricing, calculus & linear algebra, programming) and AI (classical ML, deep learning, ML system design).
- **First-principles solutions** — every problem derives the result and states a one-line key insight.
- **Reveal-on-demand flashcards** — hide the solution, reason it out, then flip.
- **Search & filter** by track, domain, difficulty, starred, or unsolved.
- **Progress tracking** — star and mark-solved state persists in your browser (`localStorage`).
- **Beautiful math** — KaTeX rendering for everything from Itô's lemma to Black–Scholes.
- **Light / dark** theme with a green-book–inspired palette.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- `react-markdown` + `remark-math` + `rehype-katex` for content rendering
- `next-themes`, `lucide-react`

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```

## Content structure

Problems live in `lib/problems/*.ts`, one file per track, each an array of typed `Problem` objects (`lib/types.ts`). Track metadata is in `lib/tracks.ts`. To add a problem, append to the relevant file — the site picks it up automatically (static generation).

## Disclaimer

A study aid with original explanations curated from public references. Not affiliated with any employer or publisher.
