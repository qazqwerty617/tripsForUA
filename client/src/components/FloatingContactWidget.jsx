import { useLocation } from 'react-router-dom'
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

  // Don't show in admin area
  const isAdmin = location.pathname.startsWith('/mng-x7k9p2-secure')
  // On tour pages, lift slightly on mobile so it doesn't collide with bottom program banner
  const isTourPage = location.pathname.startsWith('/tours/')

  if (isAdmin) return null

  const handleTelegramClick = () => {
    trackPixelEvent('Contact', {
      method: 'Telegram',
      type: 'FloatingCornerWidget'
    })
    api.trackSocialClick('telegram', {
      type: 'FloatingCornerWidget'
    }).catch(() => {})
  }

  return (
    <div
      className={`fixed z-40 transition-all duration-300 right-4 sm:right-6 ${
        isTourPage ? 'bottom-24 sm:bottom-6' : 'bottom-6'
      }`}
    >
      <a
        href="https://t.me/tripsforukr_bot"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleTelegramClick}
        aria-label="Telegram Bot"
        title="Написати менеджеру в Telegram"
        className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1c1c1f]/95 backdrop-blur-md flex items-center justify-center border border-luxury-gold/45 hover:border-luxury-gold shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_8px_25px_rgba(212,175,55,0.25)] transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#229ED9] flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
          <TelegramIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </a>
    </div>
  )
}

