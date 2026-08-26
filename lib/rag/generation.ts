import { RetrievedChunk, EmbeddingMode } from "@/types";

/**
 * DEMO MODE (no LLM_API_KEY set): returns a clearly-labeled extractive
 * "answer" built directly from the retrieved Top-K context, with no model
 * call at all. This exists so the RAG Playground works out of the box and
 * NEVER silently fabricates a fluent-sounding answer that looks model
 * generated when it isn't.
 *
 * API MODE: calls a real LLM. Anthropic's Messages API is wired here as the
 * concrete example. Extend for other providers by branching on LLM_PROVIDER,
 * matching the pattern in lib/rag/embeddings.ts. Not exercised against a
 * live key in development — verify before treating output as real
 * experimental data.
 */

export function currentGenerationMode(): EmbeddingMode {
  return process.env.LLM_PROVIDER && process.env.LLM_API_KEY ? "api" : "demo";
}

function demoAnswer(query: string, context: RetrievedChunk[]): string {
  if (context.length === 0) {
    return "[DEMO MODE] No context was retrieved for this query, so no answer can be produced.";
  }
  const summary = context
    .slice(0, 3)
    .map((c, i) => `(${i + 1}) ${c.text}`)
    .join(" ");
  return `[DEMO MODE — extractive, no LLM called] Based on the retrieved context: ${summary}`;
}

async function apiAnswer(query: string, context: RetrievedChunk[]): Promise<string> {
  const provider = process.env.LLM_PROVIDER;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "claude-sonnet-4-6";

  const contextBlock = context
    .map((c, i) => `[${i + 1}] (${c.documentName}) ${c.text}`)
    .join("\n");

  const prompt = `Answer the question using ONLY the numbered context below. If the context does not contain the answer, say so explicitly.\n\nContext:\n${contextBlock}\n\nQuestion: ${query}`;

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) {
      throw new Error(`LLM API request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text ?? "[No text returned by the API]";
  }

  throw new Error(
    `Unsupported LLM_PROVIDER "${provider}". Add a branch in lib/rag/generation.ts for this provider, or unset it to use demo mode.`
  );
}

export async function generateAnswer(
  query: string,
  context: RetrievedChunk[]
): Promise<{ answer: string; mode: EmbeddingMode }> {
  const mode = currentGenerationMode();
  if (mode === "demo") {
    return { answer: demoAnswer(query, context), mode };
  }
  return { answer: await apiAnswer(query, context), mode };
}
