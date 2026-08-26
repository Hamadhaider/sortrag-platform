export function Panel({
  title,
  eyebrow,
  children,
  className = ""
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-panel rule-top rule-bottom sm:border sm:border-rule sm:rounded ${className}`}>
      {(title || eyebrow) && (
        <div className="px-5 pt-4 pb-3 rule-bottom">
          {eyebrow && (
            <div className="text-[11px] font-mono tracking-widest text-ink-soft uppercase">{eyebrow}</div>
          )}
          {title && <h2 className="font-display text-lg font-semibold mt-0.5">{title}</h2>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  accent = false
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-panel border border-rule rounded p-4">
      <div className="text-[11px] font-mono tracking-widest text-ink-soft uppercase">{label}</div>
      <div className={`font-tabular text-2xl font-semibold mt-1 ${accent ? "text-signal" : ""}`}>
        {value}
        {unit && <span className="text-sm font-body text-ink-soft ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export function Pill({ pass, children }: { pass: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded ${
        pass ? "bg-pass/10 text-pass" : "bg-fail/10 text-fail"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${pass ? "bg-pass" : "bg-fail"}`} />
      {children}
    </span>
  );
}
