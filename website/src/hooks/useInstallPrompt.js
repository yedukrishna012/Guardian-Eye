import { useCallback, useEffect, useState } from 'react'

function isRunningStandalone() {
  if (typeof window === 'undefined') return false

  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true,
  )
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(isRunningStandalone)

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable'

    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
      return 'accepted'
    }

    return 'dismissed'
  }, [deferredPrompt])

  return {
    canInstall: Boolean(deferredPrompt) && !installed,
    installed,
    promptInstall,
  }
}
