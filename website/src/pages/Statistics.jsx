import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { BarChart3, Radio } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/auth-context'
import IncidentExplorer from '../components/IncidentExplorer'

export default function Statistics() {
  const { currentUser } = useAuth()
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser || !db) return undefined

    const emergenciesQuery = query(
      collection(db, 'users', currentUser.uid, 'emergencies'),
      orderBy('timestamp', 'desc'),
    )

    return onSnapshot(
      emergenciesQuery,
      (snapshot) => {
        setEmergencies(
          snapshot.docs.map((eventDoc) => ({
            id: eventDoc.id,
            ...eventDoc.data(),
          })),
        )
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        console.error('Failed to load statistics:', snapshotError)
        setError(snapshotError.message)
        setLoading(false)
      },
    )
  }, [currentUser])

  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Incident history
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Incident statistics
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Every confirmed event, resolved or still active.
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] ${
            error
              ? 'border-danger/30 bg-danger/10 text-danger'
              : 'border-success/30 bg-success/10 text-success'
          }`}
          aria-live="polite"
        >
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          {error ? 'Live updates offline' : 'Live updates on'}
        </span>
      </div>

      {error && (
        <div
          className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      <IncidentExplorer
        emergencies={emergencies}
        loading={loading}
        exportPrefix="guardian-eye-incidents"
        emptyTitle="No incidents recorded yet"
        emptyMessage="When the edge device confirms an emergency, it will appear here with its reason, status, and timestamp."
      />
    </div>
  )
}
