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
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
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
                <MessageCircle className="h-5 w-5 text-primary-400" />
                <a href="https://t.me/tripsforukr_bot" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition">Telegram</a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram className="h-5 w-5 text-primary-400" />
                <a href="https://www.instagram.com/trips_for_ukr/?igsh=dnNucTM2cnd1cmgx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-400 transition">Instagram</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} TripsForUA. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  )
}
