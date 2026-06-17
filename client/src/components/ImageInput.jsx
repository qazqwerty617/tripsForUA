import { useState, useRef } from 'react'
import { Upload, Link, X, Image } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

/**
 * ImageInput — universal image field component
 * Supports:
 *  - File upload (any format → converted to JPEG on server)
 *  - URL import (Google, Pinterest, Unsplash, etc. → downloaded & converted on server)
 *  - Manual URL paste (external URLs stored as-is)
 *  - Image preview
 *
 * Props:
 *  value        — current image URL or /uploads/... path (string)
 *  onChange     — called with new URL/path string
 *  label        — optional label text
 *  disabled     — disable all interactions
 */
export default function ImageInput({ value, onChange, label = 'Зображення', disabled = false }) {
  const [mode, setMode] = useState('idle') // 'idle' | 'uploading' | 'importing' | 'url-input'
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef(null)

  const isLoading = mode === 'uploading' || mode === 'importing'

  // Upload file → server converts to JPEG
  const handleFileUpload = async (file) => {
    if (!file) return
    setMode('uploading')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res?.data?.path || res?.data?.url
      if (url) {
        onChange(url)
        toast.success('✅ Зображення завантажено та оптимізовано!')
      } else {
        toast.error('Не вдалося отримати URL зображення')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Помилка завантаження'
      toast.error(msg)
    } finally {
      setMode('idle')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Import from URL (Google, Pinterest, Unsplash, etc.) → server downloads & converts
  const handleUrlImport = async () => {
    const url = urlInput.trim()
    if (!url) {
      toast.error('Введіть URL зображення')
      return
    }

    setMode('importing')
    try {
      const res = await api.post('/import-image', { url })
      const resultPath = res?.data?.path || res?.data?.url
      if (resultPath) {
        onChange(resultPath)
        setUrlInput('')
        setMode('idle')
        toast.success('✅ Зображення імпортовано та оптимізовано!')
      } else {
        toast.error('Не вдалося зберегти зображення')
        setMode('url-input')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Помилка імпорту'
      toast.error(msg)
      setMode('url-input')
    }
  }

  const handleClear = () => {
    onChange('')
    setMode('idle')
    setUrlInput('')
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      )}

      {/* Main action row */}
      <div className="flex flex-wrap gap-2">
        {/* File upload button */}
        <label
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all cursor-pointer
            ${isLoading || disabled
              ? 'opacity-50 pointer-events-none bg-luxury-gold/5 border-luxury-gold/20 text-gray-400'
              : 'bg-luxury-gold/10 hover:bg-luxury-gold/20 border-luxury-gold/40 text-luxury-gold'
            }`}
        >
          {mode === 'uploading' ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {mode === 'uploading' ? 'Завантаження...' : 'Обрати файл'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.avif,.bmp,.tiff"
            className="hidden"
            disabled={isLoading || disabled}
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
          />
        </label>

        {/* URL import toggle */}
        <button
          type="button"
          disabled={isLoading || disabled}
          onClick={() => setMode(m => m === 'url-input' ? 'idle' : 'url-input')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all
            ${mode === 'url-input'
              ? 'bg-blue-500/20 border-blue-400/50 text-blue-300'
              : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400'
            } ${isLoading || disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Link className="h-4 w-4" />
          По URL
        </button>

        {/* Clear button */}
        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm transition-all"
          >
            <X className="h-4 w-4" />
            Очистити
          </button>
        )}
      </div>

      {/* URL input panel */}
      {mode === 'url-input' && (
        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg space-y-2">
          <p className="text-xs text-blue-300 font-medium">
            📎 Вставте посилання на фото з Google, Pinterest, Unsplash або будь-якого іншого сайту.
            Сервер завантажить і оптимізує зображення автоматично.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlImport())}
              placeholder="https://i.pinimg.com/... або посилання з Google Images..."
              className="flex-1 px-3 py-2 bg-luxury-dark border border-blue-500/40 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleUrlImport}
              disabled={mode === 'importing' || !urlInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              {mode === 'importing' ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Імпорт...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4" />
                  Імпортувати
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            💡 Підказка: в Google Images — правий клік на фото → «Копіювати адресу зображення».<br />
            В Pinterest — відкрийте фото, правий клік → «Копіювати адресу зображення».
          </p>
        </div>
      )}

      {/* Current URL display */}
      {value && mode !== 'url-input' && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-luxury-dark/60 rounded-lg border border-luxury-gold/10">
          <span className="text-xs text-gray-400 truncate flex-1 font-mono">{value}</span>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-luxury-gold/20"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
            onLoad={(e) => {
              e.target.style.display = 'block'
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'none'
            }}
          />
          <div
            className="hidden w-full h-48 rounded-lg border border-red-500/30 bg-red-900/10 items-center justify-center flex-col gap-2"
          >
            <Image className="h-8 w-8 text-red-400" />
            <p className="text-red-400 text-sm">Зображення недоступне або невірний URL</p>
            <p className="text-gray-500 text-xs">Спробуйте завантажити файл або імпортувати по URL</p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Підтримується: JPG, PNG, WebP, GIF, HEIC, AVIF (до 20MB) • Автоматично конвертується у JPEG
      </p>
    </div>
  )
}
