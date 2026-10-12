/**
 * Helper utility for Meta (Facebook) Pixel tracking.
 * Safely executes fbq calls if available without throwing errors when ad blockers are active.
 */

export const trackPixelEvent = (eventName, data = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      if (data && Object.keys(data).length > 0) {
        window.fbq('track', eventName, data)
      } else {
        window.fbq('track', eventName)
      }
    } catch (err) {
      console.warn('[Meta Pixel] Tracking error:', eventName, err)
    }
  }
}

export const trackPixelCustom = (eventName, data = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, data)
    } catch (err) {
      console.warn('[Meta Pixel] Custom tracking error:', eventName, err)
    }
  }
}
