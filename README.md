# SentinelForge CTF 🛡️⚒️

<div align="center">

**Built for Modern Security Professionals**

*Forge challenges. Build cybersecurity skills.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](./DOCKER_INSTALL.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Us-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/sentinelforgectf)

</div>

---

## 🎯 Overview

Most CTF platforms emphasize traditional ethical hacking skills like password cracking or malware analysis. While valuable, these exercises rarely reflect the daily challenges faced by modern technology professionals.

**SentinelForge is different.**

We're a community-driven platform built for the builders and implementors — cloud architects, DevOps engineers, platform teams, and security practitioners who design, deploy, and secure today's infrastructure.

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/f6e3f633-86fa-42a2-a710-3a6f0f6e16ce" />


## ✨ Key Features

### For Participants
- 💻 **Simulated Terminals** - Practice CLI commands safely
- 📊 **Real-time Scoreboard** - Track group ranking and progress
- 💡 **Progressive Hints** - Get help (with point penalties)
- 🏆 **First Blood Bonus** - Extra points for being first to solve

### For Administrators
- 🐳 **5-Minute Setup** - Docker Compose deployment with everything included
- 📦 **Modular Challenge Packs** - JSON-based challenge definitions, easy to create and maintain
- ⚙️ **Flexible Scoring** - Configurable points, hints, first blood bonuses
- 🔧 **Easy Management** - Load challenge packs via seeds or create custom challenges
- 💾 **Built-in Database** - PostgreSQL included, no external setup needed

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 SentinelForge CTF Platform                   │
│                     (Docker Compose)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend Container          Backend Container              │
│  ┌──────────────┐            ┌──────────────┐              │
│  │  React +     │            │  Express.js  │              │
│  │  Vite SPA    │◄───────────┤  REST API    │              │
│  │  (nginx:80)  │            │  JWT Auth    │              │
│  │              │            │  (port 3000) │              │
│  └──────────────┘            └──────┬───────┘              │
│   Host: :80                         │                       │
│                            ┌────────▼────────┐              │
│                            │   PostgreSQL    │              │
│                            │   Container     │              │
│                            └─────────────────┘              │
│                                                              │
│  All services communicate via internal Docker network       │
│  Data persists in Docker volumes                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Docker Installation (Recommended) 🐳

Get up and running in **under 5 minutes**:

```bash
# Clone the repository
git clone https://github.com/chadeckles/sentinelforgectf.git
cd sentinelforgectf

# Configure environment
cp .env.example .env
# Edit .env and set strong values for DB_PASSWORD, JWT_SECRET, and (optionally) VITE_API_URL (include /api/v1)

# Start everything (default ports)
docker compose up -d

# Optional example: override exposed ports or frontend URL
# BACKEND_PORT=3333 FRONTEND_PORT=8099 \
#   VITE_API_URL=http://localhost:3333/api/v1 \
#   CORS_ORIGIN=http://localhost:8099 docker compose up -d
```

**✨ That's it!** You get:
- ✅ Database (PostgreSQL) with migrations applied
- ✅ Backend API running on port 3000
- ✅ Frontend served on port 80
- ✅ Sample demo challenges pre-loaded

**Access the platform:**
- Frontend: http://localhost (or http://localhost:80)
- Backend API: http://localhost:3000

**Default credentials:**
- Admin: `admin@sentinelforge.ctf` / `changeme`
- Demo User: `alpha@sentinelforge.ctf` / `demo123`

👉 **[Full Installation Guide](./DOCKER_INSTALL.md)**

---

git clone https://github.com/chadeckles/sentinelforgectf.git

## 📚 Documentation

- **[Docker Installation](./DOCKER_INSTALL.md)** - Complete Docker setup guide
- **[Challenge Packs Guide](./docs/CHALLENGE_PACKS.md)** - Creating and loading challenge packs ⭐
- **[Admin Guide](./docs/ADMIN_GUIDE.md)** - Platform management and configuration
- **[API Reference](./docs/ADMIN_GUIDE.md#api-endpoints)** - Backend API documentation

## 🎮 Challenge Categories

SentinelForge organizes challenges into security-focused categories:

1. **Trivia** - Test your cloud computing and security knowledge with Q&A challenges
2. **Cloud Security** - Find misconfigurations in Azure Storage, Key Vault, and cloud services
3. **Container Security** - Docker/Kubernetes security challenges and container escapes
4. **Infrastructure as Code** - Discover security issues in Terraform and IaC templates
5. **DevSecOps** - CI/CD security, secret scanning, and supply chain vulnerabilities

The platform is designed to be extensible—contributors can add new categories and challenge formats as needed.

## 📁 Project Structure

```
sentinelforge-ctf/
├── backend/              # Express.js API (TypeScript)
│   ├── src/
│   │   ├── server.ts     # Main application entry
│   │   ├── config/       # Database & environment config
│   │   ├── middleware/   # Auth, error handling, CORS
│   │   ├── routes/       # API endpoints (auth, challenges, etc.)
│   │   └── utils/        # Helper functions (flag validation, etc.)
│   ├── migrations/       # Knex database migrations
│   ├── seeds/            # Initial data (sample demo challenges)
│   ├── Dockerfile        # Backend container image
│   ├── knexfile.ts       # Database configuration
│   └── package.json      # Node.js dependencies
├── frontend/             # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── App.jsx       # Main React app
│   │   └── main.jsx      # Application entry point
│   ├── Dockerfile        # Frontend container image
│   ├── nginx.conf        # nginx web server config
│   ├── vite.config.js    # Vite build configuration
│   └── package.json      # Frontend dependencies
├── challenge-packs/      # Modular challenge definitions
│   ├── demo-pack/        # Sample challenge pack
│   │   ├── challenges.json       # Challenge definitions
│   │   └── package-info.json     # Pack metadata
│   ├── pack-loader.js    # Challenge pack loader utility
│   └── README.md         # Challenge pack documentation
├── docs/                 # Documentation
│   ├── ADMIN_GUIDE.md    # Platform administration
│   ├── CHALLENGE_PACKS.md # Creating challenge packs
│   └── flag-security.md  # Flag generation best practices
├── .github/
│   └── workflows/        # CI/CD automation
├── docker-compose.yml    # Complete stack orchestration
├── .env.example          # Environment variables template
├── CONTRIBUTING.md       # Contribution guidelines
└── README.md             # This file
```

## 🎨 Features Showcase

### Simulated Terminal
Interactive CLI environment with:
- Pre-loaded commands for each challenge
- Copy-to-clipboard for all commands/output
- Helpful error messages for invalid commands

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🌟 Operating Model

SentinelForge is **free and open-source** for self-hosting. Our operating model:

- ✅ **Free Forever**: Docker self-hosting, base platform, sample demo challenges
- 📦 **Challenge Packs***: Premium security scenarios (Azure, AWS, Kubernetes, etc.)
- 🤝 **Consulting***: Custom challenge development and deployment assistance available

_*Available for purchase on Ko-fi_

<div align="center">

### ☕ Support SentinelForge

**[Buy us a coffee or get premium challenge packs on Ko-Fi ➜](https://ko-fi.com/sentinelforgectf)**

[![Ko-Fi](https://img.shields.io/badge/Ko--fi-Support%20Us-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/sentinelforgectf)

</div>

We believe CTF platforms should be accessible and available to everyone. We optionally have challenge packs for purchase and other content on Ko-Fi to facilitate your learning or to help you get up-and-running faster.

**Try it!** Visit ➡️ [https://sentinelforgectf.io/](https://sentinelforgectf.io) to experience all base challenges online.

## 🙏 Acknowledgments

- Special thanks to all contributors

## 📞 Support

- **Documentation**: [Installation Guide](./DOCKER_INSTALL.md) | [Admin Guide](./docs/)
- **Issues**: [GitHub Issues](https://github.com/chadeckles/sentinelforgectf/issues)
- **Discussions**: [GitHub Discussions](https://github.com/chadeckles/sentinelforgectf/discussions)

---

**Simple to deploy. Powerful to learn. Built for modern security professionals.** 🛡️⚒️

---

<div align="center">

**Ready to level up your security skills? Let's go! 🚀**

[Get Started](./DOCKER_INSTALL.md) | [View Demo Challenges](./backend/seeds/001_initial_data.ts) | [Contribute](./CONTRIBUTING.md)

</div>
