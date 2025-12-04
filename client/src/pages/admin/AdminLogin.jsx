import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Shield } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = { ...formData }
      if (requires2FA) {
        payload.twoFactorCode = twoFactorCode
      }

      const response = await api.post('/auth/login', payload)

      // Check if 2FA is required
      if (response.data.requires2FA) {
        setRequires2FA(true)
        toast('Введіть код з Google Authenticator', { icon: '🔐' })
        setLoading(false)
        return
      }

      if (response.data.role !== 'admin') {
        toast.error('У вас немає прав адміністратора')
        return
      }

      login(response.data)
      toast.success('Вхід виконано успішно')
      navigate('/mng-x7k9p2-secure')
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 15
        toast.error(`Забагато спроб входу. Спробуйте через ${retryAfter} хвилин.`, { duration: 5000 })
      } else {
        toast.error(error.response?.data?.message || 'Помилка входу')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-dark via-luxury-dark-lighter to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-luxury-dark-card rounded-2xl shadow-2xl border border-luxury-gold/30 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {requires2FA ? (
                <Shield className="h-8 w-8 text-luxury-gold" />
              ) : (
                <Lock className="h-8 w-8 text-luxury-gold" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-luxury-gold">
              {requires2FA ? 'Двофакторна автентифікація' : 'Адмін-панель'}
            </h2>
            <p className="text-gray-300 mt-2">
              {requires2FA ? 'Введіть код з додатку автентифікації' : 'Увійдіть для керування сайтом'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!requires2FA ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Код 2FA (6 цифр)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-center text-2xl tracking-widest"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false)
                    setTwoFactorCode('')
                  }}
                  className="mt-2 text-sm text-gray-400 hover:text-luxury-gold"
                >
                  ← Назад до входу
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-gold text-luxury-dark py-3 rounded-lg font-semibold hover:bg-luxury-gold-light transition disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Завантаження...' : requires2FA ? 'Підтвердити' : 'Увійти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
