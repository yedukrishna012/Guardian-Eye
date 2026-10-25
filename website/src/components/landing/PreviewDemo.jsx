import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Play,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Video,
} from 'lucide-react'
import StatusOrb from '../StatusOrb'

const INITIAL_COUNTDOWN = 10

export default function PreviewDemo() {
  const [phase, setPhase] = useState('idle')
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN)

  useEffect(() => {
    if (phase !== 'fall') return undefined

    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, INITIAL_COUNTDOWN - Math.floor(elapsed / 1000))
      setCountdown(remaining)

      if (remaining === 0) {
        window.clearInterval(timer)
        setPhase('confirmed')
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [phase])

  function startSimulation() {
    setCountdown(INITIAL_COUNTDOWN)
    setPhase('fall')
  }

  function resetSimulation() {
    setCountdown(INITIAL_COUNTDOWN)
    setPhase('idle')
  }

  const isAlert = phase === 'fall' || phase === 'confirmed'
  const progress = ((INITIAL_COUNTDOWN - countdown) / INITIAL_COUNTDOWN) * 100

  return (
    <div className="glass-panel-strong relative overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ScanLine className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-300">
              Dashboard preview
            </p>
            <p className="text-[10px] text-gray-500">Simulated device · no live data</p>
          </div>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
            isAlert
              ? 'border-danger/30 bg-danger/10 text-danger'
              : 'border-success/30 bg-success/10 text-success'
          }`}
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAlert ? 'bg-danger motion-safe:animate-pulse' : 'bg-success'
            }`}
            aria-hidden="true"
          />
          {phase === 'confirmed' ? 'Emergency confirmed' : isAlert ? 'Fall detected' : 'System secure'}
        </span>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#04070d]">
          <div className="absolute inset-0 bg-dot-grid opacity-30" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.18),transparent_60%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-accent/10 to-transparent motion-safe:animate-scan" aria-hidden="true" />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 backdrop-blur">
            <Video className="h-3 w-3" aria-hidden="true" />
            Simulated feed
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative grid h-32 w-32 place-items-center sm:h-40 sm:w-40">
              <span className="absolute inset-0 rounded-full border border-primary/20" aria-hidden="true" />
              <span className="absolute inset-4 rounded-full border border-accent/20" aria-hidden="true" />
              <span className="absolute h-px w-full bg-accent/20" aria-hidden="true" />
              <span className="absolute h-full w-px bg-accent/20" aria-hidden="true" />
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-full border backdrop-blur ${
                  isAlert
                    ? 'border-danger/30 bg-danger/10 text-danger'
                    : 'border-success/25 bg-success/10 text-success'
                }`}
              >
                {isAlert ? (
                  <Activity className="h-7 w-7 motion-safe:animate-pulse" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-7 w-7" aria-hidden="true" />
                )}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {phase === 'confirmed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-4 text-center backdrop-blur-sm"
              >
                <span className="rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-danger">
                  Simulated emergency
                </span>
                <p className="max-w-xs text-sm font-bold leading-relaxed text-white">
                  Fall detected for ≥ 10 seconds
                </p>
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-xs font-bold text-white transition hover:bg-red-500"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Acknowledge
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Guardian status
              </p>
              <p className={`mt-1 text-lg font-bold ${isAlert ? 'text-danger' : 'text-success'}`}>
                {phase === 'confirmed'
                  ? 'Emergency confirmed'
                  : phase === 'fall'
                    ? 'Timing the fall'
                    : 'All clear'}
              </p>
            </div>
            <StatusOrb state={isAlert ? 'alert' : 'secure'} size="sm" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[11px]">
              <span className="flex items-center gap-2 text-gray-400">
                <Activity className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Vision
              </span>
              <span className={phase !== 'idle' ? 'text-warning' : 'text-gray-600'}>
                {phase !== 'idle' ? 'Fall detected' : 'Monitoring'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-[11px]">
              <span className="flex items-center gap-2 text-gray-400">
                <Clock3 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                10-second rule
              </span>
              <span className={phase === 'fall' ? 'font-mono text-warning' : phase === 'confirmed' ? 'text-danger' : 'text-gray-600'}>
                {phase === 'fall' ? `${countdown}s` : phase === 'confirmed' ? 'Satisfied' : 'Armed'}
              </span>
            </div>
          </div>

          {phase === 'fall' && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-warning to-danger transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                The alert fires only if the fall condition persists for the full 10 seconds.
              </p>
            </div>
          )}

          <div className="mt-auto pt-4">
            {phase === 'idle' ? (
              <button
                type="button"
                onClick={startSimulation}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primaryDark"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Simulate a fall
              </button>
            ) : (
              <button
                type="button"
                onClick={resetSimulation}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset preview
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/5 bg-black/20 px-4 py-3 text-[11px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p>This preview runs entirely in your browser. Nothing is written to Firebase.</p>
        <Link
          to="/demo"
          className="inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-accent"
        >
          Open the full demo
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
