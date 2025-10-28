import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Star, ArrowRight } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import DestinationModal from '../components/DestinationModal'

export default function Home() {
  const [tours, setTours] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [toursRes, destinationsRes] = await Promise.all([
        api.get('/tours?status=active'),
        api.get('/destinations')
      ])
      console.log('Destinations:', destinationsRes.data)
      setTours(toursRes.data.slice(0, 6))
      // Show up to 8 destinations without relying on `featured` flag
      setDestinations((destinationsRes.data || []).slice(0, 8))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="bg-luxury-dark">
      {/* Hero Section */}
      <section className="relative h-[700px] bg-gradient-to-br from-luxury-dark via-luxury-dark-lighter to-black">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)',
            backgroundBlendMode: 'overlay',
            opacity: 0.2
          }}
        ></div>
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance text-luxury-gold animate-fade-in" style={{letterSpacing: '0.02em'}}>
              TRIPS<br />FOR UKRAINE
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl animate-slide-up">
              Створюємо незабутні враження та допомагаємо відкривати нові горизонти
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#tours" 
                className="bg-luxury-gold text-luxury-dark px-8 py-4 rounded-full font-semibold text-lg hover:bg-luxury-gold-light transition inline-flex items-center justify-center shadow-xl animate-scale-in"
              >
                Переглянути тури
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href="#contact" 
                className="border-2 border-luxury-gold text-luxury-gold px-8 py-4 rounded-full font-semibold text-lg hover:bg-luxury-gold/10 backdrop-blur-sm transition inline-flex items-center justify-center animate-scale-in"
              >
                Зв'язатися з нами
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-luxury-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-luxury-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">130+ турів</h3>
              <p className="text-gray-300">За 5 років організували понад 130 незабутніх подорожей</p>
            </div>
            <div className="text-center">
              <div className="bg-luxury-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">1300+ клієнтів</h3>
              <p className="text-gray-300">Довіра тисяч мандрівників з України</p>
            </div>
            <div className="text-center">
              <div className="bg-luxury-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">99% задоволених</h3>
              <p className="text-gray-300">1000+ позитивних відгуків від наших клієнтів</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-luxury-dark" id="destinations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Популярні напрямки</h2>
            <p className="text-xl text-gray-300">Оберіть свою наступну пригоду</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-300">Завантаження...</div>
          ) : destinations.length === 0 ? (
            <div className="text-center text-gray-300">
              <p className="text-xl mb-4">Немає доступних напрямків</p>
              <p className="text-sm">Будь ласка, запустіть: npm run seed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.map((destination) => (
                <button
                  key={destination._id}
                  onClick={() => {
                    setSelectedDestination(destination)
                    setIsModalOpen(true)
                  }}
                  className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-luxury-gold/20 transition-all duration-300 hover:scale-105 animate-fade-in cursor-pointer"
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={destination.image || (destination.gallery && destination.gallery[0]) || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200'}
                      alt={destination.nameUk}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="text-3xl mb-2">{destination.flag}</div>
                      <h3 className="text-2xl font-bold mb-2 text-luxury-gold">{destination.nameUk}</h3>
                      <p className="text-sm text-gray-300">{destination.shortDescription}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/destinations"
              className="inline-flex items-center text-luxury-gold font-semibold text-lg hover:text-luxury-gold-light transition"
            >
              Дивитися всі напрямки
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Tours */}
      <section className="py-20 bg-luxury-dark-lighter" id="tours">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Найближчі тури</h2>
            <p className="text-xl text-gray-300">Забронюйте своє місце вже зараз</p>
          </div>


          {loading ? (
            <div className="text-center">Завантаження...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <Link
                  key={tour._id}
                  to={`/tours/${tour._id}`}
                  className="bg-luxury-dark-card rounded-xl shadow-xl hover:shadow-luxury-gold/30 transition overflow-hidden group hover:scale-105 animate-fade-in"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={tour.images[0]}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{tour.destination?.flag}</span>
                      <span className="text-sm font-medium text-luxury-gold">
                        {tour.destination?.nameUk}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-luxury-gold group-hover:text-luxury-gold-light transition">
                      {tour.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {tour.shortDescription}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
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
                    <div className="flex items-center justify-between pt-4 border-t border-luxury-gold/20">
                      <span className="text-2xl font-bold text-luxury-gold">
                        €{tour.price}
                      </span>
                      <span className="text-luxury-gold font-semibold group-hover:translate-x-1 transition">
                        Детальніше →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-luxury-dark" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-luxury-gold">Чому обирають нас?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Авторські маршрути</h3>
                    <p className="text-gray-300">
                      Кожен тур розроблений з любов'ю та досвідом наших гідів
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Невеликі групи</h3>
                    <p className="text-gray-300">
                      До 15 чоловік, щоб кожен отримав максимум уваги
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Унікальні локації</h3>
                    <p className="text-gray-300">
                      Не тільки популярні місця, а й приховані перлини
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800"
                alt="About us"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-luxury-dark-lighter via-luxury-dark to-black border-t border-luxury-gold/20 text-white" id="contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Готові до пригод?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Зв'яжіться з нами, і ми допоможемо обрати ідеальну подорож для вас
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/trips_for_ukr"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-luxury-gold text-luxury-dark px-8 py-4 rounded-full font-semibold text-lg hover:bg-luxury-gold-light transition shadow-xl"
            >
              Telegram: @trips_for_ukr
            </a>
            <a
              href="https://www.instagram.com/trips_for_ukr?igsh=dnNucTM2cnd1cmgx"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-luxury-gold text-luxury-gold px-8 py-4 rounded-full font-semibold text-lg hover:bg-luxury-gold/10 backdrop-blur-sm transition"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Destination Modal */}
      <DestinationModal
        destination={selectedDestination}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDestination(null)
        }}
      />
    </div>
  )
}
