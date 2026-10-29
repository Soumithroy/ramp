import { formatCurrency, summarize } from "../utils/spend"

export function CategoryBreakdown({ data }: { data: ReturnType<typeof summarize>["byCategory"] }) {
  const max = Math.max(1, ...data.map((d) => d.amount))
  return (
    <section className="panel" aria-labelledby="by-category">
      <h2 id="by-category">Spend by category</h2>
      <ul className="bars">
        {data.map((d) => (
          <li key={d.category}>
            <span className="bar-label">{d.category}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(d.amount / max) * 100}%` }} />
            </span>
            <span className="bar-value">{formatCurrency(d.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
