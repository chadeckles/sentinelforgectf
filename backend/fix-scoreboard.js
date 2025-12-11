const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'mssql',
  connection: {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: false
    }
  }
});

async function fixScoreboard() {
  try {
    console.log('Rebuilding scoreboard cache...');

    // Clear existing cache
    await db('scoreboard_cache').del();

    // Get all users with correct submissions
    const users = await db('submissions')
      .where({ is_correct: 1 })
      .distinct('user_id');

    console.log(`Found ${users.length} users with correct submissions`);

    for (const { user_id } of users) {
      const stats = await db('submissions')
        .where({ user_id, is_correct: 1 })
        .select(
          db.raw('SUM(points_awarded) as total_points'),
          db.raw('COUNT(DISTINCT challenge_id) as challenges_solved'),
          db.raw('MAX(submitted_at) as last_solve_time')
        )
        .first();

      await db('scoreboard_cache').insert({
        user_id,
        team_id: null,
        total_points: stats.total_points || 0,
        challenges_solved: stats.challenges_solved || 0,
        last_solve_time: stats.last_solve_time
      });

      console.log(`Updated cache for user ${user_id}: ${stats.total_points} points, ${stats.challenges_solved} challenges`);
    }

    console.log('\n=== FINAL SCOREBOARD ===');
    const scoreboard = await db('scoreboard_cache')
      .join('users', 'scoreboard_cache.user_id', 'users.id')
      .select('scoreboard_cache.*', 'users.email', 'users.username')
      .orderBy('scoreboard_cache.total_points', 'desc');
    console.log(JSON.stringify(scoreboard, null, 2));

    await db.destroy();
  } catch (err) {
    console.error('Error:', err);
    await db.destroy();
    process.exit(1);
  }
}

fixScoreboard();
