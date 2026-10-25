import { Download } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallButton({ className = '', compact = false }) {
  const { canInstall, promptInstall } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <button
      type="button"
      onClick={promptInstall}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition hover:border-accent/50 hover:bg-accent/15 ${className}`}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      {compact ? 'Install' : 'Install Guardian Eye'}
    </button>
  )
}
