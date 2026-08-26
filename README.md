# SortRAG — Optimizing RAG Retrieval

**Benchmarking Quick Sort vs Merge Sort for AI Document Ranking**

A reproducible experimental platform for studying how sorting algorithm choice affects the
ranking/reranking stage of a Retrieval-Augmented Generation (RAG) pipeline. Built as the technical
companion to a university research paper — not a marketing demo, not a generic AI chatbot.

## 1. Project overview

This platform lets you run controlled, repeatable comparisons of Quick Sort, Merge Sort, a built-in-sort
baseline, and a no-sort baseline against identical benchmark input, and separately lets you see the same
algorithms operating inside an actual (small, demo-scale) RAG pipeline. Every number shown after clicking
"Run" is a real measurement taken in your browser at that moment — nothing is pre-filled or fabricated.

## 2. Research objective, question, and hypotheses

**Research question:** How does the choice of sorting algorithm affect the computational performance of
document ranking/reranking inside a RAG system?

**Hypotheses to test with the data this platform produces** (write your own after running experiments —
this README intentionally does not assert an answer):
- H1: Algorithm choice measurably affects sorting latency at some input sizes.
- H2: The effect size, if any, differs by input distribution (random vs. sorted vs. duplicate-heavy).
- H3: Sorting time is/is not a meaningful fraction of total RAG end-to-end latency.

Full methodology, variables, and limitations: see the in-app **Documentation** page
(`app/documentation/page.tsx`) — the source of truth, kept in sync with the code.

## 3. System architecture

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts
- **Benchmark engine** (`lib/sorting/`, `lib/benchmark/`): pure, deterministic, runs entirely client-side —
  no secrets involved, no network calls inside timed sections.
- **RAG engine** (`lib/rag/`): runs server-side via `app/api/rag/route.ts` so any configured embedding/LLM
  API keys never reach the browser.
- **Evaluation** (`lib/evaluation/`): retrieval quality metrics, disabled without supplied ground truth.
- **Storage** (`lib/storage/`): experiment history in browser localStorage — local-only, not a cloud DB.

```
app/
  page.tsx                 Dashboard
  benchmark/page.tsx        Algorithm Benchmark (size sweep)
  comparison/page.tsx       Algorithm Comparison (fairness-checked, same input)
  rag/page.tsx              RAG Playground
  api/rag/route.ts          Server-side RAG pipeline endpoint
  results/page.tsx          Research Data dashboard
  history/page.tsx          Experiment History (localStorage)
  documentation/page.tsx    Methodology & limitations
lib/
  sorting/                 quickSort.ts, mergeSort.ts, builtinSort.ts, validate.ts (shared comparator), types.ts
  benchmark/                rng.ts (seeded), generator.ts (distributions), runner.ts, stats.ts
  rag/                      embeddings.ts, retrieval.ts, generation.ts, pipeline.ts
  evaluation/                metrics.ts (Precision@K, Recall@K, Hit Rate, MRR, NDCG)
  storage/                   local.ts (experiment history)
  utils/                     export.ts (CSV/JSON), id.ts (Experiment IDs)
data/sample-documents.ts    10-chunk DEMO corpus for the RAG Playground
types/index.ts               shared RAG domain types
tests/                       Vitest test suite
```

## 4. Sorting algorithms and complexity

| Algorithm | Time (avg) | Time (worst) | Space | Notes |
|---|---|---|---|---|
| Quick Sort | O(n log n) | O(n²) | O(log n) | Median-of-three pivot, insertion-sort cutoff <16 elements. Implemented from scratch. |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Stable, top-down. Implemented from scratch. |
| Built-in (baseline) | O(n log n) | O(n log n)* | O(n)* | `Array.prototype.sort` — TimSort on V8 (Node/Chrome) specifically. |
| No Sort (baseline) | O(1) | O(1) | O(1) | Passes input through unranked; not a ranking. |

\* Stated for V8 specifically, since that's what this platform runs on — not asserted generically for
"JavaScript" across all engines.

All four use one shared deterministic comparator (`lib/sorting/validate.ts`): primary key = relevance
score (descending), secondary key = item id (ascending). Every comparison run verifies Quick Sort, Merge
Sort, and Built-in Sort produce identical output orderings and reports **Ranking consistency: PASS/FAIL**.

## 5. Experimental methodology

1. Generate a benchmark input **once** per experiment (seeded, deterministic — `lib/benchmark/generator.ts`).
2. Clone that exact input for each algorithm (never regenerate per algorithm).
3. Run configurable warm-up trials (default 5, discarded).
4. Run configurable measured trials (default 30), timing **only** the sorting call.
5. Record every individual trial time; compute mean, median, min, max, standard deviation, P95.
6. Verify ranking correctness and cross-algorithm consistency.
7. Display an **Experimental Fairness Checklist** before/with every comparison result.

Supported input distributions: random, sorted ascending, sorted descending, nearly sorted, duplicate-heavy.
Default input sizes: 10, 50, 100, 500, 1,000, 5,000, 10,000 (custom sizes supported, capped at 200,000 to
protect the browser/server).

## 6. Metrics

**Performance:** mean, median, min, max, standard deviation, P95, per-algorithm and relative ("X was Y%
faster **in this experiment**" — never a general claim).

**Retrieval quality** (only when ground truth is supplied — otherwise explicitly disabled, not
zero-faked): Precision@K, Recall@K, Hit Rate@K, MRR, NDCG (binary relevance).

## 7. Dataset format

The RAG Playground uses a small hand-written 10-chunk demo corpus (`data/sample-documents.ts`), clearly
labeled DEMO DATA. To use your own documents, replace this file with your own `DocumentChunk[]` array (see
`types/index.ts`) or wire in a real ingestion/chunking step.

## 8. Installation & local development

```bash
npm install
cp .env.example .env.local   # optional — leave blank to run fully in demo mode
npm run dev
```

Visit `http://localhost:3000`.

## 9. Environment variables

See `.env.example`. All optional — the platform runs fully functional in demo mode with none of them set:

- `EMBEDDING_PROVIDER`, `EMBEDDING_API_KEY`, `EMBEDDING_MODEL` — real embedding calls (OpenAI wired as an
  example in `lib/rag/embeddings.ts`; extend for other providers).
- `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL` — real answer generation (Anthropic wired as an example in
  `lib/rag/generation.ts`).
- `VECTOR_DATABASE_PROVIDER`, `VECTOR_DATABASE_URL`, `VECTOR_DATABASE_KEY` — reserved for a future real
  vector database integration; current retrieval is local in-memory cosine similarity over the demo corpus.

**Never commit `.env.local` or real keys.** Add secrets to Vercel's environment variable settings instead.

## 10. Running tests

```bash
npm test
```

Covers: empty/single/two-element arrays, already-sorted and reverse-sorted input, duplicate-value
tie-breaking, decimal/negative values, non-mutation of input, large-input (n=5,000–20,000) correctness, and
Quick Sort / Merge Sort / Built-in output agreement.

## 11. Building & deploying

```bash
npm run build
npm run start   # production server, for local verification
```

**Vercel:** push to GitHub, import the repo in Vercel, add any environment variables you want under
Project Settings → Environment Variables, deploy. The RAG API route (`app/api/rag/route.ts`) is a standard
serverless function; sorting/benchmarking runs client-side and has no serverless execution-time concerns.

## 12. Exporting results

From **Results** or **History**: Summary CSV (aggregated stats per algorithm/experiment), Raw Trials CSV
(every individual measured execution time, not just the average), or full JSON.

## 13. Limitations

See Documentation section 13 in-app, or `app/documentation/page.tsx`. In short: browser-JS-engine timing
noise, a demo corpus too small for general RAG-quality conclusions, no statistical significance testing
implemented yet (descriptive statistics only), and demo embeddings that are a bag-of-words vector, not a
trained semantic model.

## 14. Reproducibility

Every experiment records its seed, distribution, size, warm-up/measured run counts, and a sequential
Experiment ID (`RAG-YYYY-NNNN`). The same (seed, size, distribution) always regenerates the same input —
verified in `tests/benchmark.test.ts`.

## 15. Citation

If you cite this platform in your paper, cite it as your own coursework/research tooling — it is not a
published academic work itself. Any third-party research this project's documentation references will be
marked `TODO: VERIFY SOURCE` until independently confirmed; no fabricated citations are included.

## 16. No fake data

This platform will never display invented latency, accuracy, precision, recall, or algorithm-superiority
numbers as if they were measured. Anything not derived from an actual executed run is labeled DEMO DATA.
