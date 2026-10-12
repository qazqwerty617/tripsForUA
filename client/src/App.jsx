import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingContactWidget from './components/FloatingContactWidget'
import ProtectedRoute from './components/ProtectedRoute'
import { trackPixelEvent } from './utils/metaPixel'

const Home = lazy(() => import('./pages/Home'))
const TourDetail = lazy(() => import('./pages/TourDetail'))
const Destinations = lazy(() => import('./pages/Destinations'))
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminTours = lazy(() => import('./pages/admin/AdminTours'))
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'))
const AdminAviatury = lazy(() => import('./pages/admin/AdminAviatury'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const Admin2FA = lazy(() => import('./pages/admin/Admin2FA'))

function App() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Initial PageView is handled by index.html script tag
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Track page views on route changes for public pages
    if (!location.pathname.startsWith('/mng-x7k9p2-secure')) {
      trackPixelEvent('PageView')
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div className="p-6 text-center">Завантаження...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tours/:id" element={<TourDetail />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:slug" element={<DestinationDetail />} />

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
            <Route path="/mng-x7k9p2-secure/reviews" element={
              <ProtectedRoute>
                <AdminReviews />
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
      <FloatingContactWidget />
    </div>
  )
}

export default App
