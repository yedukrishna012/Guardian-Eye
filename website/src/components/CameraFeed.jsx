import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Check,
  Clipboard,
  Eye,
  EyeOff,
  Expand,
  Loader2,
  RefreshCw,
  Settings,
  ShieldAlert,
  Video,
  X,
} from 'lucide-react'
import { copyText } from '../utils/clipboard'

const HOST_KEY = 'guardian-eye:camera-host'
const TOKEN_KEY = 'guardian-eye:camera-token'

function readStorage(storage, key) {
  try {
    return storage.getItem(key) || ''
  } catch {
    return ''
  }
}

function writeStorage(storage, key, value) {
  try {
    if (value) storage.setItem(key, value)
    else storage.removeItem(key)
  } catch {
    // Storage can be unavailable in private mode; the stream still works.
  }
}

function buildStreamUrl(rawHost, token) {
  const host = rawHost.trim()
  if (!host) return ''

  const withScheme = /^https?:\/\//i.test(host) ? host : `http://${host}`

  try {
    const url = new URL(withScheme)
    if (!url.port) url.port = '5000'
    url.pathname = '/video_feed'
    url.search = ''
    if (token.trim()) url.searchParams.set('token', token.trim())
    return url.toString()
  } catch {
    return ''
  }
}

function isMixedContent(url) {
  return Boolean(
    typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      url.startsWith('http://'),
  )
}

export default function CameraFeed({ onClose }) {
  const initialHost = useMemo(() => readStorage(window.localStorage, HOST_KEY), [])
  const initialToken = useMemo(
    () => readStorage(window.sessionStorage, TOKEN_KEY) || import.meta.env.VITE_CAMERA_STREAM_TOKEN || '',
    [],
  )
  const initialUrl = useMemo(
    () => buildStreamUrl(initialHost, initialToken),
    [initialHost, initialToken],
  )

  const [host, setHost] = useState(initialHost)
  const [token, setToken] = useState(initialToken)
  const [showToken, setShowToken] = useState(false)
  const [streamUrl, setStreamUrl] = useState(initialUrl)
  const [retryKey, setRetryKey] = useState(0)
  const [status, setStatus] = useState(() => {
    if (!initialUrl) return 'idle'
    return isMixedContent(initialUrl) ? 'blocked' : 'connecting'
  })
  const [error, setError] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const panelRef = useRef(null)
  const streamRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.()
        } else {
          onClose()
        }
      }
    }

    function handleFullscreenChange() {
      setFullscreen(Boolean(document.fullscreenElement))
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [onClose])

  useEffect(() => {
    if (!streamUrl || status !== 'connecting') return undefined

    const timer = window.setTimeout(() => {
      setStatus((current) => (current === 'connecting' ? 'offline' : current))
      setError('The camera did not send a frame within 9 seconds.')
    }, 9000)

    return () => window.clearTimeout(timer)
  }, [streamUrl, status, retryKey])

  function connect(event) {
    event?.preventDefault()
    const nextUrl = buildStreamUrl(host, token)

    if (!nextUrl) {
      setError('Enter a valid device IP address or URL, for example 192.168.1.42.')
      setStatus('idle')
      return
    }

    writeStorage(window.localStorage, HOST_KEY, host)
    writeStorage(window.sessionStorage, TOKEN_KEY, token)
    setError('')
    setStreamUrl(nextUrl)
    setStatus(isMixedContent(nextUrl) ? 'blocked' : 'connecting')
    setRetryKey((key) => key + 1)
  }

  function retry() {
    if (!streamUrl) {
      connect()
      return
    }

    setError('')
    setStatus(isMixedContent(streamUrl) ? 'blocked' : 'connecting')
    setRetryKey((key) => key + 1)
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await panelRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch (err) {
      console.error('Fullscreen failed:', err)
    }
  }

  async function copyStreamUrl() {
    const copiedOk = await copyText(streamUrl)
    setCopied(copiedOk)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const statusMeta = {
    idle: { label: 'Not connected', dot: 'bg-gray-500', text: 'text-gray-400' },
    connecting: { label: 'Connecting', dot: 'bg-warning animate-pulse', text: 'text-warning' },
    online: { label: 'Stream online', dot: 'bg-success', text: 'text-success' },
    offline: { label: 'Stream offline', dot: 'bg-danger', text: 'text-danger' },
    blocked: { label: 'Blocked by browser', dot: 'bg-danger', text: 'text-danger' },
  }[status]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        ref={panelRef}
        className="glass-panel-strong flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden bg-background/95"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="camera-title" className="text-lg font-bold text-white sm:text-xl">
                  Live camera
                </h2>
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${statusMeta.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} aria-hidden="true" />
                  {statusMeta.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                MJPEG stream from the Guardian Eye edge device on your local network.
              </p>
            </div>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/5 p-2 text-gray-400 transition hover:border-danger/30 hover:bg-danger/10 hover:text-white"
            aria-label="Close camera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={connect} className="grid gap-3 border-b border-white/5 bg-surface/30 px-4 py-4 sm:grid-cols-[1fr_1fr_auto] sm:px-6">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Device address
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-primary/50">
                <Settings className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                <input
                  type="text"
                  value={host}
                  onChange={(event) => setHost(event.target.value)}
                  placeholder="192.168.1.42"
                  className="w-full bg-transparent py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Stream token <span className="text-gray-600">(optional)</span>
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-primary/50">
                <ShieldAlert className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Only if configured on the Pi"
                  className="w-full bg-transparent py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((visible) => !visible)}
                  className="text-gray-500 transition hover:text-white"
                  aria-label={showToken ? 'Hide stream token' : 'Show stream token'}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="mt-auto inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primaryDark"
            >
              <Video className="h-4 w-4" aria-hidden="true" />
              Connect
            </button>
          </form>

          <div className="p-4 sm:p-6">
            <div
              ref={streamRef}
              className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#04070d]"
            >
              {streamUrl && status !== 'blocked' && (
                <img
                  key={retryKey}
                  src={streamUrl}
                  alt="Guardian Eye live camera stream"
                  className={`h-full w-full object-contain transition-opacity duration-300 ${
                    status === 'online' ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => {
                    setStatus('online')
                    setError('')
                  }}
                  onError={() => {
                    setStatus('offline')
                    setError('The stream could not be reached. Check the device IP, port 5000, and that main.py is running.')
                  }}
                />
              )}

              {status !== 'online' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  {status === 'connecting' ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-300">
                        Waiting for the first frame…
                      </p>
                    </>
                  ) : status === 'blocked' ? (
                    <>
                      <ShieldAlert className="h-12 w-12 text-danger" aria-hidden="true" />
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-danger">Mixed content blocked</p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-400">
                          This dashboard is served over HTTPS, so the browser will not load an HTTP
                          camera stream. Open the dashboard over LAN HTTP, put the Pi behind an HTTPS
                          tunnel, or serve the stream over HTTPS.
                        </p>
                      </div>
                    </>
                  ) : status === 'offline' ? (
                    <>
                      <Camera className="h-12 w-12 text-danger/70" aria-hidden="true" />
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-danger">Camera offline</p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-400">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={retry}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-gray-200 transition hover:bg-white/10"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Retry stream
                      </button>
                    </>
                  ) : (
                    <>
                      <Video className="h-12 w-12 text-gray-600" aria-hidden="true" />
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-gray-300">Connect your Pi camera</p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-500">
                          Enter the device&apos;s local IP address. Port 5000 is used by default.
                          You can also paste a full URL such as{' '}
                          <span className="font-mono text-gray-400">http://192.168.1.42:5000</span>.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {status === 'online' && (
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-danger/30 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-danger backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger motion-safe:animate-pulse" aria-hidden="true" />
                  Live
                </div>
              )}
            </div>

            {error && status !== 'offline' && (
              <p className="mt-3 rounded-xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-xs text-danger" role="alert">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <Expand className="h-4 w-4" aria-hidden="true" />
                {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>

              <button
                type="button"
                onClick={copyStreamUrl}
                disabled={!streamUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy stream URL'}
              </button>

              {streamUrl && (
                <a
                  href={streamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs font-semibold text-primary transition hover:text-accent"
                >
                  Open stream in a new tab
                </a>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/15 bg-warning/5 px-4 py-3 text-[11px] leading-relaxed text-gray-500">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <p>
                The camera stream is intended for a trusted LAN. Do not expose port 5000 to the
                internet. If you set <span className="font-mono text-gray-400">CAMERA_STREAM_TOKEN</span>{' '}
                on the Pi, enter the same token here. HTTPS dashboards cannot load HTTP camera streams.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
