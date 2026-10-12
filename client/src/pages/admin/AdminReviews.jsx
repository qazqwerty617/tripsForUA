import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Edit, Trash2, ArrowLeft, Upload, X, Search, Star,
  Calendar, Compass, Eye, EyeOff, CheckCircle2, MessageCircle,
  Quote, ChevronUp, ChevronDown, Image as ImageIcon, Loader2
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
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photoUrlInput, setPhotoUrlInput] = useState('')

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
        ...(toursRes.data || []).map(t => ({
          id: t._id,
          title: t.title || t.fancyTitle || `${t.city ? t.city + ', ' : ''}${t.country}`
        })),
        ...(aviaturyRes.data || []).map(a => ({
          id: a._id,
          title: a.title || `${a.name} (${a.country})`
        }))
      ].filter(t => Boolean(t.title))

      setAvailableTours(list)
    } catch (error) {
      console.error('Помилка завантаження списку турів:', error)
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setEditingReview(null)
    setPhotoUrlInput('')
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
      rating: review.rating || 5,
      text: review.text || '',
      photos: review.photos || [],
      isPublished: review.isPublished !== false,
      order: review.order || 0
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      return
    }

    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Відгук успішно видалено')
      setReviews(prev => prev.filter(r => r._id !== id))
    } catch (error) {
      console.error('Помилка видалення відгуку:', error)
      if (error.response?.status === 401) {
        toast.error('Сесія закінчилася. Будь ласка, увійдіть в адмінку знову')
        localStorage.removeItem('auth-storage')
        setTimeout(() => { window.location.href = '/mng-x7k9p2-secure/login' }, 1200)
        return
      }
      toast.error('Помилка видалення відгуку')
    }
  }

  const handleTogglePublish = async (review) => {
    try {
      const newStatus = !review.isPublished
      await api.put(`/reviews/${review._id}`, { isPublished: newStatus })
      toast.success(newStatus ? 'Відгук опубліковано' : 'Відгук приховано')
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, isPublished: newStatus } : r))
    } catch (error) {
      console.error('Помилка оновлення статусу:', error)
      if (error.response?.status === 401) {
        toast.error('Сесія закінчилася. Будь ласка, увійдіть в адмінку знову')
        localStorage.removeItem('auth-storage')
        setTimeout(() => { window.location.href = '/mng-x7k9p2-secure/login' }, 1200)
        return
      }
      toast.error('Помилка зміни статусу')
    }
  }

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= reviews.length) return

    const newReviews = [...reviews]
    const temp = newReviews[index]
    newReviews[index] = newReviews[targetIndex]
    newReviews[targetIndex] = temp

    setReviews(newReviews)

    try {
      await api.put('/reviews/reorder', {
        orderedIds: newReviews.map(r => r._id)
      })
      toast.success('Порядок оновлено')
    } catch (error) {
      console.error('Помилка збереження порядку:', error)
      toast.error('Помилка збереження порядку')
      fetchReviews()
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
      const url = res.data.url || res.data.imageUrl
      setFormData(prev => ({ ...prev, authorAvatar: url }))
      toast.success('Аватарку завантажено')
    } catch (error) {
      console.error('Помилка завантаження фото:', error)
      toast.error('Помилка завантаження файлу')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      setUploadingPhotos(true)
      const uploadedUrls = []

      for (const file of files) {
        const uploadData = new FormData()
        uploadData.append('image', file)
        const res = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const url = res.data.url || res.data.imageUrl
        if (url) uploadedUrls.push(url)
      }

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls]
      }))
      toast.success(`Завантажено фото: ${uploadedUrls.length}`)
    } catch (error) {
      console.error('Помилка завантаження фотографій:', error)
      toast.error('Помилка завантаження частини файлів')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleAddPhotoByUrl = () => {
    if (!photoUrlInput.trim()) return
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, photoUrlInput.trim()]
    }))
    setPhotoUrlInput('')
    toast.success('Фото додано')
  }

  const handleRemovePhoto = (photoIndex) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== photoIndex)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.tourTitle.trim()) {
      toast.error('Вкажіть назву туру')
      return
    }
    if (!formData.travelDate.trim()) {
      toast.error('Вкажіть дату подорожі')
      return
    }
    if (!formData.authorName.trim()) {
      toast.error('Вкажіть імʼя автора')
      return
    }
    if (!formData.text.trim()) {
      toast.error('Введіть текст відгуку')
      return
    }

    const payload = {
      tourTitle: formData.tourTitle.trim(),
      travelDate: formData.travelDate.trim(),
      authorName: formData.authorName.trim(),
      authorCity: formData.authorCity.trim(),
      authorAvatar: formData.authorAvatar.trim(),
      rating: Number(formData.rating) || 5,
      text: formData.text.trim(),
      photos: (formData.photos || []).filter(Boolean),
      isPublished: Boolean(formData.isPublished),
      order: Number(formData.order) || 0
    }
    if (formData.tourId && typeof formData.tourId === 'string' && formData.tourId.length === 24) {
      payload.tourId = formData.tourId
    }

    try {
      if (editingReview) {
        const res = await api.put(`/reviews/${editingReview._id}`, payload)
        toast.success('Відгук успішно оновлено')
        setReviews(prev => prev.map(r => r._id === editingReview._id ? res.data : r))
      } else {
        const res = await api.post('/reviews', payload)
        toast.success('Відгук успішно створено')
        setReviews(prev => [res.data, ...prev])
      }

      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Помилка збереження відгуку:', error)
      if (error.response?.status === 401) {
        toast.error('Сесія закінчилася. Будь ласка, увійдіть в адмінку знову')
        localStorage.removeItem('auth-storage')
        setTimeout(() => {
          window.location.href = '/mng-x7k9p2-secure/login'
        }, 1200)
        return
      }
      const msg = error.response?.data?.message || 'Помилка збереження'
      toast.error(msg)
    }
  }

  const filteredReviews = reviews.filter(r => {
    const q = searchQuery.toLowerCase()
    return (
      (r.authorName && r.authorName.toLowerCase().includes(q)) ||
      (r.tourTitle && r.tourTitle.toLowerCase().includes(q)) ||
      (r.authorCity && r.authorCity.toLowerCase().includes(q)) ||
      (r.text && r.text.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-luxury-dark text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Керування відгуками | Адмін-панель</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Top Navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link
              to="/mng-x7k9p2-secure"
              className="inline-flex items-center text-luxury-gold hover:text-luxury-gold-light mb-2 transition font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              До панелі керування
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Відгуки мандрівників</h1>
                <p className="text-gray-400 text-sm">
                  Додавайте реальні відгуки туристів, фото з поїздок та керуйте їх показом у каруселі на сайті
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm()
                setShowForm(false)
              } else {
                resetForm()
                setShowForm(true)
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark transition shadow-lg hover:shadow-luxury-gold/20"
          >
            {showForm ? (
              <>
                <X className="h-5 w-5" /> Закрити форму
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" /> Додати відгук
              </>
            )}
          </button>
        </div>

        {/* Form Modal / Drawer */}
        {showForm && (
          <div className="bg-luxury-dark-card rounded-2xl border border-luxury-gold/30 p-6 sm:p-8 shadow-2xl mb-10 relative overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-luxury-gold/20">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-luxury-gold" />
                {editingReview ? 'Редагування відгуку' : 'Новий відгук мандрівника'}
              </h2>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(false)
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tour Selection / Title & Travel Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1.5">
                    Назва туру <span className="text-red-400">*</span>
                  </label>
                  {availableTours.length > 0 && (
                    <div className="mb-2">
                      <select
                        value={formData.tourTitle}
                        onChange={(e) => {
                          const val = e.target.value
                          const matched = availableTours.find(t => t.title === val)
                          setFormData(prev => ({
                            ...prev,
                            tourTitle: val,
                            tourId: matched ? matched.id : prev.tourId
                          }))
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-sm text-gray-300 focus:border-luxury-gold focus:outline-none transition mb-1"
                      >
                        <option value="">-- Вибрати з існуючих турів або ввести нижче --</option>
                        {availableTours.map((tour, idx) => (
                          <option key={idx} value={tour.title}>
                            {tour.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="наприклад, Мадейра: Острів вічної весни"
                    value={formData.tourTitle}
                    onChange={(e) => setFormData({ ...formData, tourTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1.5">
                    Дата подорожі <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="наприклад, Вересень 2024 або 15-22.08.2024"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition"
                  />
                  <div className="flex gap-2 mt-2">
                    {['Вересень 2024', 'Серпень 2024', 'Липень 2024', 'Травень 2024'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setFormData({ ...formData, travelDate: sample })}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-luxury-gold/20 text-gray-300 hover:text-luxury-gold border border-white/5 transition"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author Name, City, Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1.5">
                    Ім'я автора / мандрівника <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="наприклад, Анастасія Коваленко"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1.5">
                    Місто автора (опціонально)
                  </label>
                  <input
                    type="text"
                    placeholder="наприклад, Київ"
                    value={formData.authorCity}
                    onChange={(e) => setFormData({ ...formData, authorCity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1.5">
                    Оцінка (зірочки)
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: starVal })}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            starVal <= (formData.rating || 5)
                              ? 'text-luxury-gold fill-luxury-gold'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-luxury-gold text-base">
                      {formData.rating || 5} / 5
                    </span>
                  </div>
                </div>
              </div>

              {/* Author Avatar Upload / URL */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Аватарка автора (фото обличчя)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {formData.authorAvatar ? (
                    <div className="relative">
                      <img
                        src={formData.authorAvatar}
                        alt="avatar preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-luxury-gold shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, authorAvatar: '' })}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow"
                        title="Видалити аватарку"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-bold text-lg">
                      {formData.authorName?.trim() ? formData.authorName.trim()[0].toUpperCase() : 'М'}
                    </div>
                  )}

                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-luxury-dark border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold text-xs font-semibold transition">
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Завантаження...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> Завантажити файл
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>

                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Або вставте посилання на фото (URL)"
                      value={formData.authorAvatar}
                      onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-xs text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Текст відгуку <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Опишіть враження мандрівника від туру, організації, локацій, емоцій..."
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition resize-y leading-relaxed"
                />
              </div>

              {/* Attached Photos of the Trip */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">
                  Фотографії з подорожі (відображатимуться в каруселі з можливістю збільшення)
                </label>

                {/* Photos previews list */}
                {formData.photos.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {formData.photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        className="relative group w-20 h-20 rounded-xl overflow-hidden border border-luxury-gold/40 shadow-lg"
                      >
                        <img
                          src={photo}
                          alt={`Uploaded ${pIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(pIdx)}
                          className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                          title="Видалити це фото"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-luxury-dark border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold text-xs font-semibold transition">
                    {uploadingPhotos ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Завантаження фото...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" /> Завантажити фото з пристрою
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotosUpload}
                      disabled={uploadingPhotos}
                    />
                  </label>

                  <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                    <input
                      type="text"
                      placeholder="Або додати фото за посиланням (URL)..."
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddPhotoByUrl()
                        }
                      }}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-luxury-dark border border-luxury-gold/20 text-xs text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoByUrl}
                      className="px-4 py-2.5 rounded-xl bg-luxury-gold/15 hover:bg-luxury-gold/30 text-luxury-gold border border-luxury-gold/30 text-xs font-semibold transition"
                    >
                      Додати URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Toggle & Submit */}
              <div className="pt-4 border-t border-luxury-gold/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded text-luxury-gold focus:ring-luxury-gold bg-luxury-dark border-luxury-gold/40"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">Опублікувати на сайті</span>
                    <p className="text-xs text-gray-400">Якщо вимкнено — відгук буде збережено у чернетках</p>
                  </div>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setShowForm(false)
                    }}
                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 text-sm font-medium transition"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-luxury-gold hover:bg-luxury-gold-light text-luxury-dark font-bold text-sm transition shadow-lg hover:shadow-luxury-gold/20"
                  >
                    {editingReview ? 'Зберегти зміни' : 'Опублікувати відгук'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Пошук за автором, туром або містом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-luxury-dark-card border border-luxury-gold/20 text-white placeholder-gray-500 focus:border-luxury-gold focus:outline-none text-sm transition"
            />
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>Всього відгуків: <strong className="text-luxury-gold">{reviews.length}</strong></span>
            <span>•</span>
            <span>Опубліковано: <strong className="text-emerald-400">{reviews.filter(r => r.isPublished).length}</strong></span>
          </div>
        </div>

        {/* Reviews Cards List */}
        {loading ? (
          <div className="py-20 text-center text-luxury-gold animate-pulse text-lg">
            Завантаження списку відгуків...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center bg-luxury-dark-card rounded-2xl border border-luxury-gold/15 p-8">
            <MessageCircle className="h-12 w-12 text-luxury-gold/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Відгуків поки що немає</h3>
            <p className="text-gray-400 text-sm mb-5">
              Створіть перший відгук, щоб туристи бачили враження на сайті
            </p>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light transition"
            >
              <Plus className="h-4 w-4" /> Додати перший відгук
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review, index) => (
              <div
                key={review._id}
                className="bg-luxury-dark-card rounded-2xl border border-luxury-gold/20 hover:border-luxury-gold/50 p-5 sm:p-6 shadow-xl transition flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top order and status controls */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 font-mono">#{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-luxury-gold disabled:opacity-20 transition"
                        title="Підняти вгору"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 1)}
                        disabled={index === reviews.length - 1}
                        className="p-1 text-gray-400 hover:text-luxury-gold disabled:opacity-20 transition"
                        title="Опустити вниз"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(review)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                        review.isPublished
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50'
                          : 'bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-900/50'
                      }`}
                      title="Натисніть для зміни статусу публікації"
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

                  {/* Tour title & Travel date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-luxury-gold bg-luxury-gold/10 px-2.5 py-0.5 rounded-full border border-luxury-gold/20 truncate max-w-[200px]">
                      <Compass className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{review.tourTitle}</span>
                    </span>
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                      {review.travelDate}
                    </span>
                  </div>

                  {/* Rating Stars */}
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
                  <p className="text-gray-300 text-sm italic leading-relaxed line-clamp-4 mb-4">
                    "{review.text}"
                  </p>

                  {/* Photos preview in card */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                      {review.photos.map((p, pIdx) => (
                        <img
                          key={pIdx}
                          src={p}
                          alt="thumb"
                          className="w-10 h-10 rounded-lg object-cover border border-luxury-gold/30 flex-shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {/* Author line */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      {review.authorAvatar ? (
                        <img
                          src={review.authorAvatar}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border border-luxury-gold/40"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-bold text-xs">
                          {review.authorName ? review.authorName[0].toUpperCase() : 'М'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{review.authorName}</p>
                        {review.authorCity && <p className="text-[11px] text-gray-400">м. {review.authorCity}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-luxury-dark hover:bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold rounded-xl text-xs font-semibold transition"
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
