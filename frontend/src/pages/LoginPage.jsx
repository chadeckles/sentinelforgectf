import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import API_BASE_URL from '../config/api'
import './AuthPages.css'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Redirect to challenges page
        navigate('/challenges')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <LogIn className="auth-icon" size={48} aria-hidden="true" />
          <h1 className="auth-title">
            <span className="text-glow-cyan">SENTINELFORGE</span>{' '}
            <span className="text-glow-magenta">CTF</span>
          </h1>
          <p className="auth-subtitle">Login to Continue Your Journey</p>
        </div>

        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            <AlertCircle size={20} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} aria-label="Login form">
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} aria-hidden="true" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sentinel@example.com"
              required
              autoComplete="email"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} aria-hidden="true" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
            />
          </div>

          <button type="submit" className="auth-submit-button" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>

        <div className="auth-demo-info">
          <p className="demo-title">🎯 Demo Account</p>
          <p className="demo-credentials">
            Email: <code>alpha@sentinelforge.ctf</code>
            <br />
            Password: <code>demo123</code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
