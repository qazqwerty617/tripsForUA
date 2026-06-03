import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Users, Star, ArrowRight, Check, X, Globe } from 'lucide-react'
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
  const [showAllTours, setShowAllTours] = useState(() => searchParams.get('showAllTours') === 'true')

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

    setSearchParams(params, { replace: true })
  }, [showAllTours, resortFilter, showAllAviatury, setSearchParams])

  // Show tours (all or first 6)
  useEffect(() => {
    if (allTours.length > 0) {
      setTours(showAllTours ? allTours : allTours.slice(0, 6))
    } else {
      setTours([])
    }
  }, [showAllTours, allTours])

  // Filter aviatury by resort type
  useEffect(() => {
    if (allAviatury.length > 0) {
      let filtered = allAviatury
      if (resortFilter === 'resort') {
        filtered = allAviatury.filter(item => item.isResort === true)
      } else if (resortFilter === 'non-resort') {
        filtered = allAviatury.filter(item => item.isResort !== true)
      }
      setAviatury(filtered)
    } else {
      setAviatury([])
    }
  }, [resortFilter, allAviatury])

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
              Унікальний проєкт від нашої команди з добірками ексклюзивних та екскурсійних турів від провідних туроператорів України в одному місці. Зручно, швидко та вигідно.
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
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">30+ напрямків</h3>
              <p className="text-gray-400">Понад 30 ексклюзивних напрямків: від Мадагаскару до Японії</p>
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
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Екскурсійні тури</h2>
            <p className="text-xl text-gray-400">Обирай подорож мрії — під будь-які зручні дати</p>
          </div>

          {tours.length === 0 && !loading && (
            <div className="text-center py-16 glass rounded-2xl mb-8">
              <div className="text-5xl mb-4">✈️</div>
              <p className="text-gray-400 text-lg">Наразі немає доступних екскурсійних турів</p>
              <p className="text-gray-500 text-sm mt-2">Слідкуйте за оновленнями — нові тури з'являться скоро!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAllTours ? tours : tours.slice(0, 6)).map((tour, index) => (
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
                      <div className="text-2xl font-bold text-luxury-gold">€{tour.price}</div>
                      {tour.originalPrice && (
                        <div className="text-lg text-gray-500 line-through">€{tour.originalPrice}</div>
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

          {!showAllTours && tours.length >= 6 && (
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
            <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Індивідуальні тури</h2>
            <p className="text-xl text-gray-300">Подорожуй комфортно, вигідно та без зайвих витрат</p>
          </div>

          {/* Фільтр за типом */}
          <div className="bg-luxury-dark-card border border-luxury-gold/20 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setResortFilter('all')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${resortFilter === 'all'
                  ? 'bg-luxury-gold text-luxury-dark'
                  : 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                  }`}
              >
                Всі тури
              </button>
              <button
                onClick={() => setResortFilter('resort')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${resortFilter === 'resort'
                  ? 'bg-luxury-gold text-luxury-dark'
                  : 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                  }`}
              >
                🏛️ Екскурсійні
              </button>
              <button
                onClick={() => setResortFilter('non-resort')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${resortFilter === 'non-resort'
                  ? 'bg-luxury-gold text-luxury-dark'
                  : 'border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
                  }`}
              >
                ✈️ Стандартні
              </button>
            </div>
            {resortFilter !== 'all' && (
              <p className="text-sm text-gray-400 mt-3 text-center">
                Знайдено: <span className="text-luxury-gold font-semibold">{aviatury.length}</span> {aviatury.length === 0 ? 'турів' : aviatury.length === 1 ? 'тур' : aviatury.length < 5 ? 'тури' : 'турів'}
              </p>
            )}
          </div>

          {aviatury.length === 0 && !loading && (
            <div className="text-center py-16 glass rounded-2xl mb-8">
              <div className="text-5xl mb-4">🌴</div>
              <p className="text-gray-400 text-lg">Наразі немає доступних індивідуальних турів</p>
              <p className="text-gray-500 text-sm mt-2">Нові пропозиції додаються регулярно</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(showAllAviatury ? aviatury : aviatury.slice(0, 12)).map((aviatur, index) => (
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
                      🔥 Гарячий тур
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

          {!showAllAviatury && aviatury.length > 12 && (
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
              <h2 className="text-4xl font-bold mb-6 text-luxury-gold">Чому обирають нас?</h2>
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
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Всі туроператори в одному місці</h3>
                    <p className="text-gray-300">
                      Фільтруй всі тури за ціною та датами
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
                    <h3 className="text-xl font-semibold mb-2 text-gray-100">Унікальні локації</h3>
                    <p className="text-gray-300">
                      Ви побачите місця, що недоступні більшості туристів
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
          <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Готові до пригод?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Звʼяжіться з нами у зручному месенджері та отримайте ідеальну пропозицію
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
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm" onClick={() => setShowAviaturModal(false)}>
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-luxury-dark-card w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-luxury-gold/20 relative animate-scale-in" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setShowAviaturModal(false)}
                  className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-luxury-gold hover:text-luxury-dark transition"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-full relative">
                    <img
                      src={selectedAviatur.image}
                      alt={selectedAviatur.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <div className="flex items-center text-luxury-gold mb-2">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="text-lg">
                          {selectedAviatur.name && selectedAviatur.name !== selectedAviatur.country ? (
                            <>
                              <span className="text-gray-400 mr-2">{selectedAviatur.country},</span>
                              <span className="text-luxury-gold font-bold">{selectedAviatur.name}</span>
                            </>
                          ) : (
                            <span className="text-luxury-gold font-semibold">{selectedAviatur.country}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">{selectedAviatur.title}</h2>

                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="bg-luxury-dark px-4 py-2 rounded-lg border border-luxury-gold/30">
                        <span className="text-gray-400 text-sm block">Тривалість</span>
                        <span className="text-luxury-gold font-semibold">{selectedAviatur.nights} ночей</span>
                      </div>
                      <div className="bg-luxury-dark px-4 py-2 rounded-lg border border-luxury-gold/30">
                        <span className="text-gray-400 text-sm block">Ціна</span>
                        <span className="text-luxury-gold font-semibold">від €{selectedAviatur.price}</span>
                      </div>
                      <div className="bg-luxury-dark px-4 py-2 rounded-lg border border-luxury-gold/30">
                        <span className="text-gray-400 text-sm block">Категорія</span>
                        <span className="text-luxury-gold font-semibold">
                          {selectedAviatur.isResort ? '🏛️ Екскурсійний' : '✈️ Стандартний'}
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-8">
                      <h3 className="text-luxury-gold text-xl font-semibold mb-3">Про тур</h3>
                      <p className="text-gray-300 whitespace-pre-line">{selectedAviatur.description}</p>

                      <h3 className="text-luxury-gold text-xl font-semibold mt-6 mb-3">Що включено</h3>
                      <ul className="space-y-2">
                        {selectedAviatur.included.map((item, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <h3 className="text-luxury-gold text-xl font-semibold mt-6 mb-3">Не включено</h3>
                      <ul className="space-y-2">
                        {selectedAviatur.notIncluded.map((item, index) => (
                          <li key={index} className="flex items-start text-gray-300">
                            <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href="https://t.me/tripsforukr_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-luxury-gold text-luxury-dark py-4 rounded-xl font-bold text-lg hover:bg-luxury-gold-light transition flex items-center justify-center shadow-lg hover:shadow-luxury-gold/20"
                      >
                        Забронювати в Telegram
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </a>
                      <a
                        href="https://www.instagram.com/trips_for_ukr?igsh=dnNucTM2cnd1cmgx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 border-2 border-luxury-gold text-luxury-gold py-4 rounded-xl font-bold text-lg hover:bg-luxury-gold/10 transition flex items-center justify-center"
                      >
                        Instagram
                      </a>
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
