import { AlertTriangle, ShieldCheck } from 'lucide-react'

const SIZES = {
  sm: {
    outer: 'h-28 w-28',
    middle: 'h-24 w-24',
    inner: 'h-16 w-16',
    icon: 'h-7 w-7',
  },
  md: {
    outer: 'h-40 w-40',
    middle: 'h-32 w-32',
    inner: 'h-24 w-24',
    icon: 'h-11 w-11',
  },
  lg: {
    outer: 'h-52 w-52',
    middle: 'h-40 w-40',
    inner: 'h-28 w-28',
    icon: 'h-14 w-14',
  },
}

export default function StatusOrb({ state = 'secure', size = 'lg' }) {
  const isAlert = state === 'alert'
  const isDemo = state === 'demo'
  const Icon = isAlert ? AlertTriangle : ShieldCheck
  const dimensions = SIZES[size] || SIZES.lg

  const tone = isAlert
    ? {
        ring: 'border-danger/30',
        glow: 'bg-danger/10',
        core: 'border-danger/40 bg-danger/10 text-danger shadow-danger',
        ping: 'border-danger/30',
      }
    : isDemo
      ? {
          ring: 'border-primary/30',
          glow: 'bg-primary/10',
          core: 'border-primary/40 bg-primary/10 text-primary shadow-glow',
          ping: 'border-primary/30',
        }
      : {
          ring: 'border-success/30',
          glow: 'bg-success/10',
          core: 'border-success/40 bg-success/10 text-success shadow-[0_0_60px_rgba(16,185,129,0.25)]',
          ping: 'border-success/30',
        }

  return (
    <div className={`relative grid ${dimensions.outer} place-items-center`} aria-hidden="true">
      <div className={`absolute inset-0 rounded-full border ${tone.ring} animate-pulse-ring`} />
      <div
        className={`absolute inset-4 rounded-full border ${tone.ping} animate-pulse-ring [animation-delay:1.2s]`}
      />
      <div className={`absolute inset-0 rounded-full ${tone.glow} blur-3xl`} />
      <div
        className={`relative grid ${dimensions.middle} place-items-center rounded-full border border-white/5 bg-background/60 backdrop-blur-2xl`}
      >
        <div
          className={`grid ${dimensions.inner} place-items-center rounded-full border ${tone.core} backdrop-blur-xl`}
        >
          <Icon className={`${dimensions.icon} ${isAlert ? 'animate-pulse' : ''}`} />
        </div>
      </div>
    </div>
  )
}
