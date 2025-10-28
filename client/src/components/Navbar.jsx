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
              <Link to="/" className="text-2xl font-bold text-luxury-gold hover:text-luxury-gold-light transition" style={{letterSpacing: '0.05em'}}>
                TRIPS FOR UKRAINE
              </Link>
            </Link>
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
