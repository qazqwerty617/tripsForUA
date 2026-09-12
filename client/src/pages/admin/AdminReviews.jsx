import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Edit, Trash2, ArrowLeft, Upload, X, Search, Star,
  Calendar, Compass, Eye, EyeOff, CheckCircle2, MessageCircle, Quote
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [availableTours, setAvailableTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const initialFormState = {
    tourTitle: '',
    tourId: '',
    travelDate: '',
    authorName: '',
    authorCity: '',
    authorAvatar: '',
    rating: 5,
    text: '',
    photos: [],
    isPublished: true,
    order: 0
  }

  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    fetchReviews()
    fetchTours()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await api.get('/reviews?all=true')
      setReviews(res.data || [])
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error)
      toast.error('Помилка завантаження відгуків')
    } finally {
      setLoading(false)
    }
  }

  const fetchTours = async () => {
    try {
      const [toursRes, aviaturyRes] = await Promise.all([
        api.get('/tours').catch(() => ({ data: [] })),
        api.get('/aviatury').catch(() => ({ data: [] }))
      ])
      const list = [
        ...(toursRes.data || []).map(t => ({ id: t._id, title: t.title || t.fancyTitle || `${t.city ? t.city + ', ' : ''}${t.country}` })),
        ...(aviaturyRes.data || []).map(a => ({ id: a._id, title: a.title || `${a.name} (${a.country})` }))
      ].filter(t => Boolean(t.title))

      setAvailableTours(list)
    } catch (error) {
      console.error('Помилка завантаження списку турів:', error)
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setEditingReview(null)
  }

  const handleEdit = (review) => {
    setEditingReview(review)
    setFormData({
      tourTitle: review.tourTitle || '',
      tourId: review.tourId || '',
      travelDate: review.travelDate || '',
      authorName: review.authorName || '',
      authorCity: review.authorCity || '',
      authorAvatar: review.authorAvatar || '',
      rating: review.rating ?? 5,
      text: review.text || '',
      photos: Array.isArray(review.photos) ? review.photos : [],
      isPublished: review.isPublished ?? true,
      order: review.order ?? 0
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.tourTitle.trim()) {
      toast.error('Будь ласка, вкажіть назву туру')
      return
    }
    if (!formData.travelDate.trim()) {
      toast.error('Будь ласка, вкажіть дату подорожі')
      return
    }
    if (!formData.authorName.trim()) {
      toast.error('Будь ласка, вкажіть імʼя автора')
      return
    }
    if (!formData.text.trim()) {
      toast.error('Будь ласка, напишіть текст відгуку')
      return
    }

    try {
      const payload = {
        ...formData,
        photos: formData.photos.filter(p => p && p.trim())
      }

      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, payload)
        toast.success('Відгук успішно оновлено')
      } else {
        await api.post('/reviews', payload)
        toast.success('Відгук успішно створено')
      }

      setShowForm(false)
      resetForm()
      fetchReviews()
    } catch (error) {
      console.error('Помилка збереження відгуку:', error)
      toast.error(error.response?.data?.message || 'Помилка збереження')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return

    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Відгук видалено')
      fetchReviews()
    } catch (error) {
      console.error('Помилка видалення:', error)
      toast.error('Помилка видалення відгуку')
    }
  }

  const handleTogglePublish = async (review) => {
    try {
      const newStatus = !review.isPublished
      await api.put(`/reviews/${review._id}`, { isPublished: newStatus })
      toast.success(newStatus ? 'Відгук опубліковано на сайті' : 'Відгук приховано')
      setReviews(reviews.map(r => r._id === review._id ? { ...r, isPublished: newStatus } : r))
    } catch (error) {
      toast.error('Помилка оновлення статусу')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('image', file)

    try {
      setUploadingAvatar(true)
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data.path || res.data.url
      setFormData(prev => ({ ...prev, authorAvatar: url }))
      toast.success('Аватар завантажено')
    } catch (err) {
      toast.error('Помилка завантаження файлу')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('image', file)

    try {
      setUploadingPhoto(true)
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data.path || res.data.url
      setFormData(prev => ({ ...prev, photos: [...prev.photos, url] }))
      toast.success('Фото додано')
    } catch (err) {
      toast.error('Помилка завантаження фото')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== index)
    }))
  }

  const handleTourSelect = (e) => {
    const selectedTitle = e.target.value
    if (!selectedTitle) return
    const matched = availableTours.find(t => t.title === selectedTitle)
    setFormData(prev => ({
      ...prev,
      tourTitle: selectedTitle,
      tourId: matched ? matched.id : ''
    }))
  }

  const filteredReviews = reviews.filter(r => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.tourTitle?.toLowerCase().includes(q) ||
      r.authorName?.toLowerCase().includes(q) ||
      r.authorCity?.toLowerCase().includes(q) ||
      r.travelDate?.toLowerCase().includes(q) ||
      r.text?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-luxury-dark text-gray-100 pb-20">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Керування відгуками - Адмін-панель</title>
      </Helmet>

      {/* Top Header */}
      <div className="bg-luxury-dark-card shadow-xl border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link to="/mng-x7k9p2-secure" className="text-luxury-gold hover:text-luxury-gold-light mb-2 inline-flex items-center text-sm font-medium">
                <ArrowLeft className="h-4 w-4 mr-1" /> До адмін-панелі
              </Link>
              <h1 className="text-3xl font-bold text-luxury-gold flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-luxury-gold" />
                Відгуки мандрівників
              </h1>
            </div>
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false)
                  resetForm()
                } else {
                  resetForm()
                  setShowForm(true)
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-luxury-dark rounded-xl hover:bg-luxury-gold-light transition font-bold shadow-lg shadow-luxury-gold/10"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showForm ? 'Закрити форму' : 'Додати відгук'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ADD / EDIT FORM */}
        {showForm && (
          <div className="bg-luxury-dark-card border border-luxury-gold/30 rounded-2xl p-6 sm:p-8 mb-10 shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2.5 h-7 bg-luxury-gold rounded-full inline-block" />
              {editingReview ? 'Редагувати відгук' : 'Додати новий відгук'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tour Title Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-gray-200">
                      Назва туру <span className="text-luxury-gold">*</span>
                    </label>
                    {availableTours.length > 0 && (
                      <span className="text-xs text-luxury-gold/80">
                        або оберіть зі списку нижче
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.tourTitle}
                    onChange={(e) => setFormData({ ...formData, tourTitle: e.target.value })}
                    placeholder="Наприклад: Магія Норвегії: Фіорди"
                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 rounded-xl text-white focus:outline-none focus:border-luxury-gold transition"
                  />
                  {availableTours.length > 0 && (
                    <select
                      onChange={handleTourSelect}
                      defaultValue=""
                      className="mt-2 w-full px-3 py-2 bg-luxury-dark border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-luxury-gold"
                    >
                      <option value="" disabled>Швидкий вибір з наявних турів...</option>
                      {availableTours.map((t, idx) => (
                        <option key={idx} value={t.title}>{t.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Travel Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1.5">
                    Дата або період подорожі <span className="text-luxury-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    placeholder="Наприклад: Вересень 2024 або 12-19 Серпня"
                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 rounded-xl text-white focus:outline-none focus:border-luxury-gold transition"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['Серпень 2024', 'Вересень 2024', 'Жовтень 2024', 'Літо 2024'].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, travelDate: sug })}
                        className="text-xs bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold px-2.5 py-1 rounded-md border border-luxury-gold/20 transition"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1.5">
                    Імʼя автора / клієнта <span className="text-luxury-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="Наприклад: Олена Ковальчук або Максим та Ірина"
                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 rounded-xl text-white focus:outline-none focus:border-luxury-gold transition"
                  />
                </div>

                {/* Author City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-1.5">
                    Місто мандрівника (необовʼязково)
                  </label>
                  <input
                    type="text"
                    value={formData.authorCity}
                    onChange={(e) => setFormData({ ...formData, authorCity: e.target.value })}
                    placeholder="Наприклад: Київ, Львів, Дніпро"
                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 rounded-xl text-white focus:outline-none focus:border-luxury-gold transition"
                  />
                </div>
              </div>

              {/* Rating selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Оцінка мандрівника (зірочки): <span className="text-luxury-gold font-bold">{formData.rating} / 5</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= formData.rating
                            ? 'text-luxury-gold fill-luxury-gold'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Review */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-1.5">
                  Текст відгуку <span className="text-luxury-gold">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Введіть щирі враження від туру, деталі поїздки, роботу гіда тощо..."
                  className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 rounded-xl text-white focus:outline-none focus:border-luxury-gold transition resize-y"
                />
              </div>

              {/* Photos & Avatar row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Author Avatar */}
                <div className="p-4 rounded-xl bg-luxury-dark border border-luxury-gold/15">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Фото або аватар автора
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.authorAvatar ? (
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-luxury-gold flex-shrink-0">
                        <img src={formData.authorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, authorAvatar: '' })}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex items-center justify-center text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-luxury-dark-lighter border border-dashed border-gray-600 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                        Немає
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={formData.authorAvatar}
                        onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                        placeholder="Вставте URL або завантажте"
                        className="w-full px-3 py-1.5 text-xs bg-luxury-dark-card border border-gray-700 rounded-lg text-white"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-luxury-gold/15 text-luxury-gold hover:bg-luxury-gold/25 rounded-lg text-xs font-semibold cursor-pointer transition">
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingAvatar ? 'Завантаження...' : 'Завантажити фото'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Vacation / Trip Photos */}
                <div className="p-4 rounded-xl bg-luxury-dark border border-luxury-gold/15">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Фотографії з туру (за бажанням)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative w-14 h-14 rounded-lg overflow-hidden border border-luxury-gold/40 flex-shrink-0 group">
                        <img src={photo} alt="Trip" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <label className="w-14 h-14 rounded-lg bg-luxury-dark-lighter border border-dashed border-luxury-gold/40 hover:border-luxury-gold flex flex-col items-center justify-center text-luxury-gold cursor-pointer transition flex-shrink-0">
                      <Plus className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Status & Ordering */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded accent-luxury-gold cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-white">
                    Опублікувати на сайті
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                    className="px-5 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-xl transition font-medium"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light rounded-xl font-bold transition shadow-lg shadow-luxury-gold/10"
                  >
                    {editingReview ? 'Зберегти зміни' : 'Опублікувати відгук'}
                  </button>
                </div>
              </div>

              {/* Live Card Preview Box */}
              <div className="mt-8 pt-6 border-t border-luxury-gold/20">
                <p className="text-xs uppercase tracking-wider text-luxury-gold font-bold mb-3">
                  👁️ Попередній перегляд картки на сайті:
                </p>
                <div className="max-w-md bg-gradient-to-b from-luxury-dark-card to-luxury-dark rounded-2xl border border-luxury-gold/40 p-6 relative overflow-hidden shadow-xl">
                  <Quote className="absolute top-4 right-4 h-14 w-14 text-luxury-gold/[0.05]" />
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 truncate max-w-[220px]">
                      <Compass className="h-3 w-3 text-luxury-gold flex-shrink-0" />
                      <span className="truncate">{formData.tourTitle || 'Назва туру'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-white/5 px-2.5 py-1 rounded-full">
                      <Calendar className="h-3 w-3 text-luxury-gold/80" />
                      <span>{formData.travelDate || 'Дата подорожі'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-3 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (formData.rating || 5)
                            ? 'text-luxury-gold fill-luxury-gold'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-200 text-sm leading-relaxed italic mb-4">
                    "{formData.text || 'Текст вашого відгуку буде відображатися тут...'}"
                  </p>

                  <div className="pt-3 border-t border-luxury-gold/15 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {formData.authorAvatar ? (
                        <img src={formData.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-luxury-gold/40" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-bold text-xs">
                          {formData.authorName ? formData.authorName[0].toUpperCase() : 'А'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{formData.authorName || 'Імʼя автора'}</p>
                        {formData.authorCity && <p className="text-[10px] text-gray-400">м. {formData.authorCity}</p>}
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Перевірений
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Search & Quick Stats Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за туром, автором..."
              className="w-full pl-10 pr-4 py-2 bg-luxury-dark-card border border-luxury-gold/20 rounded-xl text-sm text-white focus:outline-none focus:border-luxury-gold"
            />
          </div>

          <div className="text-sm text-gray-400">
            Всього відгуків: <span className="text-luxury-gold font-bold">{reviews.length}</span> (опубліковано: <span className="text-emerald-400 font-bold">{reviews.filter(r => r.isPublished).length}</span>)
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-20 text-center text-luxury-gold animate-pulse text-lg">
            Завантаження відгуків...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-luxury-dark-card border border-dashed border-gray-700 rounded-2xl p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-medium text-lg mb-1">
              {searchQuery ? 'За вашим запитом нічого не знайдено' : 'Ще немає доданих відгуків'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Натисніть «Додати відгук», щоб створити перший відгук для сайту
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-luxury-dark rounded-xl font-bold hover:bg-luxury-gold-light transition"
            >
              <Plus className="h-5 w-5" /> Створити відгук
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="bg-luxury-dark-card border border-luxury-gold/20 hover:border-luxury-gold/50 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition duration-200 relative group"
              >
                <div>
                  {/* Top Bar: Tour & Date */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 truncate max-w-[200px]">
                      <Compass className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{review.tourTitle}</span>
                    </span>
                    <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 whitespace-nowrap">
                      {review.travelDate}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < (review.rating || 5)
                            ? 'text-luxury-gold fill-luxury-gold'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-luxury-gold font-bold ml-1">
                      {review.rating || 5}/5
                    </span>
                  </div>

                  {/* Text preview */}
                  <p className="text-gray-200 text-sm italic leading-relaxed line-clamp-4 mb-4">
                    "{review.text}"
                  </p>
                </div>

                <div>
                  {/* Author line */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      {review.authorAvatar ? (
                        <img src={review.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-luxury-gold/40" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-bold text-xs">
                          {review.authorName ? review.authorName[0].toUpperCase() : 'А'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{review.authorName}</p>
                        {review.authorCity && <p className="text-[11px] text-gray-400">м. {review.authorCity}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(review)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                        review.isPublished
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
                          : 'bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-900/50'
                      }`}
                      title="Натисніть для зміни статусу"
                    >
                      {review.isPublished ? (
                        <>
                          <Eye className="h-3 w-3" /> Опубліковано
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Приховано
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-luxury-dark hover:bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold rounded-xl text-xs font-semibold transition"
                    >
                      <Edit className="h-3.5 w-3.5" /> Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 bg-luxury-dark hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 rounded-xl transition"
                      title="Видалити відгук"
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
