import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
  User,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/auth-context'
import { copyText } from '../utils/clipboard'
import { formatDateTime } from '../utils/format'
import { getAuthErrorMessage } from '../utils/authErrors'

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
        {label}
      </span>
      <span className="min-w-0 break-all text-xs font-medium text-gray-200 sm:text-right">
        {children}
      </span>
    </div>
  )
}

export default function Profile() {
  const { currentUser, logout, resetPassword } = useAuth()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [resetState, setResetState] = useState('idle')
  const [resetMessage, setResetMessage] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  const initial = currentUser?.email?.charAt(0)?.toUpperCase() || 'G'
  const createdAt = currentUser?.metadata?.creationTime
  const lastSignIn = currentUser?.metadata?.lastSignInTime

  async function handleCopyId() {
    setCopyError('')
    const copiedOk = await copyText(currentUser?.uid)

    if (copiedOk) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      setCopyError('Could not copy automatically. Select the ID and copy it manually.')
    }
  }

  async function handlePasswordReset() {
    if (!currentUser?.email || resetState === 'sending') return

    setResetState('sending')
    setResetMessage('')

    try {
      await resetPassword(currentUser.email)
      setResetState('sent')
      setResetMessage(`Password reset link sent to ${currentUser.email}.`)
    } catch (error) {
      setResetState('error')
      setResetMessage(getAuthErrorMessage(error))
    }
  }

  async function handleLogout() {
    setSigningOut(true)

    try {
      await logout()
    } catch (error) {
      console.error('Failed to sign out:', error)
      setSigningOut(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          <User className="h-3.5 w-3.5" aria-hidden="true" />
          Your account
        </div>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Profile &amp; device
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Manage your guardian account, pairing ID, and security settings.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel relative overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-primary/30 via-accent/15 to-violet-500/25 sm:h-40">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 to-transparent" aria-hidden="true" />
        </div>

        <div className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl border-[6px] border-surface bg-gradient-to-br from-primary/30 to-accent/20 text-4xl font-black text-white shadow-glow sm:h-32 sm:w-32">
              {initial}
            </div>
            <div className="pb-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">Guardian account</h2>
              <p className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-400 sm:justify-start">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                {currentUser?.email || 'No email linked'}
              </p>
            </div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-success sm:ml-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Signed in
            </span>
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="glass-panel p-5 sm:p-6"
        >
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Account details
          </h2>

          <div className="mt-3">
            <DetailRow label="Email">{currentUser?.email || 'Not available'}</DetailRow>
            <DetailRow label="Member since">
              {createdAt ? formatDateTime(createdAt) : 'Not available'}
            </DetailRow>
            <DetailRow label="Last sign-in">
              {lastSignIn ? formatDateTime(lastSignIn) : 'Not available'}
            </DetailRow>
            <DetailRow label="Auth provider">
              {currentUser?.providerData?.[0]?.providerId || 'password'}
            </DetailRow>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-black/20 p-3 text-[11px] leading-relaxed text-gray-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Guardian Eye uses Firebase Authentication. Your password is never stored in this
            application or in Firestore.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
              <Smartphone className="h-4 w-4 text-accent" aria-hidden="true" />
              Device pairing
            </h2>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
            Paste this ID into <span className="font-mono text-gray-400">device_config.json</span> on
            the Raspberry Pi so its emergencies are written to your account.
          </p>

          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
              Pairing ID
            </p>
            <p className="mt-1 break-all font-mono text-xs text-accent">
              {currentUser?.uid || 'Not available'}
            </p>
          </div>

          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11px] leading-5 text-gray-400">
{`{
  "user_id": "${currentUser?.uid || 'YOUR_FIREBASE_UID'}",
  "gemini_api_key": ""
}`}
          </pre>

          {copyError && (
            <p className="mt-3 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-[11px] text-warning">
              {copyError}
            </p>
          )}

          <Link
            to="/demo"
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary transition hover:text-accent"
          >
            Explore the demo dashboard
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-panel mt-5 p-5 sm:p-6"
      >
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-200">
          <KeyRound className="h-4 w-4 text-warning" aria-hidden="true" />
          Password &amp; security
        </h2>

        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/5 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-200">Password reset</p>
            <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-gray-500">
              Firebase sends a secure reset link to your email. Use it to choose a new password; the
              link expires automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={resetState === 'sending'}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetState === 'sending' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            )}
            {resetState === 'sending' ? 'Sending…' : 'Send reset link'}
          </button>
        </div>

        {resetMessage && (
          <p
            className={`mt-3 flex items-start gap-2 rounded-xl border px-4 py-3 text-[11px] leading-relaxed ${
              resetState === 'error'
                ? 'border-danger/25 bg-danger/10 text-danger'
                : 'border-success/25 bg-success/10 text-success'
            }`}
            role={resetState === 'error' ? 'alert' : 'status'}
          >
            {resetState === 'error' ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {resetMessage}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-gray-500">
            Signing out removes this browser&apos;s dashboard session. The edge device keeps running.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-danger/30 px-4 py-2.5 text-xs font-semibold text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            Sign out
          </button>
        </div>
      </motion.section>
    </div>
  )
}
