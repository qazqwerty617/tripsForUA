import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
const Home = lazy(() => import('./pages/Home'))
const TourDetail = lazy(() => import('./pages/TourDetail'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminTours = lazy(() => import('./pages/admin/AdminTours'))
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'))
const AdminAviatury = lazy(() => import('./pages/admin/AdminAviatury'))
const Admin2FA = lazy(() => import('./pages/admin/Admin2FA'))
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div className="p-6 text-center">Завантаження...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/tours/:id" element={<TourDetail />} />

            {/* Admin Routes */}
            <Route path="/mng-x7k9p2-secure/login" element={<AdminLogin />} />
            <Route path="/mng-x7k9p2-secure" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/mng-x7k9p2-secure/tours" element={
              <ProtectedRoute>
                <AdminTours />
              </ProtectedRoute>
            } />
            <Route path="/mng-x7k9p2-secure/destinations" element={
              <ProtectedRoute>
                <AdminDestinations />
              </ProtectedRoute>
            } />
            <Route path="/mng-x7k9p2-secure/aviatury" element={
              <ProtectedRoute>
                <AdminAviatury />
              </ProtectedRoute>
            } />
            <Route path="/mng-x7k9p2-secure/2fa" element={
              <ProtectedRoute>
                <Admin2FA />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
