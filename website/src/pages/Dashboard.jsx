import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  AlertTriangle,
  BellRing,
  Camera,
  CheckCircle2,
  Cloud,
  CloudOff,
  History,
  Loader2,
  Radio,
  ShieldCheck,
  Siren,
  Video,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { db } from '../firebase'
import { useAuth } from '../contexts/auth-context'
import StatusOrb from '../components/StatusOrb'
import CameraFeed from '../components/CameraFeed'
import EmergencyOverlay from '../components/EmergencyOverlay'
import { formatDateTime, formatRelative, isOlderThanMinutes } from '../utils/format'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const [activeEmergency, setActiveEmergency] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testNotice, setTestNotice] = useState('')
  const [now, setNow] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!currentUser || !db) return undefined

    const emergenciesQuery = query(
      collection(db, 'users', currentUser.uid, 'emergencies'),
      orderBy('timestamp', 'desc'),
      limit(10),
    )

    return onSnapshot(
      emergenciesQuery,
      (snapshot) => {
        const events = snapshot.docs.map((eventDoc) => ({
          id: eventDoc.id,
          ...eventDoc.data(),
        }))

        setRecentEvents(events)
        setActiveEmergency(events.find((event) => event.status === 'active') || null)
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error('Firestore listener failed:', snapshotError)
        setError(snapshotError.message)
        setLoading(false)
      },
    )
  }, [currentUser])

  const closeCamera = useCallback(() => setCameraOpen(false), [])
  const openCamera = useCallback(() => setCameraOpen(true), [])

  const isStale = useMemo(
    () => Boolean(activeEmergency && isOlderThanMinutes(activeEmergency.timestamp, 5, now)),
    [activeEmergency, now],
  )

  const handleAcknowledge = useCallback(
    async (emergency) => {
      if (!currentUser || !emergency) return

      await updateDoc(
        doc(db, 'users', currentUser.uid, 'emergencies', emergency.id),
        { status: 'resolved' },
      )

      setActiveEmergency((current) => (current?.id === emergency.id ? null : current))
    },
    [currentUser],
  )

  async function handleTestEmergency() {
    if (!currentUser || sendingTest) return

    const confirmed = window.confirm(
      'Send a test emergency to this dashboard? It will appear as an active alert and must be acknowledged.',
    )
    if (!confirmed) return

    setSendingTest(true)
    setTestNotice('')
    setError('')

    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'emergencies'), {
        reason: 'Test emergency alert',
        status: 'active',
        timestamp: serverTimestamp(),
      })
      setTestNotice('Test alert sent. The dashboard should react in real time.')
    } catch (testError) {
      console.error('Test emergency failed:', testError)
      setError(testError.message)
    } finally {
      setSendingTest(false)
    }
  }

  const lastEvent = recentEvents[0]
  const activeCount = recentEvents.filter((event) => event.status === 'active').length

  return (
    <div className="relative flex min-h-full flex-col">
      <AnimatePresence>
        {cameraOpen && <CameraFeed onClose={closeCamera} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeEmergency && !isStale && (
          <EmergencyOverlay
            emergency={activeEmergency}
            onAcknowledge={handleAcknowledge}
            onViewCamera={openCamera}
          />
        )}
      </AnimatePresence>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            Live monitoring
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            System status
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Real-time cloud status for your Guardian Eye device.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] ${
              error
                ? 'border-danger/30 bg-danger/10 text-danger'
                : 'border-success/30 bg-success/10 text-success'
            }`}
            aria-live="polite"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                error ? 'bg-danger' : 'bg-success motion-safe:animate-pulse'
              }`}
              aria-hidden="true"
            />
            {error ? 'Cloud listener offline' : 'Firestore listener live'}
          </span>

          <button
            type="button"
            onClick={openCamera}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Live camera
          </button>
        </div>
      </div>

      {isStale && activeEmergency && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-warning">Unacknowledged alert from {formatRelative(activeEmergency.timestamp, now)}</p>
              <p className="mt-1 text-xs leading-relaxed text-warning/80">
                {activeEmergency.reason} · The full-screen view hides after 5 minutes, but the event
                remains active in Firestore until you acknowledge it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAcknowledge(activeEmergency)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-warning px-4 py-2.5 text-xs font-bold text-black transition hover:bg-amber-400"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Acknowledge
          </button>
        </motion.div>
      )}

      {testNotice && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-xs text-success" role="status">
          <span className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {testNotice}
          </span>
          <button
            type="button"
            onClick={() => setTestNotice('')}
            className="text-success/70 transition hover:text-success"
            aria-label="Dismiss test notice"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid flex-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="glass-panel relative flex min-h-[34rem] flex-col items-center justify-center overflow-hidden p-6 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.12),transparent_60%)]" aria-hidden="true" />

          {loading ? (
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-primary">Connecting to Firestore…</p>
            </div>
          ) : error ? (
            <div className="relative z-10 max-w-md">
              <CloudOff className="mx-auto h-14 w-14 text-danger" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-danger">Connection error</h2>
              <p className="mt-2 text-sm text-gray-400">{error}</p>
              <p className="mt-3 text-xs text-gray-500">
                Check that Firestore is enabled and that the rules in{' '}
                <span className="font-mono text-gray-400">website/firestore.rules</span> are deployed.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Reload dashboard
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <StatusOrb state="secure" size="lg" />
              <div className="mt-6 flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-success">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                System secure
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                No confirmed emergencies
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-400">
                Guardian Eye is watching for a sustained fall, a distress keyword, or a gesture
                combination. The dashboard will react the moment a confirmed event reaches Firestore.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openCamera}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primaryDark"
                >
                  <Video className="h-4 w-4" aria-hidden="true" />
                  View live camera
                </button>
                <button
                  type="button"
                  onClick={handleTestEmergency}
                  disabled={sendingTest}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-danger/30 hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Siren className="h-4 w-4" aria-hidden="true" />
                  )}
                  Send test alert
                </button>
              </div>

              <p className="mt-4 max-w-md text-[10px] leading-relaxed text-gray-600">
                Live overlays appear while this dashboard is open. Telegram and optional GSM SMS
                are the out-of-app alert channels.
              </p>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="glass-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
                Recent activity
              </h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-gray-400">
                {activeCount} active
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {recentEvents.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-center">
                  <History className="mx-auto h-6 w-6 text-gray-600" aria-hidden="true" />
                  <p className="mt-2 text-xs text-gray-500">No emergency events yet.</p>
                </div>
              ) : (
                recentEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-200">{event.reason}</p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {formatDateTime(event.timestamp)} · {formatRelative(event.timestamp, now)}
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
                ))
              )}
            </div>
          </section>

          <section className="glass-panel p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
              <BellRing className="h-4 w-4 text-primary" aria-hidden="true" />
              Response chain
            </h2>
            <div className="mt-4 space-y-3">
              {[
                {
                  icon: Cloud,
                  title: 'Firestore sync',
                  text: 'The Python edge engine writes confirmed events to your user document.',
                },
                {
                  icon: BellRing,
                  title: 'Telegram',
                  text: 'Contacts receive a message when the bot token and chat IDs are configured.',
                },
                {
                  icon: Radio,
                  title: 'GSM SMS backup',
                  text: 'A SIM800L module can send an SMS as an additional hardware alert channel.',
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-gray-400">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{item.title}</p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">{item.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {lastEvent && (
            <section className="glass-panel p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Last event
              </p>
              <p className="mt-2 text-xs font-medium text-gray-300">{lastEvent.reason}</p>
              <p className="mt-1 text-[10px] text-gray-500">{formatDateTime(lastEvent.timestamp)}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
