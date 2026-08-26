/**
 * Generates an Experiment ID like "RAG-2026-0001".
 * The counter is persisted (via the caller, see lib/storage/local.ts) so IDs
 * stay unique and increasing rather than relying on the current timestamp
 * alone, which section 15 explicitly warns against as a sole identifier.
 */
export function generateExperimentId(year: number, sequence: number): string {
  return `RAG-${year}-${String(sequence).padStart(4, "0")}`;
}
