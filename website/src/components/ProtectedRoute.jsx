import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import BrandLoader from './BrandLoader'
import FirebaseSetupNotice from './FirebaseSetupNotice'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading, isFirebaseConfigured } = useAuth()
  const location = useLocation()

  if (loading) {
    return <BrandLoader />
  }

  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
