# Contributing to SentinelForge CTF

First off, thank you for considering contributing to SentinelForge CTF! 🛡️⚒️

## Code of Conduct

This project is built on the principle that security education through CTF challenges helps create better defenders. We welcome contributions from everyone who shares this mission.

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
4. Write/update tests
5. Run linters (`npm run lint`)
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/sentinelforge-ctf.git
cd sentinelforge-ctf

# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev
```

## Coding Standards

### Backend (TypeScript/Node.js)

- Use TypeScript strict mode
- Follow ESLint configuration
- Write JSDoc comments for public APIs
- Include unit tests for new features
- Use async/await over callbacks

### Frontend (React/TypeScript)

- Use functional components and hooks
- Follow the existing component structure
- Implement responsive design
- Maintain cyberpunk theme consistency
- Write accessible code (ARIA labels, semantic HTML)

### Database

- Write migrations for schema changes
- Include rollback logic
- Use transactions for data integrity
- Index frequently queried fields

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests (if available)
npm run test:e2e
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

## Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@sentinelforgectf.io
3. Include details and steps to reproduce
4. Allow time for a fix before public disclosure

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with the `question` label or email us at info@sentinelforgectf.io.

---

Thank you for helping make SentinelForge CTF better! 🚀
