import { useState, useEffect, useRef } from 'react'
import { Search, MapPin } from 'lucide-react'
import { countriesData } from '../utils/countriesData'

export default function CountryCitySelector({ 
  selectedCountry, 
  selectedCity, 
  onCountryChange, 
  onCityChange,
  required = false 
}) {
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false)
  const [countrySuggestions, setCountrySuggestions] = useState([])

  const [citySearch, setCitySearch] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState([])

  // Refs to close on click outside
  const countryRef = useRef(null)
  const cityRef = useRef(null)

  useEffect(() => {
    setCountrySearch(selectedCountry || '')
  }, [selectedCountry])

  useEffect(() => {
    setCitySearch(selectedCity || '')
  }, [selectedCity])

  // Filter countries
  useEffect(() => {
    if (!countrySearch.trim()) {
      setCountrySuggestions(countriesData.slice(0, 10)) // show top 10 initially
      return
    }
    const query = countrySearch.toLowerCase()
    const filtered = countriesData.filter(c => 
      c.nameUk.toLowerCase().includes(query) ||
      c.nameEn.toLowerCase().includes(query)
    ).slice(0, 10)
    setCountrySuggestions(filtered)
  }, [countrySearch])

  // Filter cities based on selected country
  useEffect(() => {
    if (!selectedCountry) {
      setCitySuggestions([])
      return
    }
    const countryObj = countriesData.find(c => c.nameUk === selectedCountry)
    if (!countryObj || !countryObj.cities) {
      setCitySuggestions([])
      return
    }

    const allCities = countryObj.cities.sort((a, b) => a.localeCompare(b, 'uk'))
    if (!citySearch.trim()) {
      setCitySuggestions(allCities)
      return
    }
    const query = citySearch.toLowerCase()
    const filtered = allCities.filter(city => 
      city.toLowerCase().includes(query)
    )
    setCitySuggestions(filtered)
  }, [selectedCountry, citySearch])

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setShowCountrySuggestions(false)
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCitySuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selectCountry = (country) => {
    onCountryChange(country.nameUk)
    setCountrySearch(country.nameUk)
    setShowCountrySuggestions(false)
    if (onCityChange) onCityChange('')
  }

  const selectCityObj = (city) => {
    if (onCityChange) onCityChange(city)
    setCitySearch(city)
    setShowCitySuggestions(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Country Input */}
      <div ref={countryRef} className="relative">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Країна {required && '*'}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gold" />
          <input
            type="text"
            required={required}
            placeholder="Введіть країну (напр. Греція)..."
            value={countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value)
              setShowCountrySuggestions(true)
            }}
            onFocus={() => setShowCountrySuggestions(true)}
            className="w-full pl-10 pr-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500 transition-all duration-200"
          />
        </div>
        
        {showCountrySuggestions && countrySuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-luxury-dark border border-luxury-gold/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto divide-y divide-luxury-gold/10 backdrop-blur-md">
            {countrySuggestions.map((c) => (
              <button
                key={c.nameUk}
                type="button"
                onClick={() => selectCountry(c)}
                className="w-full px-4 py-3 text-left hover:bg-luxury-gold/10 text-gray-100 flex items-center justify-between transition-colors duration-150"
              >
                <span className="font-medium text-sm text-gray-200">{c.nameUk}</span>
                <span className="text-xl">{c.flag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City Input */}
      <div ref={cityRef} className="relative">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Місто {required && '*'}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gold" />
          <input
            type="text"
            required={required && !!selectedCountry}
            disabled={!selectedCountry}
            placeholder={selectedCountry ? "Введіть місто (напр. Афіни)..." : "Спершу оберіть країну"}
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value)
              setShowCitySuggestions(true)
            }}
            onBlur={(e) => {
              // Save custom-typed city even if not selected from dropdown
              if (e.target.value && onCityChange) {
                onCityChange(e.target.value)
              }
              setTimeout(() => setShowCitySuggestions(false), 150)
            }}
            onFocus={() => {
              if (selectedCountry) setShowCitySuggestions(true)
            }}
            className="w-full pl-10 pr-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>

        {showCitySuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-luxury-dark border border-luxury-gold/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto divide-y divide-luxury-gold/10 backdrop-blur-md">
            {citySuggestions.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => selectCityObj(city)}
                className="w-full px-4 py-3 text-left hover:bg-luxury-gold/10 text-gray-100 flex items-center justify-between transition-colors duration-150"
              >
                <span className="text-sm text-gray-200">{city}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
