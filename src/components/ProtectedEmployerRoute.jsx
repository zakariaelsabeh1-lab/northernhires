import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedEmployerRoute({ children }) {
  const { user, employerProfile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-green-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/employers/login" state={{ from: location.pathname }} replace />
  }

  if (!employerProfile) {
    return <Navigate to="/employers/register" state={{ from: location.pathname }} replace />
  }

  return children
}
