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

async function query() {
  try {
    console.log('=== SUBMISSIONS ===');
    const submissions = await db('submissions')
      .join('users', 'submissions.user_id', 'users.id')
      .join('challenges', 'submissions.challenge_id', 'challenges.id')
      .select('submissions.*', 'users.email', 'challenges.title')
      .orderBy('submissions.submitted_at', 'desc');
    console.log(JSON.stringify(submissions, null, 2));

    console.log('\n=== SCOREBOARD CACHE ===');
    const scoreboard = await db('scoreboard_cache')
      .join('users', 'scoreboard_cache.user_id', 'users.id')
      .select('scoreboard_cache.*', 'users.email')
      .orderBy('scoreboard_cache.total_points', 'desc');
    console.log(JSON.stringify(scoreboard, null, 2));

    await db.destroy();
  } catch (err) {
    console.error('Error:', err);
    await db.destroy();
    process.exit(1);
  }
}

query();
