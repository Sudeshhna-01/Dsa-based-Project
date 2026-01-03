import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import './styles/buttons.css'

if (import.meta.env.DEV) {
  const originalError = console.error
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Download the React DevTools')) {
      return
    }
    originalError.apply(console, args)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

