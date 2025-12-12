# Ko-fi Premium Pack Distribution Strategy

## Overview
This document outlines the strategy for distributing premium challenge packs through Ko-fi while keeping the core SentinelForge CTF platform open source.

## Repository Structure

### Public Repository (github.com/chadeckles/sentinelforgectf)
**Contains:**
- ✅ Core CTF platform (frontend/backend/docker)
- ✅ Demo pack (9 free challenges)
- ✅ Pack validation scripts
- ✅ Pack loader infrastructure
- ✅ Installation scripts
- ✅ Documentation

**Does NOT contain:**
- ❌ Premium challenge packs
- ❌ Premium pack source code
- ❌ Solutions or flags for premium challenges

### Private Repository (github.com/chadeckles/sentinelforgectf-premium-packs)
**Contains:**
- ✅ All premium pack source files
- ✅ Pack development tools
- ✅ Release packaging scripts
- ✅ Version history for packs
- ✅ Premium pack documentation

## Ko-fi Product Setup

### Product Listings (5 Products)

1. **Azure Fundamentals Pack** - $15
   - 12 challenges, 1800 points
   - Comprehensive Azure security scenarios
   - Digital Download: `azure-fundamentals-pack.zip`

2. **CI/CD Pipeline Security Pack** - $10
   - 4 challenges, 800 points
   - GitHub Actions vulnerabilities
   - Digital Download: `cicd-pipeline-pack.zip`

3. **Container Security Pack** - $12
   - 5 challenges, 1150 points
   - Docker and Kubernetes exploitation
   - Digital Download: `container-security-pack.zip`

4. **Terraform Security Pack** - $10
   - 5 challenges, 950 points
   - Infrastructure as Code security
   - Digital Download: `terraform-security-pack.zip`

5. **Identity & Access Management Pack** - $12
   - 5 challenges, 1100 points
   - Azure AD and IAM security
   - Digital Download: `identity-access-pack.zip`

6. **Complete Premium Bundle** - $45 (save $14)
   - All 5 premium packs
   - 31 challenges, 5800 points
   - Digital Download: `sentinelforge-premium-bundle.zip`

## Distribution Workflow

### Creating Release Packages

```bash
# From private repo
cd sentinelforgectf-premium-packs

# Create individual pack
./scripts/package-pack.sh azure-fundamentals

# Create bundle
./scripts/package-bundle.sh all
```

Each ZIP should contain:
```
pack-name-pack/
├── package-info.json
├── challenges.json
└── README.md (installation instructions)
```

### Ko-fi Configuration

**Digital Download Settings:**
- Automatic delivery upon payment
- Download limit: 3 downloads per purchase
- Download expiry: 30 days
- File size: <50MB per pack

**Product Description Template:**
```markdown
🎯 [PACK NAME] Challenge Pack for SentinelForge CTF

[Description of what skills are covered]

📦 What's Included:
- [X] challenges covering [topics]
- [X] total points
- Detailed scenarios with learning objectives
- Terminal interactions and hints
- Installation instructions

🔧 Requirements:
- SentinelForge CTF platform (free on GitHub)
- Basic Docker knowledge
- 30-60 minutes per challenge

📥 Installation:
1. Download the pack
2. Extract to challenge-packs/ folder
3. Run the included installer
4. Reseed database

💡 Perfect for: [target audience]

🔒 License: Personal/single-organization use only
```

## Security Measures

### Preventing Accidental Leaks

1. **`.gitignore` Protection**
   - Premium packs ignored in public repo
   - Only demo-pack and infrastructure files tracked

2. **Pre-commit Hooks** (optional)
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   if git diff --cached --name-only | grep -E "challenge-packs/(azure|cicd|container|terraform|identity)"; then
       echo "ERROR: Attempting to commit premium pack content!"
       exit 1
   fi
   ```

3. **CI/CD Checks**
   - GitHub Actions workflow to verify no premium content in PRs
   - Automated checks on main branch pushes

### License Protection

Create `LICENSE-PREMIUM.md` in each pack:
```markdown
# Premium Pack License

This challenge pack is licensed for personal or single-organization use only.

## Permitted Use:
✅ Running challenges in your personal CTF instance
✅ Deploying within your organization for training
✅ Learning and educational purposes

## Prohibited Use:
❌ Redistribution or resale
❌ Sharing with others who haven't purchased
❌ Posting solutions publicly
❌ Including in other CTF platforms without permission

© 2025 SentinelForge. All rights reserved.
```

## Customer Support Strategy

### Support Channels
1. **Ko-fi DMs** - Installation help
2. **GitHub Issues** - Bug reports (no premium content)
3. **Email** - Licensing questions

### Common Support Scenarios

**Installation Issues:**
- Provide `install-pack.sh` script
- Include validation troubleshooting
- Offer database seeding guidance

**Technical Problems:**
- Accept bug reports via private channels
- Patch and re-release fixed packs
- Notify customers of updates (Ko-fi announcements)

**Refund Policy:**
- 7-day money-back guarantee
- No questions asked for technical issues
- Handle via Ko-fi dispute system

## Future Enhancements

### Version Management
- Semantic versioning for packs (v1.0.0)
- Release notes for updates
- Automatic update notifications

### Bundle Strategy
- Quarterly new pack releases
- Seasonal discounts on bundles
- Loyalty program for repeat customers

### Analytics
- Track which packs sell best
- Survey customers for new pack ideas
- Monitor completion rates (if telemetry added)

## Revenue Projections

**Conservative Estimate:**
- 50 customers/year
- Average purchase: $20 (mix of individual + bundles)
- Revenue: $1,000/year

**Optimistic Estimate:**
- 200 customers/year
- Average purchase: $25
- Revenue: $5,000/year

## Marketing Strategy

1. **Public Demo Pack** - Shows value proposition
2. **GitHub README** - Prominent Ko-fi link
3. **Social Media** - Share challenge screenshots (no flags)
4. **Community Engagement** - Help users with public pack
5. **Content Marketing** - Blog posts about CTF development

## Next Steps

1. ✅ Update `.gitignore` to protect premium packs
2. ✅ Create installation scripts
3. ✅ Write customer documentation
4. ⏳ Create private GitHub repo for premium packs
5. ⏳ Package all 5 packs as ZIPs
6. ⏳ Set up Ko-fi product listings
7. ⏳ Test purchase → install workflow
8. ⏳ Launch and announce!
