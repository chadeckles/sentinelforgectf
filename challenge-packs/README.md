# SentinelForge CTF Challenge Packs

Modular JSON-based challenge packs for the SentinelForge CTF platform.

## 📦 What's Included

This directory contains:
- **Demo Pack** - Free demonstration challenges (included in base platform)
- **Utilities** - Pack loader and validation tools
- **Documentation** - Architecture and technical guides

## 📚 Creating Challenge Packs

Challenge packs are JSON files that define CTF challenges. Each pack contains:
- `package-info.json` - Pack metadata
- `challenges.json` - Challenge definitions

**See [CHALLENGE_PACKS.md](../docs/CHALLENGE_PACKS.md)** for complete documentation on creating and loading challenge packs.

## 🛠️ Utilities

### Validate Packs
```bash
node validate-packs.js
```

### Test Loading
```bash
node pack-loader.js
```

## 🛠️ Usage

### For Users

📚 **See [CHALLENGE_PACKS.md](../docs/CHALLENGE_PACKS.md) for complete user documentation** including:
- How to load challenge packs
- Creating custom packs
- Challenge schema reference
- Examples and troubleshooting

### For Developers

**Validate Packs**
```bash
node validate-packs.js
```

**Test Loading**
```bash
node pack-loader.js
```

**Integration**
This repo is consumed by the main CTF platform:
1. Pack loader dynamically reads challenge packs
2. Backend seed script imports via pack-loader.js
3. Challenges seeded into PostgreSQL database

## 📚 Documentation

For complete documentation on creating, validating, and loading challenge packs, see:
- **[Challenge Packs Guide](../docs/CHALLENGE_PACKS.md)** - Complete user guide
- **[Architecture](./ARCHITECTURE.md)** - Technical implementation details

## 🔧 Integration

Challenge packs are automatically loaded when you run database seeds:
```bash
cd backend
npm run db:seed
```

The pack loader reads all pack directories and imports challenges into the database.

## 💡 Getting More Packs

Additional challenge packs are available on [Ko-fi](https://ko-fi.com/sentinelforgectf).

## 🤝 Contributing

Want to create your own challenge packs? See the [Challenge Packs Guide](../docs/CHALLENGE_PACKS.md) for complete instructions.
