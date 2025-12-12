#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Challenge Pack Loader - TEST MODE
 * Validates JSON structure and simulates database inserts
 */

/**
 * Hash a flag using SHA256
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
 * Test pack loading and transformation
 */
function testPack() {
  console.log('\n🧪 Challenge Pack Loader - TEST MODE\n');
  console.log('='.repeat(60));
  
  const packName = process.env.PACK || 'azure-fundamentals';
  
  try {
    console.log(`\n📦 Testing pack: ${packName}\n`);
    
    const { packageInfo, challenges } = loadPack(packName);
    
    console.log(`\n${'─'.repeat(60)}`);
    console.log('\n🔄 Transforming challenges to database format...\n');
    
    let totalPoints = 0;
    const transformedChallenges = [];
    
    challenges.forEach((challenge, index) => {
      const row = transformChallenge(challenge, index);
      transformedChallenges.push(row);
      totalPoints += challenge.points;
      
      console.log(`   ${index + 1}. ${row.title}`);
      console.log(`      Category: ${row.category}`);
      console.log(`      Difficulty: ${row.difficulty}`);
      console.log(`      Points: ${row.points}`);
      console.log(`      Flag Hash: ${row.flag_hash.substring(0, 16)}...`);
      console.log(`      Metadata size: ${row.metadata.length} bytes`);
      console.log('');
    });
    
    console.log(`${'─'.repeat(60)}`);
    console.log('\n✅ Validation Summary:\n');
    console.log(`   Pack Name: ${packageInfo.name}`);
    console.log(`   Version: ${packageInfo.version}`);
    console.log(`   Challenges: ${transformedChallenges.length}`);
    console.log(`   Total Points: ${totalPoints}`);
    console.log(`   Expected Points: ${packageInfo.total_points}`);
    
    if (totalPoints === packageInfo.total_points) {
      console.log(`   ✅ Point totals match!`);
    } else {
      console.log(`   ⚠️  Point mismatch! (${totalPoints} vs ${packageInfo.total_points})`);
    }
    
    console.log('\n📋 Database Rows Ready:');
    console.log(`   ${transformedChallenges.length} challenges ready for insertion`);
    console.log(`   All flags hashed with SHA256`);
    console.log(`   Metadata serialized as JSON strings`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Run validation: node ../validate-packs.js');
    console.log('   2. Test database insert: npm run seed (from backend/)');
    console.log('   3. Verify in production');
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    return transformedChallenges;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testPack();
}

module.exports = { testPack, loadPack, transformChallenge, hashFlag };
