# 🐳 SentinelForge Docker Quick Start

Get SentinelForge up and running in minutes with Docker. Perfect for self-hosting, testing, or deploying challenge packs.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

> **macOS tip:** `brew install --cask docker` installs Docker Desktop (which includes the `docker compose` plugin inside the Docker UX). If you rely on the standalone CLI, also run `brew install docker-compose` so the `docker compose …` commands in this guide are available from the terminal.

## Quick Install

**1. Clone the repository:**
```bash
git clone https://github.com/chadeckles/sentinelforgectf.git
cd sentinelforgectf
```

**2. Create environment file:**
```bash
cp .env.example .env
```

**3. Configure environment variables** (edit `.env`):
```bash
# Database
DB_USER=sentinelforge
DB_PASSWORD=changeme-in-production
DB_NAME=sentinelforge_ctf

# Backend
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Ports (optional, defaults shown)
BACKEND_PORT=3000
FRONTEND_PORT=80

# CORS (update if FRONTEND_PORT changes)
CORS_ORIGIN=http://localhost

# Frontend API URL (change if hosting remotely)
VITE_API_URL=http://localhost:3000/api/v1
```

**4. Start SentinelForge:**
```bash
docker compose up -d
```

**5. Access the platform:**
- **Frontend:** http://localhost (or http://localhost:FRONTEND_PORT)
- **Backend API:** http://localhost:3000 (or http://localhost:BACKEND_PORT)

The database will be automatically initialized with seed data including demo challenges.

## What's Included

The Docker setup includes:
- ✅ **PostgreSQL 14** - Database with persistent storage
- ✅ **Backend API** - Express + TypeScript server
- ✅ **Frontend** - React SPA served by nginx
- ✅ **Auto-migrations** - Database schema automatically applied
- ✅ **Seed data** - 9 demo challenges pre-loaded
- ✅ **Health checks** - Automatic service monitoring
- ✅ **Volume persistence** - Data persists across restarts

## Common Commands

### View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Stop services:
```bash
docker compose down
```

### Stop and remove data volumes:
```bash
docker compose down -v
```

### Restart a specific service:
```bash
docker compose restart backend
```

### Rebuild after code changes:
```bash
docker compose up -d --build
```

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│  PostgreSQL │
│  (nginx)    │         │  (Node.js)  │         │             │
│  Port: 80   │         │  Port: 3000 │         │  Port: 5432 │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `sentinelforge` |
| `DB_PASSWORD` | PostgreSQL password | `changeme` |
| `DB_NAME` | Database name | `sentinelforge_ctf` |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `BACKEND_PORT` | Backend API port | `3000` |
| `FRONTEND_PORT` | Frontend port | `80` |
| `CORS_ORIGIN` | Allowed origin for backend CORS | `http://localhost` |
| `VITE_API_URL` | API URL for frontend | `http://localhost:3000/api/v1` |

### Volumes

| Volume | Purpose |
|--------|---------|
| `postgres_data` | Database persistence |
| `backend_logs` | Application logs |

## Production Deployment

### Security Checklist

1. **Change default credentials:**
   ```bash
   DB_PASSWORD=your-strong-password
   JWT_SECRET=your-random-secret-key
   ```

2. **Use HTTPS** - Place nginx or a reverse proxy (like Traefik/Caddy) in front

3. **Set proper ports** - If running on a server, map to standard ports:
   ```bash
   FRONTEND_PORT=80
   BACKEND_PORT=3000
   ```

4. **Configure API URL** - Point frontend to your domain:
   ```bash
   VITE_API_URL=https://api.yourdomain.com/api/v1
   ```

5. **Backup database regularly:**
   ```bash
   docker exec sentinelforge-db pg_dump -U sentinelforge sentinelforge_ctf > backup.sql
   ```

### Updating SentinelForge

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Database migrations run automatically on startup
```

## Installing Challenge Packs

SentinelForge is designed to work with installable challenge packs. To add new challenges:

1. **Purchase challenge pack** from [your-store-url]
2. **Extract pack** to your system
3. **Import challenges** via admin panel or API
4. **Restart backend** if needed:
   ```bash
   docker compose restart backend
   ```

More details: See [Challenge Pack Installation Guide](./docs/challenge-packs.md)

## Troubleshooting

### Database connection errors
```bash
# Check if postgres is healthy
docker compose ps

# View postgres logs
docker compose logs postgres

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

### Frontend can't connect to backend
- Check `VITE_API_URL` in `.env` matches your backend location
- Rebuild frontend: `docker compose up -d --build frontend`
- Check CORS settings in backend

### Port conflicts
- Change ports in `.env` if 80 or 3000 are already in use
- Example: `FRONTEND_PORT=8080` and `BACKEND_PORT=3001`

## Support

- **Documentation:** [Full docs](./docs)
- **Issues:** [GitHub Issues](https://github.com/yourusername/sentinelforge-ctf/issues)

---

**SentinelForge** - Free and open source CTF platform for self-hosting.
