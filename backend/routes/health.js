// routes/health.js - Updated for Personal Spreadsheet System
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const router = express.Router();

// Configuration
const GOOGLE_SHEETS_CONFIG = {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    masterSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID // Master spreadsheet for users
};

const N8N_CONFIG = {
    analyzeWebhookUrl: process.env.N8N_ANALYZE_WEBHOOK_URL,
    saveWebhookUrl: process.env.N8N_SAVE_WEBHOOK_URL
};

// Test master spreadsheet connection (Users table)
async function testMasterSpreadsheetConnection() {
    try {
        if (!GOOGLE_SHEETS_CONFIG.serviceAccountEmail || !GOOGLE_SHEETS_CONFIG.privateKey) {
            return {
                status: 'not_configured',
                error: 'Missing Google Sheets credentials'
            };
        }

        if (!GOOGLE_SHEETS_CONFIG.masterSpreadsheetId) {
            return {
                status: 'not_configured',
                error: 'Missing Master Spreadsheet ID'
            };
        }

        const serviceAccountAuth = new JWT({
            email: GOOGLE_SHEETS_CONFIG.serviceAccountEmail,
            key: GOOGLE_SHEETS_CONFIG.privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.masterSpreadsheetId, serviceAccountAuth);
        
        // Load document info
        await doc.loadInfo();
        
        // Check for Users sheet
        let usersSheet = doc.sheetsByTitle['Users'];
        if (!usersSheet) {
            console.log('📝 Creating Users sheet in master spreadsheet...');
            usersSheet = await doc.addSheet({ 
                title: 'Users',
                headerValues: ['UID', 'Email', 'Name', 'Nickname', 'Purpose', 'MonthlyBudget', 'Categories', 'IsSetupComplete', 'CreatedAt', 'LastLogin', 'Picture', 'SpreadsheetId']
            });
        } else {
            await usersSheet.loadHeaderRow();
            console.log('📋 Users sheet exists with headers:', usersSheet.headerValues);
        }
        
        // Count users
        const rows = await usersSheet.getRows();
        const activeUsers = rows.filter(row => row.get('SpreadsheetId')).length;
        
        return {
            status: 'connected',
            title: doc.title,
            sheets: doc.sheetsByIndex.length,
            usersSheet: {
                name: usersSheet.title,
                headers: usersSheet.headerValues,
                totalUsers: rows.length,
                usersWithSpreadsheets: activeUsers
            },
            architecture: 'personal_spreadsheets'
        };
    } catch (error) {
        console.error('❌ Master spreadsheet connection error:', error);
        return {
            status: 'error',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
    }
}

// GET /api/health - Health check endpoint
router.get('/health', async (req, res) => {
    try {
        console.log('🏥 Health check requested');
        
        const healthStatus = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            architecture: 'PERSONAL_SPREADSHEETS',
            server: {
                running: true,
                port: process.env.PORT || 3000,
                uptime: process.uptime()
            },
            services: {
                n8n: {
                    analyzeWebhook: !!N8N_CONFIG.analyzeWebhookUrl,
                    saveWebhook: !!N8N_CONFIG.saveWebhookUrl,
                    status: (N8N_CONFIG.analyzeWebhookUrl || N8N_CONFIG.saveWebhookUrl) ? 'configured' : 'not_configured'
                },
                googleSheets: {
                    hasCredentials: !!(GOOGLE_SHEETS_CONFIG.serviceAccountEmail && GOOGLE_SHEETS_CONFIG.privateKey),
                    hasMasterSpreadsheetId: !!GOOGLE_SHEETS_CONFIG.masterSpreadsheetId,
                    status: 'checking',
                    architecture: 'personal_spreadsheets_per_user'
                }
            }
        };

        // Test Master Spreadsheet connection
        if (healthStatus.services.googleSheets.hasCredentials && healthStatus.services.googleSheets.hasMasterSpreadsheetId) {
            console.log('🔍 Testing Master Spreadsheet connection...');
            try {
                const gsStatus = await testMasterSpreadsheetConnection();
                healthStatus.services.googleSheets = { ...healthStatus.services.googleSheets, ...gsStatus };
                
                if (gsStatus.status === 'connected') {
                    console.log('✅ Master Spreadsheet connected successfully');
                    console.log(`👥 ${gsStatus.usersSheet.totalUsers} total users`);
                    console.log(`📊 ${gsStatus.usersSheet.usersWithSpreadsheets} users with personal spreadsheets`);
                } else {
                    console.log('⚡ Master Spreadsheet connection issue:', gsStatus.error);
                }
            } catch (gsError) {
                console.error('❌ Master Spreadsheet test failed:', gsError);
                healthStatus.services.googleSheets = {
                    ...healthStatus.services.googleSheets,
                    status: 'error',
                    error: gsError.message
                };
            }
        } else {
            healthStatus.services.googleSheets.status = 'not_configured';
        }

        // Set overall status
        if (healthStatus.services.googleSheets.status === 'error') {
            healthStatus.status = 'DEGRADED';
            healthStatus.message = 'Master Spreadsheet connection failed, but server is running';
        } else if (healthStatus.services.googleSheets.status === 'not_configured') {
            healthStatus.status = 'DEGRADED';
            healthStatus.message = 'Google Sheets not configured, running in limited mode';
        }

        console.log(`✅ Health check completed - Status: ${healthStatus.status}`);
        res.status(200).json(healthStatus);
        
    } catch (error) {
        console.error('❌ Health check error:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message,
            services: {
                server: { running: false },
                googleSheets: { status: 'error', error: error.message }
            }
        });
    }
});

// GET /api/config - Configuration endpoint
router.get('/config', (req, res) => {
    try {
        const config = {
            categories: [
                { id: 'makanan', name: 'Makanan', icon: 'fas fa-utensils' },
                { id: 'transportasi', name: 'Transportasi', icon: 'fas fa-car' },
                { id: 'belanja', name: 'Belanja', icon: 'fas fa-shopping-bag' },
                { id: 'hiburan', name: 'Hiburan', icon: 'fas fa-gamepad' },
                { id: 'kesehatan', name: 'Kesehatan', icon: 'fas fa-heartbeat' },
                { id: 'pendidikan', name: 'Pendidikan', icon: 'fas fa-graduation-cap' },
                { id: 'lainnya', name: 'Lainnya', icon: 'fas fa-receipt' }
            ],
            maxFileSize: '10MB',
            supportedFormats: ['JPEG', 'PNG', 'WebP'],
            features: {
                receiptAnalysis: !!N8N_CONFIG.analyzeWebhookUrl,
                googleSheets: !!(GOOGLE_SHEETS_CONFIG.serviceAccountEmail && GOOGLE_SHEETS_CONFIG.privateKey),
                personalSpreadsheets: true, // NEW: Personal spreadsheet per user
                directConnection: true,
                offlineMode: true,
                filenameSupport: true,
                driveUpload: !!process.env.GOOGLE_DRIVE_FOLDER_ID
            },
            api: {
                version: '3.0.0', // Bumped version for personal spreadsheets
                baseUrl: `http://localhost:${process.env.PORT || 3000}/api`,
                endpoints: {
                    health: 'GET /api/health',
                    config: 'GET /api/config',
                    expenses: 'GET /api/expenses?userEmail={email}',
                    saveExpense: 'POST /api/save-expense',
                    clearData: 'DELETE /api/clear-data',
                    stats: 'GET /api/stats?userEmail={email}',
                    analyzeReceipt: 'POST /api/analyze-receipt',
                    userRegister: 'POST /api/user/register',
                    userSetup: 'POST /api/user/setup',
                    userProfile: 'GET /api/user/profile/{email}',
                    userSpreadsheet: 'GET /api/user/spreadsheet/{email}'
                }
            },
            spreadsheets: {
                architecture: 'PERSONAL_PER_USER',
                configured: !!(GOOGLE_SHEETS_CONFIG.serviceAccountEmail && GOOGLE_SHEETS_CONFIG.privateKey && GOOGLE_SHEETS_CONFIG.masterSpreadsheetId),
                masterSpreadsheetId: GOOGLE_SHEETS_CONFIG.masterSpreadsheetId ? 'configured' : 'missing',
                userTableStructure: ['UID', 'Email', 'Name', 'Nickname', 'Purpose', 'MonthlyBudget', 'Categories', 'IsSetupComplete', 'CreatedAt', 'LastLogin', 'Picture', 'SpreadsheetId'],
                expenseTableStructure: ['ID', 'Toko', 'Kategori', 'Total', 'Tanggal', 'Alamat', 'Catatan', 'Filename', 'DriveLink', 'Timestamp']
            }
        };

        res.json(config);
    } catch (error) {
        console.error('❌ Config error:', error);
        res.status(500).json({
            error: 'Failed to load configuration',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;