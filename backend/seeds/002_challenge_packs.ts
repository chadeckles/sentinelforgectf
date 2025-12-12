import type { Knex } from 'knex';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

// Import the pack loader using require (CommonJS)
// Use process.cwd() to get the actual working directory, not __dirname
const packLoaderPath = path.join(process.cwd(), 'challenge-packs', 'pack-loader.js');
let seedPacks: any = null;

// Only load if the file exists
if (fs.existsSync(packLoaderPath)) {
  const packLoader = require(packLoaderPath);
  seedPacks = packLoader.seed;
} else {
  console.log(`⚠️  Pack loader not found at: ${packLoaderPath}`);
}

export async function seed(knex: Knex): Promise<void> {
  console.log('\n🌱 Starting database seed...\n');
  
  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await knex('user_achievements').del();
  await knex('achievements').del();
  await knex('hint_unlocks').del();
  await knex('submissions').del();
  await knex('hints').del();
  await knex('challenge_files').del();
  await knex('challenges').del();
  await knex('team_members').del();
  await knex('teams').del();
  await knex('users').del();
  console.log('✅ Existing data cleared\n');

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'changeme',
    12
  );

  const [admin] = await knex('users')
    .insert({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@sentinelforge.ctf',
      password_hash: adminPassword,
      role: 'admin',
      is_verified: true,
      is_active: true,
      country: 'USA',
      affiliation: 'SentinelForge'
    })
    .returning('*');
  console.log(`✅ Admin user created: ${admin.email}\n`);

  // Create demo users
  console.log('👥 Creating demo users...');
  const demoPassword = await bcrypt.hash('demo123', 12);

  const [user1, user2, user3] = await knex('users')
    .insert([
      {
        username: 'sentinel_alpha',
        email: 'alpha@sentinelforge.ctf',
        password_hash: demoPassword,
        role: 'user',
        is_verified: true,
        country: 'USA',
        affiliation: 'Alpha Team'
      },
      {
        username: 'cloud_guardian',
        email: 'guardian@sentinelforge.ctf',
        password_hash: demoPassword,
        role: 'user',
        is_verified: true,
        country: 'GBR',
        affiliation: 'Guardian Squad'
      },
      {
        username: 'cyber_sentinel',
        email: 'sentinel@sentinelforge.ctf',
        password_hash: demoPassword,
        role: 'user',
        is_verified: true,
        country: 'DEU',
        affiliation: 'Sentinel Corps'
      }
    ])
    .returning('*');
  console.log(`✅ Created ${[user1, user2, user3].length} demo users\n`);

  // Create demo teams
  console.log('👥 Creating demo teams...');
  const [team1, team2] = await knex('teams')
    .insert([
      {
        name: 'Alpha Defenders',
        description: 'Elite cloud security specialists',
        country: 'USA',
        captain_id: user1.id,
        affiliation: 'Alpha Team'
      },
      {
        name: 'Guardian Alliance',
        description: 'International cybersecurity coalition',
        country: 'GBR',
        captain_id: user2.id,
        affiliation: 'Guardian Squad'
      }
    ])
    .returning('*');
  console.log(`✅ Created ${[team1, team2].length} demo teams\n`);

  // Add team members
  await knex('team_members').insert([
    { team_id: team1.id, user_id: user1.id },
    { team_id: team2.id, user_id: user2.id },
    { team_id: team2.id, user_id: user3.id }
  ]);

  // Load challenge packs using pack-loader
  console.log('📦 Loading challenge packs...\n');
  
  // The pack-loader will:
  // 1. Automatically discover all valid packs in challenge-packs/ directory
  // 2. Load demo-pack (free challenges for public CTF)
  // 3. Load azure-fundamentals (premium pack if purchased)
  // 4. Hash flags with SHA256
  // 5. Serialize metadata as JSON
  
  // Note: You can control which packs to load with PACK environment variable:
  // - PACK=demo-pack (only demo challenges)
  // - PACK=azure-fundamentals (only azure fundamentals)
  // - No PACK variable = load ALL available packs
  
  // Load challenge packs if available
  if (seedPacks && typeof seedPacks === 'function') {
    console.log('📦 Loading challenge packs...');
    await seedPacks(knex);
    console.log('\n✅ Challenge packs loaded successfully!\n');
  } else {
    console.log('⚠️  No challenge packs found or pack-loader not available\n');
  }

  // Create achievements
  console.log('🏆 Creating achievements...');
  const achievements = await knex('achievements')
    .insert([
      {
        name: 'First Blood',
        description: 'Be the first to solve any challenge',
        badge_icon: '🩸',
        criteria: { type: 'first_solve', count: 1 }
      },
      {
        name: 'Sentinel Initiate',
        description: 'Solve your first challenge',
        badge_icon: '🛡️',
        criteria: { type: 'challenges_solved', count: 1 }
      },
      {
        name: 'Cloud Guardian',
        description: 'Solve 5 cloud security challenges',
        badge_icon: '☁️',
        criteria: { type: 'category_solved', category: 'Cloud Security', count: 5 }
      },
      {
        name: 'DevSecOps Master',
        description: 'Solve all DevSecOps challenges',
        badge_icon: '⚙️',
        criteria: { type: 'category_complete', category: 'DevSecOps' }
      },
      {
        name: 'Perfect Score',
        description: 'Solve all challenges without using hints',
        badge_icon: '💯',
        criteria: { type: 'no_hints', challenges_solved: 'all' }
      }
    ])
    .returning('*');
  console.log(`✅ Created ${achievements.length} achievements\n`);

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       🎉 Database seeded successfully! 🎉             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('👤 Admin User:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'changeme'}\n`);
  
  console.log('👥 Demo Users:');
  console.log('   Email: alpha@sentinelforge.ctf / Password: demo123');
  console.log('   Email: guardian@sentinelforge.ctf / Password: demo123');
  console.log('   Email: sentinel@sentinelforge.ctf / Password: demo123\n');
  
  console.log('📝 Note: Challenge packs loaded via pack-loader.js');
  console.log('   Use PACK=demo-pack to load only demo challenges');
  console.log('   Use PACK=azure-fundamentals to load only premium pack');
  console.log('   No PACK variable = load all available packs\n');
}
