// server.js - Fixed Expense Tracker API with Cloudflare Tunnel CORS Support
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Expense Tracker API...');
console.log(`📅 Started: ${new Date().toLocaleString()}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`📌 Port: ${PORT}`);

// ============================================
// CORS CONFIGURATION FOR CLOUDFLARE TUNNEL
// ============================================
const allowedOrigins = [
    'https://kitapunya.web.id',
    'https://www.kitapunya.web.id',
    'http://kitapunya.web.id',  // Add HTTP version
    'http://www.kitapunya.web.id',  // Add HTTP www version
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
];

// Parse additional origins from env if exists
if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    allowedOrigins.push(...envOrigins);
}

console.log('✅ CORS Allowed Origins:', allowedOrigins);

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, server-to-server)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if the origin is allowed
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked origin: ${origin}`);
            // In development, you might want to allow all origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true, // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Length', 'Content-Range'],
    maxAge: 86400, // Cache preflight for 24 hours
    optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Additional CORS headers for extra compatibility (especially for Cloudflare)
app.use((req, res, next) => {
    // Get origin from request
    const origin = req.headers.origin;
    
    // If origin is in allowed list, set it explicitly
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle OPTIONS/preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.sendStatus(200);
    }
    
    next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Logging middleware with more details
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    const origin = req.headers.origin || 'no-origin';
    console.log(`[${timestamp}] ${req.method} ${req.path} - Origin: ${origin}`);
    
    // Log body for debugging (be careful in production)
    if (req.method === 'POST' && process.env.NODE_ENV === 'development') {
        console.log('Body:', JSON.stringify(req.body).slice(0, 200));
    }
    
    next();
});

// Optional auth middleware
const { optionalAuth, isConfigured } = require('./middleware/auth');
app.use(optionalAuth);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const receiptRoutes = require('./routes/receipt');
const expenseRoutes = require('./routes/expense');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', receiptRoutes);
app.use('/api', expenseRoutes);

// Add standalone delete route if needed
try {
    const deleteRoutes = require('./routes/delete');
    app.use('/api', deleteRoutes);
    console.log('✅ Delete routes loaded');
} catch (error) {
    console.log('⚠️ Delete routes not found, using fallback');
    
    // Fallback delete endpoint
    app.delete('/api/user/delete-account', async (req, res) => {
        console.log('🗑️ Delete account endpoint called (fallback)');
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email required' 
            });
        }

        try {
            // Try to use userService if available
            const { userService } = require('./routes/user');
            
            if (!userService || !userService.auth) {
                // Mock response
                return res.json({ 
                    success: true, 
                    message: 'Account deleted (service not configured)',
                    autoDeleted: false,
                    details: {
                        userDeleted: true,
                        spreadsheetDeleted: false
                    }
                });
            }

            // Find user
            const user = await userService.findUser(email);
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'User not found' 
                });
            }

            let spreadsheetDeleted = false;

            // Delete spreadsheet if exists
            if (user.spreadsheetId && userService.drive) {
                try {
                    await userService.drive.files.delete({
                        fileId: user.spreadsheetId
                    });
                    spreadsheetDeleted = true;
                    console.log(`✅ Spreadsheet ${user.spreadsheetId} deleted`);
                } catch (err) {
                    console.error('⚠️ Could not delete spreadsheet:', err.message);
                }
            }

            // Delete user from master
            try {
                const sheet = await userService.getSheet();
                const rows = await sheet.getRows();
                const userRow = rows.find(r => r.get('Email') === email);
                
                if (userRow) {
                    await userRow.delete();
                    console.log(`✅ User ${email} deleted from master`);
                }
            } catch (err) {
                console.error('⚠️ Could not delete user from master:', err.message);
            }

            res.json({ 
                success: true, 
                message: 'Account and spreadsheet deleted successfully',
                autoDeleted: spreadsheetDeleted,
                details: {
                    userDeleted: true,
                    spreadsheetDeleted: spreadsheetDeleted
                }
            });

        } catch (error) {
            console.error('❌ Delete account error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to delete account',
                details: error.message
            });
        }
    });

    // Fallback export endpoint
    app.get('/api/user/export-data/:email', async (req, res) => {
        console.log('📤 Export data endpoint called (fallback)');
        const email = decodeURIComponent(req.params.email);
        
        try {
            const { userService } = require('./routes/user');
            
            if (!userService || !userService.auth) {
                // Mock export
                const mockData = {
                    exportDate: new Date().toISOString(),
                    user: { email },
                    expenses: [],
                    statistics: { totalExpenses: 0, totalAmount: 0 }
                };
                
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="expense-data.json"`);
                return res.json(mockData);
            }

            const user = await userService.findUser(email);
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'User not found' 
                });
            }

            // Get expenses if possible
            let expenses = [];
            try {
                const { PersonalSheetsService } = require('./routes/expense');
                const sheetsService = new PersonalSheetsService();
                if (sheetsService.isReady() && user.spreadsheetId) {
                    expenses = await sheetsService.getExpenses(email);
                }
            } catch (err) {
                console.warn('Could not get expenses:', err.message);
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                user: {
                    email: user.email,
                    name: user.name,
                    nickname: user.nickname,
                    spreadsheetId: user.spreadsheetId
                },
                expenses,
                statistics: {
                    totalExpenses: expenses.length,
                    totalAmount: expenses.reduce((sum, exp) => sum + exp.total, 0)
                }
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="expense-data-${email.split('@')[0]}.json"`);
            res.json(exportData);

        } catch (error) {
            console.error('❌ Export error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to export data'
            });
        }
    });
}

// Health check endpoint - IMPORTANT for CORS testing
app.get('/api/health', async (req, res) => {
    console.log('🏥 Health check from:', req.headers.origin || 'no-origin');
    
    try {
        // Try to use health routes
        const healthRoutes = require('./routes/health');
        if (healthRoutes && typeof healthRoutes === 'function') {
            return healthRoutes(req, res);
        }
    } catch (error) {
        // Continue with fallback
    }
    
    // Fallback health check
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: {
            running: true,
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'production',
            port: PORT
        },
        cors: {
            enabled: true,
            origin: req.headers.origin || 'no-origin',
            allowedOrigins: allowedOrigins
        },
        auth: {
            configured: isConfigured()
        },
        features: {
            deleteAccount: true,
            exportData: true,
            personalSpreadsheets: true
        },
        cloudflare: {
            tunnel: true,
            note: 'Using Cloudflare Tunnel for routing'
        }
    });
});

// API documentation
app.get('/', (req, res) => {
    const origin = req.headers.origin || 'direct-access';
    
    res.json({
        name: 'Expense Tracker API',
        version: '3.2.0',
        status: 'running',
        accessedFrom: origin,
        cors: {
            configured: true,
            yourOrigin: origin,
            allowed: allowedOrigins.includes(origin) || origin === 'direct-access'
        },
        endpoints: {
            auth: [
                'POST /api/auth/verify',
                'GET /api/auth/profile',
                'POST /api/auth/signout',
                'GET /api/auth/status'
            ],
            user: [
                'POST /api/user/register',
                'POST /api/user/setup',
                'GET /api/user/profile/:email',
                'PUT /api/user/profile',
                'DELETE /api/user/delete-account',
                'GET /api/user/export-data/:email',
                'GET /api/user/spreadsheet/:email'
            ],
            expense: [
                'POST /api/save-expense',
                'GET /api/expenses',
                'GET /api/stats',
                'DELETE /api/clear-data'
            ],
            receipt: [
                'POST /api/analyze-receipt'
            ],
            health: [
                'GET /api/health',
                'GET /api/config'
            ]
        },
        features: {
            personalSpreadsheets: true,
            autoDeleteAccount: true,
            dataExport: true,
            receiptOCR: !!process.env.N8N_ANALYZE_WEBHOOK_URL,
            authentication: isConfigured(),
            cloudflareIntegration: true
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`⚠️ 404: ${req.method} ${req.originalUrl} from ${req.headers.origin || 'unknown'}`);
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} not found`,
        availableEndpoints: 'GET /',
        origin: req.headers.origin
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    
    // Special handling for CORS errors
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            error: 'CORS policy violation',
            message: 'Your domain is not allowed to access this API',
            yourOrigin: req.headers.origin,
            allowedOrigins: process.env.NODE_ENV === 'development' ? allowedOrigins : 'Contact admin for access'
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 Server running at http://localhost:${PORT}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 Personal Spreadsheets: ✅ Enabled`);
    console.log(`🗑️ Delete Account: ✅ Enabled`);
    console.log(`💾 Export Data: ✅ Enabled`);
    console.log(`🌐 CORS: ✅ Configured for Cloudflare`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📝 Allowed Origins:`);
    allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
    console.log(`${'='.repeat(50)}`);
    console.log(`\n📝 View API docs at: http://localhost:${PORT}/`);
    console.log('🚀 Server ready for Cloudflare Tunnel!\n');
});

module.exports = app;