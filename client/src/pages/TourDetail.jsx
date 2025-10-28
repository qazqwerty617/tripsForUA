import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Users, Clock, Check, X, MapPin } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function TourDetail() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfPeople: 1,
    notes: ''
  })

  useEffect(() => {
    fetchTour()
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження...</div>
  }

  if (!tour) {
    return <div className="min-h-screen flex items-center justify-center">Тур не знайдено</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[500px]">
        <img
          src={tour.images[0]}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{tour.destination?.flag}</span>
              <span className="text-xl bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                {tour.destination?.nameUk}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{tour.title}</h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {format(new Date(tour.startDate), 'd MMM', { locale: uk })} - {format(new Date(tour.endDate), 'd MMM yyyy', { locale: uk })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{tour.availableSpots} вільних місць</span>
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
              <h2 className="text-3xl font-bold mb-4">Про тур</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {tour.description}
              </p>
            </div>

            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h2 className="text-3xl font-bold mb-6">Основні моменти</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                        <Check className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included/Not Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tour.included && tour.included.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-green-600">Включено в ціну</h3>
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
                  <h3 className="text-xl font-bold mb-4 text-red-600">Не включено в ціну</h3>
                  <ul className="space-y-2">
                    {tour.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <h2 className="text-3xl font-bold mb-6">Програма туру</h2>
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
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-24">
              <div className="text-center mb-6 pb-6 border-b">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  €{tour.price}
                </div>
                <p className="text-gray-600">за людину</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Початок
                  </span>
                  <span className="font-semibold">
                    {format(new Date(tour.startDate), 'd MMM yyyy', { locale: uk })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Тривалість
                  </span>
                  <span className="font-semibold">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Вільні місця
                  </span>
                  <span className="font-semibold text-primary-600">
                    {tour.availableSpots} / {tour.maxParticipants}
                  </span>
                </div>
              </div>

              {tour.availableSpots > 0 ? (
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

            {/* Booking Form */}
            {showBookingForm && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
