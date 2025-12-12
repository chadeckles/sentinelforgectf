# Premium Challenge Packs Installation Guide

## For Premium Pack Purchasers

Thank you for purchasing a SentinelForge CTF premium challenge pack! This guide will help you install your new challenges.

## Installation Steps

### 1. Download Your Pack
After purchasing on Ko-fi, you'll receive a ZIP file (e.g., `azure-fundamentals-pack.zip`)

### 2. Extract the Pack
Navigate to your CTF installation directory and extract:

```bash
cd /path/to/CTF/challenge-packs
unzip ~/Downloads/azure-fundamentals-pack.zip
```

This will create a new folder (e.g., `azure-fundamentals/`) with:
- `package-info.json` - Pack metadata
- `challenges.json` - Challenge definitions

### 3. Validate the Pack
Ensure the pack is properly formatted:

```bash
node validate-packs.js
```

You should see: `✅ All packs validated successfully!`

### 4. Install Challenges
Reseed your database to load the new challenges:

```bash
cd ../backend
npm run db:seed
```

### 5. Restart Your CTF
If using Docker:
```bash
cd ..
docker-compose down
docker-compose up -d
```

If running locally:
```bash
# Backend
cd backend && npm run dev

# Frontend (in new terminal)
cd frontend && npm run dev
```

## Available Premium Packs

- **Azure Fundamentals** (12 challenges, 1800 points) - Comprehensive Azure security topics
- **CI/CD Pipeline Security** (4 challenges, 800 points) - GitHub Actions vulnerabilities and DevSecOps
- **Container Security** (5 challenges, 1150 points) - Docker and Kubernetes exploitation
- **Terraform Security** (5 challenges, 950 points) - Infrastructure as Code security
- **Identity & Access Management** (5 challenges, 1100 points) - Azure AD and IAM

## Troubleshooting

### Pack Not Showing Up
- Verify the folder is in `challenge-packs/` directory
- Check that both `package-info.json` and `challenges.json` exist
- Run validation to check for JSON errors

### Database Issues
- Clear existing data: `npm run db:reset` (from backend/)
- Reseed: `npm run db:seed`

### Permission Issues
- Ensure the pack folder has read permissions
- On Unix systems: `chmod -R 755 challenge-packs/your-pack/`

## Support

Having issues? Contact support through Ko-fi or open an issue on GitHub (without sharing premium pack contents).

## Security Note

⚠️ **Do not redistribute premium packs**. These are licensed for personal/single-organization use only.
