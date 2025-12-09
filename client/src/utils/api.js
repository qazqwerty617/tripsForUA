import axios from 'axios'
import { tours as MOCK_TOURS, destinations as MOCK_DESTINATIONS } from './mockData'

// Use Vite env var if provided (e.g., on Vercel), otherwise fallback to local proxy '/api'
const BASE_URL = import.meta.env.VITE_API_BASE || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      const { state } = JSON.parse(authData)
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Fallback to mock data when backend is unavailable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error?.config || {}
    const method = (cfg.method || 'get').toLowerCase()
    const url = (cfg.url || '')
    const isNetwork = error?.code === 'ERR_NETWORK' || /Network|ECONNREFUSED|Failed to fetch/i.test(error?.message || '')

    if (isNetwork && method === 'get') {
      // /tours and /tours?...
      if (url === '/tours' || url.startsWith('/tours?')) {
        console.warn('[API Fallback] Using mock tours list')
        return Promise.resolve({ data: MOCK_TOURS, status: 200, statusText: 'OK', headers: {}, config: cfg })
      }
      // /tours/:id
      const m = url.match(/^\/tours\/(.+)$/)
      if (m) {
        const id = decodeURIComponent(m[1])
        const item = MOCK_TOURS.find(t => t._id === id) || null
        console.warn('[API Fallback] Using mock tour by id', id)
        return Promise.resolve({ data: item, status: 200, statusText: 'OK', headers: {}, config: cfg })
      }
      // /destinations
      if (url === '/destinations' || url.startsWith('/destinations?')) {
        console.warn('[API Fallback] Using mock destinations list')
        return Promise.resolve({ data: MOCK_DESTINATIONS, status: 200, statusText: 'OK', headers: {}, config: cfg })
      }
    }

    return Promise.reject(error)
  }
)

api.trackView = (itemId, itemType) => {
  return api.post('/analytics/view', { itemId, itemType });
};

api.trackSocialClick = (platform, source = null) => {
  const payload = { itemId: platform, itemType: 'Social' };
  if (source) {
    payload.source = source;
  }
  return api.post('/analytics/view', payload);
};

export default api;
