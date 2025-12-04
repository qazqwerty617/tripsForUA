import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nameUk: '',
    country: '',
    flag: '',
    slug: '',
    description: '',
    shortDescription: '',
    image: '',
    gallery: [''],
    continent: 'Europe',
    featured: false,
    popularityScore: 0
  })

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/destinations')
      setDestinations(response.data)
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
        gallery: formData.gallery.filter(g => g.trim())
      }

      if (editingDestination) {
        await api.put(`/destinations/${editingDestination._id}`, cleanedData)
        toast.success('Напрямок оновлено')
      } else {
        await api.post('/destinations', cleanedData)
        toast.success('Напрямок створено')
      }

      setShowForm(false)
      setEditingDestination(null)
      resetForm()
      fetchDestinations()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити цей напрямок?')) return

    try {
      await api.delete(`/destinations/${id}`)
      toast.success('Напрямок видалено')
      fetchDestinations()
    } catch (error) {
      toast.error('Помилка видалення')
    }
  }

  const handleEdit = (destination) => {
    setEditingDestination(destination)
    setFormData({
      name: destination.name,
      nameUk: destination.nameUk,
      country: destination.country,
      flag: destination.flag,
      slug: destination.slug,
      description: destination.description,
      shortDescription: destination.shortDescription,
      image: destination.image,
      gallery: destination.gallery.length ? destination.gallery : [''],
      continent: destination.continent,
      featured: destination.featured,
      popularityScore: destination.popularityScore
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameUk: '',
      country: '',
      flag: '',
      slug: '',
      description: '',
      shortDescription: '',
      image: '',
      gallery: [''],
      continent: 'Europe',
      featured: false,
      popularityScore: 0
    })
  }

  const addGalleryImage = () => {
    setFormData({ ...formData, gallery: [...formData.gallery, ''] })
  }

  const removeGalleryImage = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index)
    setFormData({ ...formData, gallery: newGallery })
  }

  const updateGalleryImage = (index, value) => {
    const newGallery = [...formData.gallery]
    newGallery[index] = value
    setFormData({ ...formData, gallery: newGallery })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/mng-x7k9p2-secure" className="text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Назад
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Керування напрямками</h1>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingDestination(null)
                resetForm()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="h-5 w-5" />
              Додати напрямок
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingDestination ? 'Редагувати напрямок' : 'Новий напрямок'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Назва (EN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Iceland"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Назва (UK) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameUk}
                    onChange={(e) => setFormData({ ...formData, nameUk: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ісландія"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Країна *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ісландія"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Прапор (emoji) *</label>
                  <input
                    type="text"
                    required
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="🇮🇸"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="iceland"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Континент *</label>
                  <select
                    required
                    value={formData.continent}
                    onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Europe">Європа</option>
                    <option value="Asia">Азія</option>
                    <option value="Africa">Африка</option>
                    <option value="North America">Північна Америка</option>
                    <option value="South America">Південна Америка</option>
                    <option value="Oceania">Океанія</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Популярність (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.popularityScore}
                    onChange={(e) => setFormData({ ...formData, popularityScore: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label className="ml-2 text-sm font-medium">Рекомендований</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Короткий опис *</label>
                <textarea
                  required
                  rows="2"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Опис *</label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Головне зображення (URL) *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Галерея зображень (URLs)</label>
                {formData.gallery.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => updateGalleryImage(index, e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="https://..."
                    />
                    {formData.gallery.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Додати зображення
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingDestination ? 'Оновити' : 'Створити'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingDestination(null)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Завантаження...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div key={destination._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.nameUk}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{destination.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold">{destination.nameUk}</h3>
                      <p className="text-sm text-gray-500">{destination.country}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {destination.shortDescription}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${destination.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {destination.featured ? 'Рекомендований' : 'Звичайний'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {destination.continent === 'Europe' ? 'Європа' :
                        destination.continent === 'Africa' ? 'Африка' :
                          destination.continent === 'Asia' ? 'Азія' : destination.continent}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(destination)}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(destination._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
