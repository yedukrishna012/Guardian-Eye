import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Clock3,
  Download,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import StatCard from './StatCard'
import ActivityChart from './ActivityChart'
import {
  buildCategoryBreakdown,
  buildDailySeries,
  categorizeReason,
  downloadCsv,
  formatDateTime,
  formatRelative,
  toDate,
} from '../utils/format'

const RANGE_OPTIONS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: 'all', label: 'All time' },
]

const CATEGORY_STYLES = {
  Fall: 'border-primary/20 bg-primary/10 text-primary',
  Voice: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
  Gesture: 'border-warning/20 bg-warning/10 text-warning',
  Test: 'border-white/10 bg-white/5 text-gray-400',
  Other: 'border-white/10 bg-white/5 text-gray-400',
}

function getChartDays(range, events, now) {
  if (range === '7d') return 7
  if (range === '30d') return 30

  const reference = now || Date.now()
  const dates = events
    .map((event) => toDate(event.timestamp))
    .filter(Boolean)
    .map((date) => date.getTime())

  if (dates.length === 0) return 30

  const earliest = Math.min(...dates)
  const days = Math.ceil((reference - earliest) / (24 * 60 * 60 * 1000)) + 1
  return Math.min(90, Math.max(7, days))
}

export default function IncidentExplorer({
  emergencies,
  loading = false,
  exportPrefix = 'guardian-eye-incidents',
  emptyTitle = 'No incidents yet',
  emptyMessage = 'Confirmed emergencies will appear here as soon as the edge device reports them.',
}) {
  const [range, setRange] = useState('30d')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const cutoff = useMemo(() => {
    if (range === 'all') return null

    const date = new Date()
    date.setDate(date.getDate() - (range === '7d' ? 7 : 30))
    return date
  }, [range])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return emergencies.filter((event) => {
      const eventDate = toDate(event.timestamp)

      if (cutoff && (!eventDate || eventDate < cutoff)) return false
      if (statusFilter !== 'all' && event.status !== statusFilter) return false
      if (
        normalizedSearch &&
        !`${event.reason || ''} ${event.id || ''}`.toLowerCase().includes(normalizedSearch)
      ) {
        return false
      }

      return true
    })
  }, [cutoff, emergencies, search, statusFilter])

  const activeCount = filtered.filter((event) => event.status === 'active').length
  const resolvedCount = filtered.length - activeCount
  const lastEvent = filtered[0]
  const chartDays = getChartDays(range, filtered, now)
  const series = useMemo(() => buildDailySeries(filtered, chartDays), [filtered, chartDays])
  const categories = useMemo(() => buildCategoryBreakdown(filtered), [filtered])
  const maxCategory = Math.max(1, ...categories.map((category) => category.count))
  const displayed = filtered.slice(0, visibleCount)
  const hasFilters = range !== '30d' || statusFilter !== 'all' || search.trim() !== ''

  const exportRows = filtered.map((event) => ({
    timestamp: formatDateTime(event.timestamp),
    reason: event.reason || '',
    category: categorizeReason(event.reason),
    status: event.status || '',
    id: event.id,
  }))

  function resetFilters() {
    setRange('30d')
    setStatusFilter('all')
    setSearch('')
    setVisibleCount(20)
  }

  function exportCsv() {
    downloadCsv(
      `${exportPrefix}-${new Date().toISOString().slice(0, 10)}.csv`,
      exportRows,
      [
        { key: 'timestamp', label: 'Date & time' },
        { key: 'reason', label: 'Reason' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'id', label: 'Event ID' },
      ],
    )
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Total events"
          value={filtered.length}
          hint={`${emergencies.length} all time`}
          tone="primary"
          delay={0}
        />
        <StatCard
          icon={ShieldAlert}
          label="Active alerts"
          value={activeCount}
          hint="Awaiting acknowledgement"
          tone={activeCount > 0 ? 'danger' : 'success'}
          delay={0.05}
        />
        <StatCard
          icon={ShieldCheck}
          label="Resolved"
          value={resolvedCount}
          hint="Acknowledged by a guardian"
          tone="success"
          delay={0.1}
        />
        <StatCard
          icon={Clock3}
          label="Last incident"
          value={lastEvent ? formatRelative(lastEvent.timestamp, now) : 'None'}
          hint={lastEvent ? formatDateTime(lastEvent.timestamp) : 'No events in range'}
          tone="warning"
          delay={0.15}
        />
      </div>

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1.55fr_0.45fr]">
        <ActivityChart
          series={series}
          title={`Incident activity · last ${chartDays} days`}
          subtitle={`${filtered.length} events in the current filter`}
        />

        <section className="glass-panel min-w-0 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
            By signal
          </h2>
          <p className="mt-1 text-[11px] text-gray-500">How the current incidents break down.</p>

          <div className="mt-5 space-y-4">
            {categories.length === 0 ? (
              <p className="rounded-xl border border-white/5 bg-black/20 p-4 text-center text-xs text-gray-500">
                No incidents match this filter.
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-semibold text-gray-300">{category.name}</span>
                    <span className="font-mono text-gray-500">{category.count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${(category.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
              Categories
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              Fall, voice, and gesture events are grouped from the reason text written by the Python
              decision engine. Test alerts are grouped separately.
            </p>
          </div>
        </section>
      </div>

      <section className="glass-panel mt-5 min-w-0 overflow-hidden" aria-label="Incident log">
        <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
                Security log
              </h2>
              <p className="mt-1 text-[11px] text-gray-500">
                Showing {displayed.length} of {filtered.length} matching events
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setRange(option.id)
                      setVisibleCount(20)
                    }}
                    aria-pressed={range === option.id}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                      range === option.id
                        ? 'bg-primary text-white'
                        : 'text-gray-500 hover:text-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setVisibleCount(20)
                }}
                aria-label="Filter by status"
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-gray-300 outline-none focus:border-primary/50"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-primary/50">
                <Search className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setVisibleCount(20)
                  }}
                  placeholder="Search reason or ID"
                  aria-label="Search incidents"
                  className="w-full bg-transparent py-2 text-xs text-gray-200 outline-none placeholder:text-gray-600 sm:w-44"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setVisibleCount(20)
                    }}
                    className="text-gray-500 transition hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] font-semibold text-primary transition hover:text-accent"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={exportCsv}
                disabled={filtered.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="h-12 w-12 text-success/60" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-gray-300">
              {hasFilters ? 'No incidents match this filter' : emptyTitle}
            </p>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              {hasFilters
                ? 'Try widening the date range, clearing the search, or switching the status filter.'
                : emptyMessage}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-surface/40 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Date &amp; time</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Reason</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Signal</th>
                    <th scope="col" className="px-5 py-3 text-center font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Event ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayed.map((event) => {
                    const category = categorizeReason(event.reason)

                    return (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-400">
                          <span className="block font-medium text-gray-300">
                            {formatRelative(event.timestamp, now)}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {formatDateTime(event.timestamp)}
                          </span>
                        </td>
                        <td className="max-w-md px-5 py-3.5">
                          <p className="truncate text-xs font-medium text-gray-200" title={event.reason}>
                            {event.reason}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              CATEGORY_STYLES[category] || CATEGORY_STYLES.Other
                            }`}
                          >
                            {category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              event.status === 'active'
                                ? 'border-danger/25 bg-danger/10 text-danger'
                                : 'border-success/25 bg-success/10 text-success'
                            }`}
                          >
                            {event.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-[10px] text-gray-600 transition group-hover:text-primary">
                          {event.id.slice(0, 12)}…
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > displayed.length && (
              <div className="border-t border-white/5 p-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 20)}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Load 20 more
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
