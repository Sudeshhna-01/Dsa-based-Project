import { API_URL } from './apiConfig.js'

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  }

  try {
    const fullUrl = `${API_URL}${normalizedEndpoint}`
    const response = await fetch(fullUrl, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

