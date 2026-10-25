import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../contexts/auth-context'
import Logo from './Logo'
import InstallButton from './InstallButton'

const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Statistics', href: '/statistics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
]

function Sidebar({ onNavigate }) {
  const { currentUser, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out:', error)
      setLoggingOut(false)
    }
  }

  const initial = currentUser?.email?.charAt(0)?.toUpperCase() || 'G'

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center border-b border-white/5 px-5">
        <Logo to="/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6" aria-label="Dashboard">
        {NAVIGATION.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-primary/30 bg-primary/15 text-white shadow-[0_0_24px_rgba(59,130,246,0.12)]'
                    : 'border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-5 w-5 ${isActive ? 'text-accent' : 'text-gray-500'}`}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-white/5 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Signed in
            </p>
            <p className="truncate text-xs font-medium text-gray-300">{currentUser?.email}</p>
          </div>
        </div>

        <InstallButton compact className="w-full" />

        <Link
          to="/demo"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View public demo
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Public site
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-danger/10 hover:text-danger disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="h-4 w-4" aria-hidden="true" />
          )}
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen overflow-hidden bg-background font-sans text-gray-100">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <div className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-surface/85 px-4 backdrop-blur-xl md:hidden">
        <Logo to="/dashboard" />
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-background md:hidden"
            >
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/5 bg-surface/45 backdrop-blur-xl md:flex">
        <Sidebar />
      </aside>

      <main id="main-content" className="relative min-h-screen flex-1 overflow-y-auto p-4 pb-16 pt-20 md:p-8 md:pt-8">
        <div
          className="pointer-events-none fixed left-1/4 top-20 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed bottom-20 right-1/4 h-[20rem] w-[20rem] rounded-full bg-accent/10 blur-[100px]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
