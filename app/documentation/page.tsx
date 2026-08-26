import { Panel } from "@/components/Card";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rule-bottom py-6 first:pt-0 last:border-b-0">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-xs text-signal">{n}</span>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </div>
      <div className="text-ink-soft leading-relaxed space-y-3 max-w-3xl">{children}</div>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-1">Methodology</div>
        <h1 className="font-display text-3xl font-bold">Documentation</h1>
        <p className="text-ink-soft mt-1 max-w-2xl">
          The experimental design behind this platform, written for a beginner researcher to understand and
          defend in a viva or presentation.
        </p>
      </div>

      <Panel>
        <Section n="01" title="Research question">
          <p>How does the choice of sorting algorithm affect the computational performance of the
          ranking/reranking stage inside a Retrieval-Augmented Generation (RAG) system?</p>
        </Section>

        <Section n="02" title="Scope">
          <p>
            RAG has three conceptual stages: <em>retrieval</em> (finding candidates), <em>ranking/
            reranking</em> (ordering candidates by relevance score), and <em>generation</em> (producing the
            final answer). This research targets ranking/reranking specifically. The platform does not claim
            to evaluate retrieval or generation quality as a research contribution — those stages exist here
            only so the ranking stage sits inside a realistic pipeline.
          </p>
        </Section>

        <Section n="03" title="Independent / dependent / controlled variables">
          <p><strong>Independent variable:</strong> sorting algorithm (Quick Sort, Merge Sort, built-in
          sort baseline, no-sort baseline).</p>
          <p><strong>Dependent variables:</strong> sorting latency (mean, median, std dev, P95 across
          repeated trials), ranking correctness, and — only where ground truth is supplied — retrieval
          quality metrics.</p>
          <p><strong>Controlled variables per experiment:</strong> input size, input distribution, seed,
          number of warm-up and measured runs, ranking direction, and tie-breaking rule. Every algorithm in
          a single comparison receives the identical input array (cloned once, never regenerated).</p>
        </Section>

        <Section n="04" title="Algorithms and complexity">
          <p><strong>Quick Sort</strong> — median-of-three pivot, Hoare-style partitioning, insertion-sort
          cutoff below 16 elements. Average O(n log n) time, worst case O(n²) time, ~O(log n) auxiliary
          space (recursion stack; sorts a copy in place).</p>
          <p><strong>Merge Sort</strong> — top-down, stable. O(n log n) time in the best, average, and worst
          case. O(n) auxiliary space per merge level — the direct trade-off against Quick Sort's smaller
          memory footprint.</p>
          <p><strong>Built-in Sort (baseline)</strong> — <code className="font-mono text-xs">Array.prototype.sort</code>.
          On V8 (Node.js / Chrome, which is what this platform runs on), this has been TimSort since V8 7.0:
          O(n log n) time average and worst case, O(n) space. This is stated for V8 specifically, not
          asserted generically for "JavaScript" across all engines.</p>
          <p><strong>No Sort (baseline)</strong> — passes retrieved items through unordered. Exists only to
          measure the cost/value of adding an explicit sorting stage; its output is never presented as a
          ranking.</p>
          <p>Both Quick Sort and Merge Sort are implemented from scratch in this codebase (
          <code className="font-mono text-xs">lib/sorting/quickSort.ts</code>,{" "}
          <code className="font-mono text-xs">lib/sorting/mergeSort.ts</code>) rather than wrapping a
          library call, so their measured behavior reflects this platform's specific implementations, not a
          third-party library's.</p>
        </Section>

        <Section n="05" title="Tie-breaking and ranking correctness">
          <p>
            All four algorithms use one shared comparator (<code className="font-mono text-xs">lib/sorting/validate.ts</code>):
            primary key relevance score (descending), secondary key item id (ascending). Without this, two
            "correct" sorts of the same input could legitimately disagree whenever scores tie, making
            cross-algorithm output comparison meaningless. Every comparison run checks that Quick Sort,
            Merge Sort, and Built-in Sort produce byte-for-byte identical orderings, and flags "Ranking
            consistency: FAIL" if they don't.
          </p>
        </Section>

        <Section n="06" title="Benchmark methodology">
          <p>For every algorithm and input size: generate the input once (seeded, deterministic) → run a
          configurable number of warm-up trials (default 5, discarded) → run a configurable number of
          measured trials (default 30) → record every individual trial time, not just the fastest → compute
          mean, median, min, max, standard deviation, and P95.</p>
          <p>Only the sorting call itself is inside the timed section (<code className="font-mono text-xs">performance.now()</code>
          around the call and nothing else) — input cloning, logging, and chart rendering happen outside the
          timer.</p>
          <p>With fewer than 10 measured runs, the UI shows a low-sample-size warning; standard deviation
          and P95 are not reliable below that.</p>
        </Section>

        <Section n="07" title="Input distributions">
          <p>Random, already-sorted ascending, already-sorted descending, nearly sorted (~5% of adjacent
          pairs swapped), and duplicate-heavy (scores collapsed into ~10 buckets). Sorting algorithms can
          behave very differently depending on input shape — this is why the platform doesn't test only
          random input.</p>
        </Section>

        <Section n="08" title="Reproducibility">
          <p>A seeded PRNG (mulberry32) generates benchmark input. The same (size, distribution, seed) always
          produces the same array. Every saved experiment records its seed, and Experiment IDs
          (<code className="font-mono text-xs">RAG-YYYY-NNNN</code>) are sequential, not timestamp-derived,
          so they stay stable and unique.</p>
        </Section>

        <Section n="09" title="What is and isn't real data">
          <p>Benchmark and comparison results shown after clicking "Run" are real measurements taken in your
          browser — nothing is pre-filled or fabricated. The RAG Playground's demo corpus (10 chunks) and
          demo embeddings (a fixed-vocabulary bag-of-words vector, not a trained model) are labeled DEMO DATA
          and produce no official experimental results; they exist only so the pipeline is explorable without
          API keys. If <code className="font-mono text-xs">EMBEDDING_PROVIDER</code>/<code className="font-mono text-xs">LLM_PROVIDER</code> are
          configured, real API calls are made instead — but note that code path has not been exercised
          against a live key during development, so verify it against your own account before trusting its
          output for a paper.</p>
        </Section>

        <Section n="10" title="Retrieval quality metrics">
          <p>Precision@K, Recall@K, Hit Rate@K, MRR, and NDCG are implemented (
          <code className="font-mono text-xs">lib/evaluation/metrics.ts</code>) but require you to supply
          ground-truth relevant document IDs per query. Without ground truth, these are explicitly disabled
          — never computed against an assumed or default relevance labeling.</p>
        </Section>

        <Section n="11" title="Storage and persistence">
          <p>Experiment history is stored in the browser's localStorage — local to this device and browser
          only, not a cloud database, and cleared if site data is cleared. The data model (Experiment /
          AlgorithmResult / AggregatedResult) is designed to map directly onto a real database schema if you
          later add a persistent backend (e.g. a Postgres-backed API route) for multi-device access.</p>
        </Section>

        <Section n="12" title="Architecture">
          <p>Next.js (App Router) + TypeScript + Tailwind CSS + Recharts. Sorting and the benchmark engine
          run entirely client-side (pure, deterministic, no secrets involved). The RAG pipeline runs through
          a server-side API route (<code className="font-mono text-xs">app/api/rag/route.ts</code>) so any
          configured embedding/LLM API keys stay server-only and are never sent to the browser. No
          long-running backend process is required; this is Vercel-serverless-compatible by design.</p>
        </Section>

        <Section n="13" title="Limitations">
          <ul className="list-disc pl-5 space-y-1">
            <li>Sorting benchmarks measure pure algorithm time in a browser JS engine — not a controlled
            bare-metal environment, and JIT warm-up/GC pauses can add noise even after warm-up runs.</li>
            <li>The RAG Playground's demo corpus is 10 chunks — too small for any general conclusion about
            RAG quality; it exists for demonstration, not evaluation.</li>
            <li>No statistical significance test (e.g. paired t-test) is implemented yet; comparisons report
            descriptive statistics only. Do not describe a difference as "statistically significant" unless
            you run and report an actual test.</li>
            <li>Demo embeddings are a bag-of-words vector, not a trained semantic embedding model — retrieval
            quality in demo mode should not be interpreted as representative of a real embedding model.</li>
          </ul>
        </Section>

        <Section n="14" title="No fabricated results, no fabricated citations">
          <p>This platform will never display invented latency, accuracy, or precision/recall numbers as if
          they were measured, and this documentation will not cite research papers it cannot verify. Where a
          citation would normally go and hasn't been verified, it is marked{" "}
          <code className="font-mono text-xs">TODO: VERIFY SOURCE</code> rather than invented.</p>
        </Section>
      </Panel>
    </div>
  );
}
