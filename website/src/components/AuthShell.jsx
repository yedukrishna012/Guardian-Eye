import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import Logo from './Logo'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-primary/15 blur-[110px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <Logo to="/" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-500 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full"
          >
            <div className="mb-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-glow">
                <ShieldCheck className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{title}</h1>
              <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
            </div>

            <div className="glass-panel-strong p-5 sm:p-7">{children}</div>

            {footer && <div className="mt-5 text-center text-xs text-gray-500">{footer}</div>}
          </motion.div>
        </div>

        <p className="pb-2 text-center text-[10px] text-gray-600">
          Guardian Eye · MIT licensed · Your camera and microphone stay on your device.
        </p>
      </div>
    </div>
  )
}
