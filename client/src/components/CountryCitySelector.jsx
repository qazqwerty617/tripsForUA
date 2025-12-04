import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { countriesData } from '../utils/countriesData'

export default function CountryCitySelector({ 
  selectedCountry, 
  selectedCity, 
  onCountryChange, 
  onCityChange,
  required = false 
}) {
  const [countrySearch, setCountrySearch] = useState('')
  const [filteredCountries, setFilteredCountries] = useState(countriesData)
  const [availableCities, setAvailableCities] = useState([])
  const [citySearch, setCitySearch] = useState('')

  // Filter countries based on input
  useEffect(() => {
    const searchLower = (countrySearch || '').toLowerCase()
    const filtered = !searchLower
      ? countriesData
      : countriesData.filter(country => 
          country.nameUk.toLowerCase().includes(searchLower) ||
          country.nameEn.toLowerCase().includes(searchLower)
        )
    setFilteredCountries(filtered)
  }, [countrySearch])

  // Sync countrySearch input with selectedCountry for clarity
  useEffect(() => {
    if (selectedCountry && countrySearch !== selectedCountry) {
      setCountrySearch(selectedCountry)
    }
  }, [selectedCountry])

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      const country = countriesData.find(c => c.nameUk === selectedCountry)
      if (country) {
        const cities = [...(country.cities || [])].sort((a, b) => a.localeCompare(b, 'uk'))
        setAvailableCities(cities)
      } else {
        setAvailableCities([])
      }
    } else {
      setAvailableCities([])
    }
  }, [selectedCountry])

  const handleCountryInput = (e) => {
    const val = e.target.value
    setCountrySearch(val)
  }

  const handleCountrySelect = (e) => {
    const val = e.target.value
    onCountryChange(val)
    if (onCityChange) onCityChange('')
  }

  const handleCityChange = (e) => {
    if (onCityChange) {
      onCityChange(e.target.value)
    }
  }

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Країна {required && '*'}
        </label>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Швидкий пошук країни..."
            value={countrySearch}
            onChange={handleCountryInput}
            className="w-full pl-10 pr-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
          />
        </div>
        <select
          required={required}
          value={selectedCountry}
          onChange={handleCountrySelect}
          className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
        >
          <option value="">Оберіть країну</option>
          {filteredCountries.map((country) => (
            <option key={country.nameUk} value={country.nameUk}>
              {country.flag} {country.nameUk}
            </option>
          ))}
        </select>
        {countrySearch && filteredCountries.length === 0 && (
          <p className="mt-1 text-sm text-gray-400">Країну не знайдено</p>
        )}
      </div>

      {/* City Selection (search + select) */}
      {selectedCountry && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Місто {required && '*'}
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Швидкий пошук міста..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold placeholder-gray-500"
            />
          </div>
          <select
            required={required && !!selectedCountry}
            value={selectedCity || ''}
            onChange={handleCityChange}
            className="w-full px-4 py-2 bg-luxury-dark border border-luxury-gold/30 text-gray-100 rounded-lg focus:ring-2 focus:ring-luxury-gold"
          >
            <option value="">Оберіть місто</option>
            {availableCities
              .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
              .map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
          </select>
        </div>
      )}
    </div>
  )
}
