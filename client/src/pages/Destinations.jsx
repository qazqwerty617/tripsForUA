import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import DestinationModal from '../components/DestinationModal'

export default function Destinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (destination) => {
    setSelectedDestination(destination)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedDestination(null), 300)
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/destinations')
      setDestinations(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-luxury-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-luxury-dark-lighter to-luxury-dark text-white py-20 border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4 text-luxury-gold">Наші напрямки</h1>
          <p className="text-xl text-gray-300">
            Відкрийте для себе найкрасивіші куточки планети
          </p>
        </div>
      </div>


      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">Завантаження...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => (
              <button
                key={destination._id}
                onClick={() => openModal(destination)}
                className="bg-luxury-dark-card rounded-2xl overflow-hidden shadow-xl hover:shadow-luxury-gold/30 transition-all duration-300 group cursor-pointer text-left hover:scale-105 animate-fade-in"
              >
                <div className="aspect-[16/11] overflow-hidden relative">
                  <img
                    src={destination.image}
                    alt={destination.nameUk}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {destination.continent === 'Europe' ? 'Європа' : destination.continent === 'Africa' ? 'Африка' : 'Азія'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-4xl">{destination.flag}</span>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-luxury-gold group-hover:text-luxury-gold-light transition">
                        {destination.nameUk}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">{destination.shortDescription}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {destination.shortDescription}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-primary-600 font-semibold">
                      Детальніше
                    </span>
                    <span className="text-2xl group-hover:translate-x-1 transition">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <DestinationModal
        destination={selectedDestination}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  )
}
