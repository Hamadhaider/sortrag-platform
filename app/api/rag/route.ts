import { NextRequest, NextResponse } from "next/server";
import { runRagPipeline } from "@/lib/rag/pipeline";
import { SAMPLE_DOCUMENTS } from "@/data/sample-documents";
import { AlgorithmName } from "@/lib/sorting/types";

/**
 * Runs server-side so EMBEDDING_API_KEY / LLM_API_KEY (see .env.example)
 * never reach the browser (section 38). In demo mode (no keys set) this
 * still runs server-side for consistency, even though nothing secret is
 * involved at that point.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = (body.query ?? "").trim();
    const topN: number = Number.isFinite(body.topN) ? body.topN : 5;
    const topK: number = Number.isFinite(body.topK) ? body.topK : 3;
    const sortAlgorithm: AlgorithmName = body.sortAlgorithm ?? "quicksort";

    if (!query) {
      return NextResponse.json({ error: "Query must not be empty." }, { status: 400 });
    }
    if (topN < 1 || topK < 1 || topK > topN) {
      return NextResponse.json({ error: "Invalid topN/topK: require topN >= topK >= 1." }, { status: 400 });
    }

    const trace = await runRagPipeline(query, SAMPLE_DOCUMENTS, topN, topK, sortAlgorithm);
    return NextResponse.json(trace);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error running the RAG pipeline.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
