import { useEffect, useState } from 'react'
import { Star, Calendar, Compass, Quote, CheckCircle2, X, ChevronRight, MessageCircle } from 'lucide-react'
import api from '../utils/api'

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews')
      setReviews(response.data || [])
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error)
    } finally {
      setLoading(false)
    }
  }

  // If loading and no items yet
  if (loading && reviews.length === 0) {
    return (
      <section className="py-20 bg-luxury-dark relative border-t border-luxury-gold/10" id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block animate-pulse text-luxury-gold text-lg">Завантаження відгуків...</div>
        </div>
      </section>
    )
  }

  // If no reviews exist, don't show an empty awkward section or show a warm invitation
  if (!loading && reviews.length === 0) {
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-luxury-dark via-luxury-dark-lighter/40 to-luxury-dark relative border-t border-luxury-gold/15 overflow-hidden" id="reviews">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-xs uppercase tracking-widest font-semibold mb-4 backdrop-blur-sm shadow-sm">
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

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((review) => {
            const authorInitial = review.authorName?.trim() ? review.authorName.trim()[0].toUpperCase() : 'М'

            return (
              <div
                key={review._id}
                className="bg-gradient-to-b from-luxury-dark-card to-luxury-dark rounded-2xl border border-luxury-gold/20 hover:border-luxury-gold/60 p-6 sm:p-7 shadow-xl hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
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
                      <Compass className="h-3 w-3 flex-shrink-0 text-luxury-gold" />
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
                    <p className="text-gray-200 text-sm sm:text-[15px] leading-relaxed italic whitespace-pre-line font-normal">
                      "{review.text}"
                    </p>
                  </div>

                  {/* Photo Gallery (if client attached photos) */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {review.photos.filter(Boolean).map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(photo)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-luxury-gold/30 hover:border-luxury-gold hover:scale-105 transition group/img shadow-md cursor-pointer"
                        >
                          <img
                            src={photo}
                            alt={`Фото з туру ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs">
                            🔍
                          </div>
                        </button>
                      ))}
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
                      {review.authorCity && (
                        <p className="text-xs text-gray-400">
                          м. {review.authorCity}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-sm">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                    Перевірений
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal for viewing clicked review photo */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-luxury-gold/40 shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 bg-black/70 text-white hover:text-luxury-gold p-2 rounded-full transition"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Фото з туру"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  )
}
