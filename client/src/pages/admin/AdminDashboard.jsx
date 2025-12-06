import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Calendar, LogOut, Plane, Shield } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import useAuthStore from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: 0,
    aviatury: 0
  })
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [expiringAviatury, setExpiringAviatury] = useState([])
  const [expiringTours, setExpiringTours] = useState([])
  const [activeModal, setActiveModal] = useState(null) // 'tours' | 'aviatury' | null

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [toursRes, aviaturyRes] = await Promise.all([
        api.get('/tours'),
        api.get('/aviatury')
      ])

      setStats({
        tours: toursRes.data.length,
        aviatury: aviaturyRes.data.length
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(today.getDate() + 3)

      // Filter expiring aviatury
      const expAviatury = aviaturyRes.data.filter(a => {
        if (!a.availableFrom) return false
        const date = new Date(a.availableFrom)
        date.setHours(0, 0, 0, 0)
        return date >= today && date <= threeDaysFromNow
      })
      setExpiringAviatury(expAviatury)

      // Filter expiring tours
      const expTours = toursRes.data.filter(t => {
        if (!t.startDate) return false
        const date = new Date(t.startDate)
        date.setHours(0, 0, 0, 0)
        return date >= today && date <= threeDaysFromNow
      })
      setExpiringTours(expTours)

    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleUpdateDate = async (id, newDate, type) => {
    try {
      const endpoint = type === 'aviatury' ? 'aviatury' : 'tours'
      const items = type === 'aviatury' ? expiringAviatury : expiringTours
      const item = items.find(i => i._id === id)

      if (!item) return

      const startDate = new Date(newDate)
      const updateData = {}

      if (type === 'aviatury') {
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + (item.nights || 6))
        updateData.availableFrom = startDate
        updateData.availableTo = endDate
      } else {
        // For tours, we preserve the duration
        const oldStart = new Date(item.startDate)
        const oldEnd = new Date(item.endDate)
        const duration = oldEnd - oldStart
        const endDate = new Date(startDate.getTime() + duration)
        updateData.startDate = startDate
        updateData.endDate = endDate
      }

      await api.put(`/${endpoint}/${id}`, updateData)
      toast.success('Дату оновлено')
      fetchStats()
    } catch (error) {
      console.error('Error updating date:', error)
      toast.error('Помилка оновлення дати')
    }
  }

  const handleToggleHot = async (id, currentStatus, type) => {
    try {
      const endpoint = type === 'aviatury' ? 'aviatury' : 'tours'
      // Note: Tours might use 'featured' instead of 'hot', but user asked for 'hot'. 
      // Assuming we want to toggle the same visual badge. 
      // If Tour model doesn't have 'hot', we might need to add it or use 'featured'.
      // For now, let's assume we added 'hot' to Tour or use 'featured' as a proxy if needed.
      // Checking Tour model previously: it has 'featured', not 'hot'. 
      // User said "додати значок гарячий тур". I should probably use 'featured' for Tours or add 'hot'.
      // Given the context, I'll use 'featured' for Tours as "Hot" equivalent for now to avoid schema changes if possible,
      // OR just try 'hot' if I want to be consistent. 
      // Actually, looking at Tour.js model, it has `featured`. I'll use that for Tours.

      const field = type === 'aviatury' ? 'hot' : 'featured'
      await api.put(`/${endpoint}/${id}`, { [field]: !currentStatus })
      toast.success(currentStatus ? 'Бейдж знято' : 'Бейдж додано')
      fetchStats()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Помилка оновлення статусу')
    }
  }

  const handleDelete = async (id, type) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей тур?')) return
    try {
      const endpoint = type === 'aviatury' ? 'aviatury' : 'tours'
      await api.delete(`/${endpoint}/${id}`)
      toast.success('Тур видалено')
      fetchStats()
    } catch (error) {
      console.error('Error deleting tour:', error)
      toast.error('Помилка видалення туру')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Вихід виконано')
    navigate('/mng-x7k9p2-secure/login')
  }

  return (
    <div className="min-h-screen bg-luxury-dark">
      {/* Header */}
      <div className="bg-luxury-dark-card shadow-xl border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-luxury-gold">Адмін-панель</h1>
              <p className="text-gray-300 mt-1">Вітаємо, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition border border-red-700"
            >
              <LogOut className="h-5 w-5" />
              Вийти
            </button>
          </div>
        </div>
      </div>

      {/* Prevent indexing by search engines */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin Panel - TripsForUA</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Tours */}
          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 hover:border-luxury-gold/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Всього турів</p>
                <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.tours}</p>
              </div>
              <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-luxury-gold" />
              </div>
            </div>
          </div>

          {/* Total Aviatury */}
          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 hover:border-luxury-gold/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Індивідуальних турів</p>
                <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.aviatury}</p>
              </div>
              <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                <Plane className="h-6 w-6 text-luxury-gold" />
              </div>
            </div>
          </div>

          {/* Expiring Tours Card */}
          <button
            onClick={() => setActiveModal('tours')}
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-red-500/30 p-6 hover:border-red-500/60 transition text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
              <Calendar className="h-16 w-16 text-red-500" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium">Спливають (Авторські)</p>
                <p className="text-3xl font-bold text-red-500 mt-2">{expiringTours.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center group-hover:bg-red-900/40 transition">
                <Calendar className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 relative z-10">Натисніть для деталей</p>
          </button>
        </div>

        {/* Quick Actions Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/mng-x7k9p2-secure/tours"
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-8 hover:border-luxury-gold hover:shadow-luxury-gold/20 transition group"
          >
            <Package className="h-12 w-12 text-luxury-gold mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-luxury-gold transition">
              Авторські подорожі
            </h3>
            <p className="text-gray-300">
              Додавайте, редагуйте та видаляйте тури
            </p>
          </Link>

          <Link
            to="/mng-x7k9p2-secure/aviatury"
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-8 hover:border-luxury-gold hover:shadow-luxury-gold/20 transition group"
          >
            <Plane className="h-12 w-12 text-luxury-gold mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-luxury-gold transition">
              Індивідуальні тури
            </h3>
            <p className="text-gray-300">
              Керуйте пропозиціями індивідуальних турів
            </p>
          </Link>
        </div>

        {/* Quick Link to Main Site */}
        <div className="mt-8 flex justify-center gap-6">
          <Link
            to="/mng-x7k9p2-secure/2fa"
            className="inline-flex items-center gap-2 text-luxury-gold hover:text-luxury-gold-light font-medium"
          >
            <Shield className="h-5 w-5" />
            Налаштування 2FA
          </Link>
          <Link
            to="/"
            className="inline-flex items-center text-luxury-gold hover:text-luxury-gold-light font-medium"
          >
            ← Повернутися на головну сторінку
          </Link>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-luxury-dark-card w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-luxury-gold/20 relative animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-luxury-gold/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-luxury-gold">
                {activeModal === 'tours' ? 'Авторські подорожі, що спливають' : 'Авіатури, що спливають'}
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white transition">
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {(activeModal === 'tours' ? expiringTours : expiringAviatury).length === 0 ? (
                <p className="text-gray-400 text-center">Немає турів, що спливають найближчим часом</p>
              ) : (
                <div className="space-y-4">
                  {(activeModal === 'tours' ? expiringTours : expiringAviatury).map(item => (
                    <div key={item._id} className="bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10 hover:border-luxury-gold/30 transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-lg mb-1">{item.title || item.name}</h4>
                        <div className="text-sm text-gray-400 mb-2">
                          Поточна дата: {new Date(item.startDate || item.availableFrom).toLocaleDateString()}
                        </div>
                        <input
                          type="date"
                          value={item.startDate || item.availableFrom ? new Date(item.startDate || item.availableFrom).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleUpdateDate(item._id, e.target.value, activeModal)}
                          className="bg-black/30 border border-luxury-gold/20 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-luxury-gold focus:outline-none w-full sm:w-auto"
                        />
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleToggleHot(item._id, activeModal === 'tours' ? item.featured : item.hot, activeModal)}
                          className={`px-4 py-2 rounded text-sm font-bold transition whitespace-nowrap ${(activeModal === 'tours' ? item.featured : item.hot)
                            ? 'bg-orange-600/20 text-orange-500 border border-orange-600/50 hover:bg-orange-600/30'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                            }`}
                        >
                          {(activeModal === 'tours' ? item.featured : item.hot) ? '🔥 Гарячий' : '⚪️ Звичайний'}
                        </button>

                        <button
                          onClick={() => handleDelete(item._id, activeModal)}
                          className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded hover:bg-red-900/40 transition text-sm flex items-center justify-center gap-2"
                        >
                          <LogOut className="h-4 w-4" /> Видалити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
