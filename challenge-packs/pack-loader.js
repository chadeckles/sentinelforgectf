#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Challenge Pack Loader
 * Reads JSON challenge definitions and generates database seed data
 */

// Get database connection from backend
const dbConfig = require('../backend/src/config/database');

/**
 * Hash a flag using the same method as backend seeds
 */
function hashFlag(flag) {
  return crypto.createHash('sha256').update(flag).digest('hex');
}

/**
 * Load a challenge pack from its directory
 */
function loadPack(packName) {
  const packDir = path.join(__dirname, packName);
  
  if (!fs.existsSync(packDir)) {
    throw new Error(`Pack directory not found: ${packDir}`);
  }
  
  // Read package info
  const packageInfoPath = path.join(packDir, 'package-info.json');
  if (!fs.existsSync(packageInfoPath)) {
    throw new Error(`Package info not found: ${packageInfoPath}`);
  }
  const packageInfo = JSON.parse(fs.readFileSync(packageInfoPath, 'utf-8'));
  
  // Read challenges
  const challengesPath = path.join(packDir, 'challenges.json');
  if (!fs.existsSync(challengesPath)) {
    throw new Error(`Challenges file not found: ${challengesPath}`);
  }
  const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf-8'));
  
  console.log(`📦 Loaded pack: ${packageInfo.name}`);
  console.log(`   Version: ${packageInfo.version}`);
  console.log(`   Challenges: ${challenges.length}`);
  console.log(`   Total Points: ${packageInfo.total_points}`);
  
  return { packageInfo, challenges };
}

/**
 * Get list of available packs
 */
function getAvailablePacks() {
  const entries = fs.readdirSync(__dirname, { withFileTypes: true });
  const packs = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => {
      // Must have both package-info.json and challenges.json
      const packageInfoExists = fs.existsSync(path.join(__dirname, name, 'package-info.json'));
      const challengesExist = fs.existsSync(path.join(__dirname, name, 'challenges.json'));
      return packageInfoExists && challengesExist;
    });
  
  return packs;
}

/**
 * Transform challenge JSON to database row format
 */
function transformChallenge(challenge, index) {
  return {
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    category: challenge.category,
    points: challenge.points,
    flag_hash: hashFlag(challenge.flag),
    is_active: challenge.is_active,
    metadata: JSON.stringify(challenge.metadata),
    order_index: index + 1
  };
}

/**
 * Seed challenges to database
 * @param {Object} knexInstance - Optional knex instance (creates own if not provided)
 */
async function seed(knexInstance = null) {
  const knex = knexInstance || dbConfig.default;
  
  try {
    console.log('\n🌱 Challenge Pack Seeder\n');
    console.log('='.repeat(50));
    
    // Determine which packs to load
    const requestedPack = process.env.PACK;
    let packsToLoad = [];
    
    if (requestedPack) {
      if (!getAvailablePacks().includes(requestedPack)) {
        console.error(`❌ Pack not found: ${requestedPack}`);
        console.log('\nAvailable packs:');
        getAvailablePacks().forEach(pack => console.log(`   - ${pack}`));
        process.exit(1);
      }
      packsToLoad = [requestedPack];
      console.log(`\n📦 Loading specific pack: ${requestedPack}\n`);
    } else {
      packsToLoad = getAvailablePacks();
      console.log(`\n📦 Loading all packs (${packsToLoad.length} found)\n`);
    }
    
    let totalChallengesAdded = 0;
    let totalPoints = 0;
    
    for (const packName of packsToLoad) {
      console.log(`\n${'─'.repeat(50)}`);
      
      try {
        const { packageInfo, challenges } = loadPack(packName);
        
        // Transform challenges
        const challengeRows = challenges.map((challenge, index) => 
          transformChallenge(challenge, index)
        );
        
        // Insert into database
        console.log(`\n🔄 Inserting ${challengeRows.length} challenges into database...`);
        
        for (const challenge of challengeRows) {
          await knex('challenges').insert(challenge);
          console.log(`   ✓ ${challenge.title} (${challenge.points} pts)`);
        }
        
        totalChallengesAdded += challengeRows.length;
        totalPoints += packageInfo.total_points;
        
        console.log(`\n✅ Pack "${packageInfo.name}" seeded successfully!`);
        
      } catch (error) {
        console.error(`\n❌ Error loading pack "${packName}":`, error.message);
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`\n🎉 Seeding Complete!\n`);
    console.log(`📊 Summary:`);
    console.log(`   Packs loaded: ${packsToLoad.length}`);
    console.log(`   Total challenges: ${totalChallengesAdded}`);
    console.log(`   Total points: ${totalPoints}`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    // Only destroy connection if we created it (standalone mode)
    if (!knexInstance) {
      await knex.destroy();
    }
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seed, loadPack, getAvailablePacks, transformChallenge, hashFlag };
