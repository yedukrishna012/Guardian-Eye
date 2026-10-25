import { BarChart3 } from 'lucide-react'

export default function ActivityChart({ series, title = 'Incident activity', subtitle }) {
  const maxTotal = Math.max(1, ...series.map((day) => day.total))
  const total = series.reduce((sum, day) => sum + day.total, 0)
  const active = series.reduce((sum, day) => sum + day.active, 0)
  const labelEvery = series.length <= 7 ? 1 : series.length <= 14 ? 2 : 5

  return (
    <section className="glass-panel min-w-0 p-5 sm:p-6" aria-label={title}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            {total} total
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
            {active} active
          </span>
        </div>
      </div>

      <div className="relative mt-7">
        {total === 0 && (
          <p className="absolute inset-x-0 top-16 z-10 text-center text-sm text-gray-500">
            No incidents in this range.
          </p>
        )}
        <div className="flex h-40 items-end gap-1 sm:h-48 sm:gap-1.5">
          {series.map((day, index) => {
            const totalHeight = day.total === 0 ? 3 : Math.max(6, (day.total / maxTotal) * 100)
            const activeHeight = day.total === 0 ? 0 : (day.active / day.total) * 100
            const showLabel = index % labelEvery === 0 || index === series.length - 1

            return (
              <div key={day.key} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  className="relative w-full rounded-t-md border border-white/5 bg-gradient-to-t from-primary/70 to-accent/40 transition-all duration-300 group-hover:border-accent/40 group-hover:from-primary group-hover:to-accent/60"
                  style={{ height: `${totalHeight}%` }}
                  title={`${day.label}: ${day.total} event${day.total === 1 ? '' : 's'} (${day.active} active)`}
                >
                  {day.active > 0 && (
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-sm bg-danger/90"
                      style={{ height: `${activeHeight}%` }}
                    />
                  )}
                  <span className="pointer-events-none absolute inset-x-0 -top-6 text-center text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {day.total}
                  </span>
                </div>
                <span
                  className={`mt-2 truncate text-center text-[9px] uppercase tracking-wide ${
                    showLabel ? 'text-gray-500' : 'text-transparent'
                  }`}
                  aria-hidden={!showLabel}
                >
                  {series.length <= 14 ? day.shortLabel : day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="sr-only">
        {series
          .filter((day) => day.total > 0)
          .map((day) => `${day.label}: ${day.total} events, ${day.active} active`)
          .join('. ') || 'No incidents in this range.'}
      </p>
    </section>
  )
}
