import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Star, ArrowRight, Check, X } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'


export default function Home() {
  const [tours, setTours] = useState([])
  const [aviatury, setAviatury] = useState([])
  const [allTours, setAllTours] = useState([]) // Оригінальний список для max дат
  const [allAviatury, setAllAviatury] = useState([]) // Оригінальний список для max дат
  const [loading, setLoading] = useState(true)
  const [selectedAviatur, setSelectedAviatur] = useState(null)
  const [showAviaturModal, setShowAviaturModal] = useState(false)
  const [showAllAviatury, setShowAllAviatury] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [toursDateFrom, setToursDateFrom] = useState('')
  const [toursDateTo, setToursDateTo] = useState('')
  const [showAllTours, setShowAllTours] = useState(false)

  // Лічильники для показу результатів в реальному часі
  const [filteredToursCount, setFilteredToursCount] = useState(0)
  const [filteredAviaturyCount, setFilteredAviaturyCount] = useState(0)


  // Обчислюємо мінімальну та максимальну дату
  // useMemo для today щоб він був стабільним при рендері, але оновлювався при необхідності
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Обнуляємо час для точного порівняння дат
    return now.toISOString().split('T')[0]
  }, [])

  // useMemo щоб перераховувати тільки коли allAviatury змінюється
  const { minAviaturDate, maxAviaturDate } = useMemo(() => {
    if (allAviatury.length === 0) return { minAviaturDate: '', maxAviaturDate: '' }
    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)

    const futureAviatury = allAviatury.filter(a => {
      if (!a.availableFrom) return false
      const availableDate = new Date(a.availableFrom)
      availableDate.setHours(0, 0, 0, 0)
      return availableDate >= todayDate
    })

    if (futureAviatury.length === 0) return { minAviaturDate: '', maxAviaturDate: '' }

    const dates = futureAviatury
      .map(a => a.availableFrom ? new Date(a.availableFrom) : null)
      .filter(d => d !== null)

    if (dates.length === 0) return { minAviaturDate: '', maxAviaturDate: '' }

    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0]
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0]

    return { minAviaturDate: minDate, maxAviaturDate: maxDate }
  }, [allAviatury, today])

  // useMemo щоб перераховувати тільки коли allTours змінюється
  const { minTourDate, maxTourDate } = useMemo(() => {
    if (allTours.length === 0) return { minTourDate: '', maxTourDate: '' }
    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)

    const futureTours = allTours.filter(t => {
      if (!t.startDate) return false
      const startDate = new Date(t.startDate)
      startDate.setHours(0, 0, 0, 0)
      return startDate >= todayDate
    })

    if (futureTours.length === 0) return { minTourDate: '', maxTourDate: '' }

    const dates = futureTours
      .map(t => t.startDate ? new Date(t.startDate) : null)
      .filter(d => d !== null)

    if (dates.length === 0) return { minTourDate: '', maxTourDate: '' }

    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0]
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0]

    return { minTourDate: minDate, maxTourDate: maxDate }
  }, [allTours, today])



  // Підрахувати результати фільтрації на клієнті (без API запиту)
  const countFilteredResults = (items, dateFrom, dateTo) => {
    if (!dateFrom && !dateTo) return items.length

    return items.filter(item => {
      const itemDate = new Date(item.startDate || item.availableFrom)
      itemDate.setHours(0, 0, 0, 0)

      if (dateFrom && dateTo) {
        const from = new Date(dateFrom)
        const to = new Date(dateTo)
        from.setHours(0, 0, 0, 0)
        to.setHours(0, 0, 0, 0)
        return itemDate >= from && itemDate <= to
      }

      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)
        return itemDate >= from
      }

      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(0, 0, 0, 0)
        return itemDate <= to
      }

      return true
    }).length
  }



  useEffect(() => {
    // Завантажити дані при монтуванні компонента
    fetchData()

    // Автоматично оновлювати дані кожні 30 секунд
    // Це потрібно щоб фільтри синхронізувались зі змінами в адмін-панелі
    const interval = setInterval(() => {
      fetchData()
    }, 30000) // 30 секунд

    // Оновити дані коли користувач повертається на сторінку
    // (наприклад, після зміни туру в адмін-панелі)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Очистити interval та event listener при демонтуванні
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [toursRes, aviaturyRes] = await Promise.all([
        api.get('/tours?status=active'),
        api.get('/aviatury?status=active')
      ])

      const allToursData = toursRes.data
      const allAviaturyData = aviaturyRes.data

      // Зберігаємо оригінальні дані для max дат
      setAllTours(allToursData)
      setAllAviatury(allAviaturyData)

      // Показуємо перші 6 турів
      setTours(allToursData.slice(0, 6))
      setAviatury(allAviaturyData)


      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  // Автоматично підраховувати результати для турів в реальному часі
  useEffect(() => {
    const count = countFilteredResults(allTours, toursDateFrom, toursDateTo)
    setFilteredToursCount(count)
  }, [allTours, toursDateFrom, toursDateTo])

  // Автоматично підраховувати результати для авіатурів в реальному часі
  useEffect(() => {
    const count = countFilteredResults(allAviatury, dateFrom, dateTo)
    setFilteredAviaturyCount(count)
  }, [allAviatury, dateFrom, dateTo])

  const applyAviaturyFilter = async () => {
    try {
      const params = new URLSearchParams()
      params.set('status', 'active')
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await api.get(`/aviatury?${params.toString()}`)
      setAviatury(res.data)
      setShowAllAviatury(true)
    } catch (error) {
      console.error('Error filtering aviatury:', error)
    }
  }

  const applyToursFilter = async () => {
    try {
      const params = new URLSearchParams()
      params.set('status', 'active')
      if (toursDateFrom) params.set('from', toursDateFrom)
      if (toursDateTo) params.set('to', toursDateTo)
      const res = await api.get(`/tours?${params.toString()}`)
      setTours(res.data)
      setShowAllTours(true)
    } catch (error) {
      console.error('Error filtering tours:', error)
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance text-luxury-gold animate-fade-in" style={{ letterSpacing: '0.02em' }}>
              TRIPS<br />FOR UKRAINE
            </h1>
            <p className="text-base md:text-xl mb-8 text-gray-300 max-w-2xl animate-slide-up">
              Унікальний проєкт від нашої команди з добірками ексклюзивних турів та авторських подорожей від провідних туроператорів України в одному місці. Зручно, швидко та вигідно.
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
                Зв'язок з нами
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-luxury-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up delay-100">
              <div className="bg-luxury-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <Calendar className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">130+ турів</h3>
              <p className="text-gray-300">За 5 років організували понад 130 незабутніх подорожей</p>
            </div>
            <div className="text-center animate-fade-in-up delay-200">
              <div className="bg-luxury-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>
                <Users className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">1300+ клієнтів</h3>
              <p className="text-gray-300">Довіра тисяч мандрівників з України</p>
            </div>
            <div className="text-center animate-fade-in-up delay-300">
              <div className="bg-luxury-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>
                <Star className="h-8 w-8 text-luxury-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-luxury-gold">99% задоволених</h3>
              <p className="text-gray-300">1000+ позитивних відгуків від наших клієнтів</p>
            </div>
          </div>
        </div>
      </section>

      {/* Авторські подорожі */}
      <section className="py-20 bg-luxury-dark-lighter" id="tours">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Авторські подорожі</h2>
            <p className="text-xl text-gray-300">Забронюйте своє місце вже зараз</p>
          </div>

          {/* Фільтр за датами */}
          <div className="bg-luxury-dark-card border border-luxury-gold/20 rounded-xl p-4 mb-6">


            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-300 mb-2">З дати</label>
                <input
                  type="date"
                  value={toursDateFrom}
                  onChange={(e) => {
                    const newDateFrom = e.target.value
                    setToursDateFrom(newDateFrom)

                    if (newDateFrom && !toursDateTo) {
                      const from = new Date(newDateFrom)
                      const autoTo = new Date(from.getFullYear(), from.getMonth() + 1, 0)
                      const autoToStr = autoTo.toISOString().split('T')[0]
                      if (!maxTourDate || autoToStr <= maxTourDate) {
                        setToursDateTo(autoToStr)
                      } else if (maxTourDate) {
                        setToursDateTo(maxTourDate)
                      }
                    }

                    if (toursDateTo && newDateFrom > toursDateTo) {
                      setToursDateTo('')
                    }
                  }}
                  min={minTourDate || today}
                  max={maxTourDate}
                  className="w-full px-3 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">До дати</label>
                <input
                  type="date"
                  value={toursDateTo}
                  onChange={(e) => setToursDateTo(e.target.value)}
                  min={toursDateFrom || minTourDate || today}
                  max={maxTourDate}
                  className="w-full px-3 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button onClick={applyToursFilter} className="flex-1 bg-luxury-gold text-luxury-dark px-4 py-2 rounded-lg font-semibold hover:bg-luxury-gold-light transition">Знайти</button>
                <button onClick={() => { setToursDateFrom(''); setToursDateTo(''); fetchData(); setShowAllTours(false); }} className="px-4 py-2 rounded-lg border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 transition">Скинути</button>
              </div>
            </div>

            {(toursDateFrom || toursDateTo) && (
              <p className="text-sm text-gray-400 mt-3">
                Знайдено: <span className="text-luxury-gold font-semibold">{filteredToursCount}</span> {filteredToursCount === 1 ? 'тур' : filteredToursCount < 5 ? 'тури' : 'турів'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAllTours ? tours : tours.slice(0, 6)).map((tour, index) => (
              <Link key={tour._id} to={`/tours/${tour._id}`} className="bg-luxury-dark-card rounded-xl overflow-hidden shadow-lg border border-luxury-gold/20 hover:border-luxury-gold/50 transition group hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative h-64">
                  <img
                    src={tour.images[0]}
                    alt={tour.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-luxury-gold text-luxury-dark px-3 py-1 rounded-full text-sm font-semibold">
                    {tour.duration} днів
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-luxury-gold mr-1" />
                    <span className="text-gray-400 text-sm">{tour.destination?.name}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-luxury-gold transition">{tour.title}</h3>
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
              <Link to="/tours" className="inline-block border-2 border-luxury-gold text-luxury-gold px-8 py-3 rounded-full font-semibold hover:bg-luxury-gold hover:text-luxury-dark transition">
                Всі тури
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Авіатури */}
      <section className="py-20 bg-luxury-dark" id="aviatury">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-gold">Авіатури</h2>
            <p className="text-xl text-gray-300">Найкращі пропозиції для відпочинку</p>
          </div>

          {/* Фільтр за датами */}
          <div className="bg-luxury-dark-card border border-luxury-gold/20 rounded-xl p-4 mb-6">


            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-300 mb-2">З дати</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    const newDateFrom = e.target.value
                    setDateFrom(newDateFrom)

                    if (newDateFrom && !dateTo) {
                      const from = new Date(newDateFrom)
                      const autoTo = new Date(from.getFullYear(), from.getMonth() + 1, 0)
                      const autoToStr = autoTo.toISOString().split('T')[0]
                      if (!maxAviaturDate || autoToStr <= maxAviaturDate) {
                        setDateTo(autoToStr)
                      } else if (maxAviaturDate) {
                        setDateTo(maxAviaturDate)
                      }
                    }

                    if (dateTo && newDateFrom > dateTo) {
                      setDateTo('')
                    }
                  }}
                  min={minAviaturDate || today}
                  max={maxAviaturDate}
                  className="w-full px-3 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">До дати</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || minAviaturDate || today}
                  max={maxAviaturDate}
                  className="w-full px-3 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button onClick={applyAviaturyFilter} className="flex-1 bg-luxury-gold text-luxury-dark px-4 py-2 rounded-lg font-semibold hover:bg-luxury-gold-light transition">Знайти</button>
                <button onClick={() => { setDateFrom(''); setDateTo(''); fetchData(); setShowAllAviatury(false); }} className="px-4 py-2 rounded-lg border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10 transition">Скинути</button>
              </div>
            </div>

            {(dateFrom || dateTo) && (
              <p className="text-sm text-gray-400 mt-3">
                Знайдено: <span className="text-luxury-gold font-semibold">{filteredAviaturyCount}</span> {filteredAviaturyCount === 1 ? 'авіатур' : filteredAviaturyCount < 5 ? 'авіатури' : 'авіатурів'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(showAllAviatury ? aviatury : aviatury.slice(0, 12)).map((aviatur, index) => (
              <button
                key={aviatur._id}
                onClick={() => {
                  setSelectedAviatur(aviatur)
                  setShowAviaturModal(true)
                }}
                className="bg-luxury-dark-card rounded-xl overflow-hidden shadow-lg border border-luxury-gold/20 hover:border-luxury-gold/50 transition group text-left h-full flex flex-col hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
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
                    <div className="text-sm text-gray-400 text-right">
                      {format(new Date(aviatur.availableFrom), 'd MMM', { locale: uk })} — {format(new Date(aviatur.availableTo), 'd MMM', { locale: uk })}
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
                Показати всі авіатури
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
                        <span className="text-gray-400 text-sm block">Дати</span>
                        <span className="text-luxury-gold font-semibold">
                          {format(new Date(selectedAviatur.availableFrom), 'd MMM', { locale: uk })} — {format(new Date(selectedAviatur.availableTo), 'd MMM', { locale: uk })}
                        </span>
                      </div>
                      <div className="bg-luxury-dark px-4 py-2 rounded-lg border border-luxury-gold/30">
                        <span className="text-gray-400 text-sm block">Ціна</span>
                        <span className="text-luxury-gold font-semibold">від €{selectedAviatur.price}</span>
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
