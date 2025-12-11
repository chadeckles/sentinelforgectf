"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
// Load environment variables
dotenv_1.default.config();
// Import Key Vault configuration
const keyVault_1 = require("./config/keyVault");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const challenge_routes_1 = __importDefault(require("./routes/challenge.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const submission_routes_1 = __importDefault(require("./routes/submission.routes"));
const scoreboard_routes_1 = __importDefault(require("./routes/scoreboard.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});
// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, auth_routes_1.default);
app.use(`/api/${API_VERSION}/users`, user_routes_1.default);
app.use(`/api/${API_VERSION}/challenges`, challenge_routes_1.default);
app.use(`/api/${API_VERSION}/teams`, team_routes_1.default);
app.use(`/api/${API_VERSION}/submissions`, submission_routes_1.default);
app.use(`/api/${API_VERSION}/scoreboard`, scoreboard_routes_1.default);
app.use(`/api/${API_VERSION}/admin`, admin_routes_1.default);
// Welcome endpoint
app.get('/', (_req, res) => {
    res.json({
        message: '🛡️⚒️ Welcome to SentinelForge CTF API',
        version: API_VERSION,
        documentation: '/api/docs',
        health: '/health'
    });
});
// 404 handler
app.use(notFound_1.notFound);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start server
if (process.env.NODE_ENV !== 'test') {
    // Initialize secrets from Key Vault first
    (0, keyVault_1.initializeSecrets)()
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
exports.default = app;
//# sourceMappingURL=server.js.map