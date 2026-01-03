const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

