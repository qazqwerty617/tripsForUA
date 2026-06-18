import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Users, Star, ArrowRight, Check, X, Globe, Calendar, Clock, Plus, Search } from 'lucide-react'
import api from '../utils/api'


export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [tours, setTours] = useState([])
  const [aviatury, setAviatury] = useState([])
  const [allTours, setAllTours] = useState([])
  const [allAviatury, setAllAviatury] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAviatur, setSelectedAviatur] = useState(null)
  const [showAviaturModal, setShowAviaturModal] = useState(false)
  const [showAllAviatury, setShowAllAviatury] = useState(() => searchParams.get('showAllAviatury') === 'true')
  const [resortFilter, setResortFilter] = useState(() => searchParams.get('resortFilter') || 'all')
  const [tourSort, setTourSort] = useState(() => searchParams.get('tourSort') || 'all')
  const [showAllTours, setShowAllTours] = useState(() => searchParams.get('showAllTours') === 'true')
  const [tourSearchQuery, setTourSearchQuery] = useState(() => searchParams.get('tourSearch') || '')
  const [aviaturSearchQuery, setAviaturSearchQuery] = useState(() => searchParams.get('aviaturSearch') || '')

  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      if (resortFilter === 'all') {
        fetchData()
      }
    }, 120000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [resortFilter])

  const fetchData = async () => {
    try {
      const [toursRes, aviaturyRes] = await Promise.all([
        api.get('/tours?status=active'),
        api.get('/aviatury?status=active')
      ])

      setAllTours(toursRes.data)
      setAllAviatury(aviaturyRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  // Зберігати фільтри в URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (showAllTours) params.set('showAllTours', 'true')
    if (resortFilter !== 'all') params.set('resortFilter', resortFilter)
    if (showAllAviatury) params.set('showAllAviatury', 'true')
    if (tourSort !== 'all') params.set('tourSort', tourSort)
    if (tourSearchQuery.trim()) params.set('tourSearch', tourSearchQuery.trim())
    if (aviaturSearchQuery.trim()) params.set('aviaturSearch', aviaturSearchQuery.trim())

    setSearchParams(params, { replace: true })
  }, [showAllTours, resortFilter, showAllAviatury, tourSort, tourSearchQuery, aviaturSearchQuery, setSearchParams])

  const filteredTours = useMemo(() => {
    if (!allTours) return []
    let result = [...allTours]

    if (tourSearchQuery.trim()) {
      const query = tourSearchQuery.toLowerCase().trim()
      result = result.filter(tour => {
        const country = (tour.country || '').toLowerCase()
        const city = (tour.city || '').toLowerCase()
        const title = (tour.title || '').toLowerCase()
        const fancyTitle = (tour.fancyTitle || '').toLowerCase()
        const destinationName = (tour.destination?.name || '').toLowerCase()
        const destinationNameUk = (tour.destination?.nameUk || '').toLowerCase()

        return country.includes(query) ||
               city.includes(query) ||
               title.includes(query) ||
               fancyTitle.includes(query) ||
               destinationName.includes(query) ||
               destinationNameUk.includes(query)
      })
    }

    return result
  }, [allTours, tourSearchQuery])

  // Show tours (all or first 6 when not searching)
  useEffect(() => {
    if (filteredTours.length > 0) {
      if (tourSearchQuery.trim()) {
        setTours(filteredTours)
      } else {
        setTours(showAllTours ? filteredTours : filteredTours.slice(0, 6))
      }
    } else {
      setTours([])
    }
  }, [showAllTours, filteredTours, tourSearchQuery])

  // Filter/sort aviatury
  useEffect(() => {
    if (allAviatury.length > 0) {
      let filtered = [...allAviatury]

      if (aviaturSearchQuery.trim()) {
        const query = aviaturSearchQuery.toLowerCase().trim()
        filtered = filtered.filter(item => {
          const country = (item.country || '').toLowerCase()
          const name = (item.name || '').toLowerCase()
          const title = (item.title || '').toLowerCase()
          const description = (item.description || '').toLowerCase()

          return country.includes(query) ||
                 name.includes(query) ||
                 title.includes(query) ||
                 description.includes(query)
        })
      }

      if (tourSort === 'bestseller') {
        // hot items first, then sort by views or keep order
        filtered = filtered.sort((a, b) => {
          if (a.hot && !b.hot) return -1
          if (!a.hot && b.hot) return 1
          return 0
        })
      } else if (tourSort === 'cheapest') {
        filtered = filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
      }
      setAviatury(filtered)
    } else {
      setAviatury([])
    }
  }, [tourSort, allAviatury, aviaturSearchQuery])

  return (
    <div className="bg-[#0f0f0f]">
      {/* Hero Section */}
      <section className="relative h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-black"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)',
            backgroundBlendMode: 'overlay',
            opacity: 0.15
          }}
        ></div>
        {/* Subtle radial accent behind title */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance text-luxury-gold text-glow animate-fade-in" style={{ letterSpacing: '0.02em' }}>
              TRIPS<br />FOR UKRAINE
            </h1>
            <p className="text-base md:text-xl mb-8 text-gray-400 max-w-2xl animate-fade-in-up">
              Туристичний проєкт, якому довіряють понад 200 тисяч українців. Відправляємо в подорожі з будь-якого міста Європи — обирай свій наступний напрямок нижче!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#tours"
                className="bg-luxury-gold text-luxury-dark px-8 py-4 rounded-full font-semibold text-lg hover:bg-luxury-gold-light hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition inline-flex items-center justify-center shadow-xl animate-scale-in"
              >
                Переглянути тури
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#contact"
                className="glass border border-luxury-gold/40 text-luxury-gold px-8 py-4 rounded-full font-semibold text-lg hover:bg-luxury-gold/10 transition inline-flex items-center justify-center animate-scale-in"
              >
                Зв'язок з нами
              </a>
            </div>
          </div>
        </div>
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#141414]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center glass rounded-2xl p-8 animate-fade-in-up delay-100">
              <div className="bg-luxury-gold/15 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                <Globe className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">55+ напрямків</h3>
              <p className="text-gray-400">Понад 55 напрямків! Готові авіатури з країн Європи</p>
            </div>
            <div className="text-center glass rounded-2xl p-8 animate-fade-in-up delay-200">
              <div className="bg-luxury-gold/15 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <Users className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">15000+ клієнтів</h3>
              <p className="text-gray-400">Довіра — наше все. Більше 6 років на ринку, найбільша аудиторія в Україні</p>
            </div>
            <div className="text-center glass rounded-2xl p-8 animate-fade-in-up delay-300">
              <div className="bg-luxury-gold/15 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                <Star className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">98% позитивних відгуків</h3>
              <p className="text-gray-400">Кожен відгук унікальний, а емоції від туру — незабутні</p>
            </div>
          </div>
        </div>
      </section>

      {/* Екскурсійні тури */}
      <section className="py-20 bg-luxury-dark-lighter" id="tours">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-luxury-gold">Екскурсійні тури</h2>
            <p className="text-base md:text-xl text-gray-400">Авіарейси, трансфер, готель, харчування, вся програма туру</p>
          </div>

          {/* Info block */}
          <div className="glass rounded-2xl px-8 py-6 mb-10">
            <p className="text-gray-300 text-sm md:text-lg leading-relaxed text-center">
              <span className="text-luxury-gold font-semibold">Курортна відпустка нового формату</span>. Поєднання комфортного відпочинку та найяскравіших вражень в одній подорожі. Без груп, фіксованих дат і жорстких графіків. Обирайте програму, напишіть бажані дати та місто вильоту — і отримайте індивідуальну пропозицію саме для вас.
            </p>
          </div>

          {/* Пошук туру */}
          <div className="max-w-2xl mx-auto mb-10 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-luxury-gold" />
              <input
                type="text"
                value={tourSearchQuery}
                onChange={(e) => setTourSearchQuery(e.target.value)}
                placeholder="Куди ви бажаєте поїхати? (країна або курорт...)"
                className="w-full pl-12 pr-12 py-3.5 bg-luxury-dark-card border border-luxury-gold/30 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent placeholder-gray-500 shadow-[0_0_20px_rgba(212,175,55,0.05)] text-base md:text-lg transition duration-300"
              />
              {tourSearchQuery && (
                <button
                  onClick={() => setTourSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition"
                  aria-label="Очистити пошук"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {tours.length === 0 && !loading && (
            <div className="text-center py-16 glass rounded-2xl mb-8 max-w-2xl mx-auto">
              <div className="text-5xl mb-4">{tourSearchQuery ? '🔍' : '✈️'}</div>
              <p className="text-gray-300 text-lg font-medium">
                {tourSearchQuery ? `Нічого не знайдено за запитом "${tourSearchQuery}"` : 'Наразі немає доступних екскурсійних турів'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {tourSearchQuery ? 'Спробуйте змінити запит або перевірити правопис.' : 'Слідкуйте за оновленнями — нові тури з\'являться скоро!'}
              </p>
              {tourSearchQuery && (
                <button
                  onClick={() => setTourSearchQuery('')}
                  className="mt-6 px-6 py-2 border border-luxury-gold/50 text-luxury-gold rounded-full font-semibold hover:bg-luxury-gold/10 transition text-sm"
                >
                  Скинути пошук
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => (
              <Link key={tour._id} to={`/tours/${tour._id}`} className="bg-luxury-dark-card rounded-xl overflow-hidden shadow-lg border border-luxury-gold/20 hover:border-luxury-gold/50 transition group hover-lift">
                <div className="relative h-64">
                  <img
                    src={tour.images[0]}
                    alt={tour.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-luxury-gold text-luxury-dark px-3 py-1 rounded-full text-sm font-semibold">
                    {tour.duration}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-luxury-gold mr-1" />
                    <span className="text-gray-400 text-sm">{tour.fancyTitle ? tour.title : tour.destination?.name}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-luxury-gold transition">{tour.fancyTitle || tour.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{tour.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-luxury-gold">від €{tour.price}</div>
                      {tour.originalPrice && (
                        <div className="text-lg text-gray-500 line-through">від €{tour.originalPrice}</div>
                      )}
                    </div>
                    <span className="text-luxury-gold flex items-center text-sm font-semibold group-hover:translate-x-1 transition">
                      Детальніше <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!showAllTours && !tourSearchQuery.trim() && tours.length >= 6 && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllTours(true)}
                className="inline-block border-2 border-luxury-gold text-luxury-gold px-8 py-3 rounded-full font-semibold hover:bg-luxury-gold hover:text-luxury-dark transition"
              >
                Всі тури
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Авіатури */}
      <section className="py-20 bg-luxury-dark" id="aviatury">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-luxury-gold">Стандартні тури</h2>
            <p className="text-base md:text-xl text-gray-300">Авіарейси, готель, харчування, страхування, путівник, онлайн-підтримка 24/7</p>
          </div>

          {/* Пошук та Фільтри */}
          <div className="bg-luxury-dark-card border border-luxury-gold/20 rounded-xl p-6 mb-8 max-w-4xl mx-auto space-y-4 text-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-luxury-gold" />
              <input
                type="text"
                value={aviaturSearchQuery}
                onChange={(e) => setAviaturSearchQuery(e.target.value)}
                placeholder="Пошук стандартного туру за країною, курортом або назвою..."
                className="w-full pl-12 pr-12 py-3 bg-luxury-dark border border-luxury-gold/30 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent placeholder-gray-500 shadow-md text-base transition duration-300"
              />
              {aviaturSearchQuery && (
                <button
                  onClick={() => setAviaturSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition"
                  aria-label="Очистити пошук"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={() => setTourSort('all')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition ${tourSort === 'all'
                  ? 'bg-luxury-gold text-luxury-dark shadow-md'
                  : 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                  }`}
              >
                Всі пропозиції
              </button>
              <button
                onClick={() => setTourSort('bestseller')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition ${tourSort === 'bestseller'
                  ? 'bg-luxury-gold text-luxury-dark shadow-md'
                  : 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                  }`}
              >
                🔥 Бестселлери
              </button>
              <button
                onClick={() => setTourSort('cheapest')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition ${tourSort === 'cheapest'
                  ? 'bg-luxury-gold text-luxury-dark shadow-md'
                  : 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                  }`}
              >
                💰 Спочатку вигідні
              </button>
            </div>
            {(tourSort !== 'all' || aviaturSearchQuery.trim()) && (
              <p className="text-sm text-gray-400 text-center pt-1">
                Знайдено: <span className="text-luxury-gold font-semibold">{aviatury.length}</span> {aviatury.length === 0 ? 'турів' : aviatury.length === 1 ? 'тур' : aviatury.length < 5 ? 'тури' : 'турів'}
              </p>
            )}
          </div>

          {aviatury.length === 0 && !loading && (
            <div className="text-center py-16 glass rounded-2xl mb-8 max-w-2xl mx-auto">
              <div className="text-5xl mb-4">{aviaturSearchQuery ? '🔍' : '🌴'}</div>
              <p className="text-gray-300 text-lg font-medium">
                {aviaturSearchQuery ? `Нічого не знайдено за запитом "${aviaturSearchQuery}"` : 'Наразі немає доступних стандартних турів'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {aviaturSearchQuery ? 'Спробуйте змінити запит або перевірити правопис.' : 'Нові пропозиції додаються регулярно.'}
              </p>
              {aviaturSearchQuery && (
                <button
                  onClick={() => setAviaturSearchQuery('')}
                  className="mt-6 px-6 py-2 border border-luxury-gold/50 text-luxury-gold rounded-full font-semibold hover:bg-luxury-gold/10 transition text-sm"
                >
                  Скинути пошук
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {((showAllAviatury || aviaturSearchQuery.trim()) ? aviatury : aviatury.slice(0, 12)).map((aviatur, index) => (
              <button
                key={aviatur._id}
                onClick={() => {
                  setSelectedAviatur(aviatur)
                  setShowAviaturModal(true)
                  // Track view for analytics
                  api.post('/analytics/view', { itemId: aviatur._id, itemType: 'Aviatur' })
                    .catch(() => { }) // Silent fail
                }}
                className="bg-luxury-dark-card rounded-xl overflow-hidden shadow-lg border border-luxury-gold/20 hover:border-luxury-gold/50 transition group text-left h-full flex flex-col hover-lift"
              >
                <div className="relative h-48">
                  <img
                    src={aviatur.image}
                    alt={aviatur.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {aviatur.hot && (
                    <div className="absolute top-3 left-3 bg-luxury-dark/30 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg border border-white/20">
                      🔥 Бестселлер
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3 w-3 mr-1 text-luxury-gold" />
                      {aviatur.name && aviatur.name !== aviatur.country ? (
                        <>
                          <span className="text-luxury-gold font-bold">{aviatur.name}</span>
                          <span className="text-gray-400 ml-1">, {aviatur.country}</span>
                        </>
                      ) : (
                        <span className="text-luxury-gold">{aviatur.country}</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {aviatur.nights} ночей
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white group-hover:text-luxury-gold transition line-clamp-2">{aviatur.title}</h3>
                  <div className="mt-auto pt-3 border-t border-gray-700 flex items-center justify-between gap-4">
                    <div className="text-xl font-bold text-luxury-gold shrink-0">
                      від €{aviatur.price}
                    </div>
                    <div className="text-sm">
                      {aviatur.isResort ? (
                        <span className="text-luxury-gold">🏛️ Екскурсійний</span>
                      ) : (
                        <span className="text-gray-400">✈️ Стандартний</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!showAllAviatury && !aviaturSearchQuery.trim() && aviatury.length > 12 && (
            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllAviatury(true)}
                className="inline-block border-2 border-luxury-gold text-luxury-gold px-8 py-3 rounded-full font-semibold hover:bg-luxury-gold hover:text-luxury-dark transition"
              >
                Показати всі тури
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-luxury-dark" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-luxury-gold">Чому обирають нас?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Екскурсійні маршрути</h3>
                    <p className="text-gray-300">
                      Кожен тур розроблений досвідченими гідами
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Всі екскурсійні тури в одному місці</h3>
                    <p className="text-gray-300">
                      Обирай тільки найкраще
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
                      9-15 чоловік, щоб кожен почувався комфортно
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Зручний формат відпочинку</h3>
                    <p className="text-gray-300">
                      Встигни побачити ВСЕ з максимальним комфортом
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800"
                alt="About us"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-luxury-dark-lighter via-luxury-dark to-black border-t border-luxury-gold/20 text-white" id="contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-luxury-gold">Готові до пригод?</h2>
          <p className="text-base md:text-xl mb-8 text-gray-300">
            Звʼяжіться з нами у зручному месенджері та отримайте індивідуальну пропозицію!
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



      {/* Aviatur Modal */}
      {
        showAviaturModal && selectedAviatur && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50" onClick={() => setShowAviaturModal(false)}>
            <div className="min-h-full" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowAviaturModal(false)}
                  className="absolute top-4 right-4 z-20 bg-black/40 p-2 rounded-full text-white hover:bg-black/60 transition"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Hero - dark with photo */}
                <div className="relative h-[300px] md:h-[440px]">
                  <img
                    src={selectedAviatur.image}
                    alt={selectedAviatur.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 pb-8 px-8 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-base bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                        {selectedAviatur.country}
                      </span>
                      {selectedAviatur.name && selectedAviatur.name !== selectedAviatur.country && (
                        <span className="text-base bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full">
                          {selectedAviatur.name}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">{selectedAviatur.title}</h2>
                    <div className="flex flex-wrap gap-5 text-base">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Будь-які дати (під запит)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedAviatur.nights} ночей</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Стандартний тур</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left content */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Description */}
                      <div className="bg-white rounded-2xl p-7 shadow-md">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Про подорож</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedAviatur.description}</p>
                      </div>

                      {/* Included / Not included */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {selectedAviatur.included && selectedAviatur.included.length > 0 && (
                          <div className="bg-white rounded-2xl p-6 shadow-md">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Включено в ціну</h3>
                            <ul className="space-y-2">
                              {selectedAviatur.included.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedAviatur.notIncluded && selectedAviatur.notIncluded.length > 0 && (
                          <div className="bg-white rounded-2xl p-6 shadow-md">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Додаткові послуги та активності</h3>
                            <ul className="space-y-2">
                              {selectedAviatur.notIncluded.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Plus className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-4">
                        <div className="text-center mb-6 pb-6 border-b">
                          {selectedAviatur.originalPrice > 0 && (
                            <div className="text-xl text-gray-400 line-through mb-1">
                              від €{selectedAviatur.originalPrice}
                            </div>
                          )}
                          <div className="text-4xl font-bold text-primary-600 mb-2">
                            від €{selectedAviatur.price}
                          </div>
                          <p className="text-gray-600">за людину</p>
                        </div>

                        <div className="space-y-0 mb-6">
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-gray-800 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Дати виїзду
                            </span>
                            <span className="font-semibold text-gray-900 text-sm">Будь-які (під запит)</span>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-gray-800 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Тривалість
                            </span>
                            <span className="font-semibold text-gray-900">{selectedAviatur.nights} ночей</span>
                          </div>
                          <div className="flex items-center justify-between py-3 border-b">
                            <span className="text-gray-800 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Тип туру
                            </span>
                            <span className="font-semibold text-primary-600 text-sm">
                              Стандартний
                            </span>
                          </div>
                          {selectedAviatur.possibleDepartures && (
                            <div className="flex flex-col py-3 border-b">
                              <span className="text-gray-800 flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4" />
                                Можливі вильоти з:
                              </span>
                              <span className="font-semibold text-gray-900 leading-relaxed text-sm italic">
                                {selectedAviatur.possibleDepartures}
                              </span>
                            </div>
                          )}
                        </div>

                        <a
                          href="https://t.me/tripsforukr_bot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block text-center bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition mb-3"
                        >
                          Забронювати
                        </a>
                        <a
                          href="https://www.instagram.com/trips_for_ukr?igsh=dnNucTM2cnd1cmgx"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                        >
                          Instagram
                        </a>

                        <p className="text-sm text-gray-500 text-center mt-4">
                          Зв'яжемося протягом 24 годин
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )
      }
    </div >
  )
}
