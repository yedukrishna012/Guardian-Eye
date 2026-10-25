import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      let id = hash.slice(1)

      try {
        id = decodeURIComponent(id)
      } catch {
        // Keep the raw fragment when it is not valid percent-encoding.
      }

      const target = document.getElementById(id)

      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
