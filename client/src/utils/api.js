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

export default api
