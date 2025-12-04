import { Plane, Instagram, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Plane className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">TripsForUA</span>
            </div>
            <p className="text-gray-400 mb-4">
              Авторські тури по найкрасивішим місцям світу.
              Створюємо незабутні подорожі з 2020 року.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Швидкі посилання</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-400 transition">
                  Головна
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-gray-400 hover:text-primary-400 transition">
                  Напрямки
                </Link>
              </li>
              <li>
                <a href="/#tours" className="text-gray-400 hover:text-primary-400 transition">
                  Календар турів
                </a>
              </li>
              <li>
                <a href="/#about" className="text-gray-400 hover:text-primary-400 transition">
                  Про нас
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакти</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
                <a href="https://t.me/tripsforukr_bot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition">Telegram</a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram className="h-5 w-5 text-primary-400" />
                <a href="https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition">Instagram</a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  )
}
