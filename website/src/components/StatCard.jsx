import { motion } from 'framer-motion'

const TONES = {
  primary: {
    icon: 'border-primary/20 bg-primary/10 text-primary',
    glow: 'group-hover:shadow-glow',
  },
  danger: {
    icon: 'border-danger/20 bg-danger/10 text-danger',
    glow: 'group-hover:shadow-danger',
  },
  success: {
    icon: 'border-success/20 bg-success/10 text-success',
    glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]',
  },
  warning: {
    icon: 'border-warning/20 bg-warning/10 text-warning',
    glow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]',
  },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
  delay = 0,
  className = '',
}) {
  const styles = TONES[tone] || TONES.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -3 }}
      className={`glass-panel group p-5 transition-all duration-300 ${styles.glow} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${styles.icon}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </motion.div>
  )
}
