import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Users, Clock, Check, X, MapPin, MessageCircle, Instagram } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'
import { trackPixelEvent } from '../utils/metaPixel'

export default function TourDetail() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfPeople: 1,
    notes: '',
    selectedDate: ''
  })

  useEffect(() => {
    fetchTour()
  }, [id])

  // Track view for analytics
  useEffect(() => {
    if (id) {
      api.post('/analytics/view', { itemId: id, itemType: 'Tour' })
        .catch(() => { }) // Silent fail - analytics shouldn't break the page
    }
  }, [id])

  const fetchTour = async () => {
    try {
      const response = await api.get(`/tours/${id}`)
      setTour(response.data)
      setLoading(false)
      if (response.data) {
        trackPixelEvent('ViewContent', {
          content_name: response.data.title,
          content_type: 'product',
          content_ids: [response.data._id || id],
          value: response.data.price,
          currency: 'EUR'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/bookings', {
        ...formData,
        tour: id
      })
      trackPixelEvent('Lead', {
        content_name: tour?.title,
        content_category: 'Tour Booking',
        currency: 'EUR',
        value: tour?.price ? tour.price * (formData.numberOfPeople || 1) : 0
      })
      toast.success('Бронювання успішно створено! Ми зв\'яжемося з вами найближчим часом.')
      setShowBookingForm(false)
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        numberOfPeople: 1,
        notes: ''
      })
      fetchTour() // Refresh tour to update available spots
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка при бронюванні')
    }
  }

  const isValidDate = (date) => {
    if (!date) return false
    try {
      const d = new Date(date)
      return !isNaN(d.getTime()) && d.getFullYear() > 2000
    } catch {
      return false
    }
  }

  const formatDate = (date, formatStr = 'd MMM') => {
    if (!isValidDate(date)) return ''
    try {
      return format(new Date(date), formatStr, { locale: uk })
    } catch (e) {
      console.error('Date formatting error:', e)
      return ''
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження...</div>
  }

  if (!tour) {
    return <div className="min-h-screen flex items-center justify-center">Тур не знайдено</div>
  }

  // Schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": tour.description,
    "touristType": [
      "Audience"
    ],
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": "EUR",
      "availability": tour.availableSpots > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
    },
    "itinerary": tour.itinerary?.map(day => ({
      "@type": "City",
      "name": day.title,
      "description": day.description
    }))
  }

  if (tour.images?.[0]) {
    structuredData.image = tour.images[0]
  }

  if (tour.startDate && tour.endDate) {
    structuredData.startDate = tour.startDate
    structuredData.endDate = tour.endDate
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{tour.title} | Trips for Ukraine</title>
        <meta name="description" content={tour.description?.slice(0, 160) || 'Авторський тур від Trips for Ukraine'} />

        {/* Open Graph */}
        <meta property="og:title" content={tour.title} />
        <meta property="og:description" content={tour.description?.slice(0, 160)} />
        {tour.images?.[0] && <meta property="og:image" content={tour.images[0]} />}
        <meta property="og:type" content="website" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero */}
      {/* Hero */}
      <div className="relative h-[280px] sm:h-[380px] md:h-[500px]">
        <img
          loading="lazy" decoding="async"
          src={tour.images?.[0]}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 pb-6 sm:pb-8 md:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 flex-wrap">
              <span className="text-3xl sm:text-4xl md:text-5xl">{tour.destination?.flag}</span>
              <span className="text-xs sm:text-sm md:text-base bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-0.5 sm:py-1 rounded-full">
                {tour.destination?.nameUk}
              </span>
              {tour.fancyTitle && (
                <span className="text-xs sm:text-sm md:text-base bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-0.5 sm:py-1 rounded-full">
                  {tour.title}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 leading-tight">{tour.fancyTitle || tour.title}</h1>
            <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>
                  {tour.hasFixedDates && isValidDate(tour.startDate)
                    ? `${formatDate(tour.startDate)} - ${formatDate(tour.endDate, 'd MMM yyyy')}`
                    : 'Дати під запит'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>
                  {tour.tourType === 'exclusive' || tour.tourBasis === 'Індивідуальний' || !tour.maxParticipants
                    ? 'Індивідуальний тур'
                    : `${tour.availableSpots} вільних місць`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-6 text-gray-900">Основні моменти</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-600" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Про подорож</h2>
              <p className="text-[15px] sm:text-base md:text-lg text-gray-700 leading-relaxed" style={{ overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {tour.description}
              </p>
            </div>

            {/* Included/Not Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {tour.included && tour.included.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
                  <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Включено в ціну</h3>
                  <ul className="space-y-2">
                    {tour.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.notIncluded && tour.notIncluded.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
                  <h3 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">Не включено в ціну</h3>
                  <ul className="space-y-2">
                    {tour.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary or Contact Buttons */}
            {tour.tourType === 'package' ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-6">Зв'яжіться з нами для деталей</h2>
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
                  Цей тур доступний за запитом. Натисніть нижче, щоб зв'язатися з нашим менеджером та дізнатись більше про актуальні дати, ціни та умови.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {tour.contactTelegram && (
                    <a
                      href={tour.contactTelegram.startsWith('http') ? tour.contactTelegram : `https://t.me/${tour.contactTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-blue-500 text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-blue-600 transition shadow-lg"
                      onClick={() => {
                        trackPixelEvent('Contact', { method: 'Telegram', tour: tour.title })
                        api.trackSocialClick('telegram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })
                      }}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Написати в Telegram
                    </a>
                  )}
                  {tour.contactInstagram && (
                    <a
                      href={tour.contactInstagram.startsWith('http') ? tour.contactInstagram : `https://instagram.com/${tour.contactInstagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
                      onClick={() => {
                        trackPixelEvent('Contact', { method: 'Instagram', tour: tour.title })
                        api.trackSocialClick('instagram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })
                      }}
                    >
                      <Instagram className="h-5 w-5" />
                      Написати в Instagram
                    </a>
                  )}
                  {!tour.contactTelegram && !tour.contactInstagram && (
                    <div className="text-center text-gray-600 text-sm sm:text-base">
                      <p>Контактні дані будуть додані найближчим часом</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              tour.itinerary && tour.itinerary.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-md">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Програма туру</h2>
                  <div className="space-y-4 sm:space-y-6">
                    {tour.itinerary.map((day, index) => (
                      <div key={index} className="flex gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-base">
                          {day.day}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">{day.title}</h4>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl ${showBookingForm ? '' : 'sticky top-24'}`}>
              <div className="text-center mb-6 pb-6 border-b">
                {tour.originalPrice && tour.originalPrice > tour.price && (
                  <div className="text-xl text-gray-400 line-through mb-1">
                    €{tour.originalPrice}
                  </div>
                )}
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-1 sm:mb-2">
                  €{tour.price}
                </div>
                <p className="text-gray-600 text-sm sm:text-base">за людину</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                {/* Date Selection */}
                {tour.hasFixedDates && tour.availableDates && tour.availableDates.filter(isValidDate).length > 1 ? (
                  <div className="py-2.5 sm:py-3 border-b">
                    <span className="text-gray-800 flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm">
                      <Calendar className="h-4 w-4" />
                      Оберіть дату виїзду
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {tour.availableDates
                        .filter(isValidDate)
                        .sort((a, b) => new Date(a) - new Date(b))
                        .map((date, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSelectedDate(date)
                              setFormData(prev => ({ ...prev, selectedDate: date }))
                            }}
                            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${selectedDate === date
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {formatDate(date)}
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2.5 sm:py-3 border-b text-xs sm:text-sm">
                    <span className="text-gray-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Дати туру
                    </span>
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                      {tour.hasFixedDates && isValidDate(tour.availableDates?.[0])
                        ? formatDate(tour.availableDates[0], 'd MMM yyyy')
                        : tour.hasFixedDates && isValidDate(tour.startDate)
                        ? formatDate(tour.startDate, 'd MMM yyyy')
                        : 'Під запит (будь-які дати)'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5 sm:py-3 border-b text-xs sm:text-sm">
                  <span className="text-gray-800 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Тривалість
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 sm:py-3 border-b text-xs sm:text-sm">
                  <span className="text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Вільні місця
                  </span>
                  <span className="font-semibold text-primary-600 text-xs sm:text-sm">
                    {tour.tourType === 'exclusive' || tour.tourBasis === 'Індивідуальний' || !tour.maxParticipants
                      ? 'Під запит'
                      : `${tour.availableSpots} / ${tour.maxParticipants}`}
                  </span>
                </div>
              </div>

              {tour.availableSpots > 0 || tour.tourType === 'exclusive' || tour.tourBasis === 'Індивідуальний' || !tour.maxParticipants ? (
                <button
                  onClick={() => {
                    const willOpen = !showBookingForm
                    setShowBookingForm(willOpen)
                    if (willOpen) {
                      trackPixelEvent('InitiateCheckout', {
                        content_name: tour.title,
                        content_ids: [tour._id || id],
                        content_type: 'product',
                        value: tour.price,
                        currency: 'EUR'
                      })
                    }
                  }}
                  className="w-full bg-primary-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-primary-700 transition"
                >
                  {showBookingForm ? 'Закрити форму' : 'Звʼязатись з менеджером'}
                </button>
              ) : (
                <div className="bg-gray-100 text-gray-600 py-3 sm:py-4 rounded-xl text-center font-semibold text-sm sm:text-base">
                  Немає вільних місць
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4">
                Зв'яжемося протягом 24 годин
              </p>
            </div>

            {/* Booking Flow */}
            {showBookingForm && (
              tour.tourType === 'exclusive' ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mt-4 sm:mt-6">
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900">Обрати спосіб звʼязку</h3>
                  <p className="text-gray-600 text-xs sm:text-base mb-4 sm:mb-6">Напишіть нам у зручному для вас месенджері.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="https://t.me/tripsforukr_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition shadow-lg"
                      onClick={() => {
                        trackPixelEvent('Lead', {
                          content_name: tour.title,
                          content_category: 'Exclusive Tour Booking Bot',
                          currency: 'EUR',
                          value: tour.price || 0
                        })
                        api.trackSocialClick('telegram', { type: 'TourBookingBot', id: tour._id, name: tour.title }).catch(() => { })
                      }}
                    >
                      Написати в Telegram
                    </a>
                    <a
                      href="https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
                      onClick={() => {
                        trackPixelEvent('Contact', { method: 'Instagram', type: 'BookingBot', tour: tour.title })
                        api.trackSocialClick('instagram', { type: 'TourBookingBot', id: tour._id, name: tour.title }).catch(() => { })
                      }}
                    >
                      Написати в Instagram
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-xl mt-6">
                  <h3 className="text-2xl font-bold mb-6">Форма бронювання</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ваше ім'я *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Кількість осіб *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={tour.availableSpots}
                        required
                        value={formData.numberOfPeople}
                        onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Коментар (необов'язково)
                      </label>
                      <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Ціна за особу:</span>
                        <span className="font-semibold">€{tour.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Кількість осіб:</span>
                        <span className="font-semibold">{formData.numberOfPeople}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Загальна сума:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          €{tour.price * formData.numberOfPeople}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                      Підтвердити бронювання
                    </button>
                  </form>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
