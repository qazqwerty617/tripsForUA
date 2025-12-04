import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowLeft, Check, X, Search } from 'lucide-react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminAviatury() {
  const [aviatury, setAviatury] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAviatur, setEditingAviatur] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    flag: '',
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    duration: '7 днів / 6 ночей',
    nights: 6,
    hot: false,
    image: '',
    availableFrom: '',
    availableTo: '',
    included: ['Переліт', 'Трансфер', 'Проживання'],
    notIncluded: ['Екскурсії', 'Страховка'],
    status: 'active'
  })

  useEffect(() => {
    fetchAviatury()
  }, [])

  const fetchAviatury = async () => {
    try {
      const response = await api.get('/aviatury')
      setAviatury(response.data)
      setLoading(false)
    } catch (error) {
      toast.error('Помилка завантаження')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Перевірка обов'язкових полів
    if (!formData.name) {
      toast.error('Будь ласка, введіть назву авіатуру')
      return
    }

    if (!formData.image) {
      toast.error('Будь ласка, додайте зображення')
      return
    }

    try {
      const cleanedData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        nights: Number(formData.nights) || 6,
        hot: formData.hot || false,
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom) : undefined,
        availableTo: formData.availableTo ? new Date(formData.availableTo) : undefined,
        included: formData.included.filter(i => i.trim()),
        notIncluded: formData.notIncluded.filter(i => i.trim())
      }

      if (editingAviatur) {
        await api.put(`/aviatury/${editingAviatur._id}`, cleanedData)
        toast.success('Авіатур оновлено')
      } else {
        await api.post('/aviatury', cleanedData)
        toast.success('Авіатур створено')
      }

      setShowForm(false)
      resetForm()
      fetchAviatury()
    } catch (error) {
      toast.error('Помилка збереження')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Видалити цей авіатур?')) {
      try {
        await api.delete(`/aviatury/${id}`)
        toast.success('Авіатур видалено')
        fetchAviatury()
      } catch (error) {
        toast.error('Помилка видалення')
      }
    }
  }

  const handleEdit = (aviatur) => {
    setEditingAviatur(aviatur)
    setFormData({
      name: aviatur.name,
      country: aviatur.country,
      flag: aviatur.flag,
      title: aviatur.title || '',
      description: aviatur.description || '',
      price: aviatur.price,
      originalPrice: aviatur.originalPrice || '',
      duration: aviatur.duration || '7 днів / 6 ночей',
      nights: aviatur.nights || 6,
      hot: aviatur.hot || false,
      image: aviatur.image,
      availableFrom: aviatur.availableFrom ? new Date(aviatur.availableFrom).toISOString().slice(0, 10) : '',
      availableTo: aviatur.availableTo ? new Date(aviatur.availableTo).toISOString().slice(0, 10) : '',
      included: aviatur.included || ['Переліт', 'Трансфер', 'Проживання'],
      notIncluded: aviatur.notIncluded || ['Екскурсії', 'Страховка'],
      status: aviatur.status
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      flag: '',
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      duration: '7 днів / 6 ночей',
      nights: 6,
      hot: false,
      image: '',
      availableFrom: '',
      availableTo: '',
      included: ['Переліт', 'Трансфер', 'Проживання'],
      notIncluded: ['Екскурсії', 'Страховка'],
      status: 'active'
    })
    setEditingAviatur(null)
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res?.data?.path || res?.data?.url
      if (url) {
        setFormData(prev => ({ ...prev, image: url }))
        toast.success('Зображення завантажено')
      } else {
        toast.error('Не вдалося отримати URL зображення')
      }
    } catch (e) {
      toast.error('Помилка завантаження зображення')
    }
  }

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({ ...formData, [field]: newArray })
  }

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] })
  }

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: newArray })
  }

  // Filter aviatury based on search query
  const filteredAviatury = aviatury.filter(aviatur => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      aviatur.name?.toLowerCase().includes(query) ||
      aviatur.country?.toLowerCase().includes(query) ||
      aviatur.price?.toString().includes(query)
    )
  })

  if (loading) return <div className="min-h-screen bg-luxury-dark text-white flex items-center justify-center">Завантаження...</div>

  return (
    <div className="min-h-screen bg-luxury-dark text-white">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Manage Aviatury - Admin Panel</title>
      </Helmet>

      <div className="bg-luxury-dark-card border-b border-luxury-gold/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/mng-x7k9p2-secure" className="text-luxury-gold hover:text-luxury-gold-light transition">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-luxury-gold">Управління Авіатурами</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-luxury-gold text-luxury-dark px-6 py-3 rounded-lg font-semibold hover:bg-luxury-gold-light transition"
            >
              <Plus className="h-5 w-5" />
              Додати авіатур
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        {!showForm && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук за назвою, країною або ціною..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-luxury-dark-card border border-luxury-gold/30 text-white rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent placeholder-gray-500"
              />
            </div>
          </div>
        )}
        {showForm && (
          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-luxury-gold">
              {editingAviatur ? 'Редагувати авіатур' : 'Новий авіатур'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Назва *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Крит"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Країна *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Греція"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Прапор</label>
                  <input
                    type="text"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="🇬🇷"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Опис</label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Короткий опис пропозиції, пляжі, особливості, тощо... (макс. 500 символів)"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold resize-y"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">{formData.description?.length || 0}/500</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Ціна (EUR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Заголовок (опціонально)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Наприклад: Райськийвідпочинок на Криті"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Якщо не вказано, використовується назва</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Стара ціна (EUR) - опціонально</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="Для відображення знижки"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Буде показано перекресленою</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Тривалість</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="7 днів / 6 ночей"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Кількість ночей</label>
                  <input
                    type="number"
                    value={formData.nights}
                    onChange={(e) => setFormData({ ...formData, nights: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hot}
                    onChange={(e) => setFormData({ ...formData, hot: e.target.checked })}
                    className="w-4 h-4 text-luxury-gold accent-luxury-gold bg-luxury-dark border-luxury-gold/30 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-300">🔥 Гарячий тур</label>
                </div>

              </div>

              <div className="border-t border-luxury-gold/20 my-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Доступно з</label>
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Доступно до</label>
                  <input
                    type="date"
                    value={formData.availableTo}
                    onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  >
                    <option value="active">Активний</option>
                    <option value="inactive">Неактивний</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Зображення *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required={!formData.image}
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value.trim() })}
                    placeholder="https://... або /uploads/xxxxx.jpg"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg"
                  />
                </div>
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg" />
                )}
                <p className="text-xs text-gray-500 mt-1">Можна вставити URL або завантажити файл (jpeg/png/webp, до 8MB)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Що входить
                </label>
                {formData.included.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('included', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('included', index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('included')}
                  className="text-luxury-gold hover:text-luxury-gold-light text-sm"
                >
                  + Додати пункт
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <X className="h-4 w-4 text-red-400" />
                  Не входить
                </label>
                {formData.notIncluded.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('notIncluded', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('notIncluded', index)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('notIncluded')}
                  className="text-luxury-gold hover:text-luxury-gold-light text-sm"
                >
                  + Додати пункт
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-luxury-gold text-luxury-dark py-3 rounded-lg font-semibold hover:bg-luxury-gold-light transition"
                >
                  {editingAviatur ? 'Оновити' : 'Створити'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-luxury-dark-lighter border-b border-luxury-gold/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                    Зображення
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                    Напрямок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                    Ціна
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                    Дати
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gold/10">
                {filteredAviatury.map((aviatur) => (
                  <tr key={aviatur._id} className="hover:bg-luxury-dark-lighter/50">
                    <td className="px-6 py-4">
                      <img src={aviatur.image} alt={aviatur.name} className="h-16 w-24 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{aviatur.flag}</span>
                        <div>
                          <div className="font-medium text-gray-100">{aviatur.name}</div>
                          <div className="text-sm text-gray-400">{aviatur.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      €{aviatur.price}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {(aviatur.availableFrom || aviatur.availableTo) ? (
                        <span>
                          {aviatur.availableFrom ? format(new Date(aviatur.availableFrom), 'd MMM', { locale: uk }) : '—'} — {aviatur.availableTo ? format(new Date(aviatur.availableTo), 'd MMM', { locale: uk }) : '—'}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${aviatur.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {aviatur.status === 'active' ? 'Активний' : 'Неактивний'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(aviatur)}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(aviatur._id)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {aviatury.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Немає авіатурів. Додайте перший!
          </div>
        )}
      </div>
    </div>
  )
}
