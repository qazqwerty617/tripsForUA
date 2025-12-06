import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, ArrowLeft, Upload, X, Search, GripVertical } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import CountryCitySelector from '../../components/CountryCitySelector'
import { countriesData } from '../../utils/countriesData'
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

// Sortable Row Component for Tours
function SortableTourRow({ tour, handleEdit, handleDelete, countriesData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tour._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(212, 175, 55, 0.1)' : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-luxury-dark-lighter transition">
      <td className="px-3 py-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-luxury-gold">
          <GripVertical className="h-5 w-5" />
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="font-medium text-gray-100">{tour.title}</div>
      </td>
      <td className="px-4 py-4 text-gray-300">
        {tour.country ? (
          <div className="flex items-start gap-2">
            <span className="text-2xl">
              {countriesData.find(c => c.nameUk === tour.country)?.flag || '🌍'}
            </span>
            <div>
              <div className="font-medium">{tour.country}</div>
              {tour.city && <div className="text-sm text-gray-400">{tour.city}</div>}
            </div>
          </div>
        ) : (
          <>
            <span className="text-2xl mr-2">{tour.destination?.flag}</span>
            {tour.destination?.nameUk}
          </>
        )}
      </td>
      <td className="px-4 py-4 text-luxury-gold font-semibold">€{tour.price}</td>
      <td className="px-4 py-4 text-sm text-gray-300">
        {format(new Date(tour.startDate), 'dd.MM.yyyy')}
      </td>
      <td className="px-4 py-4 text-gray-300">
        {tour.availableSpots}/{tour.maxParticipants}
      </td>
      <td className="px-4 py-4">
        <span className={`px-2 py-1 text-xs rounded-full ${tour.status === 'active' ? 'bg-green-900/50 text-green-300 border border-green-700' :
          tour.status === 'completed' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
            'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
          {tour.status === 'active' ? 'Активний' :
            tour.status === 'completed' ? 'Завершений' : 'Скасований'}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
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
  )
}

export default function AdminTours() {
  const [tours, setTours] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    city: '',
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    duration: '',
    startDate: '',
    endDate: '',
    availableDates: [''],
    maxParticipants: 15,
    availableSpots: 15,
    images: [''],
    highlights: [''],
    included: [''],
    notIncluded: [''],
    featured: false,
    status: 'active',
    tourType: 'exclusive',
    contactTelegram: '',
    contactInstagram: '',
    fancyTitle: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-fill title from city and country
  useEffect(() => {
    const auto = `${formData.city ? formData.city + (formData.country ? ', ' : '') : ''}${formData.country || ''}`.trim()
    if (auto && auto !== formData.title) {
      setFormData(prev => ({ ...prev, title: auto }))
    }
  }, [formData.country, formData.city])

  // Auto-calculate startDate and endDate from availableDates and duration
  useEffect(() => {
    const validDates = formData.availableDates
      .filter(d => d && d.trim())
      .map(d => new Date(d))
      .sort((a, b) => a - b)

    if (validDates.length > 0) {
      const firstDate = validDates[0]
      const startDateStr = format(firstDate, 'yyyy-MM-dd')

      let days = 1
      const durationMatch = formData.duration.match(/(\d+)/)
      if (durationMatch) {
        days = parseInt(durationMatch[1])
      }
      // Assuming duration includes start day, so add days - 1
      const endDate = new Date(firstDate)
      endDate.setDate(endDate.getDate() + (days > 0 ? days - 1 : 0))
      const endDateStr = format(endDate, 'yyyy-MM-dd')

      if (startDateStr !== formData.startDate || endDateStr !== formData.endDate) {
        setFormData(prev => ({ ...prev, startDate: startDateStr, endDate: endDateStr }))
      }
    }
  }, [formData.availableDates, formData.duration])

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
      const oldIndex = tours.findIndex(item => item._id === active.id)
      const newIndex = tours.findIndex(item => item._id === over.id)

      const newOrder = arrayMove(tours, oldIndex, newIndex)
      setTours(newOrder)

      // Save to server
      try {
        await api.put('/tours/reorder', {
          orderedIds: newOrder.map(item => item._id)
        })
        toast.success('Порядок збережено')
      } catch (error) {
        toast.error('Помилка збереження порядку')
        fetchData() // Reload original order
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check required fields
    if (!formData.title) {
      toast.error('Будь ласка, введіть назву туру')
      return
    }

    if (formData.images.length === 0 || !formData.images[0].trim()) {
      toast.error('Будь ласка, додайте принаймні одне зображення')
      return
    }

    try {
      const cleanedData = {
        ...formData,
        title: formData.title && formData.title.trim()
          ? formData.title
          : formData.city || '',
        fancyTitle: formData.fancyTitle ? formData.fancyTitle.trim() : '',
        city: formData.city || '',
        country: formData.country || '',
        price: Number(formData.price) || 0,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        maxParticipants: Number(formData.maxParticipants) || 1,
        availableSpots: Number(formData.availableSpots) || 1,
        images: formData.images.filter(i => i && i.trim()),
        highlights: formData.highlights.filter(h => h && h.trim()),
        included: formData.included.filter(i => i && i.trim()),
        notIncluded: formData.notIncluded.filter(i => i && i.trim()),
        availableDates: formData.availableDates.filter(d => d && d.trim()).map(d => new Date(d))
      }

      // Remove empty fields that might cause validation issues
      if (!cleanedData.destination) delete cleanedData.destination
      if (!cleanedData.country) delete cleanedData.country
      if (!cleanedData.city) delete cleanedData.city

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
      destination: tour.destination?._id || '',
      country: tour.country || '',
      city: tour.city || '',
      title: tour.title,
      description: tour.description,
      shortDescription: tour.shortDescription,
      price: tour.price,
      originalPrice: tour.originalPrice || '',
      duration: tour.duration,
      startDate: format(new Date(tour.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(tour.endDate), 'yyyy-MM-dd'),
      availableDates: tour.availableDates?.length
        ? tour.availableDates.map(d => format(new Date(d), 'yyyy-MM-dd'))
        : [format(new Date(tour.startDate), 'yyyy-MM-dd')],
      maxParticipants: tour.maxParticipants,
      availableSpots: tour.availableSpots,
      images: tour.images.length ? tour.images : [''],
      highlights: tour.highlights.length ? tour.highlights : [''],
      included: tour.included.length ? tour.included : [''],
      notIncluded: tour.notIncluded.length ? tour.notIncluded : [''],
      featured: tour.featured,
      status: tour.status,
      tourType: tour.tourType || 'exclusive',
      contactTelegram: tour.contactTelegram || '',
      contactInstagram: tour.contactInstagram || '',
      fancyTitle: tour.fancyTitle || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      destination: '',
      country: '',
      city: '',
      title: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      duration: '',
      startDate: '',
      endDate: '',
      availableDates: [''],
      maxParticipants: 15,
      availableSpots: 15,
      images: [''],
      highlights: [''],
      included: [''],
      notIncluded: [''],
      featured: false,
      status: 'active',
      tourType: 'exclusive',
      contactTelegram: '',
      contactInstagram: '',
      fancyTitle: ''
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

  const handleFileUpload = async (file, index) => {
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res?.data?.path || res?.data?.url
      if (url) {
        const newImages = [...formData.images]
        newImages[index] = url
        setFormData({ ...formData, images: newImages })
        toast.success('Зображення завантажено')
      } else {
        toast.error('Не вдалося отримати URL зображення')
      }
    } catch (e) {
      console.error('Error uploading image:', e)
      toast.error('Помилка завантаження зображення')
    }
  }

  // Filter tours based on search query
  const filteredTours = tours.filter(tour => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      tour.title?.toLowerCase().includes(query) ||
      tour.city?.toLowerCase().includes(query) ||
      tour.country?.toLowerCase().includes(query) ||
      tour.price?.toString().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-luxury-dark">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Manage Tours - Admin Panel</title>
      </Helmet>

      <div className="bg-luxury-dark-card shadow-xl border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/mng-x7k9p2-secure" className="text-luxury-gold hover:text-luxury-gold-light mb-2 inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" /> Назад
              </Link>
              <h1 className="text-3xl font-bold text-luxury-gold">Авторські подорожі</h1>
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
        {/* Search Bar */}
        {!showForm && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук за назвою, містом, країною або ціною..."
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
              {editingTour ? 'Редагувати тур' : 'Новий тур'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Країна</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Греція"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Місто</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Афіни"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Маркетингова назва (наприклад: "Вогонь та Лід")</label>
                  <input
                    type="text"
                    value={formData.fancyTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, fancyTitle: e.target.value }))}
                    placeholder="Введіть красиву назву туру..."
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Якщо вказано, ця назва буде головною на сайті. Якщо ні - буде "Місто, Країна".</p>
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Стара ціна (EUR) - опціонально</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="Для відображення знижки"
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Якщо вказано, буде показано перекреслену стару ціну</p>
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

                {/* Available Dates (Primary Input) */}
                <div className="md:col-span-2 p-4 bg-luxury-dark-lighter rounded-lg border border-luxury-gold/20">
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    📅 Дати виїзду
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Додайте всі дати виїзду. Система автоматично встановить першу дату як "Початок туру" та розрахує дату закінчення на основі тривалості.
                  </p>
                  <div className="space-y-2">
                    {formData.availableDates.map((date, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => updateArrayField('availableDates', index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                        />
                        {formData.availableDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('availableDates', index)}
                            className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 border border-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayField('availableDates')}
                    className="mt-3 text-sm text-luxury-gold hover:text-luxury-gold-light"
                  >
                    + Додати дату
                  </button>
                </div>

                {/* Hidden Auto-Calculated Fields */}
                <div className="hidden">
                  <input type="date" value={formData.startDate} readOnly />
                  <input type="date" value={formData.endDate} readOnly />
                </div>
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium mb-2 text-gray-300">Тип авіатур *</label>
                  <select
                    value={formData.tourType}
                    onChange={(e) => setFormData({ ...formData, tourType: e.target.value })}
                    className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                  >
                    <option value="exclusive">Ексклюзивний авіатур</option>
                    <option value="package">Авіатур (стандартний)</option>
                  </select>
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

              {formData.tourType === 'package' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-luxury-dark-lighter rounded-lg border border-luxury-gold/20">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Telegram (для пакетних турів)</label>
                    <input
                      type="text"
                      placeholder="@username або t.me/username"
                      value={formData.contactTelegram}
                      onChange={(e) => setFormData({ ...formData, contactTelegram: e.target.value })}
                      className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Instagram (для пакетних турів)</label>
                    <input
                      type="text"
                      placeholder="@username або instagram.com/username"
                      value={formData.contactInstagram}
                      onChange={(e) => setFormData({ ...formData, contactInstagram: e.target.value })}
                      className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Зображення</label>
                {formData.images.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required={index === 0}
                        value={img}
                        onChange={(e) => updateArrayField('images', index, e.target.value.trim())}
                        placeholder="https://... або /uploads/xxxxx.jpg"
                        className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                      />
                      <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer bg-luxury-gold/20 hover:bg-luxury-gold/30 text-luxury-gold px-4 py-2 rounded-lg border border-luxury-gold/30 flex items-center justify-center gap-2">
                          <Upload className="h-4 w-4" />
                          Обрати файл
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], index)}
                          />
                        </label>
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('images', index)}
                            className="px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 border border-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {img && (
                      <div className="mt-1">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg border border-luxury-gold/20"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = ''
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Можна вставити URL або завантажити файл (jpeg/png/webp, до 8MB)</p>
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
            <div className="p-4 border-b border-luxury-gold/20 bg-luxury-dark-lighter">
              <p className="text-sm text-gray-400">💡 Перетягуйте елементи за іконку ≡ щоб змінити порядок відображення на сайті</p>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className="w-full">
                <thead className="bg-luxury-dark-lighter border-b border-luxury-gold/20">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-luxury-gold uppercase w-12"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Тур</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Напрямок</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Ціна</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Дата</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Місця</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-luxury-gold uppercase">Статус</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-luxury-gold uppercase">Дії</th>
                  </tr>
                </thead>
                <SortableContext items={filteredTours.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <tbody className="divide-y divide-luxury-gold/10">
                    {filteredTours.map((tour) => (
                      <SortableTourRow
                        key={tour._id}
                        tour={tour}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        countriesData={countriesData}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  )
}
