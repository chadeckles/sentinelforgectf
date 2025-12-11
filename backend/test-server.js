// Simple JS server to test database connection
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'sentinelforge_ctf'
});

client.connect()
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SentinelForge CTF API is running!' });
});

app.get('/api/v1/challenges', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        id, 
        title, 
        description, 
        type,
        difficulty, 
        category,
        points,
        is_active,
        metadata,
        created_at
      FROM challenges 
      WHERE is_active = true 
      ORDER BY points ASC
    `);
    res.json({ success: true, challenges: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Registration endpoint
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { username, email, password, country, affiliation } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, email, and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const result = await client.query(`
      INSERT INTO users (username, email, password_hash, country, affiliation, role, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, 'user', false, true)
      RETURNING id, username, email, country, affiliation, role, created_at
    `, [username, email, password_hash, country || null, affiliation || null]);

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        country: user.country,
        affiliation: user.affiliation,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const result = await client.query(
      'SELECT id, username, email, password_hash, country, affiliation, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is deactivated. Please contact support.' 
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Calculate user score from submissions
    const scoreResult = await client.query(`
      SELECT COALESCE(SUM(c.points), 0) as score
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.user_id = $1 AND s.is_correct = true
    `, [user.id]);

    const score = parseInt(scoreResult.rows[0].score) || 0;

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last_login
    await client.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        country: user.country,
        affiliation: user.affiliation,
        role: user.role,
        score: score
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get current user (protected route)
app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      'SELECT id, username, email, country, affiliation, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Calculate user score
    const scoreResult = await client.query(`
      SELECT 
        COALESCE(SUM(c.points), 0) as base_score,
        COALESCE((SELECT SUM(points_deducted) FROM hint_unlocks WHERE user_id = $1), 0) as hint_penalty
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.user_id = $1 AND s.is_correct = true
    `, [req.user.id]);

    const user = result.rows[0];
    const baseScore = parseInt(scoreResult.rows[0].base_score) || 0;
    const hintPenalty = parseInt(scoreResult.rows[0].hint_penalty) || 0;
    user.score = Math.max(0, baseScore - hintPenalty);

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit flag endpoint (protected)
app.post('/api/v1/challenges/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { flag } = req.body;

    if (!flag) {
      return res.status(400).json({ success: false, error: 'Flag is required' });
    }

    // Get challenge
    const challengeResult = await client.query(
      'SELECT id, title, points, flag_hash FROM challenges WHERE id = $1 AND is_active = true',
      [id]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const challenge = challengeResult.rows[0];

    // Check if already solved
    const existingSolve = await client.query(
      'SELECT id FROM submissions WHERE user_id = $1 AND challenge_id = $2 AND is_correct = true',
      [req.user.id, id]
    );

    if (existingSolve.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already solved this challenge' 
      });
    }

    // Hash submitted flag and compare
    const submittedHash = crypto
      .createHash('sha256')
      .update(flag.toLowerCase().trim())
      .digest('hex');

    const isCorrect = submittedHash === challenge.flag_hash;

    // Record submission
    await client.query(`
      INSERT INTO submissions (user_id, challenge_id, submitted_flag, is_correct)
      VALUES ($1, $2, $3, $4)
    `, [req.user.id, id, flag, isCorrect]);

    if (isCorrect) {
      // Calculate total hint deductions for this challenge
      const hintDeductionsResult = await client.query(
        'SELECT COALESCE(SUM(points_deducted), 0) as total_deducted FROM hint_unlocks WHERE user_id = $1 AND challenge_id = $2',
        [req.user.id, id]
      );
      
      const totalDeducted = parseInt(hintDeductionsResult.rows[0].total_deducted) || 0;
      const finalPoints = Math.max(0, challenge.points - totalDeducted);
      
      let message = `Correct! You earned ${finalPoints} points! 🎉`;
      if (totalDeducted > 0) {
        message += ` (${challenge.points} - ${totalDeducted} hint penalty)`;
      }

      res.json({
        success: true,
        correct: true,
        message: message,
        points: finalPoints,
        basePoints: challenge.points,
        hintPenalty: totalDeducted
      });
    } else {
      res.json({
        success: true,
        correct: false,
        message: 'Incorrect flag. Try again! 🔍'
      });
    }
  } catch (error) {
    console.error('Flag submission error:', error);
    res.status(500).json({ success: false, error: 'Submission failed' });
  }
});

// Unlock hint endpoint (protected)
app.post('/api/v1/challenges/:id/hints/:hintIndex', authenticateToken, async (req, res) => {
  try {
    const { id, hintIndex } = req.params;
    const hintIdx = parseInt(hintIndex);

    // Get challenge
    const challengeResult = await client.query(
      'SELECT id, metadata FROM challenges WHERE id = $1 AND is_active = true',
      [id]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const challenge = challengeResult.rows[0];
    const hints = challenge.metadata?.hints || [];

    if (hintIdx < 0 || hintIdx >= hints.length) {
      return res.status(400).json({ success: false, error: 'Invalid hint index' });
    }

    const hint = hints[hintIdx];
    const cost = hint.cost || 0;

    // Check if hint already unlocked
    const existingHint = await client.query(
      'SELECT id FROM hint_unlocks WHERE user_id = $1 AND challenge_id = $2 AND hint_index = $3',
      [req.user.id, id, hintIdx]
    );

    if (existingHint.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Hint already unlocked' 
      });
    }

    // Record hint unlock and deduct points
    await client.query('BEGIN');
    
    try {
      // Record the hint unlock
      await client.query(`
        INSERT INTO hint_unlocks (user_id, challenge_id, hint_index, points_deducted)
        VALUES ($1, $2, $3, $4)
      `, [req.user.id, id, hintIdx, cost]);

      // Deduct points from user (we'll need to create this logic)
      // For now, we'll just record it in hint_unlocks table
      
      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Hint unlocked! ${cost > 0 ? `-${cost} points` : ''}`,
        hint: hint.text,
        pointsDeducted: cost
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Hint unlock error:', error);
    res.status(500).json({ success: false, error: 'Failed to unlock hint' });
  }
});

// Update user profile
app.put('/api/v1/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { country, affiliation, currentPassword, newPassword } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Update country if provided
    if (country !== undefined) {
      updates.push(`country = $${paramCount}`);
      values.push(country);
      paramCount++;
    }

    // Update affiliation if provided
    if (affiliation !== undefined) {
      updates.push(`affiliation = $${paramCount}`);
      values.push(affiliation);
      paramCount++;
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Current password is required to change password' 
        });
      }

      // Verify current password
      const userResult = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user.id]
      );

      const passwordMatch = await bcrypt.compare(
        currentPassword, 
        userResult.rows[0].password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          error: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      updates.push(`password_hash = $${paramCount}`);
      values.push(newPasswordHash);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No updates provided' 
      });
    }

    // Add user ID
    values.push(req.user.id);

    // Update user
    const result = await client.query(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, username, email, country, affiliation, role, created_at
    `, values);

    // Calculate score
    const scoreResult = await client.query(`
      SELECT COALESCE(SUM(c.points), 0) as score
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.user_id = $1 AND s.is_correct = true
    `, [req.user.id]);

    const user = result.rows[0];
    user.score = parseInt(scoreResult.rows[0].score) || 0;

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Profile update failed' });
  }
});

// Get scoreboard
app.get('/api/v1/scoreboard', async (req, res) => {
  try {
    const result = await client.query(`
      WITH ranked_users AS (
        SELECT 
          u.id,
          u.username,
          u.country,
          u.affiliation,
          COALESCE(SUM(c.points), 0) - COALESCE(SUM(h.points_deducted), 0) as score,
          COUNT(DISTINCT CASE WHEN s.is_correct = true THEN s.challenge_id END) as solves,
          MAX(s.submitted_at) as last_solve,
          DENSE_RANK() OVER (ORDER BY COALESCE(SUM(c.points), 0) - COALESCE(SUM(h.points_deducted), 0) DESC) as rank
        FROM users u
        LEFT JOIN submissions s ON u.id = s.user_id AND s.is_correct = true
        LEFT JOIN challenges c ON s.challenge_id = c.id
        LEFT JOIN hint_unlocks h ON u.id = h.user_id
        WHERE u.role = 'user' AND u.is_active = true
        GROUP BY u.id, u.username, u.country, u.affiliation
        HAVING COALESCE(SUM(c.points), 0) - COALESCE(SUM(h.points_deducted), 0) > 0
      )
      SELECT * FROM ranked_users
      ORDER BY score DESC, last_solve ASC
      LIMIT 100
    `);

    res.json({ success: true, scoreboard: result.rows });
  } catch (error) {
    console.error('Scoreboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛡️⚒️ SentinelForge CTF Backend running on http://localhost:${PORT}`);
  console.log(`📊 Challenges endpoint: http://localhost:${PORT}/api/v1/challenges`);
});
