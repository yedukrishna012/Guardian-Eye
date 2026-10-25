import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'

export default function Logo({ to, compact = false, className = '' }) {
  const content = (
    <>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/20 via-primary/20 to-violet-500/20 shadow-glow-cyan">
        <span className="absolute inset-x-1 top-1 h-1/2 rounded-full bg-white/10 blur-md" />
        <Eye className="relative h-5 w-5 text-accent" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold uppercase tracking-[0.18em] text-white">
          Guardian <span className="text-accent">Eye</span>
        </span>
      )}
    </>
  )

  const classes = `inline-flex items-center gap-3 ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="Guardian Eye home">
        {content}
      </Link>
    )
  }

  return <span className={classes}>{content}</span>
}
