export function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value) {
  const date = toDate(value)
  if (!date) return 'Pending'

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatTime(value) {
  const date = toDate(value)
  if (!date) return 'Now'

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatRelative(value, now) {
  const date = toDate(value)
  if (!date) return 'just now'

  const reference = now || Date.now()
  const seconds = Math.round((reference - date.getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function isOlderThanMinutes(value, minutes, now) {
  const date = toDate(value)
  if (!date) return false

  const reference = now || Date.now()
  return reference - date.getTime() > minutes * 60 * 1000
}

export function categorizeReason(reason = '') {
  const normalized = reason.toLowerCase()

  if (normalized.includes('test')) return 'Test'
  if (normalized.includes('fall')) return 'Fall'
  if (normalized.includes('voice') || normalized.includes('keyword')) return 'Voice'
  if (normalized.includes('chest') || normalized.includes('gesture')) return 'Gesture'
  return 'Other'
}

export function buildDailySeries(items, days, now = new Date()) {
  const buckets = []
  const index = new Map()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - offset)

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`

    const bucket = {
      key,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      shortLabel: date.toLocaleDateString(undefined, { weekday: 'short' }),
      total: 0,
      active: 0,
    }

    buckets.push(bucket)
    index.set(key, bucket)
  }

  items.forEach((item) => {
    const date = toDate(item.timestamp)
    if (!date) return

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`

    const bucket = index.get(key)
    if (!bucket) return

    bucket.total += 1
    if (item.status === 'active') bucket.active += 1
  })

  return buckets
}

export function buildCategoryBreakdown(items) {
  const totals = new Map()

  items.forEach((item) => {
    const category = categorizeReason(item.reason)
    totals.set(category, (totals.get(category) || 0) + 1)
  })

  return Array.from(totals, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

export function downloadCsv(filename, rows, columns) {
  const escapeCell = (value) => {
    let text = value == null ? '' : String(value)

    // Neutralize spreadsheet formula injection from reason text or IDs.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`

    return `"${text.replaceAll('"', '""')}"`
  }

  const header = columns.map((column) => escapeCell(column.label)).join(',')
  const body = rows
    .map((row) => columns.map((column) => escapeCell(row[column.key])).join(','))
    .join('\n')

  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
