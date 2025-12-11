import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Globe, Building, Lock, Save, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import API_BASE_URL from '../config/api'
import './ProfilePage.css'

function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    country: '',
    affiliation: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setFormData({
          country: data.user.country || '',
          affiliation: data.user.affiliation || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        navigate('/login')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setMessage({ type: 'error', text: 'Error loading profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)

    // Validate password change if attempted
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to change password' })
        setUpdating(false)
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' })
        setUpdating(false)
        return
      }

      if (formData.newPassword.length < 8) {
        setMessage({ type: 'error', text: 'New password must be at least 8 characters' })
        setUpdating(false)
        return
      }
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country: formData.country,
          affiliation: formData.affiliation,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })

        // Redirect after a delay
        setTimeout(() => {
          window.location.reload() // Refresh to update navbar
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' })
      }
    } catch (err) {
      console.error('Update error:', err)
      setMessage({ type: 'error', text: 'Error updating profile' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <Shield className="header-icon" size={64} />
          <h1 className="profile-title">
            <span className="text-glow-cyan">SENTINELFORGE CTF</span>{' '}
            <span className="text-glow-magenta">PROFILE</span>
          </h1>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>

        {message && (
          <div className={`message ${message.type}`} role="alert" aria-live="polite">
            {message.type === 'success' ? (
              <CheckCircle size={20} aria-hidden="true" />
            ) : (
              <AlertCircle size={20} aria-hidden="true" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="profile-content">
          {/* User Info Card */}
          <div className="info-card">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <User size={20} />
                <div>
                  <label>Username</label>
                  <div className="info-value">{user.username}</div>
                </div>
              </div>
              <div className="info-item">
                <Mail size={20} />
                <div>
                  <label>Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
              </div>
              <div className="info-item">
                <Shield size={20} />
                <div>
                  <label>Role</label>
                  <div className="info-value role-badge">{user.role}</div>
                </div>
              </div>
              <div className="info-item">
                <span className="score-icon">🏆</span>
                <div>
                  <label>Score</label>
                  <div className="info-value score-value">{user.score || 0} points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="edit-card">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="country">
                    <Globe size={18} />
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="USA"
                    maxLength="3"
                  />
                  <span className="field-hint">Optional - 3 letter country code (e.g., USA, GBR, DEU)</span>
                </div>

                <div className="form-group">
                  <label htmlFor="affiliation">
                    <Building size={18} />
                    Affiliation
                  </label>
                  <input
                    type="text"
                    id="affiliation"
                    name="affiliation"
                    value={formData.affiliation}
                    onChange={handleChange}
                    placeholder="Company or University"
                    maxLength="100"
                  />
                  <span className="field-hint">Optional - Your organization or team</span>
                </div>
              </div>

              <div className="form-section">
                <h3>Change Password</h3>
                <p className="section-note">Leave blank if you don't want to change your password</p>

                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <Lock size={18} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">
                      <Lock size={18} />
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      minLength="8"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <Lock size={18} />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      minLength="8"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="save-button" disabled={updating}>
                {updating ? (
                  <>
                    <div className="spinner"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
