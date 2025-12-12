# Challenge Pack Architecture

## Problem
Creating massive TypeScript seed files with complex template strings leads to:
- Escaping nightmares
- Difficult to edit and maintain
- Syntax errors are hard to debug
- Copy-paste doesn't scale

## Solution: Modular JSON + Generator

### Structure
```
challenge-packs/
├── README.md
├── pack-loader.ts          # Master seed generator
├── validate-packs.js       # Pre-flight validation
├── azure-fundamentals/
│   ├── README.md
│   ├── challenges.json     # Simple JSON definitions
│   └── package-info.json   # Pack metadata
├── container-security/
│   ├── README.md
│   ├── challenges.json
│   └── package-info.json
└── [other-packs]/
```

### Benefits
1. **JSON is easier** - No escaping issues, just data
2. **Validate before seed** - Catch errors early
3. **Mix and match** - Load specific packs or all at once
4. **Easy editing** - Any text editor, no TypeScript knowledge needed
5. **Version control friendly** - Clear diffs, easy merging

### Usage
```bash
# Seed all packs via backend seed file
cd backend && npm run db:seed

# Or test pack-loader directly
node challenge-packs/pack-loader.js

# Validate before seeding
node challenge-packs/validate-packs.js
```

## Implementation Plan

### 1. Create `challenges.json` Format
```json
{
  "title": "Public Storage Exposure",
  "description": "Multi-line descriptions...",
  "type": "terminal",
  "difficulty": "easy",
  "category": "Azure",
  "points": 100,
  "flag": "flag{publ1c_bl0bs_ar3_a_b1g_n0}",
  "metadata": {
    "hints": [
      {"text": "Hint text here", "cost": 10}
    ],
    "terminal": [
      {"command": "az storage account list", "output": "..."}
    ],
    "learning_resources": [...]
  }
}
```

### 2. Create `pack-loader.js`
- Reads all pack JSON files
- Generates challenge objects with hashed flags
- Inserts into database
- Handles errors gracefully

### 3. Create `validate-packs.js`
- Checks JSON syntax
- Validates required fields
- Detects duplicate flags
- Reports issues before seeding

## Implementation Status
1. ✅ Converted demo challenges to JSON
2. ✅ Built pack-loader.js
3. ✅ Built validator
4. ✅ Created 6 challenge packs (40 total challenges)
5. ✅ Documented for future packs
