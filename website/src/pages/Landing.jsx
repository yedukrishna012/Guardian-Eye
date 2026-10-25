import { Suspense, lazy, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  Camera,
  Check,
  Cpu,
  Eye,
  Github,
  HandMetal,
  HeartPulse,
  LockKeyhole,
  Menu,
  Mic,
  PhoneCall,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '../contexts/auth-context'
import Logo from '../components/Logo'
import InstallButton from '../components/InstallButton'
import DecisionLab from '../components/landing/DecisionLab'
import PreviewDemo from '../components/landing/PreviewDemo'

const HeroScene = lazy(() => import('../components/landing/HeroScene'))

const NAV_LINKS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Decision engine', href: '#decision-lab' },
  { label: 'Dashboard', href: '#preview' },
  { label: 'Team', href: '#developers' },
]

const STATS = [
  { value: '3', label: 'signal streams', detail: 'vision · gesture · voice' },
  { value: '10s', label: 'fall confirmation', detail: 'sustained condition' },
  { value: '20s', label: 'voice window', detail: '3 keywords to escalate' },
  { value: 'MIT', label: 'open source', detail: 'self-hostable' },
]

const CAPABILITIES = [
  {
    icon: Activity,
    index: '01',
    title: 'Fall detection',
    description:
      'YOLOv8 pose keypoints measure torso angle and body aspect ratio. A fall must persist for 10 seconds before it becomes an alert.',
    tags: ['YOLOv8 pose', 'Furniture-aware', '10s timer'],
    tone: 'from-primary/15 to-transparent border-primary/20',
    iconTone: 'border-primary/25 bg-primary/10 text-primary',
  },
  {
    icon: HandMetal,
    index: '02',
    title: 'Gesture recognition',
    description:
      'Wrist, shoulder, and hip positions identify hands-on-chest, raised hands, and crossed arms. A held chest gesture or a voice combination can escalate.',
    tags: ['17 keypoints', 'Hand on chest', 'Voice combo'],
    tone: 'from-warning/15 to-transparent border-warning/20',
    iconTone: 'border-warning/25 bg-warning/10 text-warning',
  },
  {
    icon: Mic,
    index: '03',
    title: 'Voice intelligence',
    description:
      'Distress keywords are recognized in English and Malayalam. English runs locally with Vosk; Malayalam uses Google Speech when connectivity allows. Three keywords within 20 seconds confirm an emergency.',
    tags: ['English + Malayalam', 'Vosk + Google', '20s window'],
    tone: 'from-violet-500/15 to-transparent border-violet-500/20',
    iconTone: 'border-violet-400/25 bg-violet-500/10 text-violet-300',
  },
  {
    icon: BellRing,
    index: '04',
    title: 'Alert chain',
    description:
      'Confirmed events sync to Firestore for the dashboard, notify Telegram contacts, and can also send an SMS through a SIM800L module.',
    tags: ['Firestore', 'Telegram', 'Optional GSM SMS'],
    tone: 'from-success/15 to-transparent border-success/20',
    iconTone: 'border-success/25 bg-success/10 text-success',
  },
]

const FLOW = [
  {
    icon: Camera,
    title: 'Sense',
    description: 'Camera frames and microphone audio are processed locally.',
  },
  {
    icon: Cpu,
    title: 'Decide',
    description: 'A timed state machine fuses the three signals and debounces duplicates.',
  },
  {
    icon: Wifi,
    title: 'Sync',
    description: 'A confirmed event is written to users/{uid}/emergencies in Firestore.',
  },
  {
    icon: BellRing,
    title: 'Respond',
    description: 'Dashboard overlay, Telegram message, and optional GSM SMS.',
  },
]

const DEVELOPERS = [
  'Jubin T Joseph',
  'Muhammed Nabeel Sha A',
  'Rishijith Karthikeyan M',
  'Yedukrishna R',
]

function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55 }}
      className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-gray-400 sm:text-base">{description}</p>
      )}
    </motion.div>
  )
}

function HeroHud() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="pointer-events-none absolute left-[4%] top-[24%] z-10 hidden w-52 xl:block"
      >
        <div className="animate-float rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-2xl backdrop-blur-xl [animation-delay:0.2s]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            <span>Vision</span>
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Live
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Fall detector</p>
              <p className="text-[10px] text-gray-500">10s confirmation timer</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="pointer-events-none absolute right-[4%] top-[20%] z-10 hidden w-56 xl:block"
      >
        <div className="animate-float rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-2xl backdrop-blur-xl [animation-delay:1.4s]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            <span>Audio</span>
            <span className="text-accent">Listening</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Mic className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Keyword listener</p>
              <div className="mt-2 flex h-5 items-end gap-1" aria-hidden="true">
                {[35, 65, 45, 85, 55, 30, 70, 50, 90, 40, 60, 35].map((height, index) => (
                  <span
                    key={index}
                    className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-accent motion-safe:animate-pulse"
                    style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="pointer-events-none absolute bottom-[18%] left-[7%] z-10 hidden w-56 xl:block"
      >
        <div className="animate-float rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-2xl backdrop-blur-xl [animation-delay:2s]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            <span>Response</span>
            <span className="text-success">Ready</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-300">
            <span className="rounded-lg border border-white/10 bg-black/25 p-1.5 text-primary">
              <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span>Dashboard</span>
            <ArrowRight className="h-3 w-3 text-gray-600" aria-hidden="true" />
            <span>Telegram</span>
            <ArrowRight className="h-3 w-3 text-gray-600" aria-hidden="true" />
            <span>SMS</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="pointer-events-none absolute bottom-[24%] right-[6%] z-10 hidden w-52 xl:block"
      >
        <div className="animate-float rounded-2xl border border-white/10 bg-surface/60 p-4 shadow-2xl backdrop-blur-xl [animation-delay:0.8s]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            <span>Dashboard</span>
            <span className="inline-flex items-center gap-1.5 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success motion-safe:animate-pulse" aria-hidden="true" />
              Live
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-success/20 bg-success/10 text-success">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">System secure</p>
              <p className="text-[10px] text-gray-500">Firestore listener open</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function FloatingVisualFallback() {
  return (
    <div className="grid h-full w-full place-items-center" aria-hidden="true">
      <div className="relative grid h-64 w-64 place-items-center">
        <div className="absolute inset-0 rounded-full border border-accent/20" />
        <div className="absolute inset-8 rounded-full border border-primary/20" />
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
        <ShieldCheck className="h-16 w-16 text-accent/70" />
      </div>
    </div>
  )
}

export default function Landing() {
  const { currentUser } = useAuth()
  const reducedMotion = useReducedMotion()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function closeMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-sans text-gray-100">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo to="/" />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <InstallButton compact />
            <Link
              to="/demo"
              className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-2.5 text-xs font-bold text-accent transition hover:border-accent/40 hover:bg-accent/15"
            >
              Open demo
            </Link>
            <Link
              to={currentUser ? '/dashboard' : '/login'}
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primaryDark"
            >
              {currentUser ? 'Dashboard' : 'Sign in'}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white sm:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/5 bg-background/95 sm:hidden"
            >
              <nav className="space-y-1 px-4 py-4" aria-label="Mobile">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  to="/demo"
                  onClick={closeMenu}
                  className="block rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-center text-sm font-bold text-accent"
                >
                  Open demo
                </Link>
                <Link
                  to={currentUser ? '/dashboard' : '/login'}
                  onClick={closeMenu}
                  className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                >
                  {currentUser ? 'Dashboard' : 'Sign in'}
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0">
            <Suspense fallback={<FloatingVisualFallback />}>
              <HeroScene reducedMotion={Boolean(reducedMotion)} />
            </Suspense>
          </div>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(7,11,20,0.55)_65%,#070B14_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-background to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-grid opacity-20" />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent backdrop-blur"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Edge-first emergency monitoring
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.08 }}
                className="mt-6 text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                When every second counts,
                <span className="mt-2 block text-gradient">Guardian Eye is already watching.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.18 }}
                className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg"
              >
                Fall, gesture, and English keyword detection run on-device. Confirmed emergencies
                reach your dashboard and Telegram contacts; optional GSM SMS adds a hardware backup.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Link
                  to="/demo"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-gray-100 sm:w-auto"
                >
                  Try the interactive demo
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <a
                  href="#decision-lab"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-200 backdrop-blur transition hover:bg-white/10 sm:w-auto"
                >
                  See how it decides
                  <Zap className="h-4 w-4 text-accent" aria-hidden="true" />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-gray-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  Runs on Raspberry Pi
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  Edge-first detection
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  MIT licensed
                </span>
              </motion.div>
            </div>
          </div>

          <HeroHud />

          <a
            href="#capabilities"
            className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 transition hover:text-gray-400 sm:flex"
          >
            Explore
            <span className="h-8 w-px bg-gradient-to-b from-accent/60 to-transparent" aria-hidden="true" />
          </a>
        </section>

        <section className="border-y border-white/5 bg-surface/20">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/5 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center sm:px-6">
                <p className="text-2xl font-black text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-[10px] text-gray-600">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="What it watches"
              title="Three signals. One confirmed emergency."
              description="Guardian Eye does not raise an alarm from a single noisy frame. Each stream has its own confirmation window, and the decision engine combines them."
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {CAPABILITIES.map((capability, index) => {
                const Icon = capability.icon

                return (
                  <motion.article
                    key={capability.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -5 }}
                    className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-b p-5 backdrop-blur-sm transition-all duration-300 sm:p-6 ${capability.tone}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded-xl border ${capability.iconTone}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[10px] text-gray-600">{capability.index}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-white">{capability.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">{capability.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {capability.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                )
              })}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="glass-panel p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Signal to response
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {FLOW.map((step, index) => {
                    const Icon = step.icon

                    return (
                      <div
                        key={step.title}
                        className="relative flex gap-3 rounded-2xl border border-white/5 bg-black/20 p-4"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-accent">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">
                            <span className="mr-1.5 font-mono text-[10px] text-gray-600">0{index + 1}</span>
                            {step.title}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="glass-panel flex flex-col justify-between overflow-hidden p-5 sm:p-6">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-success">
                    <HeartPulse className="h-4 w-4" aria-hidden="true" />
                    Designed for the worst moment
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    Local first. Cloud when it is there.
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    The edge loop keeps detecting even if Wi-Fi drops. Firestore, Telegram, and GSM
                    are independent response paths, not hard dependencies.
                  </p>
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    'Camera and microphone stay local',
                    'Firestore schema: reason, status, timestamp',
                    'Dashboard acknowledges and resolves events',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="grid h-4 w-4 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="decision-lab" className="scroll-mt-20 border-y border-white/5 bg-surface/15 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="The rules are the product"
              title="See the decision engine think."
              description="A fall alone waits 10 seconds. A fall plus a voice keyword can confirm in 5. Three keywords in 20 seconds are enough on their own. Toggle the signals and watch the rules resolve."
            />
            <div className="mt-12">
              <DecisionLab />
            </div>
          </div>
        </section>

        <section id="preview" className="scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Guardian dashboard"
              title="A dashboard that reacts in the moment."
              description="The dashboard listens to Firestore in real time, shows a full-screen emergency overlay, and lets a guardian acknowledge the event. Install it as a PWA for a standalone app."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
              <PreviewDemo />

              <div className="space-y-3">
                {[
                  {
                    icon: Radio,
                    title: 'Real-time listener',
                    text: 'An onSnapshot subscription receives new emergencies without a refresh.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Acknowledge & resolve',
                    text: 'One tap flips the Firestore status to resolved and clears the overlay.',
                  },
                  {
                    icon: Camera,
                    title: 'Local camera feed',
                    text: 'Open the Pi MJPEG stream in the dashboard with an optional stream token.',
                  },
                  {
                    icon: Smartphone,
                    title: 'Installable PWA',
                    text: 'Add Guardian Eye to your home screen with a standalone app window.',
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.title} className="glass-panel flex gap-3 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{item.text}</p>
                      </div>
                    </div>
                  )
                })}

                <p className="px-1 text-[10px] leading-relaxed text-gray-600">
                  The live overlay appears while the dashboard is open. Guardian Eye does not send
                  browser push notifications; Telegram and optional GSM SMS remain the out-of-app
                  channels.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-primary/20 via-surface to-violet-500/10 p-8 text-center shadow-glow sm:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <Eye className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Explore Guardian Eye without a device.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
              The public demo uses simulated incidents, so you can test the emergency overlay,
              statistics, and camera UI before connecting Firebase or a Raspberry Pi.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-gray-100"
              >
                Open the demo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="https://github.com/yedukrishna012/Guardian-Eye"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                View the repository
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="developers" className="scroll-mt-20 border-t border-white/5 bg-surface/15 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="The team"
              title="Built by people who care about the unglamorous edge cases."
              description="Guardian Eye started as a college project and grew into a full edge-to-cloud emergency system."
            />

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEVELOPERS.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 text-center"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-primary/30 to-accent/20 text-white">
                    <span className="text-lg font-black">{name.charAt(0)}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white">{name}</h3>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Core contributor
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <a
                href="https://github.com/yedukrishna012/Guardian-Eye"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 transition hover:text-white"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Follow development on GitHub
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <Logo to="/" />
              <p className="mt-4 text-xs leading-relaxed text-gray-500">
                Real-time fall, gesture, and voice emergency monitoring for the moments that matter.
                Edge-first, self-hostable, and open source.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Product</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li><a href="#capabilities" className="transition hover:text-white">Capabilities</a></li>
                  <li><a href="#decision-lab" className="transition hover:text-white">Decision engine</a></li>
                  <li><Link to="/demo" className="transition hover:text-white">Demo</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Project</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li>
                    <a
                      href="https://github.com/yedukrishna012/Guardian-Eye"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:text-white"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/yedukrishna012/Guardian-Eye/blob/main/README.md"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:text-white"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/yedukrishna012/Guardian-Eye/blob/main/LICENSE"
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:text-white"
                    >
                      MIT license
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Account</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li><Link to="/login" className="transition hover:text-white">Sign in</Link></li>
                  <li><Link to="/signup" className="transition hover:text-white">Create account</Link></li>
                  <li><Link to="/dashboard" className="transition hover:text-white">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-[11px] text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Yedukrishna R. Released under the MIT License.</p>
            <p className="inline-flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
              Telegram + optional GSM SMS
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
