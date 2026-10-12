import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { X, Instagram } from 'lucide-react'
import api from '../utils/api'
import { trackPixelEvent } from '../utils/metaPixel'

// Official Telegram Icon
function TelegramIcon({ className = 'w-5 h-5 text-white' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

export default function FloatingContactWidget() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef(null)

  // Don't show in admin area
  const isAdmin = location.pathname.startsWith('/mng-x7k9p2-secure')
  // On tour pages, lift slightly on mobile so it doesn't collide with bottom program banner
  const isTourPage = location.pathname.startsWith('/tours/')

  // Auto-open greeting popover after 3 seconds on first visit
  useEffect(() => {
    if (isAdmin) return
    const dismissed = sessionStorage.getItem('contact_widget_dismissed')
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAdmin])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  if (isAdmin) return null

  const handleDismiss = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    sessionStorage.setItem('contact_widget_dismissed', 'true')
  }

  const handleTelegramClick = () => {
    trackPixelEvent('Contact', {
      method: 'Telegram',
      type: 'FloatingCornerWidget'
    })
    api.trackSocialClick('telegram', {
      type: 'FloatingCornerWidget'
    }).catch(() => {})
  }

  const handleInstagramClick = () => {
    trackPixelEvent('Contact', {
      method: 'Instagram',
      type: 'FloatingCornerWidget'
    })
    api.trackSocialClick('instagram', {
      type: 'FloatingCornerWidget'
    }).catch(() => {})
  }

  return (
    <div
      ref={widgetRef}
      className={`fixed z-40 transition-all duration-300 right-4 sm:right-6 ${
        isTourPage ? 'bottom-24 sm:bottom-6' : 'bottom-6'
      }`}
    >
      {/* Popover Menu (in Luxury Dark style matching the website) */}
      {isOpen && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 mb-2 w-64 sm:w-72 bg-luxury-dark/95 backdrop-blur-xl text-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] border border-luxury-gold/30 p-3.5 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-luxury-gold/15">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-luxury-gold tracking-wide uppercase">
                Звʼязок з нами
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-luxury-gold hover:bg-white/5 rounded-full transition"
              aria-label="Закрити"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {/* Telegram Bot */}
            <a
              href="https://t.me/tripsforukr_bot"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTelegramClick}
              className="group flex items-center gap-3 p-2.5 rounded-xl bg-luxury-dark-card/90 hover:bg-[#2c2c2c] border border-luxury-gold/15 hover:border-luxury-gold/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <TelegramIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Telegram Bot</span>
                  <span className="text-[10px] bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 font-semibold px-1.5 py-0.2 rounded-full">
                    Онлайн
                  </span>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  Швидка консультація
                </div>
              </div>
            </a>

            {/* Instagram Direct */}
            <a
              href="https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInstagramClick}
              className="group flex items-center gap-3 p-2.5 rounded-xl bg-luxury-dark-card/90 hover:bg-[#2c2c2c] border border-luxury-gold/15 hover:border-pink-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/20 group-hover:scale-105 transition text-white">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">
                  Instagram Direct
                </div>
                <div className="text-xs text-gray-400 truncate">
                  @trips_for_ukr
                </div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Звʼязатися з нами"
        className="relative group w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#1c1c1f]/95 backdrop-blur-md flex items-center justify-center border border-luxury-gold/40 hover:border-luxury-gold shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.2)] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        {/* Icon toggle */}
        {isOpen ? (
          <X className="w-5 h-5 text-luxury-gold transition-transform duration-200 rotate-90" />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#229ED9] flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
            <TelegramIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
          </div>
        )}
      </button>
    </div>
  )
}
