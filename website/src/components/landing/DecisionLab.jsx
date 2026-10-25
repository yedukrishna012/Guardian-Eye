import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  Check,
  HandMetal,
  Mic,
  Minus,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const RULES = [
  {
    id: 'voice-3',
    title: 'Repeated voice keyword',
    detail: '3 keywords within 20 seconds',
    reason: 'Voice emergency keyword repeated ≥ 3 times within 20 seconds',
    latency: 0.1,
    latencyLabel: 'on 3rd keyword',
  },
  {
    id: 'chest-voice',
    title: 'Gesture + voice',
    detail: 'Hand on chest plus one keyword',
    reason: 'Hand on chest + voice emergency keyword',
    latency: 0.2,
    latencyLabel: 'immediate',
  },
  {
    id: 'fall-voice',
    title: 'Fall + voice',
    detail: 'Fall for 5 seconds plus one keyword',
    reason: 'Fall ≥ 5 seconds + voice emergency keyword',
    latency: 5,
    latencyLabel: '5 s',
  },
  {
    id: 'fall-10',
    title: 'Fall alone',
    detail: 'Fall persists for 10 seconds',
    reason: 'Fall detected for ≥ 10 seconds',
    latency: 10,
    latencyLabel: '10 s',
  },
  {
    id: 'chest-10',
    title: 'Hand on chest alone',
    detail: 'Gesture held for 10 seconds',
    reason: 'Hand on chest detected for ≥ 10 seconds',
    latency: 10.1,
    latencyLabel: '10 s',
  },
]

function SensorCard({ active, icon: Icon, title, subtitle, onToggle, children, tone }) {
  const toneClasses = {
    vision: active
      ? 'border-primary/40 bg-primary/10 shadow-glow'
      : 'border-white/10 bg-black/20 hover:border-primary/25',
    audio: active
      ? 'border-violet-400/40 bg-violet-500/10 shadow-[0_0_40px_rgba(167,139,250,0.2)]'
      : 'border-white/10 bg-black/20 hover:border-violet-400/25',
    gesture: active
      ? 'border-warning/40 bg-warning/10 shadow-[0_0_40px_rgba(245,158,11,0.18)]'
      : 'border-white/10 bg-black/20 hover:border-warning/25',
  }

  const iconClasses = {
    vision: active ? 'text-primary' : 'text-gray-500',
    audio: active ? 'text-violet-300' : 'text-gray-500',
    gesture: active ? 'text-warning' : 'text-gray-500',
  }

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/30 ${iconClasses[tone]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-[11px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={active}
          aria-label={`${active ? 'Turn off' : 'Turn on'} ${title.toLowerCase()}`}
          className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
            active ? 'border-accent/50 bg-accent/30' : 'border-white/10 bg-white/5'
          }`}
        >
          <span
            className={`absolute top-0.5 rounded-full bg-white shadow transition-all ${
              active ? 'left-[1.45rem]' : 'left-0.5'
            }`}
            style={{ height: '1.125rem', width: '1.125rem' }}
          />
        </button>
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default function DecisionLab() {
  const [fall, setFall] = useState(false)
  const [voiceCount, setVoiceCount] = useState(0)
  const [chest, setChest] = useState(false)

  const hasVoice = voiceCount > 0

  const matchedRules = useMemo(
    () =>
      RULES.map((rule) => ({
        ...rule,
        active:
          (rule.id === 'fall-10' && fall) ||
          (rule.id === 'fall-voice' && fall && hasVoice) ||
          (rule.id === 'voice-3' && voiceCount >= 3) ||
          (rule.id === 'chest-10' && chest) ||
          (rule.id === 'chest-voice' && chest && hasVoice),
      })).filter((rule) => rule.active),
    [chest, fall, hasVoice, voiceCount],
  )

  const firstRule = useMemo(() => {
    if (matchedRules.length === 0) return null
    return matchedRules.reduce((first, rule) => (rule.latency < first.latency ? rule : first))
  }, [matchedRules])

  function reset() {
    setFall(false)
    setVoiceCount(0)
    setChest(false)
  }

  function changeVoice(delta) {
    setVoiceCount((count) => Math.min(3, Math.max(0, count + delta)))
  }

  return (
    <div className="glass-panel-strong overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Interactive rule explorer
          </div>
          <h3 className="mt-1 text-xl font-bold text-white">Inside the decision engine</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray-500">
            Toggle the simulated signals to see which rule from{' '}
            <span className="font-mono text-gray-400">decision_engine.py</span> would confirm an
            emergency first.
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          disabled={!fall && !hasVoice && !chest}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Sensor inputs
          </p>

          <SensorCard
            active={fall}
            icon={Activity}
            title="Vision · fall"
            subtitle="Pose-based fall detector"
            onToggle={() => setFall((value) => !value)}
            tone="vision"
          >
            <p className="text-[11px] leading-relaxed text-gray-500">
              {fall
                ? 'Fall detected. The engine is now timing how long the condition persists.'
                : 'No fall detected. Toggle to simulate a sustained fall.'}
            </p>
          </SensorCard>

          <SensorCard
            active={hasVoice}
            icon={Mic}
            title="Audio · distress keyword"
            subtitle="English or Malayalam keyword"
            onToggle={() => setVoiceCount((count) => (count > 0 ? 0 : 1))}
            tone="audio"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-gray-500">
                {voiceCount === 0
                  ? 'No keyword detected.'
                  : `${voiceCount} keyword${voiceCount === 1 ? '' : 's'} in the 20-second window.`}
              </p>
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => changeVoice(-1)}
                  disabled={voiceCount === 0}
                  className="grid h-6 w-6 place-items-center rounded-md text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Remove a voice keyword"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center font-mono text-xs text-gray-300">{voiceCount}</span>
                <button
                  type="button"
                  onClick={() => changeVoice(1)}
                  disabled={voiceCount >= 3}
                  className="grid h-6 w-6 place-items-center rounded-md text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Add a voice keyword"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </SensorCard>

          <SensorCard
            active={chest}
            icon={HandMetal}
            title="Gesture · hand on chest"
            subtitle="Keypoint-based gesture"
            onToggle={() => setChest((value) => !value)}
            tone="gesture"
          >
            <p className="text-[11px] leading-relaxed text-gray-500">
              {chest
                ? 'Hand-on-chest gesture held. The engine is timing the gesture.'
                : 'No gesture detected. Toggle to simulate a sustained hand-on-chest signal.'}
            </p>
          </SensorCard>
        </div>

        <div className="flex flex-col rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Decision output
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                firstRule
                  ? 'border-danger/30 bg-danger/10 text-danger'
                  : 'border-success/30 bg-success/10 text-success'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  firstRule ? 'bg-danger motion-safe:animate-pulse' : 'bg-success'
                }`}
                aria-hidden="true"
              />
              {firstRule ? 'Emergency confirmed' : 'Monitoring'}
            </span>
          </div>

          <div className="mt-4 flex-1">
            <AnimatePresence mode="wait">
              {firstRule ? (
                <motion.div
                  key={firstRule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-danger/25 bg-danger/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-danger/30 bg-danger/15 text-danger">
                      <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-danger">
                        Triggers in {firstRule.latencyLabel}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-100">
                        {firstRule.reason}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="monitoring"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-success/20 bg-success/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-success/25 bg-success/10 text-success">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-success">
                        No condition confirmed
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-400">
                        Guardian Eye keeps watching. A single isolated signal does not raise an alarm
                        until its timer or combination rule is satisfied.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Rules in play
            </p>
            <ul className="space-y-1.5">
              {RULES.map((rule) => {
                const active = matchedRules.some((match) => match.id === rule.id)
                const first = firstRule?.id === rule.id

                return (
                  <li
                    key={rule.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[11px] transition ${
                      first
                        ? 'border-danger/30 bg-danger/10 text-gray-200'
                        : active
                          ? 'border-white/10 bg-white/5 text-gray-300'
                          : 'border-transparent bg-white/[0.02] text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`grid h-4 w-4 place-items-center rounded-full border ${
                          first
                            ? 'border-danger/50 bg-danger/20 text-danger'
                            : active
                              ? 'border-accent/40 bg-accent/10 text-accent'
                              : 'border-white/10 text-transparent'
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="font-semibold">{rule.title}</span>
                        <span className="ml-1.5 text-gray-600">· {rule.detail}</span>
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-gray-500">
                      {rule.latencyLabel}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-gray-600">
            Simulated rule explorer. The real engine also tracks camera state, debounces duplicate
            keywords, and resets after an emergency completes.
          </p>
        </div>
      </div>
    </div>
  )
}
