import axios from 'axios'

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
