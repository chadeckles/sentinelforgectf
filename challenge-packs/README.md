# Challenge Packs Directory

This directory contains challenge packs for SentinelForge CTF.

## Public Content

- **demo-pack/** - 9 free challenges included with the platform
- **validate-packs.js** - Validation script for all packs
- **pack-loader.js** - Database seeding utility
- **install-pack.sh** - Premium pack installation script

## Premium Content (Not in Public Repo)

Premium challenge packs are available for purchase on Ko-fi to support the platform's development.

### Available Premium Packs

1. **Azure Fundamentals** ($15)
   - 12 challenges covering comprehensive Azure security
   - Topics: Storage, NSG, RBAC, encryption, networking, logging
   - Difficulty: Easy to Hard

2. **CI/CD Pipeline Security** ($10)
   - 4 challenges focused on GitHub Actions vulnerabilities
   - Topics: Workflow injection, PR attacks, artifact poisoning, secret exfiltration
   - Difficulty: Medium to Hard

3. **Container Security** ($12)
   - 5 challenges on Docker and Kubernetes exploitation
   - Topics: Container escape, secret exposure, image vulnerabilities, privilege escalation
   - Difficulty: Medium to Expert

4. **Terraform Security** ($10)
   - 5 challenges covering Infrastructure as Code security
   - Topics: State encryption, credentials, module injection, state locking
   - Difficulty: Easy to Hard

5. **Identity & Access Management** ($12)
   - 5 challenges on Azure AD and IAM security
   - Topics: Service principals, managed identities, conditional access, guest users, PIM
   - Difficulty: Medium to Hard

6. **Complete Premium Bundle** ($45 - Save $14!)
   - All 5 premium packs
   - 31 total challenges, 5800 points

## Installing Premium Packs

After purchasing on Ko-fi:

```bash
# Extract the pack
unzip azure-fundamentals-pack.zip -d challenge-packs/

# Validate
node validate-packs.js

# Seed database
cd ../backend && npm run db:seed
```

Or use the automated installer:

```bash
./install-pack.sh ~/Downloads/azure-fundamentals-pack.zip
```

See `PREMIUM_PACKS_README.md` for detailed installation instructions.

## For Developers

### Creating New Packs

1. Create folder: `challenge-packs/new-pack/`
2. Add `package-info.json` with metadata
3. Add `challenges.json` with challenge definitions
4. Validate: `node validate-packs.js`
5. Test load: `node test-pack-loader.js`

### Pack Structure

```
pack-name/
├── package-info.json  # Metadata (name, category, price, etc)
└── challenges.json    # Challenge definitions
```

### Available Categories
- Trivia
- Cloud Security
- Container Security
- Infrastructure as Code
- DevSecOps
- IAM

### Valid Difficulties
- easy
- medium
- hard
- expert

## License

- **Public packs** (demo-pack): MIT License
- **Premium packs**: Licensed for personal/single-organization use only

---

💡 **Tip:** Start with the free demo-pack to learn the platform, then expand with premium packs for advanced training!

🛒 **Purchase Premium Packs:** [Ko-fi Link - Add your Ko-fi shop URL here]

Revenue supports:
- Platform hosting costs
- New challenge development
- Community features
- Documentation improvements

## ⚠️ License

Premium challenge packs are proprietary and not covered by the MIT license of the main SentinelForge platform. They are licensed for use only by purchasers and may not be redistributed.

---

**Questions?** Contact: [Your contact info]
