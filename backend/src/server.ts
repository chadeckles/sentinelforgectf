import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import Key Vault configuration
import { initializeSecrets } from './config/keyVault';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import challengeRoutes from './routes/challenge.routes';
import teamRoutes from './routes/team.routes';
import submissionRoutes from './routes/submission.routes';
import scoreboardRoutes from './routes/scoreboard.routes';
import adminRoutes from './routes/admin.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/challenges`, challengeRoutes);
app.use(`/api/${API_VERSION}/teams`, teamRoutes);
app.use(`/api/${API_VERSION}/submissions`, submissionRoutes);
app.use(`/api/${API_VERSION}/scoreboard`, scoreboardRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);

// Welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🛡️⚒️ Welcome to SentinelForge CTF API',
    version: API_VERSION,
    documentation: '/api/docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  // Initialize secrets from Key Vault first
  initializeSecrets()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`
    🛡️⚒️ SentinelForge CTF API Server
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Environment: ${process.env.NODE_ENV}
    Port: ${PORT}
    API Version: ${API_VERSION}
    
    Ready to forge skills! 🚀
        `);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

export default app;
