import { FairnessCheck } from "@/lib/benchmark/runner";
import { Pill } from "./Card";

export function FairnessChecklist({ checks }: { checks: FairnessCheck[] }) {
  const allPass = checks.every((c) => c.pass);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold">Experimental Fairness Checklist</h3>
        <Pill pass={allPass}>{allPass ? "ALL CONDITIONS MET" : "REVIEW REQUIRED"}</Pill>
      </div>
      <ul className="space-y-1.5">
        {checks.map((c, i) => (
          <li key={i} className="flex items-center justify-between text-sm rule-bottom py-1.5 last:border-b-0">
            <span>{c.label}</span>
            <Pill pass={c.pass}>{c.pass ? "PASS" : "FAIL"}</Pill>
          </li>
        ))}
      </ul>
    </div>
  );
}
