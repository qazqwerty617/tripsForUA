import { useEffect, useState, useRef, useMemo } from 'react'
import {
  Star, Calendar, Compass, Quote, ChevronLeft, ChevronRight,
  X, MessageCircle, CheckCircle2, ZoomIn
} from 'lucide-react'
import api from '../utils/api'

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await api.get('/reviews')
      setReviews(response.data || [])
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error)
    } finally {
      setLoading(false)
    }
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage])

  // If there are few reviews (e.g. 3), repeat them so the carousel is always smoothly scrollable and looping
  const displayReviews = useMemo(() => {
    if (reviews.length === 0) return []
    if (reviews.length <= 4) {
      return [...reviews, ...reviews, ...reviews]
    }
    return reviews
  }, [reviews])

  const handleNext = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const card = container.querySelector('.review-card')
    const step = card ? card.offsetWidth + 24 : 400

    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 30) {
      container.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: step, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const card = container.querySelector('.review-card')
    const step = card ? card.offsetWidth + 24 : 400

    if (container.scrollLeft <= 30) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: -step, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current || reviews.length === 0) return
    const container = scrollContainerRef.current
    const card = container.querySelector('.review-card')
    if (!card) return
    const cardWidth = card.offsetWidth + 24
    const newIdx = Math.round(container.scrollLeft / cardWidth) % reviews.length
    setActiveIndex(newIdx)
  }

  const scrollToIndex = (idx) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const card = container.querySelector('.review-card')
    if (!card) return
    const cardWidth = card.offsetWidth + 24
    container.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
  }

  if (loading && reviews.length === 0) {
    return (
      <section className="py-20 bg-luxury-dark relative border-t border-luxury-gold/15" id="reviews">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block animate-pulse text-luxury-gold font-medium">Завантаження відгуків...</div>
        </div>
      </section>
    )
  }

  if (!loading && reviews.length === 0) {
    return null
  }

  return (
    <section
      className="py-24 bg-gradient-to-b from-luxury-dark via-luxury-dark-lighter/40 to-luxury-dark relative border-t border-luxury-gold/15 overflow-hidden select-none"
      id="reviews"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-xs uppercase tracking-widest font-semibold mb-3 backdrop-blur-sm shadow-sm">
            <MessageCircle className="h-3.5 w-3.5 text-luxury-gold" />
            Враження та досвід
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Що кажуть наші <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-amber-300">мандрівники</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
            Реальні емоції, яскраві спогади та чесні відгуки людей, які вже довірили нам свої найкращі подорожі
          </p>
        </div>

        {/* Carousel Container with Side Floating Arrows */}
        <div className="relative group/carousel">
          {/* Floating Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Попередній відгук"
            className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-luxury-dark/95 border-2 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-dark shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer backdrop-blur-md opacity-90 hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Floating Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Наступний відгук"
            className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-luxury-dark/95 border-2 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-dark shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 cursor-pointer backdrop-blur-md opacity-90 hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayReviews.map((review, idx) => {
              const authorInitial = review.authorName?.trim() ? review.authorName.trim()[0].toUpperCase() : 'М'

              return (
                <div
                  key={`${review._id}-${idx}`}
                  className="review-card snap-start flex-shrink-0 w-[88vw] sm:w-[380px] md:w-[420px] lg:w-[calc(33.333%-16px)] flex flex-col justify-between"
                >
                  <div className="h-full bg-gradient-to-b from-luxury-dark-card to-luxury-dark rounded-2xl border border-luxury-gold/20 hover:border-luxury-gold/60 p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                    {/* Top Glowing Accent Line on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Decorative Faint Quote Watermark */}
                    <Quote className="absolute top-4 right-4 h-16 w-16 text-luxury-gold/[0.04] pointer-events-none transition-transform duration-300 group-hover:scale-110" />

                    <div>
                      {/* Top Bar: Tour Name & Travel Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-white/5">
                        <span
                          title={review.tourTitle}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 max-w-[200px] sm:max-w-[220px] truncate"
                        >
                          <Compass className="h-3.5 w-3.5 flex-shrink-0 text-luxury-gold" />
                          <span className="truncate">{review.tourTitle}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                          <Calendar className="h-3 w-3 text-luxury-gold/80 flex-shrink-0" />
                          <span>{review.travelDate}</span>
                        </span>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mt-4 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (review.rating || 5)
                                ? 'text-luxury-gold fill-luxury-gold'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-luxury-gold ml-1.5">
                          {(review.rating || 5).toFixed(1)}
                        </span>
                      </div>

                      {/* Review Text */}
                      <div className="relative mb-5">
                        <p className="text-gray-200 text-sm sm:text-[15px] leading-relaxed italic whitespace-pre-line font-normal line-clamp-6 group-hover:line-clamp-none transition-all">
                          "{review.text}"
                        </p>
                      </div>

                      {/* Attached Tour Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="mb-5">
                          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                            Фото з подорожі:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {review.photos.filter(Boolean).map((photo, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setSelectedImage(photo)}
                                className="relative w-16 h-16 rounded-xl overflow-hidden border border-luxury-gold/30 hover:border-luxury-gold hover:scale-105 transition group/img shadow-md cursor-pointer"
                                title="Натисніть для збільшення"
                              >
                                <img
                                  src={photo}
                                  alt={`Фото з туру ${pIdx + 1}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white">
                                  <ZoomIn className="h-4 w-4 text-luxury-gold" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Author Info Card Footer */}
                    <div className="pt-4 mt-2 border-t border-luxury-gold/15 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {review.authorAvatar ? (
                          <img
                            src={review.authorAvatar}
                            alt={review.authorName}
                            className="w-10 h-10 rounded-full object-cover border border-luxury-gold/40 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-luxury-gold/30 via-luxury-gold/15 to-transparent border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-bold text-sm shadow-sm">
                            {authorInitial}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-luxury-gold transition-colors">
                            {review.authorName}
                          </h4>
                          {review.authorCity ? (
                            <p className="text-xs text-gray-400">м. {review.authorCity}</p>
                          ) : (
                            <p className="text-xs text-gray-500">Мандрівник</p>
                          )}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span>Перевірено</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Carousel Bottom Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/5">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-9 bg-luxury-gold shadow-lg shadow-luxury-gold/30'
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Перейти до відгуку ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-10 w-10 h-10 rounded-full bg-luxury-dark/80 hover:bg-luxury-gold text-white hover:text-black border border-luxury-gold/40 flex items-center justify-center transition-all shadow-xl cursor-pointer"
              aria-label="Закрити фото"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Збільшене фото з туру"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-luxury-gold/30 shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  )
}
