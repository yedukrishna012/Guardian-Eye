import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { useAuth } from '../contexts/auth-context'
import { getAuthErrorMessage } from '../utils/authErrors'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const { login, resetPassword, currentUser, isFirebaseConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)

  const from = location.state?.from || '/dashboard'

  if (currentUser) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured yet. Add website/.env.local or use the public demo.')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordReset() {
    setError('')
    setNotice('')

    if (!email.trim()) {
      setError('Enter your email address first, then request a reset link.')
      return
    }

    setResetting(true)
    try {
      await resetPassword(email.trim())
      setNotice(`Password reset email sent to ${email.trim()}.`)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setResetting(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Guardian Eye dashboard."
      footer={
        <>
          New to Guardian Eye?{' '}
          <Link to="/signup" className="font-semibold text-primary transition hover:text-accent">
            Create an account
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured && (
        <div className="mb-5 rounded-xl border border-warning/25 bg-warning/10 p-4 text-xs leading-relaxed text-warning">
          <p className="flex items-center gap-2 font-bold">
            <Info className="h-4 w-4" aria-hidden="true" />
            Dashboard authentication is not configured
          </p>
          <p className="mt-1.5 text-warning/80">
            Add the <span className="font-mono">VITE_FIREBASE_*</span> values to{' '}
            <span className="font-mono">website/.env.local</span>. The public demo works without
            credentials.
          </p>
          <Link to="/demo" className="mt-2 inline-block font-bold underline underline-offset-2">
            Open the demo instead
          </Link>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div
            className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs leading-relaxed text-danger"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {notice && (
          <div
            className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs leading-relaxed text-success"
            role="status"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {notice}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-gray-300">
            Email address
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-primary/60">
            <Mail className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-600"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={resetting || !isFirebaseConfigured}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resetting ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="h-3 w-3" aria-hidden="true" />
              )}
              Forgot password?
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-primary/60">
            <Lock className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="text-gray-500 transition hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isFirebaseConfigured}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-white/5 pt-4 text-center">
        <Link to="/demo" className="text-[11px] font-semibold text-gray-500 transition hover:text-white">
          Just exploring? Open the read-only demo
        </Link>
      </div>
    </AuthShell>
  )
}
