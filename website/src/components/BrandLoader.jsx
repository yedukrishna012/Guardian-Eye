import Logo from './Logo'

export default function BrandLoader({ label = 'Connecting to Guardian Eye…' }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="absolute h-72 w-72 rounded-full bg-primary/20 blur-[100px]" aria-hidden="true" />
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-2xl border border-accent/30" aria-hidden="true" />
        <Logo compact />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">{label}</p>
        <div className="mx-auto mt-4 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent to-transparent bg-[length:200%_100%]" />
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}
