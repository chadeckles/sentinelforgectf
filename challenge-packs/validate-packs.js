#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validate Challenge Pack JSON Files
 * Run this before seeding to catch errors early
 */

const REQUIRED_CHALLENGE_FIELDS = [
  'title',
  'description',
  'difficulty',
  'category',
  'points',
  'flag',
  'is_active',
  'metadata'
];

const VALID_CATEGORIES = ['Trivia', 'Cloud Security', 'Container Security', 'Infrastructure as Code', 'DevSecOps', 'IAM'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

let errors = [];
let warnings = [];

function validatePackInfo(packName, infoPath) {
  console.log(`\n📦 Validating ${packName}/package-info.json...`);
  
  if (!fs.existsSync(infoPath)) {
    errors.push(`${packName}: package-info.json not found`);
    return false;
  }
  
  try {
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    
    if (!info.name) warnings.push(`${packName}: Missing name in package-info.json`);
    if (!info.version) warnings.push(`${packName}: Missing version in package-info.json`);
    if (!info.challenge_count) warnings.push(`${packName}: Missing challenge_count in package-info.json`);
    
    console.log(`   ✅ Valid package info`);
    return true;
  } catch (error) {
    errors.push(`${packName}: Invalid JSON in package-info.json - ${error.message}`);
    return false;
  }
}

function validateChallenges(packName, challengesPath) {
  console.log(`\n🎯 Validating ${packName}/challenges.json...`);
  
  if (!fs.existsSync(challengesPath)) {
    errors.push(`${packName}: challenges.json not found`);
    return false;
  }
  
  try {
    const challenges = JSON.parse(fs.readFileSync(challengesPath, 'utf-8'));
    
    if (!Array.isArray(challenges)) {
      errors.push(`${packName}: challenges.json must be an array`);
      return false;
    }
    
    console.log(`   Found ${challenges.length} challenges`);
    
    // Track flags for duplicates
    const flags = new Set();
    const titles = new Set();
    
    challenges.forEach((challenge, index) => {
      const prefix = `${packName}[${index}]`;
      
      // Check required fields
      REQUIRED_CHALLENGE_FIELDS.forEach(field => {
        if (!(field in challenge)) {
          errors.push(`${prefix}: Missing required field "${field}"`);
        }
      });
      
      // Validate category
      if (challenge.category && !VALID_CATEGORIES.includes(challenge.category)) {
        errors.push(`${prefix}: Invalid category "${challenge.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
      }
      
      // Validate difficulty
      if (challenge.difficulty && !VALID_DIFFICULTIES.includes(challenge.difficulty)) {
        errors.push(`${prefix}: Invalid difficulty "${challenge.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
      }
      
      // Validate points
      if (typeof challenge.points !== 'number' || challenge.points < 0) {
        errors.push(`${prefix}: Points must be a positive number`);
      }
      
      // Check for duplicate flags
      if (challenge.flag) {
        if (flags.has(challenge.flag)) {
          errors.push(`${prefix}: Duplicate flag "${challenge.flag}"`);
        }
        flags.add(challenge.flag);
        
        // Validate flag format
        if (!challenge.flag.startsWith('flag{') || !challenge.flag.endsWith('}')) {
          warnings.push(`${prefix}: Flag should follow format "flag{...}"`);
        }
      }
      
      // Check for duplicate titles
      if (challenge.title) {
        if (titles.has(challenge.title)) {
          warnings.push(`${prefix}: Duplicate title "${challenge.title}"`);
        }
        titles.add(challenge.title);
      }
      
      // Validate metadata
      if (challenge.metadata) {
        if (challenge.metadata.hints && !Array.isArray(challenge.metadata.hints)) {
          errors.push(`${prefix}: metadata.hints must be an array`);
        }
        
        if (challenge.metadata.terminal && !Array.isArray(challenge.metadata.terminal)) {
          errors.push(`${prefix}: metadata.terminal must be an array`);
        }
        
        if (challenge.metadata.learning_resources && !Array.isArray(challenge.metadata.learning_resources)) {
          errors.push(`${prefix}: metadata.learning_resources must be an array`);
        }
      }
      
      console.log(`   ✓ Challenge ${index + 1}: ${challenge.title || '(untitled)'} (${challenge.points || 0} pts)`);
    });
    
    return true;
  } catch (error) {
    errors.push(`${packName}: Invalid JSON in challenges.json - ${error.message}`);
    return false;
  }
}

function validatePack(packName) {
  const packDir = path.join(__dirname, packName);
  
  if (!fs.statSync(packDir).isDirectory()) {
    return false;
  }
  
  const infoPath = path.join(packDir, 'package-info.json');
  const challengesPath = path.join(packDir, 'challenges.json');
  
  const infoValid = validatePackInfo(packName, infoPath);
  const challengesValid = validateChallenges(packName, challengesPath);
  
  return infoValid && challengesValid;
}

function main() {
  console.log('🔍 Challenge Pack Validator\n');
  console.log('==========================================\n');
  
  // Get all pack directories
  const entries = fs.readdirSync(__dirname, { withFileTypes: true });
  const packs = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => {
      // Skip common non-pack directories
      return !['node_modules', '.git', 'dist'].includes(name);
    });
  
  console.log(`Found ${packs.length} potential pack(s): ${packs.join(', ')}\n`);
  
  packs.forEach(pack => {
    validatePack(pack);
  });
  
  // Print summary
  console.log('\n==========================================\n');
  console.log('📊 Validation Summary:\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All packs validated successfully!\n');
    process.exit(0);
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  Warnings (${warnings.length}):\n`);
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log(`❌ Errors (${errors.length}):\n`);
    errors.forEach(error => console.log(`   ${error}`));
    console.log('\n');
    console.error('❌ Validation failed! Fix errors before seeding.\n');
    process.exit(1);
  }
  
  console.log('⚠️  Validation passed with warnings.\n');
  process.exit(0);
}

main();
