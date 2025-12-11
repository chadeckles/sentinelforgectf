import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Users, Clock, Target, Send, CheckCircle, XCircle, Flag, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import Terminal from '../components/Terminal'
import FileViewer from '../components/FileViewer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import API_BASE_URL from '../config/api'
import './ChallengeDetailPage.css'

const difficultyColors = {
  easy: '#00ff88',
  medium: '#ffaa00',
  hard: '#ff4444',
  expert: '#ff00ff'
}

const MarkdownComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  p: ({ children }) => <p>{children}</p>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>
}

const formatDescription = (text) => {
  if (!text) return null

  return (
    <ReactMarkdown
      className="challenge-description-markdown"
      remarkPlugins={[remarkGfm]}
      components={MarkdownComponents}
    >
      {text}
    </ReactMarkdown>
  )
}

function ChallengeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [flagInput, setFlagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [hintExpanded, setHintExpanded] = useState(false)
  const [revealedHints, setRevealedHints] = useState([])
  const [unlockingHint, setUnlockingHint] = useState(null)

  useEffect(() => {
    fetchChallenge()
    fetchUnlockedHints()
  }, [id])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [id])

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges`)
      const data = await response.json()
      
      if (data.success) {
        const foundChallenge = data.challenges.find(c => c.id === id)
        if (foundChallenge) {
          setChallenge(foundChallenge)
        } else {
          setError('Challenge not found')
        }
      } else {
        setError('Failed to load challenge')
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnlockedHints = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/challenges/${id}/unlocked-hints`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.unlockedHints) {
          setRevealedHints(data.unlockedHints)
        }
      }
    } catch (err) {
      console.error('Error fetching unlocked hints:', err)
    }
  }

  const handleSubmitFlag = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitResult(null)

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token')
      if (!token) {
        setSubmitResult({
          success: false,
          message: 'Please login to submit flags.'
        })
        setSubmitting(false)
        return
      }

      // Submit flag to API
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          challenge_id: id,
          flag: flagInput 
        })
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setSubmitResult({
          success: false,
          message: 'Session expired. Please login again.'
        })
      } else if (data.success || data.correct !== undefined) {
        // Handle both success response and wrong flag (400 status)
        setSubmitResult({
          success: data.correct,
          message: data.message
        })
        if (data.correct) {
          setFlagInput('') // Clear flag input on success
          // Refresh user data to update score in navbar
          window.dispatchEvent(new Event('storage'))
        }
      } else {
        setSubmitResult({
          success: false,
          message: data.error?.message || data.error || 'Submission failed'
        })
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        message: 'Error submitting flag: ' + err.message
      })
    } finally {
      setSubmitting(false)
    }
  }

  const unlockHint = async (hintIndex) => {
    if (revealedHints.includes(hintIndex)) {
      return // Already unlocked
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setSubmitResult({
        success: false,
        message: 'Please login to unlock hints'
      })
      return
    }

    setUnlockingHint(hintIndex)

    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${id}/hints/${hintIndex}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRevealedHints(prev => [...prev, hintIndex])
        // Show success message with points deducted
        setSubmitResult({
          success: true,
          message: `Hint unlocked! -${challenge.metadata.hints[hintIndex].cost || 0} points`
        })
        // Clear message after 3 seconds
        setTimeout(() => setSubmitResult(null), 3000)
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Failed to unlock hint'
        })
      }
    } catch (err) {
      setSubmitResult({
        success: false,
        message: 'Error unlocking hint: ' + err.message
      })
    } finally {
      setUnlockingHint(null)
    }
  }

  if (loading) {
    return (
      <div className="challenge-detail-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="challenge-detail-page">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error || 'Challenge not found'}</p>
          <button onClick={() => navigate('/challenges')} className="back-button">
            Back to Challenges
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-detail-page">
      <div className="challenge-detail-container">
        {/* Header */}
        <motion.div 
          className="challenge-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button onClick={() => navigate('/challenges')} className="back-button">
            <ArrowLeft size={20} />
            Back to Challenges
          </button>

          <div className="challenge-title-section">
            <h1 className="challenge-title">{challenge.title}</h1>
            <div className="challenge-badges">
              <span 
                className="difficulty-badge"
                style={{ 
                  backgroundColor: difficultyColors[challenge.difficulty] + '20',
                  color: difficultyColors[challenge.difficulty],
                  border: `1px solid ${difficultyColors[challenge.difficulty]}`
                }}
              >
                {challenge.difficulty}
              </span>
              <span className="points-badge">
                <Trophy size={16} /> {challenge.points} points
              </span>
              {challenge.solves === 0 && (
                <span className="first-blood-badge" title="Be the first to solve and earn +50 bonus points!">
                  🩸 First Blood Available
                </span>
              )}
              <span className="type-badge">
                {challenge.category}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="challenge-stats-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat">
            <Users size={18} />
            <span>{challenge.solves || 0} solves</span>
          </div>
          <div className="stat">
            <Clock size={18} />
            <span>Created {new Date(challenge.created_at).toLocaleDateString()}</span>
          </div>
          <div className="stat">
            <Target size={18} />
            <span>{challenge.category}</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="challenge-content-grid">
          {/* Challenge Description */}
          <motion.div 
            className="challenge-description-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-card">
              <h2>📋 Challenge Description</h2>
              <div className="challenge-description">
                {formatDescription(challenge.description)}
              </div>
              
              {challenge.scenario && (
                <div className="scenario-box">
                  <h3>🎯 Scenario</h3>
                  <p>{challenge.scenario}</p>
                </div>
              )}

              {challenge.hints_available > 0 && (
                <div className="hints-section">
                  <h3>💡 Hints Available: {challenge.hints_available}</h3>
                  <button className="hint-button">
                    Unlock Hint (-{challenge.hint_cost || 10} points)
                  </button>
                </div>
              )}

              {challenge.resources && challenge.resources.length > 0 && (
                <div className="resources-section">
                  <h3>🔗 Resources</h3>
                  <ul>
                    {challenge.resources.map((resource, idx) => (
                      <li key={idx}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* Flag Submission */}
          <motion.div 
            className="flag-submission-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-card">
              <h2>🚩 Submit Flag</h2>
              
              <form onSubmit={handleSubmitFlag} className="flag-form" aria-label="Flag submission form">
                <div className="flag-input-group">
                  <Flag size={20} className="flag-icon" aria-hidden="true" />
                  <label htmlFor="flag-input" className="sr-only">Enter flag</label>
                  <input
                    id="flag-input"
                    type="text"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="flag{enter_your_flag_here}"
                    className="flag-input"
                    disabled={submitting}
                    aria-label="Flag input"
                    aria-required="true"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submitting || !flagInput.trim()}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Flag
                    </>
                  )}
                </button>
              </form>

              {submitResult && (
                <motion.div 
                  className={`submit-result ${submitResult.success ? 'success' : 'error'}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {submitResult.success ? (
                    <CheckCircle size={20} aria-hidden="true" />
                  ) : (
                    <XCircle size={20} aria-hidden="true" />
                  )}
                  <span>{submitResult.message}</span>
                </motion.div>
              )}

              <div className="submission-info">
                <p>
                  <strong>Flag Format:</strong> flag&#123;...&#125;
                </p>
                <p className="info-note">
                  💡 Flags are case-sensitive. Make sure to include the exact format shown.
                </p>
                {challenge.solves === 0 && (
                  <p className="first-blood-info">
                    🩸 <strong>First Blood Bonus:</strong> Be the first to solve this challenge and earn an extra <strong>+50 points</strong>!
                  </p>
                )}
              </div>

              {/* Hint Section */}
              {challenge.metadata?.hints && challenge.metadata.hints.length > 0 && (
                <div className="hint-section">
                  <button 
                    className="hint-toggle"
                    onClick={() => setHintExpanded(!hintExpanded)}
                  >
                    <Lightbulb size={18} />
                    <span>HINT</span>
                    {hintExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  {hintExpanded && (
                    <motion.div 
                      className="hint-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {challenge.metadata.hints.map((hint, idx) => {
                        const isRevealed = revealedHints.includes(idx)
                        const isUnlocking = unlockingHint === idx
                        
                        return (
                          <div key={idx} className={`hint-item ${isRevealed ? 'revealed' : 'locked'}`}>
                            {isRevealed ? (
                              <>
                                <p className="hint-text">{hint.text}</p>
                                <span className="hint-unlocked">✓ Unlocked</span>
                              </>
                            ) : (
                              <>
                                <p className="hint-locked-text">🔒 Hint {idx + 1} - Click to reveal</p>
                                <div className="hint-unlock-controls">
                                  {hint.cost && (
                                    <span className="hint-cost">Cost: -{hint.cost} points</span>
                                  )}
                                  <button
                                    className="unlock-hint-button"
                                    onClick={() => unlockHint(idx)}
                                    disabled={isUnlocking}
                                  >
                                    {isUnlocking ? 'Unlocking...' : 'Unlock Hint'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Terminal Section - Separate from description to avoid overlap */}
        {challenge.metadata?.terminal && challenge.metadata.terminal.length > 0 && (
          <motion.div 
            className="terminal-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="section-card">
              <Terminal 
                commands={challenge.metadata.terminal}
                title="Challenge Environment"
                autoFocusInput={false}
              />
            </div>
          </motion.div>
        )}

        {/* FileViewer Section - Separate from description to avoid overlap */}
        {challenge.metadata?.files && challenge.metadata.files.length > 0 && (
          <motion.div 
            className="files-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-card">
              <FileViewer 
                files={challenge.metadata.files}
                title="Challenge Files"
              />
            </div>
          </motion.div>
        )}

        {/* Related Challenges */}
        <motion.div 
          className="related-challenges-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2>🎯 Ready for More?</h2>
          <button onClick={() => navigate('/challenges')} className="view-all-button">
            View All Challenges
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default ChallengeDetailPage
