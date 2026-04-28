
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { initializePool, closePool } = require('./config/db');

// ── Initialize Express App ────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Root route ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to DairySphere Society API',
        version: '1.0.0',
        endpoints: {
            health:          '/api/health',
            auth:            '/api/auth',
            farmers:         '/api/farmers',
            agents:          '/api/agents',
            factories:       '/api/factories',
            inputs:          '/api/inputs',
            milkQuality:     '/api/milk-quality',
            loans:           '/api/loans',
            loanRepayments:  '/api/loan-repayments',
            deliveries:      '/api/deliveries',
            purchases:       '/api/purchases',
            sales:           '/api/sales',
            dashboard:       '/api/dashboard'
        }
    });
});

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success:     true,
        message:     'DairySphere Society API is running',
        timestamp:   new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database:    'Oracle 23ai Free'
    });
});

// ── Route imports ─────────────────────────────────────────
const authRoutes            = require('./routes/auth.routes');
const farmerRoutes          = require('./routes/farmers.routes');
const dashboardRoutes       = require('./routes/dashboard.routes');
const agentRoutes           = require('./routes/agents.routes');
const factoryRoutes         = require('./routes/factories.routes');
const inputRoutes           = require('./routes/inputs.routes');
const milkQualityRoutes     = require('./routes/milkquality.routes');
const loanRoutes            = require('./routes/loans.routes');
const loanRepaymentRoutes   = require('./routes/loanrepayments.routes');
const deliveryRoutes        = require('./routes/deliveries.routes');
const purchaseRoutes        = require('./routes/purchases.routes');
const salesRoutes           = require('./routes/sales.routes');

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
    origin:      '*',
    methods:     ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (profile pictures) ───────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/farmers',          farmerRoutes);
app.use('/api/dashboard',        dashboardRoutes);
app.use('/api/agents',          agentRoutes);
app.use('/api/factories',       factoryRoutes);
app.use('/api/inputs',          inputRoutes);
app.use('/api/milk-quality',     milkQualityRoutes);
app.use('/api/loans',           loanRoutes);
app.use('/api/loan-repayments', loanRepaymentRoutes);
app.use('/api/deliveries',      deliveryRoutes);
app.use('/api/purchases',       purchaseRoutes);
app.use('/api/sales',           salesRoutes);
// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ── Start Server ───────────────────────────────────────────
async function startServer() {
    try {
        // Initialize Oracle connection pool first
        await initializePool();

        const server = app.listen(PORT, () => {
            console.log('╔══════════════════════════════════════════╗');
            console.log('║    DairySphere Society API Server        ║');
            console.log('╠══════════════════════════════════════════╣');
            console.log(`║  Port    : ${PORT}                          ║`);
            console.log(`║  Mode    : ${process.env.NODE_ENV}              ║`);
            console.log(`║  DB      : Oracle 23ai Free               ║`);
            console.log('╚══════════════════════════════════════════╝');
        });

        // Graceful shutdown
        process.on('SIGINT',  () => gracefulShutdown(server));
        process.on('SIGTERM', () => gracefulShutdown(server));

    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

async function gracefulShutdown(server) {
    console.log('\n🔄 Shutting down gracefully...');
    server.close(async () => {
        await closePool();
        console.log('✅ Server shut down cleanly');
        process.exit(0);
    });
}

startServer();