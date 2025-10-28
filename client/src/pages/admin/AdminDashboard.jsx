import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, MapPin, Calendar, LogOut } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: 0,
    destinations: 0,
    bookings: 0
  })
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [toursRes, destinationsRes, bookingsRes] = await Promise.all([
        api.get('/tours'),
        api.get('/destinations'),
        api.get('/bookings')
      ])
      setStats({
        tours: toursRes.data.length,
        destinations: destinationsRes.data.length,
        bookings: bookingsRes.data.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Вихід виконано')
    navigate('/admin/login')
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 hover:border-luxury-gold/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Напрямків</p>
                <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.destinations}</p>
              </div>
              <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-luxury-gold" />
              </div>
            </div>
          </div>

          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 hover:border-luxury-gold/40 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Бронювань</p>
                <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.bookings}</p>
              </div>
              <div className="w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-luxury-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/tours"
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-8 hover:border-luxury-gold hover:shadow-luxury-gold/20 transition group"
          >
            <Package className="h-12 w-12 text-luxury-gold mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-luxury-gold transition">
              Керування турами
            </h3>
            <p className="text-gray-300">
              Додавайте, редагуйте та видаляйте тури
            </p>
          </Link>

          <Link
            to="/admin/destinations"
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-8 hover:border-luxury-gold hover:shadow-luxury-gold/20 transition group"
          >
            <MapPin className="h-12 w-12 text-luxury-gold mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-luxury-gold transition">
              Керування напрямками
            </h3>
            <p className="text-gray-300">
              Додавайте нові країни та напрямки
            </p>
          </Link>

          <Link
            to="/admin/bookings"
            className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-8 hover:border-luxury-gold hover:shadow-luxury-gold/20 transition group"
          >
            <Calendar className="h-12 w-12 text-luxury-gold mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-100 group-hover:text-luxury-gold transition">
              Бронювання
            </h3>
            <p className="text-gray-300">
              Переглядайте та керуйте бронюваннями
            </p>
          </Link>
        </div>

        {/* Quick Link to Main Site */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-luxury-gold hover:text-luxury-gold-light font-medium"
          >
            ← Повернутися на головну сторінку
          </Link>
        </div>
      </div>
    </div>
  )
}
