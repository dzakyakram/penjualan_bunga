/** Daftar batang horizontal sederhana untuk peringkat. */
export function BarList({
  rows,
  empty,
}: {
  rows: { key: string; label: string; value: number; display: string; hint?: string }[]
  empty: string
}) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ol className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium">{r.label}</span>
            <span className="shrink-0 font-semibold">{r.display}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/55 shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)]" role="presentation">
            <div className="glass-primary h-full rounded-full !p-0" style={{ width: `${Math.max(6, (r.value / max) * 100)}%` }} />
          </div>
          {r.hint && <p className="mt-0.5 text-xs text-muted-foreground">{r.hint}</p>}
        </li>
      ))}
    </ol>
  )
}
