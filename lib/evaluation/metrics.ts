import { RetrievedChunk, RetrievalMetrics } from "@/types";

/**
 * Computes retrieval quality metrics against human-provided ground truth.
 *
 * If `relevantDocumentIds` is empty/undefined, metrics are NOT computed with
 * a fabricated assumption of relevance — they are explicitly disabled
 * (groundTruthAvailable: false, all values null/0) per section 25/26. The UI
 * must render this as "Ground truth not available — retrieval quality
 * metrics are disabled," not as a silent zero.
 */
export function computeRetrievalMetrics(
  rankedResults: RetrievedChunk[],
  relevantDocumentIds: string[] | undefined,
  k: number
): RetrievalMetrics {
  if (!relevantDocumentIds || relevantDocumentIds.length === 0) {
    return {
      precisionAtK: 0,
      recallAtK: 0,
      hitRateAtK: 0,
      mrr: null,
      ndcg: null,
      k,
      groundTruthAvailable: false
    };
  }

  const topK = rankedResults.slice(0, k);
  const relevantSet = new Set(relevantDocumentIds);

  const relevantRetrieved = topK.filter((c) => relevantSet.has(c.documentId));
  const precisionAtK = topK.length > 0 ? relevantRetrieved.length / topK.length : 0;
  const recallAtK = relevantSet.size > 0 ? relevantRetrieved.length / relevantSet.size : 0;
  const hitRateAtK = relevantRetrieved.length > 0 ? 1 : 0;

  let mrr = 0;
  for (let i = 0; i < topK.length; i++) {
    if (relevantSet.has(topK[i].documentId)) {
      mrr = 1 / (i + 1);
      break;
    }
  }

  // NDCG@K with binary relevance (1 if relevant, 0 otherwise).
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    const rel = relevantSet.has(topK[i].documentId) ? 1 : 0;
    dcg += rel / Math.log2(i + 2);
  }
  const idealHits = Math.min(relevantSet.size, k);
  let idcg = 0;
  for (let i = 0; i < idealHits; i++) {
    idcg += 1 / Math.log2(i + 2);
  }
  const ndcg = idcg > 0 ? dcg / idcg : 0;

  return {
    precisionAtK,
    recallAtK,
    hitRateAtK,
    mrr,
    ndcg,
    k,
    groundTruthAvailable: true
  };
}
