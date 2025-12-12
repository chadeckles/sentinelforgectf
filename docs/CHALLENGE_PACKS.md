# Challenge Packs Guide

## 📦 What are Challenge Packs?

Challenge packs are modular collections of CTF challenges stored as JSON files. They make it easy to:
- Add new challenges without touching TypeScript code
- Share and distribute challenge sets
- Version control challenge content separately
- Mix and match different challenge collections
- Validate challenges before loading them

## 🏗️ Architecture

```
challenge-packs/
├── pack-loader.js          # Loads packs into database
├── validate-packs.js       # Validates pack structure
├── demo-pack/              # Example: Free demo challenges
│   ├── package-info.json   # Pack metadata
│   └── challenges.json     # Challenge definitions
├── azure-fundamentals/     # Example: Azure basics pack
│   ├── package-info.json
│   └── challenges.json
└── [your-pack]/            # Your custom pack
    ├── package-info.json
    └── challenges.json
```

## 🚀 Quick Start

### Loading All Challenge Packs

**Option 1: Restart Containers (Recommended for fresh setup)**

The easiest way to load challenge packs is to restart your Docker containers:

```bash
# Stop and restart (runs migrations + seeds automatically)
docker-compose restart backend

# Or rebuild everything from scratch
docker-compose down -v
docker-compose up -d --build
```

This automatically:
1. ✅ Runs database migrations
2. ✅ Loads all challenge packs from `challenge-packs/` directory
3. ✅ Hashes all flags securely
4. ✅ Creates sample users and achievements

**Option 2: Manual Seed (For live events - no disruption)**

If your event is already running and you don't want to restart containers:

```bash
cd backend
npm run db:seed
```

This adds new challenges without affecting running containers or active users.

### Loading Specific Packs

Load only specific challenge packs using the `PACK` environment variable:

```bash
# Load only demo pack
PACK=demo-pack npm run db:seed

# Load only azure fundamentals
PACK=azure-fundamentals npm run db:seed

# Load multiple packs (comma-separated)
PACK=demo-pack,azure-fundamentals npm run db:seed
```

### Validation Before Loading

Always validate your packs before seeding:

```bash
cd challenge-packs
node validate-packs.js
```

This checks:
- ✅ Valid JSON syntax
- ✅ Required fields present
- ✅ Correct difficulty values
- ✅ No duplicate flags
- ✅ Points are reasonable

## 📝 Creating a New Challenge Pack

### Step 1: Create Pack Directory

```bash
cd challenge-packs
mkdir my-awesome-pack
cd my-awesome-pack
```

### Step 2: Create `package-info.json`

This file contains metadata about your pack:

```json
{
  "name": "My Awesome Pack",
  "version": "1.0.0",
  "description": "A collection of awesome security challenges",
  "author": "Your Name",
  "category": "Cloud Security",
  "difficulty_level": "medium",
  "challenge_count": 5,
  "total_points": 1000,
  "prerequisites": [
    "Basic Azure knowledge",
    "Understanding of IAM"
  ],
  "learning_outcomes": [
    "Master Azure security",
    "Understand access control"
  ],
  "tags": [
    "azure",
    "iam",
    "security"
  ]
}
```

### Step 3: Create `challenges.json`

This file contains your challenge definitions as a JSON array:

```json
[
  {
    "title": "Storage Account Misconfiguration",
    "description": "Find the exposed data in the misconfigured Azure Storage account.\n\nYou have access to the Azure CLI terminal. Investigate the storage account and find the flag.",
    "difficulty": "easy",
    "category": "Cloud Security",
    "points": 100,
    "flag": "flag{public_storage_is_bad}",
    "order_index": 0,
    "metadata": {
      "hints": [
        {
          "text": "Check the public access level of the storage account",
          "cost": 10
        },
        {
          "text": "Use 'az storage blob list' to see the contents",
          "cost": 20
        }
      ],
      "learning_resources": [
        {
          "title": "Azure Storage Security",
          "url": "https://learn.microsoft.com/en-us/azure/storage/common/storage-security-guide"
        }
      ],
      "terminalWindows": [
        {
          "id": "azure-cli",
          "title": "Azure CLI",
          "commands": [
            {
              "command": "az storage account list",
              "output": "[\n  {\n    \"name\": \"mystorageaccount\",\n    \"publicAccess\": \"Blob\"\n  }\n]"
            }
          ]
        }
      ]
    }
  },
  {
    "title": "Second Challenge",
    "description": "Your second challenge description...",
    "difficulty": "medium",
    "category": "Cloud Security",
    "points": 200,
    "flag": "flag{another_flag}",
    "order_index": 1,
    "metadata": null
  }
]
```

### Step 4: Validate Your Pack

```bash
cd challenge-packs
node validate-packs.js
```

If validation passes, you'll see:
```
✅ Validated: my-awesome-pack (5 challenges)
```

### Step 5: Load Your Pack

```bash
cd backend
PACK=my-awesome-pack npm run db:seed
```

## 📋 Challenge Schema Reference

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Challenge name | `"Storage Misconfiguration"` |
| `description` | string | Full challenge description (supports markdown) | `"Find the exposed data..."` |
| `difficulty` | string | One of: `easy`, `medium`, `hard`, `expert` | `"easy"` |
| `category` | string | Challenge category for filtering | `"Cloud Security"` |
| `points` | number | Points awarded for solving | `100` |
| `flag` | string | The correct flag (will be hashed) | `"flag{answer}"` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `order_index` | number | Custom ordering within category | `0` |
| `is_active` | boolean | Whether challenge is visible | `true` |
| `max_attempts` | number | Limit submission attempts (null = unlimited) | `null` |
| `metadata` | object | Additional challenge data (see below) | `null` |

### Metadata Object

The `metadata` field can contain:

```json
{
  "hints": [
    {
      "text": "Hint text that helps solve the challenge",
      "cost": 10
    }
  ],
  "learning_resources": [
    {
      "title": "Resource Title",
      "url": "https://example.com"
    }
  ],
  "terminalWindows": [
    {
      "id": "terminal-1",
      "title": "Terminal Title",
      "commands": [
        {
          "command": "ls -la",
          "output": "total 48\ndrwxr-xr-x  12 user  staff   384 Dec 12 10:00 ."
        }
      ]
    }
  ],
  "fileViewers": [
    {
      "id": "files-1",
      "title": "Project Files",
      "files": [
        {
          "name": "config.json",
          "content": "{\n  \"apiKey\": \"secret\"\n}",
          "language": "json"
        }
      ]
    }
  ]
}
```

## 🎯 Best Practices

### Flag Format
- **Use the `flag{}` format**: `flag{descriptive_name}`
- **Use underscores, not spaces**: `flag{good_flag}` not `flag{bad flag}`
- **Use lowercase**: `flag{lowercase}` not `flag{UPPERCASE}`
- **Be descriptive**: `flag{exposed_api_key}` not `flag{flag1}`

### Points Distribution
- **Easy**: 50-150 points
- **Medium**: 150-250 points
- **Hard**: 250-400 points
- **Expert**: 400-500 points

### Hints
- Provide 2-3 hints per challenge
- First hint: 10-20% of total points
- Second hint: 20-30% of total points
- Third hint: 30-40% of total points

### Descriptions
- Use clear, detailed descriptions
- Include learning context
- Explain what skills are being tested
- Use markdown for formatting
- Include success criteria

### Categories
Use consistent category names:
- `Trivia` - Knowledge questions
- `Cloud Security` - Cloud misconfigurations
- `Container Security` - Docker/K8s challenges
- `Infrastructure as Code` - Terraform/IaC
- `DevSecOps` - CI/CD security

## 🔧 Advanced Usage

### Testing Pack Loader Directly

```bash
cd challenge-packs
node pack-loader.js
```

This runs the pack loader standalone (useful for debugging).

### Custom Database Connection

The pack-loader can accept a Knex instance or use the default database config:

```javascript
const { seed } = require('./challenge-packs/pack-loader.js');

// Use with custom knex instance
await seed(knexInstance);

// Or use default connection from dbConfig
await seed();
```

### Filtering Loaded Packs

Set the `PACK` environment variable before seeding:

```bash
# In .env file
PACK=demo-pack,azure-fundamentals

# Or inline
PACK=demo-pack npm run db:seed
```

## 🐛 Troubleshooting

### "Pack loader not found"
- Ensure you're running from the project root
- Check that `challenge-packs/pack-loader.js` exists
- Verify file permissions

### "No challenges found in pack"
- Check that `challenges.json` exists and is valid JSON
- Ensure it's an array of challenge objects
- Run `validate-packs.js` to check for errors

### "Invalid difficulty value"
- Must be exactly: `easy`, `medium`, `hard`, or `expert`
- Check for typos or extra spaces
- Difficulty is case-sensitive (lowercase)

### "Duplicate flag detected"
- Each flag must be unique across all packs
- Check for copy-paste errors
- Use descriptive, unique flags

### Database connection errors
- Ensure PostgreSQL is running
- Check `backend/.env` database credentials
- Verify database exists: `npm run db:migrate`

## 📚 Example Packs

### Simple Q&A Pack

Perfect for trivia or knowledge checks:

```json
[
  {
    "title": "What is Azure?",
    "description": "Microsoft's cloud platform is called ___?",
    "difficulty": "easy",
    "category": "Trivia",
    "points": 50,
    "flag": "flag{azure}",
    "metadata": {
      "hints": [
        {"text": "It's a color of the sky", "cost": 10}
      ]
    }
  }
]
```

### Terminal-Based Pack

Interactive terminal challenges:

```json
[
  {
    "title": "Find the Secret",
    "description": "Use the Azure CLI to find the storage account key.",
    "difficulty": "medium",
    "category": "Cloud Security",
    "points": 200,
    "flag": "flag{st0r4g3_k3y_3xp0s3d}",
    "metadata": {
      "terminalWindows": [
        {
          "id": "main",
          "title": "Azure CLI",
          "commands": [
            {
              "command": "az storage account keys list --account-name mystorage",
              "output": "[\n  {\n    \"keyName\": \"key1\",\n    \"value\": \"st0r4g3_k3y_3xp0s3d\"\n  }\n]"
            }
          ]
        }
      ],
      "hints": [
        {"text": "List the storage account keys", "cost": 20}
      ]
    }
  }
]
```

## 🎓 Resources

- **[ARCHITECTURE.md](../challenge-packs/ARCHITECTURE.md)** - Technical details about the pack system
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - General platform administration
- **[Demo Pack](../challenge-packs/demo-pack/)** - Example pack to study

## 💡 Need Help?

- Check existing packs in `challenge-packs/` for examples
- Run `validate-packs.js` to catch errors early
- Review the demo pack structure
- Open an issue on GitHub for support

---

**Ready to create amazing challenges? Start building your pack today! 🚀**
