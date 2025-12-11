import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Shield, Target, Trophy, LogIn, UserPlus, User, LogOut } from 'lucide-react'
import API_BASE_URL from '../config/api'
import logo from '../assets/sentinelforge-logo.png'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // Check if user is logged in and fetch fresh data
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Fetch fresh user data from API
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          const data = await response.json()
          if (data.success) {
            setUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
          // Fall back to stored user data
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        }
      }
    }

    loadUser()

    // Listen for storage changes (login/logout events)
    const handleStorageChange = () => {
      loadUser()
    }

    window.addEventListener('storage', handleStorageChange)
    // Also refresh on location change (after flag submission)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="SentinelForge CTF home">
          <img src={logo} alt="SentinelForge CTF" className="brand-logo" style={{ height: '40px', marginRight: '0.5rem' }} aria-hidden="true" />
          <span className="brand-text glitch" data-text="SENTINELFORGE">
            SENTINELFORGE
          </span>
        </Link>

        <div className="navbar-links" role="menubar">
          <Link to="/challenges" className={`nav-link ${isActive('/challenges')}`} role="menuitem" aria-current={isActive('/challenges') ? 'page' : undefined}>
            <Target size={20} aria-hidden="true" />
            <span>Challenges</span>
          </Link>
          <Link to="/scoreboard" className={`nav-link ${isActive('/scoreboard')}`} role="menuitem" aria-current={isActive('/scoreboard') ? 'page' : undefined}>
            <Trophy size={20} aria-hidden="true" />
            <span>Scoreboard</span>
          </Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <Link to="/profile" className="user-info">
                <User size={18} />
                <span className="username">{user.username}</span>
                <span className="user-score">{user.score || 0} pts</span>
              </Link>
              <button onClick={handleLogout} className="nav-link logout-button">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                <LogIn size={20} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="nav-link-primary">
                <UserPlus size={20} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Animated underline */}
      <div className="navbar-glow"></div>
    </nav>
  )
}

export default Navbar
