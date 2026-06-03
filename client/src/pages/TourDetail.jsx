import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Users, Clock, Check, X, MapPin, MessageCircle, Instagram } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'

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
    <div className="min-h-screen bg-luxury-dark text-gray-100">
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
      <div className="relative h-[350px] md:h-[550px]">
        <img
          loading="lazy" decoding="async"
          src={tour.images?.[0]}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-luxury-dark/45 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-4xl md:text-5xl">{tour.destination?.flag}</span>
              <span className="text-sm md:text-base bg-luxury-gold/15 backdrop-blur-md border border-luxury-gold/30 text-luxury-gold px-4 py-1 rounded-full font-medium tracking-wide">
                {tour.destination?.nameUk}
              </span>
              {tour.fancyTitle && (
                <span className="text-sm md:text-base bg-white/10 backdrop-blur-md border border-white/25 text-gray-200 px-4 py-1 rounded-full font-medium tracking-wide">
                  {tour.title}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6 leading-tight tracking-wide">
              {tour.fancyTitle || tour.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm md:text-base text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-luxury-gold" />
                <span>Будь-які дати (під запит)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-luxury-gold" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-luxury-gold" />
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
            <div className="bg-luxury-dark-card border border-luxury-gold/15 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold font-serif mb-4 text-white border-b border-luxury-gold/10 pb-4">Про подорож</h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed" style={{ overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                {tour.description}
              </p>
            </div>

            {/* Included/Not Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tour.included && tour.included.length > 0 && (
                <div className="bg-luxury-dark-card border border-luxury-gold/15 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold font-serif mb-4 text-white border-b border-luxury-gold/10 pb-3">Включено в ціну</h3>
                  <ul className="space-y-2.5">
                    {tour.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.notIncluded && tour.notIncluded.length > 0 && (
                <div className="bg-luxury-dark-card border border-luxury-gold/15 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-xl font-bold font-serif mb-4 text-white border-b border-luxury-gold/10 pb-3">Не включено в ціну</h3>
                  <ul className="space-y-2.5">
                    {tour.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary or Contact Buttons */}
            {tour.tourType === 'package' ? (
              <div className="bg-luxury-dark-card border border-luxury-gold/15 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold font-serif mb-6 text-white border-b border-luxury-gold/10 pb-4">Зв'яжіться з нами для деталей</h2>
                <p className="text-gray-300 mb-6 text-base md:text-lg">
                  Цей тур доступний за запитом. Натисніть нижче, щоб зв'язатися з нашим менеджером та дізнатись більше про актуальні дати, ціни та умови.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {tour.contactTelegram && (
                    <a
                      href={tour.contactTelegram.startsWith('http') ? tour.contactTelegram : `https://t.me/${tour.contactTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-base transition shadow-lg"
                      onClick={() => api.trackSocialClick('telegram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
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
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-base transition shadow-lg"
                      onClick={() => api.trackSocialClick('instagram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                    >
                      <Instagram className="h-5 w-5" />
                      Написати в Instagram
                    </a>
                  )}
                  {!tour.contactTelegram && !tour.contactInstagram && (
                    <div className="text-center text-gray-500">
                      <p>Контактні дані будуть додані найближчим часом</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              tour.itinerary && tour.itinerary.length > 0 && (
                <div className="bg-luxury-dark-card border border-luxury-gold/15 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold font-serif mb-6 text-white border-b border-luxury-gold/10 pb-4">Програма туру</h2>
                  <div className="space-y-8">
                    {tour.itinerary.map((day, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-luxury-gold text-luxury-dark rounded-full flex items-center justify-center font-bold">
                          {day.day}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2">{day.title}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{day.description}</p>
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
            <div className={`bg-luxury-dark-card border border-luxury-gold/30 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${showBookingForm ? '' : 'sticky top-24'}`}>
              <div className="text-center mb-6 pb-6 border-b border-luxury-gold/15">
                {tour.originalPrice && tour.originalPrice > tour.price && (
                  <div className="text-lg text-gray-500 line-through mb-1">
                    від €{tour.originalPrice}
                  </div>
                )}
                <div className="text-4xl font-bold font-serif text-luxury-gold mb-2">
                  від €{tour.price}
                </div>
                <p className="text-gray-400 text-sm tracking-wider uppercase">{tour.priceUnit || 'за людину'}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-luxury-gold/10">
                  <span className="text-gray-400 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-luxury-gold" />
                    Дати виїзду
                  </span>
                  <span className="font-medium text-gray-200 text-sm">
                    Будь-які (під запит)
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-luxury-gold/10">
                  <span className="text-gray-400 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-luxury-gold" />
                    Тривалість
                  </span>
                  <span className="font-medium text-gray-200 text-sm">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-luxury-gold/10">
                  <span className="text-gray-400 flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-luxury-gold" />
                    Тип туру
                  </span>
                  <span className="font-medium text-luxury-gold text-sm">
                    {tour.tourBasis || 'Індивідуальний / Груповий'}
                  </span>
                </div>
              </div>

              {(tour.maxParticipants <= 0 || !tour.maxParticipants || tour.availableSpots > 0) ? (
                <button
                  onClick={() => setShowBookingForm(!showBookingForm)}
                  className="w-full bg-luxury-gold text-luxury-dark hover:bg-luxury-gold-light py-4 rounded-xl font-bold text-base hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition duration-300"
                >
                  {showBookingForm ? 'Закрити форму' : 'Забронювати'}
                </button>
              ) : (
                <div className="bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 py-4 rounded-xl text-center font-bold text-base">
                  Немає вільних місць
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4 tracking-wide">
                Зв'яжемося протягом 24 годин
              </p>
            </div>

            {/* Booking Flow */}
            {showBookingForm && (
              <div className="bg-luxury-dark-card border border-luxury-gold/30 rounded-2xl p-6 shadow-2xl mt-6 animate-fade-in">
                <h3 className="text-xl font-bold font-serif mb-3 text-white">Обрати спосіб бронювання</h3>
                <p className="text-gray-400 text-sm mb-6">Напишіть нам у зручному для вас месенджері.</p>
                <div className="flex flex-col gap-3">
                  <a
                    href={tour.contactTelegram ? (tour.contactTelegram.startsWith('http') ? tour.contactTelegram : `https://t.me/${tour.contactTelegram.replace('@', '')}`) : "https://t.me/tripsforukr_bot"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-sm transition shadow-lg"
                    onClick={() => api.trackSocialClick('telegram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Написати в Telegram
                  </a>
                  <a
                    href={tour.contactInstagram ? (tour.contactInstagram.startsWith('http') ? tour.contactInstagram : `https://instagram.com/${tour.contactInstagram.replace('@', '')}`) : "https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition shadow-lg"
                    onClick={() => api.trackSocialClick('instagram', { type: 'Tour', id: tour._id, name: tour.title }).catch(() => { })}
                  >
                    <Instagram className="h-5 w-5" />
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
