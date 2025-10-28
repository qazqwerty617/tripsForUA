import { X, MapPin, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DestinationModal({ destination, isOpen, onClose }) {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !destination) return null

  const images = destination.gallery && destination.gallery.length > 0 
    ? destination.gallery 
    : [destination.image]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-luxury-dark-card rounded-2xl shadow-2xl m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition backdrop-blur-sm"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Image Gallery */}
        <div className="relative h-[400px] md:h-[500px] bg-black">
          <img
            src={images[currentImage]}
            alt={destination.nameUk}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition backdrop-blur-sm"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition backdrop-blur-sm"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentImage ? 'bg-luxury-gold w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Flag Overlay */}
          <div className="absolute top-4 left-4 text-6xl md:text-7xl drop-shadow-2xl">
            {destination.flag}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-5 w-5 text-luxury-gold" />
              <span className="text-luxury-gold font-medium">{destination.country}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-luxury-gold mb-3">
              {destination.nameUk}
            </h2>
            <p className="text-xl text-gray-300">
              {destination.shortDescription}
            </p>
          </div>

          {/* Description */}
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {destination.description}
            </p>
          </div>

          {/* Continent Badge */}
          {destination.continent && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-luxury-dark-lighter rounded-full">
              <MapPin className="h-4 w-4 text-luxury-gold" />
              <span className="text-gray-300">{destination.continent}</span>
            </div>
          )}

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-luxury-gold mb-4">Галерея</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-video rounded-lg overflow-hidden transition ${
                      idx === currentImage 
                        ? 'ring-2 ring-luxury-gold' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${destination.nameUk} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
