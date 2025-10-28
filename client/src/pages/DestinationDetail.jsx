import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Users, ArrowRight } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

export default function DestinationDetail() {
  const { slug } = useParams()
  const [destination, setDestination] = useState(null)
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [slug])

  const fetchData = async () => {
    try {
      const [destRes, toursRes] = await Promise.all([
        api.get(`/destinations/${slug}`),
        api.get('/tours?status=active')
      ])
      setDestination(destRes.data)
      
      // Filter tours for this destination
      const destinationTours = toursRes.data.filter(
        tour => tour.destination.slug === slug
      )
      setTours(destinationTours)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Завантаження...</div>
  }

  if (!destination) {
    return <div className="min-h-screen flex items-center justify-center">Напрямок не знайдено</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[500px]">
        <img
          src={destination.image}
          alt={destination.nameUk}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{destination.flag}</span>
              <div>
                <h1 className="text-5xl font-bold mb-2">{destination.nameUk}</h1>
                <p className="text-xl text-gray-200">{destination.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        <div className="bg-white rounded-2xl p-8 mb-12 shadow-md">
          <h2 className="text-3xl font-bold mb-4">Про {destination.nameUk}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {destination.description}
          </p>
        </div>

        {/* Gallery */}
        {destination.gallery && destination.gallery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Фотогалерея</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {destination.gallery.map((image, index) => (
                <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden">
                  <img
                    src={image}
                    alt={`${destination.nameUk} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tours */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            Доступні тури {tours.length > 0 && `(${tours.length})`}
          </h2>
          {tours.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-md">
              <p className="text-xl text-gray-600 mb-4">
                На даний момент немає доступних турів до цього напрямку
              </p>
              <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                Переглянути всі тури
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <Link
                  key={tour._id}
                  to={`/tours/${tour._id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition">
                      {tour.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {tour.shortDescription}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(tour.startDate), 'd MMM', { locale: uk })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{tour.availableSpots} місць</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-2xl font-bold text-primary-600">
                        €{tour.price}
                      </span>
                      <span className="text-primary-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Детальніше
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
