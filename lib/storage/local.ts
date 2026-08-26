import { ComparisonResult } from "../benchmark/runner";
import { Distribution } from "../benchmark/generator";
import { generateExperimentId } from "../utils/id";

/**
 * STORAGE NOTE (section 29): experiment history here is stored in the
 * browser's localStorage. This is explicitly a LOCAL, PER-BROWSER store —
 * it is NOT a cloud database, is not shared across devices, and is cleared
 * if the user clears site data. The Documentation page must state this
 * plainly. If persistent multi-device storage is later needed, replace this
 * module with a real database-backed API route; the StoredExperiment shape
 * below is designed to map directly onto the Experiment/AlgorithmResult/
 * AggregatedResult schema described in section 55.
 */

const STORAGE_KEY = "sortrag.experiments.v1";
const SEQUENCE_KEY = "sortrag.experiment-sequence.v1";

export interface StoredExperiment {
  experimentId: string;
  timestamp: string; // ISO 8601
  config: {
    size: number;
    distribution: Distribution;
    seed: string | number;
    warmupRuns: number;
    measuredRuns: number;
  };
  result: ComparisonResult;
  environment: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function nextExperimentId(): string {
  const year = new Date().getFullYear();
  if (!isBrowser()) return generateExperimentId(year, 1);
  const raw = window.localStorage.getItem(SEQUENCE_KEY);
  const seq = raw ? parseInt(raw, 10) + 1 : 1;
  window.localStorage.setItem(SEQUENCE_KEY, String(seq));
  return generateExperimentId(year, seq);
}

export function saveExperiment(exp: StoredExperiment): void {
  if (!isBrowser()) return;
  const all = listExperiments();
  all.unshift(exp);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function listExperiments(): StoredExperiment[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredExperiment[];
  } catch {
    return [];
  }
}

export function deleteExperiment(experimentId: string): void {
  if (!isBrowser()) return;
  const remaining = listExperiments().filter((e) => e.experimentId !== experimentId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export function currentRuntimeEnvironment(): string {
  if (typeof navigator !== "undefined") return navigator.userAgent;
  return "server";
}
