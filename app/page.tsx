import Link from "next/link";
import { Panel } from "@/components/Card";

const NAV_CARDS = [
  { href: "/rag", title: "RAG Playground", desc: "Ask a question, watch retrieval → ranking → generation run end to end." },
  { href: "/benchmark", title: "Algorithm Benchmark", desc: "Measure one algorithm's sorting time across input sizes." },
  { href: "/comparison", title: "Compare Algorithms", desc: "Run Quick Sort, Merge Sort, Built-in, and No Sort on identical input." },
  { href: "/results", title: "Results", desc: "Charts and tables built only from real, executed experiments." },
  { href: "/history", title: "Experiment History", desc: "Every past run — view, compare, export, or delete." },
  { href: "/documentation", title: "Documentation", desc: "Research design, methodology, and limitations." }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] font-mono tracking-widest text-signal uppercase mb-2">
          Research Platform · Working Paper
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight">Optimizing RAG Retrieval</h1>
        <p className="font-display text-xl text-ink-soft mt-1">
          Benchmarking Quick Sort vs Merge Sort for AI Document Ranking
        </p>
        <p className="max-w-3xl mt-4 text-ink-soft leading-relaxed">
          This platform exists to answer one question with evidence rather than intuition: how does the
          choice of sorting algorithm affect the computational performance of the ranking/reranking stage
          inside a Retrieval-Augmented Generation pipeline? It runs Quick Sort, Merge Sort, a built-in-sort
          baseline, and a no-sort baseline under controlled, identical, reproducible conditions, and reports
          only what was actually measured — see{" "}
          <Link href="/documentation" className="underline decoration-rule underline-offset-2 hover:text-signal">
            Documentation
          </Link>{" "}
          for the full methodology and its limitations.
        </p>
      </div>

      <Panel eyebrow="Research Question" title="What this platform measures">
        <p className="text-ink-soft leading-relaxed max-w-3xl">
          <span className="font-mono text-sm text-ink">Independent variable</span> — sorting algorithm
          (Quick Sort / Merge Sort / built-in / no sort).{" "}
          <span className="font-mono text-sm text-ink">Dependent variables</span> — sorting latency,
          end-to-end RAG latency, ranking correctness, and (where ground truth is supplied) retrieval
          quality metrics. Everything else — dataset, query, candidate set, relevance scores, Top-K, seed —
          is held constant within a single experiment. The research focus is specifically the
          ranking/reranking stage, not retrieval or generation quality in general.
        </p>
      </Panel>

      <div>
        <h2 className="font-display text-lg font-semibold mb-4">Quick navigation</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block bg-panel border border-rule rounded p-4 hover:border-signal transition-colors"
            >
              <div className="font-display font-semibold">{c.title}</div>
              <div className="text-sm text-ink-soft mt-1">{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
