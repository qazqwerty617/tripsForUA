import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowLeft, X } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { countriesData } from '../../utils/countriesData'
import { generateAiDescription, generateAiImage } from '../../utils/aiHelper'
import ImageInput from '../../components/ImageInput'

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [countrySuggestions, setCountrySuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
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

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowSuggestions(false)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleNameUkInputChange = (val) => {
    setFormData(prev => ({ ...prev, nameUk: val, country: val }))
    if (val.trim().length >= 1) {
      const query = val.toLowerCase()
      const matches = countriesData.filter(c =>
        c.nameUk.toLowerCase().includes(query) ||
        c.nameEn.toLowerCase().includes(query)
      ).slice(0, 6)
      setCountrySuggestions(matches)
      setShowSuggestions(true)
    } else {
      setCountrySuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectCountry = (country, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Guess continent based on country name or standard mapping
    let guessedContinent = 'Europe'
    const asiaCountries = ['Японія', 'Китай', 'Таїланд', 'Індія', 'Індонезія', 'В\'єтнам', 'Мальдіви', 'Шрі-Ланка', 'ОАЕ', 'Катар', 'Камбоджа', 'Сінгапур', 'Узбекистан', 'Бахрейн', 'Бангладеш']
    const africaCountries = ['Єгипет', 'Кенія', 'Танзанія', 'Мадагаскар', 'Марокко', 'Туніс', 'ПАР', 'Алжир', 'Ангола', 'Маврикій', 'Сейшельські острови', 'Ефіопія']
    const americaCountries = ['США', 'Канада', 'Бразилія', 'Аргентина', 'Колумбія', 'Куба', 'Мексика', 'Коста-Ріка', 'Домінікана', 'Уругвай', 'Чилі']
    const oceaniaCountries = ['Австралія', 'Нова Зеландія']
    
    if (asiaCountries.includes(country.nameUk)) {
      guessedContinent = 'Asia'
    } else if (africaCountries.includes(country.nameUk)) {
      guessedContinent = 'Africa'
    } else if (americaCountries.includes(country.nameUk)) {
      guessedContinent = 'North America'
    } else if (oceaniaCountries.includes(country.nameUk)) {
      guessedContinent = 'Oceania'
    }

    setFormData(prev => ({
      ...prev,
      nameUk: country.nameUk,
      name: country.nameEn,
      country: country.nameUk,
      flag: country.flag,
      slug: country.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      continent: guessedContinent
    }))
    setCountrySuggestions([])
    setShowSuggestions(false)
    toast.success(`Напрямок ${country.nameUk} ${country.flag} автоматично заповнено!`)
  }

  const [generatingAiDesc, setGeneratingAiDesc] = useState(false)

  const handleGenerateAiDescription = async () => {
    if (!formData.nameUk) {
      toast.error('Будь ласка, спершу оберіть або введіть назву напрямку!')
      return
    }
    setGeneratingAiDesc(true)
    try {
      const generated = await generateAiDescription(formData.nameUk)
      setFormData(prev => ({ 
        ...prev, 
        description: generated,
        shortDescription: generated.split(/[.!?]/)[0] + '.'
      }))
      toast.success('AI згенерував повний та короткий опис!')
    } catch (error) {
      toast.error('Помилка генерації опису')
    } finally {
      setGeneratingAiDesc(false)
    }
  }

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
    <div className="min-h-screen bg-luxury-dark text-white">
      <div className="bg-luxury-dark-card border-b border-luxury-gold/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/mng-x7k9p2-secure" className="text-luxury-gold hover:text-luxury-gold-light mb-2 inline-flex items-center transition">
                <ArrowLeft className="h-5 w-5 mr-1" /> Назад
              </Link>
              <h1 className="text-3xl font-bold text-luxury-gold">Керування напрямками</h1>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingDestination(null)
                resetForm()
              }}
              className="flex items-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-dark font-bold rounded-lg hover:bg-luxury-gold-light transition shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Додати напрямок
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="bg-luxury-dark-card rounded-xl shadow-xl border border-luxury-gold/20 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-luxury-gold">
              {editingDestination ? 'Редагувати напрямок' : 'Новий напрямок'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Назва (UK) * (Введіть, щоб знайти країну)</label>
                  <input
                    type="text"
                    required
                    value={formData.nameUk}
                    onChange={(e) => handleNameUkInputChange(e.target.value)}
                    onFocus={() => {
                      if (formData.nameUk.trim().length >= 1) {
                        setShowSuggestions(true)
                      }
                    }}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    placeholder="Ісландія"
                  />
                  {showSuggestions && countrySuggestions.length > 0 && (
                    <div 
                      className="absolute z-50 w-full mt-1 bg-luxury-dark border border-luxury-gold/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto divide-y divide-luxury-gold/10 backdrop-blur-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {countrySuggestions.map((c) => (
                        <button
                          key={c.nameUk}
                          type="button"
                          onClick={(e) => handleSelectCountry(c, e)}
                          className="w-full px-4 py-3 text-left hover:bg-luxury-gold/10 text-gray-100 flex items-center justify-between transition-colors duration-150"
                        >
                          <span className="font-medium text-sm text-gray-200">{c.nameUk}</span>
                          <span className="text-xl">{c.flag}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Назва (EN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    placeholder="Iceland"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Країна *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    placeholder="Ісландія"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Прапор (emoji) *</label>
                  <input
                    type="text"
                    required
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    placeholder="🇮🇸"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                    placeholder="iceland"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Континент *</label>
                  <select
                    required
                    value={formData.continent}
                    onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Популярність (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.popularityScore}
                    onChange={(e) => setFormData({ ...formData, popularityScore: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-luxury-gold accent-luxury-gold bg-luxury-dark border-luxury-gold/30 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-300">🔥 Рекомендований напрямок</label>
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Опис *</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={generatingAiDesc}
                    className="px-3 py-1 bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light disabled:opacity-50 text-xs font-bold rounded flex items-center gap-1 transition"
                  >
                    {generatingAiDesc ? 'Генерація...' : '✨ AI Згенерувати'}
                  </button>
                </div>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Головне зображення (URL) *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Галерея зображень (URLs)</label>
                {formData.gallery.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => updateGalleryImage(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                      placeholder="https://..."
                    />
                    {formData.gallery.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="px-3 py-2 bg-red-900/40 text-red-300 border border-red-700 rounded-lg hover:bg-red-800/40 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="text-sm text-luxury-gold hover:text-luxury-gold-light transition"
                >
                  + Додати зображення
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-luxury-gold text-luxury-dark font-bold rounded-lg hover:bg-luxury-gold-light transition shadow-lg"
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
                  className="px-6 py-3 bg-luxury-dark-lighter border border-luxury-gold/30 text-gray-300 rounded-lg hover:bg-luxury-gold/10 transition"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Завантаження...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div key={destination._id} className="bg-luxury-dark-card border border-luxury-gold/20 rounded-xl overflow-hidden shadow-xl hover:border-luxury-gold/40 transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.nameUk}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-luxury-dark/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-luxury-gold/30 text-luxury-gold">
                    ★ {destination.popularityScore || 0}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{destination.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{destination.nameUk}</h3>
                      <p className="text-sm text-gray-400">{destination.country}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {destination.shortDescription}
                  </p>
                  <div className="flex items-center justify-between mb-4 border-t border-luxury-gold/10 pt-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${destination.featured ? 'bg-yellow-950/40 text-yellow-300 border border-yellow-800' : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                      {destination.featured ? 'Рекомендований' : 'Звичайний'}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                      {destination.continent === 'Europe' ? 'Європа' :
                        destination.continent === 'Africa' ? 'Африка' :
                          destination.continent === 'Asia' ? 'Азія' : destination.continent}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(destination)}
                      className="flex-1 px-4 py-2 bg-luxury-gold text-luxury-dark font-bold rounded-lg hover:bg-luxury-gold-light flex items-center justify-center gap-2 transition"
                    >
                      <Edit className="h-4 w-4" />
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(destination._id)}
                      className="px-4 py-2 bg-red-950/40 text-red-300 border border-red-700 rounded-lg hover:bg-red-800/40 transition"
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
