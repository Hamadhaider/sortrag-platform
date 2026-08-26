import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "SortRAG — Optimizing RAG Retrieval",
  description:
    "Benchmarking Quick Sort vs Merge Sort for AI document ranking — a reproducible experimental RAG research platform."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
          <footer className="rule-top py-6 mt-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs text-ink-soft font-mono flex flex-wrap gap-x-6 gap-y-1">
              <span>SortRAG research platform</span>
              <span>Local-first · no fabricated results (see Documentation)</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
