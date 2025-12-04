import { Link } from 'react-router-dom'
import { Plane, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-luxury-dark border-b border-luxury-gold/20 shadow-xl sticky top-0 z-50 backdrop-blur-md bg-luxury-dark/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-luxury-gold hover:text-luxury-gold-light transition" style={{ letterSpacing: '0.05em' }}>
                TRIPS FOR UKRAINE
              </span>
            </Link>
            <div className="flex items-center gap-3 ml-4">
              <a
                href="https://t.me/trips_for_ukr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-luxury-gold transition"
                aria-label="Telegram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/trips_for_ukr?igsh=dnNucTM2cnd1cmgx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-luxury-gold transition"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-luxury-gold transition font-medium">
              Головна
            </Link>
            <Link to="/destinations" className="text-gray-300 hover:text-luxury-gold transition font-medium">
              Напрямки
            </Link>
            <a href="/#tours" className="text-gray-300 hover:text-luxury-gold transition font-medium">
              Календар
            </a>
            <a href="/#about" className="text-gray-300 hover:text-luxury-gold transition font-medium">
              Про нас
            </a>
            <a
              href="#contact"
              className="bg-luxury-gold text-luxury-dark px-6 py-2 rounded-full hover:bg-luxury-gold-light transition shadow-lg font-semibold"
            >
              Зв'язатися
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-luxury-gold"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-luxury-dark-lighter border-t border-luxury-gold/20">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-300 hover:bg-luxury-gold/10 hover:text-luxury-gold rounded"
              onClick={() => setIsOpen(false)}
            >
              Головна
            </Link>
            <Link
              to="/destinations"
              className="block px-3 py-2 text-gray-300 hover:bg-luxury-gold/10 hover:text-luxury-gold rounded"
              onClick={() => setIsOpen(false)}
            >
              Напрямки
            </Link>
            <a
              href="/#tours"
              className="block px-3 py-2 text-gray-300 hover:bg-luxury-gold/10 hover:text-luxury-gold rounded"
              onClick={() => setIsOpen(false)}
            >
              Календар
            </a>
            <a
              href="/#about"
              className="block px-3 py-2 text-gray-300 hover:bg-luxury-gold/10 hover:text-luxury-gold rounded"
              onClick={() => setIsOpen(false)}
            >
              Про нас
            </a>
            <a
              href="#contact"
              className="block px-3 py-2 text-luxury-dark bg-luxury-gold rounded text-center shadow-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Зв'язатися
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
