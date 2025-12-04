import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/mng-x7k9p2-secure/login" replace />
  }

  return children
}
