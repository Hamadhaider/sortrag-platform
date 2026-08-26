"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/rag", label: "RAG Playground" },
  { href: "/benchmark", label: "Algorithm Benchmark" },
  { href: "/comparison", label: "Comparison" },
  { href: "/results", label: "Results" },
  { href: "/history", label: "History" },
  { href: "/documentation", label: "Documentation" }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="rule-bottom bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-baseline justify-between gap-3">
        <Link href="/" className="group">
          <div className="font-display text-lg font-semibold leading-none">SortRAG</div>
          <div className="text-[11px] font-mono text-ink-soft mt-1 tracking-wide">
            QUICK SORT vs MERGE SORT · RAG RANKING RESEARCH
          </div>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-mono">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  active
                    ? "text-signal border-b-2 border-signal pb-0.5"
                    : "text-ink-soft hover:text-ink pb-0.5 border-b-2 border-transparent"
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
