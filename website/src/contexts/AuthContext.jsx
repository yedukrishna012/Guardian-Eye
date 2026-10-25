import { useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import { AuthContext } from './auth-context'

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      'Firebase is not configured. Copy website/.env.example to website/.env.local and fill in the VITE_FIREBASE_* values.',
    )
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return undefined
    }

    return onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user)
        setLoading(false)
      },
      (error) => {
        console.error('Firebase auth listener failed:', error)
        setLoading(false)
      },
    )
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isFirebaseConfigured,
      signup(email, password) {
        requireAuth()
        return createUserWithEmailAndPassword(auth, email, password)
      },
      login(email, password) {
        requireAuth()
        return signInWithEmailAndPassword(auth, email, password)
      },
      logout() {
        requireAuth()
        return signOut(auth)
      },
      resetPassword(email) {
        requireAuth()
        return sendPasswordResetEmail(auth, email)
      },
    }),
    [currentUser, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
