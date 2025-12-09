import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Calendar, LogOut, Plane, Shield, BarChart3, Eye, TrendingUp, Globe, MessageCircle } from 'lucide-react'
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
  const [activeModal, setActiveModal] = useState(null) // 'tours' | 'aviatury' | 'analytics' | null
  const [analyticsData, setAnalyticsData] = useState(null)
  const [allItemsData, setAllItemsData] = useState({ tours: [], aviatury: [] })
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d')

  useEffect(() => {
    fetchStats()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [analyticsPeriod])

  const fetchAnalytics = async () => {
    try {
      const [statsRes, itemsRes] = await Promise.all([
        api.get(`/analytics/stats?period=${analyticsPeriod}`),
        api.get(`/analytics/all-items?period=${analyticsPeriod}`)
      ])
      setAnalyticsData(statsRes.data)
      setAllItemsData(itemsRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

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
        <title>Admin Panel - Trips for Ukraine</title>
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

          {/* Analytics Card */}
          <button
            onClick={() => setActiveModal('analytics')}
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-emerald-500/30 p-6 hover:border-emerald-500/60 transition text-left group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
              <BarChart3 className="h-16 w-16 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium">Переглядів (7 днів)</p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">{analyticsData?.totalViews || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:bg-emerald-900/40 transition">
                <Eye className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 relative z-10">📊 Аналітика переглядів</p>
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

      {/* Analytics Modal */}
      {activeModal === 'analytics' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-luxury-dark-card w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-luxury-gold/20 relative animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-luxury-gold/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-luxury-gold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Аналітика переглядів
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value)}
                  className="bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="24h">За 24 години</option>
                  <option value="7d">За 7 днів</option>
                  <option value="30d">За 30 днів</option>
                  <option value="all">Весь час</option>
                </select>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white transition">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] custom-scrollbar">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <p className="text-gray-400 text-sm">Всього переглядів</p>
                  <p className="text-2xl font-bold text-emerald-500">{analyticsData?.totalViews || 0}</p>
                </div>
                <div className="bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <p className="text-gray-400 text-sm">Авторські подорожі</p>
                  <p className="text-2xl font-bold text-blue-500">{analyticsData?.viewsByType?.Tour || 0}</p>
                </div>
                <div className="bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <p className="text-gray-400 text-sm">Індивідуальні тури</p>
                  <p className="text-2xl font-bold text-orange-500">{analyticsData?.viewsByType?.Aviatur || 0}</p>
                </div>
                <div className="bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <p className="text-gray-400 text-sm">Мобільних</p>
                  <p className="text-2xl font-bold text-purple-500">{analyticsData?.deviceStats?.mobile || 0}</p>
                </div>
              </div>

              {/* Mini Chart */}
              {analyticsData?.viewsPerDay?.length > 0 && (
                <div className="mb-8 bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Динаміка переглядів
                  </h3>
                  <div className="flex items-end gap-1 h-24">
                    {analyticsData.viewsPerDay.map((day, i) => {
                      const maxViews = Math.max(...analyticsData.viewsPerDay.map(d => d.count), 1)
                      const height = (day.count / maxViews) * 100
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-emerald-500/80 rounded-t hover:bg-emerald-400 transition"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${day._id}: ${day.count} переглядів`}
                          />
                          <span className="text-xs text-gray-500 truncate w-full text-center">
                            {day._id.slice(-5)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Social Media Clicks */}
              {analyticsData && (
                <div className="mb-8 bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                    Кліки в соцмережі
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <a
                      href="https://t.me/trips_for_ukr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-luxury-dark-lighter p-4 rounded border border-luxury-gold/5 flex flex-col items-center justify-center hover:border-blue-400/30 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                        </svg>
                        <span className="text-gray-300 font-medium">Telegram</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">{analyticsData.socialStats?.telegram || 0}</span>
                    </a>

                    <a
                      href="https://www.instagram.com/trips_for_ukr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-luxury-dark-lighter p-4 rounded border border-luxury-gold/5 flex flex-col items-center justify-center hover:border-pink-500/30 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span className="text-gray-300 font-medium">Instagram</span>
                      </div>
                      <span className="text-2xl font-bold text-pink-500">{analyticsData.socialStats?.instagram || 0}</span>
                    </a>
                  </div>

                  {/* Social Clicks by Source */}
                  {analyticsData.socialClicksBySource && analyticsData.socialClicksBySource.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold text-gray-300 mb-3">📍 Звідки переходять</h4>
                      <div className="bg-luxury-dark rounded-lg border border-luxury-gold/10 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-luxury-dark-lighter">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-luxury-gold uppercase">Тур/Сторінка</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-luxury-gold uppercase">Тип</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-luxury-gold uppercase">Платформа</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-luxury-gold uppercase">Кліки</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-luxury-gold/10">
                            {analyticsData.socialClicksBySource.map((item, index) => (
                              <tr key={index} className="hover:bg-luxury-dark-lighter transition">
                                <td className="px-4 py-2 text-gray-100 font-medium">{item._id.sourceName || 'Загальне'}</td>
                                <td className="px-4 py-2 text-gray-400">
                                  {item._id.sourceType === 'Tour' ? '📦 Авторські' : item._id.sourceType === 'Aviatur' ? '✈️ Індивід.' : '🏠 Загальне'}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${item._id.platform === 'telegram' ? 'bg-blue-900/30 text-blue-400' : 'bg-pink-900/30 text-pink-400'}`}>
                                    {item._id.platform === 'telegram' ? 'Telegram' : 'Instagram'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <span className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded-full text-sm font-bold">{item.count}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Country Stats */}
              {analyticsData?.countryStats && Object.keys(analyticsData.countryStats).length > 0 && (
                <div className="mb-8 bg-luxury-dark p-4 rounded-lg border border-luxury-gold/10">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    Топ країн
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {Object.entries(analyticsData.countryStats).map(([country, count]) => (
                      <div key={country} className="bg-luxury-dark-lighter p-3 rounded border border-luxury-gold/5 flex justify-between items-center">
                        <span className="text-gray-300 font-medium">{country === 'Unknown' ? 'Невідомо' : country}</span>
                        <span className="bg-blue-900/30 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tours Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">📦 Авторські подорожі</h3>
                <div className="bg-luxury-dark rounded-lg border border-luxury-gold/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-luxury-dark-lighter">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Назва</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Країна</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-luxury-gold uppercase">Перегляди</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-luxury-gold/10">
                      {allItemsData.tours.map((tour, index) => (
                        <tr key={tour._id} className="hover:bg-luxury-dark-lighter transition">
                          <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-100 font-medium">{tour.title}</td>
                          <td className="px-4 py-3 text-gray-400">{tour.country || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${tour.views > 10 ? 'bg-emerald-900/30 text-emerald-400' :
                              tour.views > 0 ? 'bg-blue-900/30 text-blue-400' :
                                'bg-gray-800 text-gray-500'
                              }`}>
                              {tour.views}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {allItemsData.tours.length === 0 && (
                        <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">Немає даних</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aviatury Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">✈️ Індивідуальні тури</h3>
                <div className="bg-luxury-dark rounded-lg border border-luxury-gold/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-luxury-dark-lighter">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Назва</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Країна</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-luxury-gold uppercase">Перегляди</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-luxury-gold/10">
                      {allItemsData.aviatury.map((aviatur, index) => (
                        <tr key={aviatur._id} className="hover:bg-luxury-dark-lighter transition">
                          <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-100 font-medium">{aviatur.name}</td>
                          <td className="px-4 py-3 text-gray-400">{aviatur.flag} {aviatur.country || '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${aviatur.views > 10 ? 'bg-emerald-900/30 text-emerald-400' :
                              aviatur.views > 0 ? 'bg-blue-900/30 text-blue-400' :
                                'bg-gray-800 text-gray-500'
                              }`}>
                              {aviatur.views}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {allItemsData.aviatury.length === 0 && (
                        <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">Немає даних</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div >
      )
      }
    </div >
  )
}
