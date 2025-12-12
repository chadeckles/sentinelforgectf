# 🛡️ SentinelForge CTF - Administrator Guide

**Complete guide for setting up, deploying, and managing your CTF platform**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Configuration](#database-configuration)
4. [Cloud Deployment (Optional)](#cloud-deployment-optional)
5. [Troubleshooting](#troubleshooting)
6. [Creating Challenges](#creating-challenges)
7. [API Reference](#api-reference)
8. [Maintenance & Operations](#maintenance--operations)

---

## Prerequisites

### Required Software

- **Docker** and **Docker Compose** (primary deployment method)
- **Git** for version control
- **Node.js** 18+ and npm (for local development only)

### Optional (For Manual Setup Without Docker)

- **PostgreSQL** 14+ (if not using Docker)
- **nginx** or **Caddy** (for reverse proxy/SSL)

### Recommended Tools

- **VS Code** with extensions: ESLint, Prettier, Database Client
- **Postman** or **curl** for API testing

---

## Local Development Setup

### Option 1: PostgreSQL (Recommended for Development)

#### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql-14
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### 2. Create Database

```bash
psql postgres
CREATE DATABASE sentinelforge_ctf;
CREATE USER ctf_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sentinelforge_ctf TO ctf_admin;
\q
```

#### 3. Configure Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sentinelforge_ctf
DB_USER=ctf_admin
DB_PASSWORD=your_password

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
EOF
```

#### 4. Run Migrations & Seeds

```bash
npm run migrate
npm run seed
```

#### 5. Start Backend

```bash
npm run dev
# Backend running on http://localhost:3000
```

### Option 2: External Database (Production)

If using a managed database service:

#### 1. Get Connection Details

Obtain connection details from your database provider's console.

#### 2. Configure Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3000

# External Database (PostgreSQL or MSSQL)
DB_CLIENT=pg  # or 'mssql' for SQL Server
DB_HOST=your-database-host
DB_PORT=5432  # or 1433 for MSSQL
DB_NAME=sentinelforge-ctf
DB_USER=dbadmin
DB_PASSWORD=your_db_password
DB_ENCRYPT=true  # for MSSQL

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
EOF
```

#### 3. Run Migrations

```bash
npm run migrate
npm run seed
```

**⚠️ MSSQL Note:** SQL Server uses different syntax than PostgreSQL:
- Booleans: `1/0` instead of `true/false`
- JSON: Stored as strings, requires `JSON.parse()`

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF

npm run dev
# Frontend running on http://localhost:3001
```

### Verify Installation

1. Open http://localhost:3001
2. Register a new user
3. Browse challenges
4. Submit a flag (try: `FLAG{TEST_FLAG_001}` for "Azure Blob Storage" challenge)
5. Check scoreboard updates

---

## Database Configuration

### PostgreSQL vs SQL Server

| Feature | PostgreSQL | SQL Server |
|---------|-----------|------------|
| **Development** | ✅ Best choice | ⚠️ Possible |
| **Production** | ✅ Works great | ✅ Works great |
| **Cost** | Free (self-host) | Varies by provider |
| **Booleans** | `true/false` | `1/0` |
| **JSON** | Native | String (parse) |
| **Setup** | Easier | More config |

### Schema Overview

**Core Tables:**
- `users` - Authentication, profiles
- `teams` - Team management (optional)
- `challenges` - Challenge definitions
- `submissions` - Flag submissions, timestamps
- `scoreboard_cache` - Real-time rankings
- `hint_unlocks` - User hint tracking
- `achievements` - Badge system

### Migration Commands

```bash
# Create new migration
npm run migrate:make migration_name

# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Reset database (⚠️ deletes all data)
npm run migrate:rollback --all
npm run migrate
```

### Seeding Data

```bash
# Run all seed files
npm run seed

# Create new seed file
npm run seed:make seed_name
```

### Database Backup

**PostgreSQL:**
```bash
pg_dump sentinelforge_ctf > backup_$(date +%Y%m%d).sql
```

**SQL Server:**
```bash
# Use your provider's console for automated backups
# Or manual backup via command line (if supported by provider)
```

---

## Cloud Deployment (Optional)

**⚠️ Note:** SentinelForge is designed for self-hosting via Docker. The primary deployment method is `docker-compose` on your own infrastructure. This section provides general guidance if you want to host it on a cloud platform.

### General Approach

SentinelForge runs anywhere Docker runs. Choose any cloud provider or VPS that supports Docker, such as:

- Major cloud providers (Azure, AWS, Google Cloud)
- VPS providers (DigitalOcean, Linode, Vultr, Hetzner, etc.)
- Your own on-premises infrastructure

### Recommended: Docker on a VPS

The simplest approach is to run `docker-compose` on a virtual machine:

**1. Provision a VM:**
- 2 CPU cores minimum
- 4GB RAM minimum
- 20GB storage
- Ubuntu 22.04 LTS or similar

**2. Install Docker:**
```bash
# SSH into your VM
ssh user@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker compose version
```

**3. Deploy SentinelForge:**
```bash
# Clone repository
git clone https://github.com/chadeckles/sentinelforgectf.git
cd sentinelforge-ctf

# Configure environment
cp .env.example .env
nano .env  # Edit with your secrets

# Start platform
docker compose up -d

# View logs
docker compose logs -f
```

**4. Configure firewall:**
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**5. Set up reverse proxy (Optional - for SSL):**

Use nginx or Caddy for HTTPS:

```bash
# Install Caddy (automatic SSL)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddyfile
sudo nano /etc/caddy/Caddyfile
```

```caddyfile
your-domain.com {
    reverse_proxy localhost:80
}
```

```bash
# Reload Caddy
sudo systemctl reload caddy
```

### Environment Variables for Production

Update your `.env` file for production:

```bash
# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Database (use strong password)
DB_USER=sentinelforge
DB_PASSWORD=$(openssl rand -base64 20)
DB_NAME=sentinelforge_ctf

# Admin account
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>

# Node environment
NODE_ENV=production
```

### Database Considerations

**Option 1: PostgreSQL in Docker (Default)**
- Included in `docker-compose.yml`
- Data persists in Docker volumes
- Good for small-to-medium deployments

**Option 2: Managed Database**
- More reliable for production
- Automatic backups
- Examples: Azure Database for PostgreSQL, AWS RDS, DigitalOcean Managed Databases
- Update `.env` with external database connection details

### Backup Strategy

**Automatic backups with cron:**

```bash
# Create backup script
cat > /root/backup-sentinelforge.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/sentinelforge-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec sentinelforge-db pg_dump -U sentinelforge sentinelforge_ctf > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup-sentinelforge.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-sentinelforge.sh
```

### Monitoring

**Check container status:**
```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

**Resource usage:**
```bash
docker stats
```

### Scaling

**Vertical scaling (more resources):**
- Upgrade your VM size

**Horizontal scaling:**
- Use a load balancer
- Run multiple backend instances
- Use external PostgreSQL database
- Consider container orchestration (Kubernetes, Docker Swarm)

### Resource Requirements

**Small deployment (< 50 concurrent users):**
- 2 CPU cores minimum
- 4GB RAM minimum
- 20GB storage

**Medium deployment (< 200 concurrent users):**
- 4 CPU cores
- 8GB RAM
- 50GB storage
- Consider managed database for better reliability

**Large deployment (200+ concurrent users):**
- 8+ CPU cores
- 16GB+ RAM
- Consider horizontal scaling with load balancing
- Use managed database service

### Security Checklist

- [ ] Use strong passwords for all accounts
- [ ] Enable firewall (UFW or cloud firewall)
- [ ] Set up SSL/HTTPS
- [ ] Regular OS security updates (`sudo apt update && sudo apt upgrade`)
- [ ] Regular Docker image updates
- [ ] Database backups enabled
- [ ] Change default admin credentials
- [ ] Restrict SSH access (key-based auth only)

### Alternative: Managed Container Services

If you prefer managed container services over managing your own VM:

Most cloud providers offer managed container platforms that can run Docker containers. These typically require:
- Converting `docker-compose.yml` to the provider's format
- Pushing images to a container registry
- Configuring environment variables through their console/CLI

Consult your cloud provider's documentation for their specific container deployment process.

⚠️ **Note:** Managed services may have different pricing models and configurations compared to running Docker on a VM.

### Support

For deployment help:
- Check [DOCKER_INSTALL.md](../DOCKER_INSTALL.md) for Docker basics
- See [GitHub Discussions](https://github.com/chadeckles/sentinelforgectf/discussions) for community support
- Review provider-specific documentation for your chosen cloud platform

---

## Troubleshooting

### Common Issues

#### 1. Scoring Shows 0 Points (SQL Server)

**Problem:** Correct flag submitted but scoreboard shows 0 points

**Cause:** SQL Server stores booleans as `1/0`, not `true/false`

**Solution:**
```javascript
// ❌ Wrong (PostgreSQL syntax)
.where({ is_correct: true })

// ✅ Correct (SQL Server compatible)
.where({ is_correct: 1 })
```

**Quick Fix:**
```bash
cd backend
node fix-scoreboard.js  # Rebuilds scoreboard from submissions
```

#### 2. Metadata Field Empty (Terminal/Files Not Showing)

**Problem:** Challenge detail page shows no terminal or files

**Cause:** Metadata field not included in API response or JSON not parsed

**Solution:**

In `backend/src/routes/challenge.routes.ts`:

```javascript
// Add metadata to SELECT
.select(
  'challenges.*',
  db.raw('challenges.metadata as metadata')  // Add this
)

// Parse JSON for SQL Server
.map(challenge => ({
  ...challenge,
  metadata: typeof challenge.metadata === 'string' 
    ? JSON.parse(challenge.metadata) 
    : challenge.metadata
}))
```

#### 3. Hint Not Persisting After Unlock

**Problem:** Unlocked hint shows as locked after page refresh

**Cause:** Frontend not fetching unlocked hints on mount

**Solution:**

In `frontend/src/pages/ChallengeDetailPage.jsx`:

```javascript
useEffect(() => {
  fetchChallengeDetails();
  fetchUnlockedHints();  // Add this
}, [id]);

const fetchUnlockedHints = async () => {
  try {
    const res = await fetch(`${API_URL}/challenges/${id}/unlocked-hints`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRevealedHints(data.unlockedHints || []);
  } catch (err) {
    console.error('Failed to fetch unlocked hints:', err);
  }
};
```

#### 4. Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

#### 5. Database Connection Refused

**PostgreSQL (Docker):**
```bash
# Check if container is running
docker compose ps postgres

# View logs
docker compose logs postgres

# Restart container
docker compose restart postgres
```

**PostgreSQL (Local):**
```bash
# Check if running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Restart
brew services restart postgresql@14
```

#### 6. JWT Token Invalid

**Problem:** 401 Unauthorized errors

**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Update .env
JWT_SECRET=<new_secret>

# Restart server
npm run dev
```

#### 7. Frontend Can't Reach Backend (CORS)

**Problem:** `Access-Control-Allow-Origin` error

**Solution:**

In `backend/src/server.ts`:

```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-frontend.azurewebsites.net'
    : 'http://localhost:3001',
  credentials: true
}));
```

---

## Creating Challenges

### Using Challenge Packs (Recommended)

**SentinelForge uses a modular challenge pack system.** Instead of editing TypeScript seed files, create JSON-based challenge packs.

📦 **See the [Challenge Packs Guide](./CHALLENGE_PACKS.md) for complete instructions** on:
- Creating new challenge packs
- Loading and validating packs
- Challenge schema reference
- Examples and best practices

### Quick Challenge Pack Example

```json
[
  {
    "title": "Storage Misconfiguration",
    "description": "Find the exposed data...",
    "difficulty": "easy",
    "category": "Cloud Security",
    "points": 100,
    "flag": "flag{your_flag_here}",
    "metadata": {
      "hints": [
        {"text": "Check public access", "cost": 10}
      ]
    }
  }
]
```

Place this in `challenge-packs/my-pack/challenges.json` and run `npm run db:seed`.

### Challenge Categories

Challenges are organized by security domain (displayed to users):

1. **Trivia** - Cloud computing and security knowledge questions
2. **Cloud Security** - Azure/AWS/GCP misconfigurations and vulnerabilities
3. **Container Security** - Docker, Kubernetes, and container escape scenarios
4. **Infrastructure as Code** - Terraform, ARM templates, and IaC security
5. **DevSecOps** - CI/CD pipelines, secret scanning, supply chain security

**Note:** Challenges use the `category` field for organization and filtering. The legacy `type` field has been removed from the schema as of December 2025 to allow more flexible challenge pack design.

### Challenge Structure

```javascript
{
  id: 1,
  title: "Challenge Name",
  description: "What the user sees",
  category: "Cloud Security",  // Main category for filtering and organization
  difficulty: "easy",  // easy, medium, hard, expert
  points: 100,
  flag: "FLAG{SECRET_VALUE}",
  order_index: 0,  // Optional: custom ordering within category
  metadata: {
    // Challenge-specific data (terminals, files, hints, etc.)
  }
}
```

### Example 1: Q&A Challenge

```javascript
{
  title: "Azure Storage Account Types",
  description: "Which Azure storage redundancy option stores 3 copies in primary region and 3 in secondary region?",
  category: "Trivia",  // Displayed category for user filtering
  difficulty: "easy",
  points: 50,
  flag: "FLAG{GRS}",
  metadata: null,
  hints: [
    { text: "Think about Geo-Redundant options", penalty: 10 },
    { text: "The acronym is 3 letters starting with G", penalty: 15 }
  ]
}
```

### Example 2: Terminal Challenge

```javascript
{
  title: "Azure CLI Investigation",
  description: "Use the Azure CLI to find the storage account access key hidden in the terminal output.",
  category: "Cloud Security",  // Category shown to users
  difficulty: "medium",
  points: 200,
  flag: "FLAG{STORAGE_KEY_abc123xyz}",
  metadata: {
    terminalWindows: [
      {
        id: "main",
        title: "Azure Cloud Shell",
        initialDirectory: "~",
        availableCommands: ["az", "ls", "cat", "echo", "pwd"],
        files: {
          "~/credentials.txt": "Storage Account: sentinelforge\nKey: STORAGE_KEY_abc123xyz",
          "~/.azure/config": "[defaults]\nlocation = eastus"
        },
        commandResults: {
          "az storage account list": JSON.stringify([
            {
              name: "sentinelforge",
              location: "eastus",
              kind: "StorageV2"
            }
          ], null, 2),
          "az storage account keys list --account-name sentinelforge": JSON.stringify({
            keys: [
              { value: "REDACTED_FOR_SECURITY" }
            ]
          }, null, 2)
        }
      }
    ]
  },
  hints: [
    { text: "Try listing files in the home directory", penalty: 20 },
    { text: "The credentials are in a text file", penalty: 30 }
  ]
}
```

### Example 3: File Viewer Challenge

```javascript
{
  title: "Terraform State Analysis",
  description: "Examine the Terraform state file to find the exposed database password.",
  category: "Infrastructure as Code",
  difficulty: "hard",
  points: 300,
  flag: "FLAG{terraform_state_secrets}",
  metadata: {
    fileViewers: [
      {
        id: "terraform-files",
        title: "Project Files",
        files: [
          {
            name: "terraform.tfstate",
            content: JSON.stringify({
              resources: [
                {
                  type: "azurerm_sql_database",
                  name: "main",
                  instances: [{
                    attributes: {
                      administrator_login_password: "terraform_state_secrets"
                    }
                  }]
                }
              ]
            }, null, 2),
            language: "json"
          },
          {
            name: "main.tf",
            content: `resource "azurerm_sql_database" "main" {
  name                = "mydb"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  server_name         = azurerm_sql_server.main.name
}`,
            language: "hcl"
          }
        ]
      }
    ]
  }
}
```

### Adding Challenges to Database

#### Option 1: Seed File (Recommended for Development & Initial Setup)

**File Location:** `/backend/seeds/001_initial_data.ts`

Edit this file to add your challenges:

```javascript
await db('challenges').insert([
  {
    title: 'Your New Challenge',
    description: 'Challenge description',
    category: 'Cloud Security',
    difficulty: 'medium',
    points: 200,
    flag: 'FLAG{YOUR_FLAG}',
    order_index: 0,
    metadata: null,
    hints: JSON.stringify([
      { text: 'Hint 1', penalty: 20 },
      { text: 'Hint 2', penalty: 30 }
    ])
  }
]);
```

**To apply changes:**
```bash
cd backend
npm run seed
```

#### Option 2: Admin API (For Adding Challenges After Deployment)

```bash
curl -X POST https://your-api.com/api/admin/challenges \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Challenge",
    "description": "Description",
    "category": "Cloud Security",
    "difficulty": "medium",
    "points": 200,
    "flag": "FLAG{SECRET}",
    "order_index": 0
  }'
```

### Challenge Best Practices

1. **Flags:**
   - Format: `FLAG{DESCRIPTIVE_NAME}`
   - Use underscores, not spaces
   - All caps for consistency
   - No special characters that might cause encoding issues

2. **Points:**
   - Easy: 50-150
   - Medium: 150-250
   - Hard: 250-400
   - Expert: 400-500

3. **Hints:**
   - 2-3 hints per challenge
   - First hint: 10-20% of points
   - Second hint: 20-30% of points
   - Make them progressively more specific

4. **Descriptions:**
   - Clear objective
   - Any necessary context
   - Don't give away the solution
   - Include realistic scenario

5. **Testing:**
   - Test all commands in terminal windows
   - Verify file contents display correctly
   - Check flag validation works
   - Test hints unlock properly

---

## API Reference

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player@example.com",
  "password": "securepass123"
}

Response: 201 Created
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Challenges

#### List All Challenges
```http
GET /api/challenges
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "title": "Challenge Name",
    "description": "Description",
    "category": "Cloud Security",
    "difficulty": "medium",
    "points": 200,
    "order_index": 0,
    "metadata": { ... },
    "hints": [ ... ]
  }
]
```

#### Get Challenge Details
```http
GET /api/challenges/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "title": "Challenge Name",
  "metadata": {
    "terminalWindows": [ ... ],
    "fileViewers": [ ... ]
  },
  "hints": [
    { "text": "Hint 1", "penalty": 20 },
    { "text": "Hint 2", "penalty": 30 }
  ]
}
```

#### Unlock Hint
```http
POST /api/challenges/:id/hints/:hintIndex
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "hint": { "text": "Hint text", "penalty": 20 }
}
```

#### Get Unlocked Hints
```http
GET /api/challenges/:id/unlocked-hints
Authorization: Bearer <token>

Response: 200 OK
{
  "unlockedHints": [0, 1]
}
```

### Submissions

#### Submit Flag
```http
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "challengeId": 1,
  "flag": "FLAG{ANSWER}"
}

Response: 200 OK (correct)
{
  "correct": true,
  "message": "Correct! You earned 200 points!",
  "points": 200,
  "isFirstBlood": false
}

Response: 200 OK (incorrect)
{
  "correct": false,
  "message": "Incorrect flag. Try again!"
}
```

### Scoreboard

#### Get Scoreboard
```http
GET /api/scoreboard
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "user_id": 1,
    "username": "player1",
    "total_score": 450,
    "challenges_solved": 3,
    "last_submission": "2025-01-15T10:30:00Z"
  }
]
```

### User Profile

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "username": "player1",
  "email": "player@example.com",
  "total_score": 450,
  "challenges_solved": 3
}
```

### Admin Endpoints

#### Create Challenge
```http
POST /api/admin/challenges
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New Challenge",
  "description": "Description",
  "category": "Cloud Security",
  "difficulty": "medium",
  "points": 200,
  "flag": "FLAG{SECRET}",
  "order_index": 0,
  "metadata": null
}
```

#### Delete Challenge
```http
DELETE /api/admin/challenges/:id
Authorization: Bearer <admin_token>

Response: 200 OK
```

---

## Maintenance & Operations

### Monitoring

#### Monitoring Logs

Check server logs:
```bash
cd backend
npm run dev  # Shows all requests/responses

# Or with PM2 (production)
pm2 logs sentinelforge-backend
```

### Backup Strategy

#### Database Backups

**Automated (Managed Databases):**
- Check your provider's automatic backup policies
- Typical retention: 7-35 days depending on service tier

**Manual Backup (PostgreSQL):**
```bash
# If using Docker PostgreSQL
docker exec sentinelforge-db pg_dump -U sentinelforge sentinelforge_ctf > backup_$(date +%Y%m%d).sql
```

#### Application Backups

```bash
# Backup source code (if not in Git)
tar -czf backup_$(date +%Y%m%d).tar.gz backend/ frontend/

# Backup Terraform state
cd terraform
terraform state pull > terraform_state_$(date +%Y%m%d).json
```

### Scaling

#### Vertical Scaling (More Power)

Upgrade your VM/server resources:
- Increase CPU cores
- Add more RAM
- Expand storage

Consult your hosting provider's documentation for resizing instructions.

#### Horizontal Scaling (More Instances)

For high-traffic scenarios:
- Deploy multiple backend containers behind a load balancer
- Use external PostgreSQL database (not in Docker)
- Configure session storage (Redis) for shared state

Consult container orchestration tools (Kubernetes, Docker Swarm) for advanced setups.

### Security Updates

#### Update Dependencies

```bash
cd backend
npm audit
npm audit fix

cd ../frontend
npm audit
npm audit fix
```

#### Update Node.js Version

```bash
# Check current version
node --version

# Update with nvm
nvm install 20
nvm use 20
```

Update in `package.json`:
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### Performance Optimization

#### Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_challenge ON submissions(challenge_id);
CREATE INDEX idx_scoreboard_score ON scoreboard_cache(total_score DESC);
```

#### Caching (Optional)

Install Redis:
```bash
npm install redis ioredis

# In backend/src/config/cache.ts
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache scoreboard
const cacheKey = 'scoreboard:all';
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Set cache (5 minutes)
await redis.setex(cacheKey, 300, JSON.stringify(scoreboard));
```

### Incident Response

#### High CPU Usage

1. Check server metrics (`docker stats` or provider's monitoring)
2. Review recent deployments
3. Check for inefficient database queries
4. Scale up temporarily
5. Investigate application logs

#### Database Connection Exhausted

```bash
# Check active connections
SELECT count(*) FROM sys.dm_exec_connections;

# Increase connection pool size in .env
DB_POOL_MIN=2
DB_POOL_MAX=20
```

#### Failed Deployments

```bash
# Check Docker container logs
docker compose logs backend
docker compose logs frontend

# Rollback to previous version
docker compose down
git checkout <previous-commit>
docker compose up -d --build
```

---

## Support & Resources

### Documentation

- **README.md** - Project overview and quick start
- **SETUP_SUMMARY.md** - What's included
- **docs/AUTHENTICATION.md** - Detailed API reference
- **docs/deployment.md** - Infrastructure details
- **docs/flag-security.md** - Security best practices

### Useful Commands Cheat Sheet

```bash
# Development
npm run dev          # Start backend dev server
npm run migrate      # Run database migrations
npm run seed         # Seed sample data
npm run test         # Run tests

# Database
npm run migrate:make <name>    # Create migration
npm run migrate:rollback       # Undo last migration
npm run seed:make <name>       # Create seed file

# Production
npm run build        # Build for production
npm start           # Start production server
node fix-scoreboard.js  # Fix scoring issues

# Docker
docker compose up -d       # Start platform
docker compose down        # Stop platform
docker compose logs -f     # View live logs
docker compose ps          # Check container status
```

### Common File Locations

```
backend/
├── .env                    # Environment variables
├── knexfile.ts            # Database configuration
├── migrations/            # Schema changes
├── seeds/                 # Sample data
└── src/
    ├── server.ts          # Main entry point
    ├── routes/            # API endpoints
    └── middleware/        # Auth, error handling

frontend/
├── .env                   # API URL
├── src/
    ├── App.jsx            # Main app
    ├── pages/             # Page components
    └── components/        # Reusable components

docker-compose.yml        # Container orchestration
```

### Getting Help

- 📧 **Email:** [your-email@example.com]
- 🐛 **Issues:** GitHub Issues
- 📚 **Docs:** /docs folder
- 💬 **Discussions:** GitHub Discussions

---

## Appendix

### A. Environment Variables Reference

**Backend (.env):**
```bash
# Server
NODE_ENV=development|production
PORT=3000

# Database (PostgreSQL)
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sentinelforge_ctf
DB_USER=ctf_admin
DB_PASSWORD=password

# Database (SQL Server)
DB_CLIENT=mssql
DB_HOST=your-database-host
DB_PORT=1433
DB_NAME=sentinelforge-ctf
DB_USER=dbadmin
DB_PASSWORD=password
DB_ENCRYPT=true

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Admin (optional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:3000/api
```

### B. Database Schema Diagram

```
┌─────────────┐         ┌──────────────┐
│   users     │         │  challenges  │
├─────────────┤         ├──────────────┤
│ id (PK)     │         │ id (PK)      │
│ username    │         │ title        │
│ email       │         │ description  │
│ password    │         │ category     │
│ created_at  │         │ difficulty   │
└─────────────┘         │ points       │
       │                │ flag         │
       │                │ metadata     │
       │                └──────────────┘
       │                       │
       └───────┬───────────────┘
               │
        ┌──────▼──────────┐
        │  submissions    │
        ├─────────────────┤
        │ id (PK)         │
        │ user_id (FK)    │
        │ challenge_id (FK)│
        │ submitted_flag  │
        │ is_correct      │
        │ points_awarded  │
        │ submitted_at    │
        └─────────────────┘
```

### C. Docker Architecture

```
Docker Compose Stack
├── Frontend Container (nginx:8080)
│   └── Environment: VITE_API_URL
├── Backend Container (node:3000)
│   └── Environment: JWT_SECRET, DB credentials
├── PostgreSQL Container (postgres:5432)
│   └── Volume: postgres-data
└── Network: sentinelforge-network
```

---

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Maintainer:** SentinelForge Team
