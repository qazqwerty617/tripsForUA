import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminTours() {
  const [tours, setTours] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [formData, setFormData] = useState({
    destination: '',
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    duration: '',
    startDate: '',
    endDate: '',
    maxParticipants: 15,
    availableSpots: 15,
    images: [''],
    highlights: [''],
    included: [''],
    notIncluded: [''],
    featured: false,
    status: 'active'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [toursRes, destRes] = await Promise.all([
        api.get('/tours'),
        api.get('/destinations')
      ])
      setTours(toursRes.data)
      setDestinations(destRes.data)
      setLoading(false)
    } catch (error) {
      toast.error('Помилка завантаження')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const cleanedData = {
        ...formData,
        images: formData.images.filter(i => i.trim()),
        highlights: formData.highlights.filter(h => h.trim()),
        included: formData.included.filter(i => i.trim()),
        notIncluded: formData.notIncluded.filter(i => i.trim())
      }

      if (editingTour) {
        await api.put(`/tours/${editingTour._id}`, cleanedData)
        toast.success('Тур оновлено')
      } else {
        await api.post('/tours', cleanedData)
        toast.success('Тур створено')
      }
      
      setShowForm(false)
      setEditingTour(null)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити цей тур?')) return
    
    try {
      await api.delete(`/tours/${id}`)
      toast.success('Тур видалено')
      fetchData()
    } catch (error) {
      toast.error('Помилка видалення')
    }
  }

  const handleEdit = (tour) => {
    setEditingTour(tour)
    setFormData({
      destination: tour.destination._id,
      title: tour.title,
      description: tour.description,
      shortDescription: tour.shortDescription,
      price: tour.price,
      duration: tour.duration,
      startDate: format(new Date(tour.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(tour.endDate), 'yyyy-MM-dd'),
      maxParticipants: tour.maxParticipants,
      availableSpots: tour.availableSpots,
      images: tour.images.length ? tour.images : [''],
      highlights: tour.highlights.length ? tour.highlights : [''],
      included: tour.included.length ? tour.included : [''],
      notIncluded: tour.notIncluded.length ? tour.notIncluded : [''],
      featured: tour.featured,
      status: tour.status
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      destination: '',
      title: '',
      description: '',
      shortDescription: '',
      price: '',
      duration: '',
      startDate: '',
      endDate: '',
      maxParticipants: 15,
      availableSpots: 15,
      images: [''],
      highlights: [''],
      included: [''],
      notIncluded: [''],
      featured: false,
      status: 'active'
    })
  }

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] })
  }

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: newArray })
  }

  const updateArrayField = (field, index, value) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({ ...formData, [field]: newArray })
  }

  return (
    <div className="min-h-screen bg-luxury-dark">
      <div className="bg-luxury-dark-card shadow-xl border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/admin" className="text-luxury-gold hover:text-luxury-gold-light mb-2 inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Назад
              </Link>
              <h1 className="text-3xl font-bold text-luxury-gold">Керування турами</h1>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingTour(null)
                resetForm()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-luxury-dark rounded-lg hover:bg-luxury-gold-light transition font-semibold shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Додати тур
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-luxury-gold">
              {editingTour ? 'Редагувати тур' : 'Новий тур'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Напрямок *</label>
                  <select
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  >
                    <option value="">Оберіть напрямок</option>
                    {destinations.map(dest => (
                      <option key={dest._id} value={dest._id}>{dest.nameUk}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Назва *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Тривалість *</label>
                  <input
                    type="text"
                    required
                    placeholder="7 днів / 6 ночей"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Дата початку *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Дата закінчення *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Макс. учасників *</label>
                  <input
                    type="number"
                    required
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Вільні місця *</label>
                  <input
                    type="number"
                    required
                    value={formData.availableSpots}
                    onChange={(e) => setFormData({ ...formData, availableSpots: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Статус *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  >
                    <option value="active">Активний</option>
                    <option value="completed">Завершений</option>
                    <option value="cancelled">Скасований</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-luxury-gold accent-luxury-gold"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-300">Рекомендований</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Короткий опис *</label>
                <textarea
                  required
                  rows="2"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Опис *</label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Зображення (URLs)</label>
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => updateArrayField('images', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                      placeholder="https://..."
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('images', index)}
                        className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 border border-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('images')}
                  className="text-sm text-luxury-gold hover:text-luxury-gold-light"
                >
                  + Додати зображення
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Основні моменти</label>
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateArrayField('highlights', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    />
                    {formData.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('highlights', index)}
                        className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 border border-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('highlights')}
                  className="text-sm text-luxury-gold hover:text-luxury-gold-light"
                >
                  + Додати момент
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Включено в ціну</label>
                  {formData.included.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayField('included', index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                      />
                      {formData.included.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('included', index)}
                          className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 border border-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('included')}
                    className="text-sm text-luxury-gold hover:text-luxury-gold-light"
                  >
                    + Додати
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Не включено в ціну</label>
                  {formData.notIncluded.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayField('notIncluded', index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                      />
                      {formData.notIncluded.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('notIncluded', index)}
                          className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 border border-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('notIncluded')}
                    className="text-sm text-luxury-gold hover:text-luxury-gold-light"
                  >
                    + Додати
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-luxury-gold text-luxury-dark rounded-lg hover:bg-luxury-gold-light font-semibold shadow-lg"
                >
                  {editingTour ? 'Оновити' : 'Створити'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingTour(null)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-luxury-dark-lighter text-gray-300 rounded-lg hover:bg-luxury-dark border border-luxury-gold/20"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-300">Завантаження...</div>
        ) : (
          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 overflow-hidden">
            <table className="w-full">
              <thead className="bg-luxury-dark-lighter border-b border-luxury-gold/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Тур</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Напрямок</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Ціна</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Місця</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Статус</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-luxury-gold uppercase">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-gold/10">
                {tours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-luxury-dark-lighter transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-100">{tour.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="text-2xl mr-2">{tour.destination?.flag}</span>
                      {tour.destination?.nameUk}
                    </td>
                    <td className="px-6 py-4 text-luxury-gold font-semibold">€{tour.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {format(new Date(tour.startDate), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {tour.availableSpots}/{tour.maxParticipants}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tour.status === 'active' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                        tour.status === 'completed' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
                        'bg-red-900/50 text-red-300 border border-red-700'
                      }`}>
                        {tour.status === 'active' ? 'Активний' : 
                         tour.status === 'completed' ? 'Завершений' : 'Скасований'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(tour)}
                        className="text-luxury-gold hover:text-luxury-gold-light mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tour._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
