import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, Users, Clock, Check, X, MapPin, MessageCircle, Instagram, Plus } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  const formatDate = (date, formatStr = 'd MMM') => {
    if (!date) return ''
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
      "availability": (!tour.maxParticipants || tour.availableSpots > 0) ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
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
        <meta name="description" content={tour.description?.slice(0, 160) || 'Екскурсійний тур від Trips for Ukraine'} />

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
      <div className="relative h-[300px] md:h-[500px]">
        <img
          loading="lazy" decoding="async"
          src={tour.images?.[0]}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 transition rounded-full flex items-center justify-center text-white shadow-lg"
          aria-label="Назад"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{tour.destination?.flag}</span>
              <span className="text-xl bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                {tour.destination?.nameUk}
              </span>
              {tour.fancyTitle && (
                <span className="text-xl bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                  {tour.title}
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-4">{tour.fancyTitle || tour.title}</h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Будь-які дати (під запит)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{tour.tourBasis || 'Індивідуальний підбір'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Про подорож</h2>
              <p className="text-lg text-gray-700 leading-relaxed" style={{ overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {tour.description}
              </p>
            </div>

            {/* Included/Not Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tour.included && tour.included.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Включено в ціну</h3>
                  <ul className="space-y-2">
                    {tour.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.notIncluded && tour.notIncluded.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Додаткові послуги та активності</h3>
                  <ul className="space-y-2">
                    {tour.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Plus className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary or Contact Buttons */}
            {tour.tourType === 'package' ? (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h2 className="text-3xl font-bold mb-6">Зв'яжіться з нами для деталей</h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Цей тур доступний за запитом. Натисніть нижче, щоб зв'язатися з нашим менеджером та дізнатись більше про актуальні дати, ціни та умови.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {tour.contactTelegram && (
                    <a
                      href={tour.contactTelegram.startsWith('http') ? tour.contactTelegram : `https://t.me/${tour.contactTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition shadow-lg"
                      onClick={() => api.trackSocialClick('telegram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                    >
                      <MessageCircle className="h-6 w-6" />
                      Написати в Telegram
                    </a>
                  )}
                  {tour.contactInstagram && (
                    <a
                      href={tour.contactInstagram.startsWith('http') ? tour.contactInstagram : `https://instagram.com/${tour.contactInstagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
                      onClick={() => api.trackSocialClick('instagram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                    >
                      <Instagram className="h-6 w-6" />
                      Написати в Instagram
                    </a>
                  )}
                  {!tour.contactTelegram && !tour.contactInstagram && (
                    <div className="text-center text-gray-600">
                      <p>Контактні дані будуть додані найближчим часом</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              tour.itinerary && tour.itinerary.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">Програма туру</h2>
                  <div className="space-y-6">
                    {tour.itinerary.map((day, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                          {day.day}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold mb-2">{day.title}</h4>
                          <p className="text-gray-600">{day.description}</p>
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
            <div className={`bg-white rounded-2xl p-6 shadow-xl ${showBookingForm ? '' : 'sticky top-24'}`}>
              <div className="text-center mb-6 pb-6 border-b">
                {tour.originalPrice > 0 && (
                  <div className="text-xl text-gray-400 line-through mb-1">
                    від €{tour.originalPrice}
                  </div>
                )}
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  від €{tour.price}
                </div>
                <p className="text-gray-600">{tour.priceUnit || 'за людину'}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Дати виїзду
                  </span>
                  <span className="font-semibold text-gray-900">
                    Будь-які (під запит)
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-800 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Тривалість
                  </span>
                  <span className="font-semibold text-gray-900">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Тип туру
                  </span>
                  <span className="font-semibold text-primary-600">
                    {tour.tourBasis || 'Індивідуальний / Груповий'}
                  </span>
                </div>
                {tour.possibleDepartures && (
                  <div className="flex flex-col py-3 border-b">
                    <span className="text-gray-800 flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      Можливі вильоти з:
                    </span>
                    <span className="font-semibold text-gray-900 leading-relaxed text-sm">
                      {tour.possibleDepartures}
                    </span>
                  </div>
                )}
              </div>

              {(tour.maxParticipants <= 0 || !tour.maxParticipants || tour.availableSpots > 0) ? (
                <button
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition"
                >
                  {showBookingForm ? 'Закрити форму' : 'Забронювати'}
                </button>
              ) : (
                <div className="bg-gray-100 text-gray-600 py-4 rounded-xl text-center font-semibold">
                  Немає вільних місць
                </div>
              )}

              <p className="text-sm text-gray-500 text-center mt-4">
                Зв'яжемося протягом 24 годин
              </p>
            </div>

            {/* Booking Flow */}
            {showBookingForm && (
              <div className="bg-white rounded-2xl p-6 shadow-xl mt-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Обрати спосіб бронювання</h3>
                <p className="text-gray-600 mb-6">Напишіть нам у зручному для вас месенджері.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={tour.contactTelegram ? (tour.contactTelegram.startsWith('http') ? tour.contactTelegram : `https://t.me/${tour.contactTelegram.replace('@', '')}`) : "https://t.me/tripsforukr_bot"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition shadow-lg"
                    onClick={() => api.trackSocialClick('telegram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                  >
                    Написати в Telegram
                  </a>
                  <a
                    href={tour.contactInstagram ? (tour.contactInstagram.startsWith('http') ? tour.contactInstagram : `https://instagram.com/${tour.contactInstagram.replace('@', '')}`) : "https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
                    onClick={() => api.trackSocialClick('instagram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                  >
                    Написати в Instagram
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
