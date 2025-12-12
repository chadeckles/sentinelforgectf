# SentinelForge CTF Challenge Packs (PRIVATE)

🔒 **This is a PRIVATE repository** - Contains all SentinelForge CTF challenge content, solutions, and flags.

## 📦 Repository Contents

All challenge packs for the SentinelForge CTF platform, including validation and loading utilities.

### Challenge Packs
- `azure-fundamentals/` - 12 challenges (1,800 pts) - Azure security basics
- `cicd-pipeline/` - 10 challenges (2,300 pts) - CI/CD security ⭐ v2.0
- `container-security/` - 11 challenges (3,000 pts) - Docker & K8s ⭐ v2.0
- `terraform-security/` - 11 challenges (2,900 pts) - IaC security ⭐ v2.0
- `identity-access/` - 11 challenges (3,300 pts) - Azure AD & IAM ⭐ v2.0
- `demo-pack/` - 9 challenges (1,600 pts) - Demo content

### Utilities
- `pack-loader.js` - Dynamically loads packs for database seeding
- `validate-packs.js` - Validates challenge pack schemas
- `ARCHITECTURE.md` - Technical documentation

## 📊 Statistics

**Total:** 64 challenges, 14,900 points, 38-50 hours of content

| Pack | Challenges | Points | Time | Status |
|------|-----------|--------|------|--------|
| Azure Fundamentals | 12 | 1,800 | 4-6h | ✅ |
| CI/CD Pipeline | 10 | 2,300 | 6-8h | ✅ v2.0 |
| Container Security | 11 | 3,000 | 8-10h | ✅ v2.0 |
| Terraform Security | 11 | 2,900 | 8-10h | ✅ v2.0 |
| Identity & Access | 11 | 3,300 | 9-11h | ✅ v2.0 |
| Demo Pack | 9 | 1,600 | 3-5h | ✅ |

## 🚀 v2.0 Enhancements

All premium packs expanded to 10-12 challenges with advanced topics:

**CI/CD:** OIDC exploitation, dependency confusion, self-hosted runners, Azure DevOps injection  
**Container:** RBAC wildcards, supply chain, OPA Gatekeeper, Falco evasion  
**Terraform:** Workspace escalation, backend hijacking, Sentinel bypass, drift evasion  
**Identity:** OAuth/OIDC attacks, certificate bypass, JIT exploitation, AD Connect attacks

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

## 📝 Quality Standards

✅ Realistic exploitable scenarios  
✅ Detailed terminal outputs (5-8 steps)  
✅ Prevention strategies with code  
✅ Verified Microsoft Learn links  
✅ 2-3 hints + 3-4 learning resources per challenge  
✅ All packs pass schema validation

## 🔒 Security

- **PRIVATE REPO** - Never make public
- Contains solutions and flags
- Educational use only
- Authorized testing only

## 📚 Documentation

Each pack contains:
- `package-info.json` - Pack metadata
- `challenges.json` - Challenge definitions

Challenge schema validated for:
- JSON structure
- Required fields
- Valid difficulties (easy/medium/hard)
- Category matching
- Points distribution

## 🎯 Deployment Workflow

1. **Edit** - Make changes in this repo
2. **Validate** - Run `validate-packs.js`
3. **Test** - Test on development environment
4. **Commit** - Push to private repo
5. **Deploy** - Pull into production CTF
6. **Seed** - Run database seed

## 📧 Maintainer

Chad Eckles (@chadeckles)

---

**Status:** ✅ Production Ready  
**Version:** 2.0.0  
**Last Updated:** December 12, 2024  
**Total Challenges:** 64  
**Total Points:** 14,900
