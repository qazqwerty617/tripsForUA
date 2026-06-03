import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowLeft, Check, X, Search, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { countriesData } from '../../utils/countriesData'
import { generateAiTitle, generateAiAviaturyDescription } from '../../utils/aiHelper'
import CountryCitySelector from '../../components/CountryCitySelector'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Row Component
function SortableRow({ aviatur, handleEdit, handleDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: aviatur._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(212, 175, 55, 0.1)' : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-luxury-dark-lighter/50">
      <td className="px-3 py-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-luxury-gold">
          <GripVertical className="h-5 w-5" />
        </button>
      </td>
      <td className="px-4 py-4">
        <img src={aviatur.image} alt={aviatur.name} className="h-16 w-24 object-cover rounded" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{aviatur.flag}</span>
          <div>
            <div className="font-medium text-gray-100">{aviatur.name}</div>
            <div className="text-sm text-gray-400">{aviatur.country}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-300">
        €{aviatur.price}
      </td>
      <td className="px-4 py-4 text-gray-300">
        {aviatur.isResort ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">🏛️ Екскурсійний</span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">✈️ Стандартний</span>
        )}
      </td>
      <td className="px-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${aviatur.status === 'active'
          ? 'bg-green-500/20 text-green-400'
          : 'bg-gray-500/20 text-gray-400'
          }`}>
          {aviatur.status === 'active' ? 'Активний' : 'Неактивний'}
        </span>
      </td>
      <td className="px-4 py-4">
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
  )
}

export default function AdminAviatury() {
  const [aviatury, setAviatury] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAviatur, setEditingAviatur] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [generatingAiTitle, setGeneratingAiTitle] = useState(false)
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
    days: 7,
    hot: false,
    image: '',
    isResort: false,
    included: ['Переліт', 'Трансфер', 'Проживання'],
    notIncluded: ['Екскурсії', 'Страховка'],
    status: 'active'
  })

  const handleGenerateAiTitle = async () => {
    if (!formData.country) {
      toast.error('Будь ласка, спершу оберіть країну!')
      return
    }
    setGeneratingAiTitle(true)
    try {
      const generated = await generateAiTitle(formData.country, formData.name)
      let cleaned = generated.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '').trim()
      setFormData(prev => ({ ...prev, title: cleaned }))
      toast.success('AI згенерував привабливу назву туру!')
    } catch (error) {
      toast.error('Помилка генерації назви')
    } finally {
      setGeneratingAiTitle(false)
    }
  }

  const [generatingAiDesc, setGeneratingAiDesc] = useState(false)

  const handleGenerateAiDescription = async () => {
    if (!formData.country) {
      toast.error('Будь ласка, спершу оберіть країну!')
      return
    }
    setGeneratingAiDesc(true)
    try {
      const generated = await generateAiAviaturyDescription(formData.country, formData.name)
      setFormData(prev => ({ ...prev, description: generated }))
      toast.success('AI згенерував опис авіатуру!')
    } catch (error) {
      toast.error('Помилка генерації опису')
    } finally {
      setGeneratingAiDesc(false)
    }
  }



  const handleNightsChange = (val) => {
    const n = parseInt(val) || 0
    const d = parseInt(formData.days) || 0
    setFormData(prev => ({
      ...prev,
      nights: val,
      duration: d > 0 || n > 0 ? `${d || ''} днів / ${n || ''} ночей`.trim() : prev.duration
    }))
  }

  const handleDaysChange = (val) => {
    const d = parseInt(val) || 0
    const n = parseInt(formData.nights) || 0
    setFormData(prev => ({
      ...prev,
      days: val,
      duration: d > 0 || n > 0 ? `${d || ''} днів / ${n || ''} ночей`.trim() : prev.duration
    }))
  }

  useEffect(() => {
    fetchAviatury()
  }, [])

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = aviatury.findIndex(item => item._id === active.id)
      const newIndex = aviatury.findIndex(item => item._id === over.id)

      const newOrder = arrayMove(aviatury, oldIndex, newIndex)
      setAviatury(newOrder)

      // Save to server
      try {
        await api.put('/aviatury/reorder', {
          orderedIds: newOrder.map(item => item._id)
        })
        toast.success('Порядок збережено')
      } catch (error) {
        toast.error('Помилка збереження порядку')
        fetchAviatury() // Reload original order
      }
    }
  }

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
        isResort: formData.isResort || false,
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
      days: (() => { const m = (aviatur.duration || '').match(/(\d+)\s*(?:день|дні|днів)/); return m ? parseInt(m[1]) : 7 })(),
      hot: aviatur.hot || false,
      image: aviatur.image,
      isResort: aviatur.isResort || false,
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
      days: 7,
      hot: false,
      image: '',
      isResort: false,
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
            <h1 className="text-3xl font-bold text-luxury-gold">Управління Індивідуальними турами</h1>
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
              {/* Country + City selector (same as Екскурсійні тури) */}
              <div className="md:col-span-2">
                <CountryCitySelector
                  selectedCountry={formData.country}
                  selectedCity={formData.name}
                  onCountryChange={(val) => {
                    const matched = countriesData.find(c => c.nameUk === val)
                    setFormData(prev => ({
                      ...prev,
                      country: val,
                      flag: matched ? matched.flag : prev.flag
                    }))
                  }}
                  onCityChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Опис</label>
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
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Наприклад: Райський відпочинок на Криті"
                      className="w-full pl-4 pr-24 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateAiTitle}
                      disabled={generatingAiTitle}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light disabled:opacity-50 text-xs font-bold rounded flex items-center gap-1 transition"
                    >
                      {generatingAiTitle ? 'Генерація...' : '✨ AI'}
                    </button>
                  </div>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Тривалість *</label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        required
                        min="1"
                        max="90"
                        placeholder="7"
                        value={formData.days ?? ''}
                        onChange={(e) => handleDaysChange(e.target.value)}
                        className="w-20 px-3 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold text-center text-lg font-bold"
                      />
                      <span className="text-xs text-gray-500 mt-1">днів</span>
                    </div>
                    <span className="text-luxury-gold font-bold text-xl mt-[-14px]">/</span>
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        min="0"
                        max="89"
                        placeholder="6"
                        value={formData.nights ?? ''}
                        onChange={(e) => handleNightsChange(e.target.value)}
                        className="w-20 px-3 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold text-center text-lg font-bold"
                      />
                      <span className="text-xs text-gray-500 mt-1">ночей</span>
                    </div>
                    {(formData.days || formData.nights) && (
                      <span className="ml-2 text-luxury-gold font-medium text-sm bg-luxury-gold/10 border border-luxury-gold/30 px-3 py-2 rounded-lg self-center">
                        {formData.days || '?'} днів / {formData.nights || '?'} ночей
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hot}
                      onChange={(e) => setFormData({ ...formData, hot: e.target.checked })}
                      className="w-4 h-4 text-luxury-gold accent-luxury-gold bg-luxury-dark border-luxury-gold/30 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-300">🔥 Гарячий тур</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isResort}
                      onChange={(e) => setFormData({ ...formData, isResort: e.target.checked })}
                      className="w-4 h-4 text-luxury-gold accent-luxury-gold bg-luxury-dark border-luxury-gold/30 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-300">🏛️ Екскурсійний тур (інакше - стандартний)</label>
                  </div>
                </div>

              </div>

              <div className="border-t border-luxury-gold/20 my-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex justify-between items-center mt-1">
                  <button
                    type="button"
                    onClick={() => addArrayItem('included')}
                    className="text-luxury-gold hover:text-luxury-gold-light text-sm"
                  >
                    + Додати пункт
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 p-2 bg-luxury-dark-lighter/50 rounded-lg border border-luxury-gold/10">
                  <span className="text-xs text-gray-400 mr-1">Швидкий вибір:</span>
                  {[
                    "✈️ Авіапереліт",
                    "🚌 Трансфер",
                    "🏨 Проживання",
                    "🍽️ Харчування",
                    "🩺 Страховка",
                    "🧳 Ручна поклажа"
                  ].map(pill => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        const current = formData.included;
                        if (current.length > 0 && current[current.length - 1] === '') {
                          const updated = [...current];
                          updated[updated.length - 1] = pill;
                          setFormData({ ...formData, included: updated });
                        } else {
                          setFormData({ ...formData, included: [...current, pill] });
                        }
                      }}
                      className="px-2 py-0.5 text-xs bg-luxury-dark border border-luxury-gold/20 text-gray-300 rounded hover:border-luxury-gold transition"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
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
                <div className="flex justify-between items-center mt-1">
                  <button
                    type="button"
                    onClick={() => addArrayItem('notIncluded')}
                    className="text-luxury-gold hover:text-luxury-gold-light text-sm"
                  >
                    + Додати пункт
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 p-2 bg-luxury-dark-lighter/50 rounded-lg border border-luxury-gold/10">
                  <span className="text-xs text-gray-400 mr-1">Швидкий вибір:</span>
                  {[
                    "🎟️ Екскурсії",
                    "🪙 Особисті витрати",
                    "🛂 Віза",
                    "🍷 Елітні напої",
                    "🚕 Додатковий трансфер"
                  ].map(pill => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        const current = formData.notIncluded;
                        if (current.length > 0 && current[current.length - 1] === '') {
                          const updated = [...current];
                          updated[updated.length - 1] = pill;
                          setFormData({ ...formData, notIncluded: updated });
                        } else {
                          setFormData({ ...formData, notIncluded: [...current, pill] });
                        }
                      }}
                      className="px-2 py-0.5 text-xs bg-luxury-dark border border-luxury-gold/20 text-gray-300 rounded hover:border-luxury-gold transition"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
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
          <div className="p-4 border-b border-luxury-gold/20 bg-luxury-dark-lighter">
            <p className="text-sm text-gray-400">💡 Перетягуйте елементи за іконку ≡ щоб змінити порядок відображення на сайті</p>
          </div>
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className="w-full">
                <thead className="bg-luxury-dark-lighter border-b border-luxury-gold/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider w-12">

                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      Зображення
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      Напрямок
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      Ціна
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <SortableContext items={filteredAviatury.map(a => a._id)} strategy={verticalListSortingStrategy}>
                  <tbody className="divide-y divide-luxury-gold/10">
                    {filteredAviatury.map((aviatur) => (
                      <SortableRow
                        key={aviatur._id}
                        aviatur={aviatur}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
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
