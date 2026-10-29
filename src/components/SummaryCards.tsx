import { formatCurrency, summarize } from "../utils/spend"

export function SummaryCards({ summary }: { summary: ReturnType<typeof summarize> }) {
  const cards = [
    { label: "Total spend", value: formatCurrency(summary.total), hint: `${summary.count} transactions` },
    { label: "Average transaction", value: formatCurrency(summary.average), hint: "per transaction" },
    {
      label: "Pending approval",
      value: formatCurrency(summary.pendingAmount),
      hint: `${summary.pendingCount} awaiting review`,
    },
  ]
  return (
    <section className="cards" aria-label="Spend summary">
      {cards.map((c) => (
        <div key={c.label} className="card">
          <span className="card-label">{c.label}</span>
          <strong className="card-value">{c.value}</strong>
          <span className="card-hint">{c.hint}</span>
        </div>
      ))}
    </section>
  )
}
