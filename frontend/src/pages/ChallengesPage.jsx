import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Unlock, Star, Trophy, Target, Cloud, Box, FileCode, GitBranch, Upload, Layers } from 'lucide-react'
import API_BASE_URL from '../config/api'
import './ChallengesPage.css'

const difficultyColors = {
  easy: '#00ff88',
  medium: '#ffaa00',
  hard: '#ff4444',
  expert: '#ff00ff'
}

const challengeTypeIcons = {
  qa: Target,
  repo: GitBranch, // Default for repo type
  terraform: FileCode,
  container: Box,
  file_upload: Upload,
  multi_part: Layers
}

// Helper function to determine icon based on challenge content
const getChallengeIcon = (challenge) => {
  const title = challenge.title?.toLowerCase() || ''
  const category = challenge.category?.toLowerCase() || ''
  
  // Check if it's a trivia challenge
  const isTriviaChallenge = 
    title.includes('trivia') || 
    category.includes('trivia')
  
  // Trivia challenges always get the Target icon
  if (isTriviaChallenge) {
    return Target
  }
  
  // Check if it's a cloud provider challenge (Azure, AWS, GCP)
  const isCloudChallenge = 
    title.includes('azure') || 
    title.includes('aws') || 
    title.includes('gcp') ||
    category === 'cloud security' ||
    category === 'cloud'
  
  // If it's cloud-related (but not trivia), use Cloud icon
  if (isCloudChallenge) {
    return Cloud
  }
  
  // Otherwise use the default icon for that type
  return challengeTypeIcons[challenge.type] || Cloud
}

function ChallengesPage() {
  const navigate = useNavigate()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges`)
      const data = await response.json()
      
      if (data.success) {
        setChallenges(data.challenges)
      } else {
        setError('Failed to load challenges')
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    const matchesDifficulty = filterDifficulty === 'all' || challenge.difficulty === filterDifficulty
    const matchesCategory = filterCategory === 'all' || challenge.category === filterCategory
    return matchesDifficulty && matchesCategory
  })

  if (loading) {
    return (
      <div className="challenges-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading challenges...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="challenges-page">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchChallenges} className="retry-button">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-glow-cyan">SentinelForge CTF</span>{' '}
          <span className="text-glow-magenta">Challenges</span>
        </motion.h1>
        <p className="challenges-subtitle">
          Sharpen your cybersecurity skills across cloud, containers, DevSecOps, and more
        </p>

        {/* Filters */}
        <div className="filters" role="search" aria-label="Filter challenges">
          <div className="filter-group">
            <label htmlFor="difficulty-filter">Difficulty:</label>
            <select id="difficulty-filter" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} aria-label="Filter by difficulty">
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select id="category-filter" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category">
              <option value="all">All</option>
              <option value="Trivia">Trivia</option>
              <option value="Cloud Security">Cloud Security</option>
              <option value="Container Security">Container Security</option>
              <option value="Infrastructure as Code">Infrastructure as Code</option>
              <option value="DevSecOps">DevSecOps</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="challenges-grid">
        {filteredChallenges.map((challenge, index) => {
          const TypeIcon = getChallengeIcon(challenge)
          
          return (
            <motion.div
              key={challenge.id}
              className="challenge-card neon-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="challenge-header">
                <div className="challenge-icon">
                  <TypeIcon size={32} />
                </div>
                <div className="challenge-meta">
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
                    <Trophy size={16} /> {challenge.points} pts
                  </span>
                </div>
              </div>

              <h3 className="challenge-title">{challenge.title}</h3>
              <p className="challenge-description">
                {challenge.description.split('\n')[0].replace(/\*\*/g, '')}
              </p>

              <div className="challenge-footer">
                <div className="challenge-stats">
                  <span className="stat">
                    <Unlock size={14} /> {challenge.solves || 0} solves
                  </span>
                  <span className="stat">
                    <Star size={14} /> {challenge.category || 'Cloud Security'}
                  </span>
                </div>
                <button className="solve-button" onClick={() => navigate(`/challenges/${challenge.id}`)} aria-label={`Solve ${challenge.title} challenge`}>
                  Solve Challenge
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="no-challenges">
          <p>No challenges match your filters.</p>
        </div>
      )}
    </div>
  )
}

export default ChallengesPage
