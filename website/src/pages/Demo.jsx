import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BellRing,
  Camera,
  CheckCircle2,
  ExternalLink,
  Github,
  HandMetal,
  Info,
  LayoutDashboard,
  Mic,
  Radio,
  RotateCcw,
  ShieldCheck,
  Siren,
  Smartphone,
  Wifi,
} from 'lucide-react'
import Logo from '../components/Logo'
import InstallButton from '../components/InstallButton'
import StatusOrb from '../components/StatusOrb'
import StatCard from '../components/StatCard'
import EmergencyOverlay from '../components/EmergencyOverlay'
import CameraFeed from '../components/CameraFeed'
import IncidentExplorer from '../components/IncidentExplorer'
import { createDemoEmergencies, createSimulatedEmergency } from '../demo/mockData'
import { categorizeReason, formatDateTime, formatRelative } from '../utils/format'

const SIGNALS = [
  {
    icon: Activity,
    name: 'Vision',
    detail: 'Fall detection',
    tone: 'border-primary/20 bg-primary/10 text-primary',
  },
  {
    icon: Mic,
    name: 'Audio',
    detail: 'Keyword listener',
    tone: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
  },
  {
    icon: HandMetal,
    name: 'Gesture',
    detail: 'Hand on chest',
    tone: 'border-warning/20 bg-warning/10 text-warning',
  },
]

const DEMO_FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Realtime dashboard',
    text: 'Active alerts open a full-screen emergency overlay until a guardian acknowledges them.',
  },
  {
    icon: BellRing,
    title: 'Incident history',
    text: 'Filter by range and status, search reasons, inspect signals, and export the current view as CSV.',
  },
  {
    icon: Camera,
    title: 'Local camera feed',
    text: 'Connect to a Guardian Eye device on your LAN, enter an optional stream token, retry, or go fullscreen.',
  },
  {
    icon: Smartphone,
    title: 'Installable PWA',
    text: 'Add Guardian Eye to your home screen. The installer appears when your browser supports it.',
  },
]

export default function Demo() {
  const [events, setEvents] = useState(() => createDemoEmergencies())
  const [simulatedEmergency, setSimulatedEmergency] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const closeCamera = useCallback(() => setCameraOpen(false), [])

  const activeCount = events.filter((event) => event.status === 'active').length
  const resolvedCount = events.length - activeCount
  const lastEvent = events[0]

  const recentEvents = useMemo(() => events.slice(0, 5), [events])

  function simulateEmergency() {
    const emergency = createSimulatedEmergency()
    setEvents((current) => [emergency, ...current])
    setSimulatedEmergency(emergency)
  }

  async function acknowledgeEmergency(emergency) {
    setEvents((current) =>
      current.map((event) =>
        event.id === emergency.id ? { ...event, status: 'resolved' } : event,
      ),
    )
    setSimulatedEmergency(null)
  }

  function resetDemo() {
    setEvents(createDemoEmergencies())
    setSimulatedEmergency(null)
    setNow(Date.now())
  }

  return (
    <div className="min-h-screen bg-background font-sans text-gray-100">
      <AnimatePresence>
        {simulatedEmergency && (
          <EmergencyOverlay
            emergency={simulatedEmergency}
            onAcknowledge={acknowledgeEmergency}
            onViewCamera={() => setCameraOpen(true)}
            demo
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{cameraOpen && <CameraFeed onClose={closeCamera} />}</AnimatePresence>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo to="/" />
            <span className="hidden rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-accent sm:inline-flex">
              Public demo
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Demo">
            <a
              href="#overview"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Overview
            </a>
            <a
              href="#incident-history"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Incident history
            </a>
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Public site
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <InstallButton compact className="hidden sm:inline-flex" />
            <Link
              to="/login"
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primaryDark"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="overview" className="scroll-mt-20 border-b border-white/5 bg-surface/15">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-warning">
                  <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                  Read-only simulation
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  The Guardian Eye dashboard,
                  <span className="block text-gradient">without the hardware.</span>
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
                  Explore the emergency overlay, incident history, statistics, and camera UI with
                  simulated data. Everything runs in your browser.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={simulateEmergency}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
                >
                  <Siren className="h-4 w-4" aria-hidden="true" />
                  Simulate an emergency
                </button>
                <a
                  href="#incident-history"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Incident history
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            <div className="mt-6 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-[11px] leading-relaxed text-primary sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                All events are simulated. No Telegram message, SMS, or Firestore write is sent.
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={resetDemo}
                  className="inline-flex items-center gap-1.5 font-bold underline underline-offset-2 transition hover:text-accent"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset demo data
                </button>
                <Link to="/signup" className="font-bold underline underline-offset-2 transition hover:text-accent">
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Siren}
              label="Active alerts"
              value={activeCount}
              hint={activeCount > 0 ? 'Simulated emergency in progress' : 'All alerts acknowledged'}
              tone={activeCount > 0 ? 'danger' : 'success'}
            />
            <StatCard
              icon={Activity}
              label="Total incidents"
              value={events.length}
              hint="In this simulation"
              tone="primary"
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
              icon={BellRing}
              label="Last incident"
              value={lastEvent ? formatRelative(lastEvent.timestamp, now) : 'None'}
              hint={lastEvent ? formatDateTime(lastEvent.timestamp) : 'No incidents yet'}
              tone="warning"
              delay={0.15}
            />
          </div>

          <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="glass-panel relative flex min-h-[30rem] min-w-0 flex-col items-center justify-center overflow-hidden p-6 text-center sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.12),transparent_60%)]"
                aria-hidden="true"
              />

              <div className="relative z-10 flex w-full min-w-0 flex-col items-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    <Wifi className="h-3 w-3" aria-hidden="true" />
                    Device online
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    Simulated feed
                  </span>
                </div>

                <div className="mt-4">
                  <StatusOrb state="secure" size="lg" />
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-success">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  System secure
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  No confirmed emergencies
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-400">
                  Guardian Eye is watching for a sustained fall, a distress keyword, or a gesture
                  combination. Trigger the simulation to see what a guardian sees.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={simulateEmergency}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primaryDark"
                  >
                    <Siren className="h-4 w-4" aria-hidden="true" />
                    Trigger emergency overlay
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Try the camera UI
                  </button>
                </div>

                <p className="mt-4 max-w-md text-[10px] leading-relaxed text-gray-600">
                  The camera view needs a Guardian Eye device on your local network. No video is
                  uploaded by this demo.
                </p>
              </div>
            </section>

            <div className="min-w-0 space-y-5">
              <section className="glass-panel p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
                    Recent activity
                  </h2>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-gray-400">
                    {events.length} events
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {recentEvents.map((event) => {
                    const category = categorizeReason(event.reason)

                    return (
                      <div
                        key={event.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-200" title={event.reason}>
                            {event.reason}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-500">
                            {formatRelative(event.timestamp, now)} · {category}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                            event.status === 'active'
                              ? 'border-danger/25 bg-danger/10 text-danger'
                              : 'border-success/25 bg-success/10 text-success'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="glass-panel p-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
                  Sensor inputs
                </h2>
                <div className="mt-4 space-y-2">
                  {SIGNALS.map((signal) => {
                    const Icon = signal.icon

                    return (
                      <div
                        key={signal.name}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`grid h-8 w-8 place-items-center rounded-lg border ${signal.tone}`}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-xs font-semibold text-gray-200">{signal.name}</span>
                            <span className="text-[10px] text-gray-500">{signal.detail}</span>
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-success">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                          Monitoring
                        </span>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-[10px] leading-relaxed text-gray-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  The demo does not run detection models. Tap “Simulate an emergency” to test the
                  alert path.
                </p>
              </section>
            </div>
          </div>
        </div>

        <section id="incident-history" className="scroll-mt-20 border-y border-white/5 bg-surface/15">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                  Demo statistics
                </div>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Incident history &amp; trends
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-400">
                  The same filters, chart, and CSV export as the authenticated statistics page — using
                  simulated incidents.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-warning/25 bg-warning/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-warning">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                Simulated data
              </span>
            </div>

            <IncidentExplorer
              emergencies={events}
              exportPrefix="guardian-eye-demo"
              emptyTitle="No demo incidents"
              emptyMessage="Reset the demo data or simulate an emergency to populate the history."
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-white">
                What this demo covers
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Every interactive surface of the guardian dashboard, without connecting a device or
                creating an account.
              </p>

              <div className="mt-6 space-y-4">
                {DEMO_FEATURES.map((feature) => {
                  const Icon = feature.icon

                  return (
                    <div key={feature.title} className="flex gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{feature.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{feature.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-primary/20 via-surface to-violet-500/10 p-6 shadow-glow sm:p-8">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />

              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Ready for real data
                </div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                  Connect your own Guardian Eye.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Create an account, add your Firebase configuration, pair the Raspberry Pi with your
                  UID, and the real dashboard will listen for live emergencies.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-gray-300">
                  {[
                    'Realtime Firestore listener',
                    'Emergency overlay and acknowledgement',
                    'Statistics, filters, and CSV export',
                    'Camera stream with optional token',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="grid h-4 w-4 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-gray-100"
                  >
                    Create an account
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href="https://github.com/yedukrishna012/Guardian-Eye#-website"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Setup guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Logo to="/" />
            <span className="text-[11px] text-gray-600">
              © 2026 Yedukrishna R. MIT licensed.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500">
            <Link to="/" className="transition hover:text-white">Public site</Link>
            <Link to="/login" className="transition hover:text-white">Sign in</Link>
            <a
              href="https://github.com/yedukrishna012/Guardian-Eye"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
