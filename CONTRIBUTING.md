# Contributing to SentinelForge CTF

First off, thank you for considering contributing to SentinelForge CTF! 🛡️⚒️

## Code of Conduct

This project is built on the principle that security education through CTF challenges helps create better defenders. We welcome contributions from everyone who shares this mission.

**We expect all contributors to:**
- Be respectful and inclusive in all interactions
- Provide constructive feedback and accept it gracefully
- Focus on what is best for the community and the project
- Show empathy towards other community members
- Avoid harassment, discriminatory language, or personal attacks

**Unacceptable behavior includes:**
- Trolling, insulting comments, or personal attacks
- Publishing others' private information without permission
- Any conduct that would be inappropriate in a professional setting

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker
- Describe the bug and steps to reproduce
- Include screenshots if applicable
- Specify your environment (OS, browser, Node version)

### Suggesting Enhancements

- Open an issue with the `enhancement` label
- Describe your idea clearly
- Explain why it would be useful

### Creating Challenges

We always need more challenges! See the [Creating Challenges section in the Admin Guide](./docs/ADMIN_GUIDE.md#creating-challenges).

**Challenge categories we're looking for:**
- Cloud misconfigurations (Azure, AWS, GCP)
- Container security vulnerabilities
- IaC (Terraform, ARM templates) security flaws
- DevSecOps pipeline vulnerabilities
- Kubernetes security
- Serverless security

### Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test with Docker Compose (`docker-compose up -d --build`)
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

**Using Docker Compose (Recommended):**

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/sentinelforge-ctf.git
cd sentinelforge-ctf

# Build and start everything (runs in background)
docker-compose up -d --build

# View logs
docker-compose logs -f

# The platform will be available at:
# Frontend: http://localhost (port 80)
# Backend API: http://localhost:3000/api/v1

# Stop when done
docker-compose down

# Clean slate (removes volumes/database)
docker-compose down -v
```

**For code changes:**
- Edit files locally
- Rebuild: `docker-compose up -d --build`
- Docker will automatically apply migrations and load challenge packs on startup

## Coding Standards

### Backend (TypeScript/Node.js)

- Follow ESLint configuration
- Write clear comments for complex logic
- Include error handling for all async operations
- Use async/await over callbacks
- Validate all user inputs
- Follow RESTful API conventions

### Frontend (React/Vite)

- Use functional components and hooks
- Follow the existing component structure
- Implement responsive design (mobile-friendly)
- Maintain cyberpunk theme consistency
- Write accessible code (ARIA labels, semantic HTML)
- Keep components small and focused

### Database (Knex.js migrations)

- Write migrations for all schema changes
- Include both `up` and `down` functions
- Test migrations on a fresh database
## Testing

```bash
# Test your changes with Docker Compose
docker-compose up -d --build

# Verify the platform works end-to-end:
# 1. Register a new user
# 2. Browse challenges
# 3. Submit flags
# 4. Check scoreboard updates

# For a clean slate (fresh database):
docker-compose down -v
docker-compose up -d --build
```

## Commit Messages

Follow conventional commits:

```
feat: add container escape challenge
fix: resolve scoreboard caching issue
docs: update deployment guide
style: format code with prettier
refactor: simplify authentication middleware
test: add unit tests for submission validation
chore: update dependencies
```

## Security Vulnerabilities

If you discover a security vulnerability in the platform:

1. **DO NOT** open a public issue
2. Email us at **security@sentinelforgectf.io**
3. Include detailed steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

We take security seriously and will respond promptly to all reports.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with the `question` label on GitHub. For general discussions, check the Discussions tab. Optionally, feel free to email us at info@sentinelforgectf.io 

---

Thank you for helping make SentinelForge CTF better! 🚀
