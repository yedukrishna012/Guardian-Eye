import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Check, Loader2, Video } from 'lucide-react'
import { formatRelative, formatTime } from '../utils/format'

export default function EmergencyOverlay({
  emergency,
  onAcknowledge,
  onViewCamera,
  demo = false,
}) {
  const [now, setNow] = useState(Date.now())
  const [acknowledging, setAcknowledging] = useState(false)
  const [error, setError] = useState('')
  const acknowledgeRef = useRef(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    acknowledgeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  if (!emergency) return null

  async function handleAcknowledge() {
    setAcknowledging(true)
    setError('')

    try {
      await onAcknowledge?.(emergency)
    } catch (err) {
      console.error('Failed to acknowledge emergency:', err)
      setError('Could not acknowledge the alert. Check your connection and try again.')
    } finally {
      setAcknowledging(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-2xl sm:p-8"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      aria-describedby="emergency-reason"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-danger/15 motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]" />
        <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger/25 blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', bounce: 0.32 }}
        className="relative z-10 w-full max-w-2xl text-center"
      >
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-danger">
          <span className="h-2 w-2 rounded-full bg-danger motion-safe:animate-pulse" aria-hidden="true" />
          {demo ? 'Demo simulation' : 'Live emergency'}
        </div>

        <div className="emergency-pulse mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full border border-danger/50 bg-danger/15 shadow-danger sm:h-32 sm:w-32">
          <AlertTriangle className="h-14 w-14 text-danger motion-safe:animate-pulse sm:h-16 sm:w-16" aria-hidden="true" />
        </div>

        <h2
          id="emergency-title"
          className="text-5xl font-black uppercase tracking-[0.16em] text-white drop-shadow-[0_0_24px_rgba(239,68,68,0.9)] sm:text-7xl"
        >
          Emergency
        </h2>

        <div className="glass-panel-strong mt-6 border-danger/30 px-5 py-6 text-left sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-danger/20 pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-danger">
              Critical alert detected
            </p>
            <p className="text-xs text-gray-400">
              {formatRelative(emergency.timestamp, now)} · {formatTime(emergency.timestamp)}
            </p>
          </div>

          <p id="emergency-reason" className="mt-5 text-xl font-semibold leading-relaxed text-gray-100 sm:text-2xl">
            {emergency.reason}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 font-mono text-[11px] text-gray-500">
            <span>ID: {emergency.id?.slice(0, 12) || 'unknown'}</span>
            <span className={emergency.status === 'active' ? 'text-danger' : 'text-success'}>
              status: {emergency.status || 'active'}
            </span>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          {demo && (
            <p className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-primary">
              This is a read-only simulation. No emergency was sent to Firebase or to an emergency
              contact.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              ref={acknowledgeRef}
              type="button"
              onClick={handleAcknowledge}
              disabled={acknowledging}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {acknowledging ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
              Acknowledge &amp; dismiss
            </button>

            {onViewCamera && (
              <button
                type="button"
                onClick={onViewCamera}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                <Video className="h-4 w-4" aria-hidden="true" />
                View camera
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-gray-500">
            {demo
              ? 'Acknowledge to reset the simulation.'
              : 'Acknowledging marks this event as resolved in Firestore.'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
