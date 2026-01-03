import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import '../styles/Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          CP Analytics
        </Link>
        
        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <li><Link to="/submissions" onClick={() => setIsMenuOpen(false)}>Submissions</Link></li>
              <li><Link to="/upload" onClick={() => setIsMenuOpen(false)}>Upload</Link></li>
              <li><Link to="/analytics" onClick={() => setIsMenuOpen(false)}>Analytics</Link></li>
              <li><Link to="/leetcode" onClick={() => setIsMenuOpen(false)}>LeetCode</Link></li>
              <li>
                <span className="navbar-user">{user.email}</span>
              </li>
              <li>
                <ThemeToggle />
              </li>
              <li>
                <button onClick={handleLogout} className="navbar-logout">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <ThemeToggle />
              </li>
              <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

