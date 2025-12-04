import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, User } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings')
      setBookings(response.data)
      setLoading(false)
    } catch (error) {
      toast.error('Помилка завантаження')
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status })
      toast.success('Статус оновлено')
      fetchBookings()
    } catch (error) {
      toast.error('Помилка оновлення')
    }
  }

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await api.put(`/bookings/${id}`, { paymentStatus })
      toast.success('Статус оплати оновлено')
      fetchBookings()
    } catch (error) {
      toast.error('Помилка оновлення')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Підтверджено'
      case 'pending':
        return 'Очікує'
      case 'cancelled':
        return 'Скасовано'
      case 'completed':
        return 'Завершено'
      default:
        return status
    }
  }

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Оплачено'
      case 'partial':
        return 'Частково'
      case 'pending':
        return 'Не оплачено'
      default:
        return status
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Бронювання</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">Завантаження...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">Немає бронювань</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tour Info */}
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-bold mb-2">Інформація про тур</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{booking.tour?.destination?.flag}</span>
                          <span className="font-medium">{booking.tour?.destination?.nameUk}</span>
                        </div>
                        <p className="font-medium text-gray-900">{booking.tour?.title}</p>
                        <p className="text-gray-600">
                          {booking.tour?.startDate && format(new Date(booking.tour.startDate), 'd MMM yyyy', { locale: uk })}
                        </p>
                        <p className="text-gray-600">Тривалість: {booking.tour?.duration}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-bold mb-2">Інформація про клієнта</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${booking.customerEmail}`} className="text-primary-600 hover:underline">
                            {booking.customerEmail}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${booking.customerPhone}`} className="text-primary-600 hover:underline">
                            {booking.customerPhone}
                          </a>
                        </div>
                        {booking.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500 mb-1">Коментар:</p>
                            <p className="text-gray-700">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Details & Actions */}
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-bold mb-2">Деталі бронювання</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Кількість осіб:</span>
                          <span className="font-semibold">{booking.numberOfPeople}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Загальна сума:</span>
                          <span className="font-bold text-lg text-primary-600">€{booking.totalPrice}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Статус:</span>
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(booking.status)}`}
                          >
                            <option value="pending">Очікує</option>
                            <option value="confirmed">Підтверджено</option>
                            <option value="cancelled">Скасовано</option>
                            <option value="completed">Завершено</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Оплата:</span>
                          <select
                            value={booking.paymentStatus}
                            onChange={(e) => updatePaymentStatus(booking._id, e.target.value)}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}
                          >
                            <option value="pending">Не оплачено</option>
                            <option value="partial">Частково</option>
                            <option value="paid">Оплачено</option>
                          </select>
                        </div>
                        <div className="pt-3 border-t text-xs text-gray-500">
                          Створено: {format(new Date(booking.createdAt), 'd MMM yyyy, HH:mm', { locale: uk })}
                        </div>
                      </div>
                    </div>
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
