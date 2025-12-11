import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Target, Calendar, User, Globe } from 'lucide-react'
import API_BASE_URL from '../config/api'
import './ScoreboardPage.css'

function ScoreboardPage() {
  const [scoreboard, setScoreboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchScoreboard()
  }, [])

  const fetchScoreboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scoreboard`)
      const data = await response.json()
      
      if (data.success) {
        setScoreboard(data.scoreboard)
      } else {
        setError('Failed to load scoreboard')
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700' // Gold
    if (rank === 2) return '#C0C0C0' // Silver
    if (rank === 3) return '#CD7F32' // Bronze
    return 'var(--neon-cyan)'
  }

  // Group players by rank to find ties
  const getTopThree = () => {
    if (scoreboard.length === 0) return []
    
    // Get players with rank 1, 2, or 3 (handles ties)
    const topThree = scoreboard.filter(p => p.rank <= 3)
    
    // Return exactly 3 positions for podium display
    // If there are ties, just show the first of each rank
    const positions = []
    for (let rank = 1; rank <= 3; rank++) {
      const player = topThree.find(p => p.rank === rank)
      if (player) positions.push(player)
    }
    return positions
  }

  const topThree = getTopThree()

  if (loading) {
    return (
      <div className="scoreboard-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading scoreboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="scoreboard-page">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="scoreboard-page">
      <motion.div 
        className="scoreboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Trophy className="header-icon" size={64} />
        <h1 className="scoreboard-title">
          <span className="text-glow-magenta">SENTINELFORGE CTF</span>{' '}
          <span className="text-glow-cyan">SCOREBOARD</span>
        </h1>
        <p className="scoreboard-subtitle">
          Current Rankings - Compete, Learn, Excel
        </p>
        <div className="demo-notice">
          <span className="demo-badge">DEMO ENVIRONMENT</span>
          <p className="demo-text">
            This is a demo instance for testing and evaluation. Database resets monthly. 
            <a href="https://github.com/chadeckles/sentinelforgectf" target="_blank" rel="noopener noreferrer">
              Self-host for production use
            </a>.
          </p>
        </div>
      </motion.div>

      {scoreboard.length === 0 ? (
        <motion.div 
          className="empty-scoreboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Trophy size={80} style={{ opacity: 0.3 }} />
          <h2>No Rankings Yet</h2>
          <p>Be the first to solve a challenge and claim the top spot!</p>
        </motion.div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <motion.div 
              className="podium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Second Place */}
              <div className="podium-place second">
                <div className="podium-medal">🥈</div>
                <div className="podium-user">
                  <User size={32} />
                  <div className="podium-username">{topThree[1].username}</div>
                  <div className="podium-country">{topThree[1].country || '🌍'}</div>
                </div>
                <div className="podium-score">{topThree[1].total_points} pts</div>
                <div className="podium-solves">{topThree[1].challenges_solved} solves</div>
                <div className="podium-rank">{topThree[1].rank}</div>
              </div>

              {/* First Place */}
              <div className="podium-place first">
                <div className="podium-medal">🥇</div>
                <div className="podium-crown">👑</div>
                <div className="podium-user">
                  <User size={40} />
                  <div className="podium-username">{topThree[0].username}</div>
                  <div className="podium-country">{topThree[0].country || '🌍'}</div>
                </div>
                <div className="podium-score">{topThree[0].total_points} pts</div>
                <div className="podium-solves">{topThree[0].challenges_solved} solves</div>
                <div className="podium-rank">{topThree[0].rank}</div>
              </div>

              {/* Third Place */}
              <div className="podium-place third">
                <div className="podium-medal">🥉</div>
                <div className="podium-user">
                  <User size={28} />
                  <div className="podium-username">{topThree[2].username}</div>
                  <div className="podium-country">{topThree[2].country || '🌍'}</div>
                </div>
                <div className="podium-score">{topThree[2].total_points} pts</div>
                <div className="podium-solves">{topThree[2].challenges_solved} solves</div>
                <div className="podium-rank">{topThree[2].rank}</div>
              </div>
            </motion.div>
          )}

          {/* Full Rankings Table */}
          <motion.div 
            className="rankings-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            role="region"
            aria-label="Scoreboard rankings table"
          >
            <table aria-label="Player rankings">
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Player</th>
                  <th scope="col">Country</th>
                  <th scope="col">Affiliation</th>
                  <th scope="col">Score</th>
                  <th scope="col">Solves</th>
                  <th scope="col">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {scoreboard.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.05) }}
                    className={player.rank <= 3 ? 'top-three' : ''}
                  >
                    <td>
                      <span 
                        className="rank-badge"
                        style={{ color: getRankColor(player.rank) }}
                      >
                        #{player.rank}
                      </span>
                    </td>
                    <td>
                      <div className="player-info">
                        <User size={20} />
                        <span className="player-username">{player.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className="country-badge">
                        {player.country || '🌍'}
                      </span>
                    </td>
                    <td className="affiliation">
                      {player.affiliation || '-'}
                    </td>
                    <td>
                      <span className="score-badge">
                        {player.total_points} pts
                      </span>
                    </td>
                    <td>
                      <span className="solves-badge">
                        <Target size={16} />
                        {player.challenges_solved}
                      </span>
                    </td>
                    <td className="last-solve">
                      {player.last_solve_time 
                        ? new Date(player.last_solve_time).toLocaleDateString()
                        : '-'
                      }
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default ScoreboardPage
