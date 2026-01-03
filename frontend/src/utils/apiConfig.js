// Centralized API URL configuration
// This ensures consistent API URL handling across the app

/**
 * Normalizes the API URL from environment variable
 * Ensures it's always a full URL (http:// or https://) without trailing slash
 */
export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  // Convert to string and remove trailing slash
  let cleanUrl = envUrl.toString().trim().replace(/\/+$/, '')
  
  // If empty, use default
  if (!cleanUrl) {
    cleanUrl = 'http://localhost:3000'
  }
  
  // Ensure it's a full URL (starts with http:// or https://)
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    // If it's not a full URL, it might be a domain name without protocol
    // Check if it looks like a domain (contains dots and doesn't start with /)
    if (cleanUrl.includes('.') && !cleanUrl.startsWith('/')) {
      // It's likely a domain name - prepend https://
      console.warn(`VITE_API_URL missing protocol. Adding https:// to: ${cleanUrl}`)
      cleanUrl = `https://${cleanUrl}`
    } else {
      // It's a relative path - this shouldn't happen in production
      console.error('VITE_API_URL appears to be a relative path. This may cause issues.')
      console.error('Please set VITE_API_URL to a full URL like: https://your-backend.railway.app')
      // In production, we should never use relative paths for API
      // But for safety, return the current origin
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
      }
      return cleanUrl
    }
  }
  
  return cleanUrl
}

export const API_URL = getApiUrl()

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API URL configured:', API_URL)
}

