import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleGenerate, handleSetupAPIKey } from './controllers/argumentController';
import { debug } from '../../shared/debug';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Debug middleware for request logging
app.use((req, res, next) => {
    const requestId = debug.trackAPIRequest(req.method, req.url, req.body, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        sessionId: req.body?.sessionId
    });

    // Add requestId to response headers for tracking
    res.setHeader('X-Request-ID', requestId);

    // Track response
    const originalSend = res.send;
    res.send = function (data) {
        debug.trackAPIResponse(requestId, res.statusCode, data);
        return originalSend.call(this, data);
    };

    next();
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.post('/api/generate', handleGenerate);
app.post('/api/setup-key', handleSetupAPIKey);

// Health check endpoint
app.get('/health', (req, res) => {
    debug.info('server', 'health_check', 'Health check requested');
    res.json({ status: 'OK', message: 'Dianoia backend is running' });
});

// Debug endpoint for viewing logs
app.get('/debug/logs', (req, res) => {
    debug.info('server', 'debug_logs_requested', 'Debug logs requested via API');
    res.json({
        logs: debug.getLogs(),
        config: debug.getConfig(),
        performance: 'Available via debug.exportLogs()'
    });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    debug.trackError(err, 'server', 'unhandled_error', {
        url: req.url,
        method: req.method,
        body: req.body
    });

    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
    debug.info('server', 'startup', `Dianoia backend server started`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000'
    });

    console.log(`🚀 Dianoia backend server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🐛 Debug logs: http://localhost:${PORT}/debug/logs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    debug.info('server', 'shutdown', 'Received SIGTERM, shutting down gracefully');
    server.close(() => {
        debug.info('server', 'shutdown_complete', 'Server shutdown complete');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    debug.info('server', 'shutdown', 'Received SIGINT, shutting down gracefully');
    server.close(() => {
        debug.info('server', 'shutdown_complete', 'Server shutdown complete');
        process.exit(0);
    });
}); 