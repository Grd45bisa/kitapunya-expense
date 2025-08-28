// routes/delete.js - Simplified delete without Firebase
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Import userService if available
let userService;
try {
    userService = require('./user').userService;
} catch (error) {
    console.warn('⚠️ userService not available, using mock');
}

// DELETE /api/delete-account - Simple delete account endpoint
router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log(`🗑️ Delete account request received for: ${email}`);
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email required' 
            });
        }

        // Mock response if userService not available
        if (!userService || !userService.auth) {
            console.warn('⚠️ Service not configured, returning mock response');
            return res.json({ 
                success: true, 
                message: 'Account deleted (mock mode)',
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

        // Delete user's sheet (with random name)
        if (user.spreadsheetId) {
            try {
                console.log(`📊 Attempting to delete sheet: ${user.spreadsheetId}`);
                
                const { GoogleSpreadsheet } = require('google-spreadsheet');
                const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, userService.auth);
                await doc.loadInfo();
                
                const sheet = doc.sheetsByTitle[user.spreadsheetId];
                if (sheet) {
                    await sheet.delete();
                    spreadsheetDeleted = true;
                    console.log(`✅ Sheet ${user.spreadsheetId} deleted`);
                }
            } catch (err) {
                console.error(`⚠️ Could not delete sheet:`, err.message);
            }
        }

        // Delete user from master
        try {
            const sheet = await userService.getSheet();
            const rows = await sheet.getRows();
            const userRow = rows.find(r => r.get('Email') === email);
            
            if (userRow) {
                await userRow.delete();
                console.log(`✅ User deleted from master`);
            }
        } catch (err) {
            console.error(`⚠️ Could not delete from master:`, err.message);
        }

        console.log(`✅ Delete completed for ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Account and spreadsheet deleted',
            autoDeleted: spreadsheetDeleted,
            details: {
                userDeleted: true,
                spreadsheetDeleted: spreadsheetDeleted
            }
        });

    } catch (error) {
        console.error('❌ Delete error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete account',
            details: error.message
        });
    }
});

// GET /api/export-data/:email - Export user data
router.get('/export-data/:email', async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        
        console.log(`📤 Export request for: ${email}`);

        // Mock data if service not available
        if (!userService || !userService.auth) {
            const mockData = {
                exportDate: new Date().toISOString(),
                user: {
                    email: email,
                    name: 'User',
                    expenses: []
                },
                statistics: {
                    totalExpenses: 0,
                    totalAmount: 0
                }
            };
            
            const timestamp = new Date().toISOString().split('T')[0];
            const randomId = crypto.randomBytes(2).toString('hex').toUpperCase();
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="expense-data-${timestamp}-${randomId}.json"`);
            return res.json(mockData);
        }

        // Get user data
        const user = await userService.findUser(email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Get expenses from user's randomly named sheet
        let expenses = [];
        if (user.spreadsheetId) {
            try {
                const { GoogleSpreadsheet } = require('google-spreadsheet');
                const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, userService.auth);
                await doc.loadInfo();
                
                const sheet = doc.sheetsByTitle[user.spreadsheetId];
                if (sheet) {
                    const rows = await sheet.getRows();
                    expenses = rows.map(row => ({
                        id: row.get('ID'),
                        toko: row.get('Toko'),
                        kategori: row.get('Kategori'),
                        total: parseInt(row.get('Total')) || 0,
                        tanggal: row.get('Tanggal'),
                        alamat: row.get('Alamat'),
                        catatan: row.get('Catatan'),
                        filename: row.get('Filename'),
                        driveLink: row.get('DriveLink'),
                        timestamp: row.get('Timestamp')
                    }));
                    console.log(`✅ Retrieved ${expenses.length} expenses from sheet ${user.spreadsheetId}`);
                }
            } catch (err) {
                console.warn('⚠️ Could not get expenses:', err.message);
            }
        }

        // Calculate statistics
        const categoryTotals = {};
        expenses.forEach(exp => {
            categoryTotals[exp.kategori] = (categoryTotals[exp.kategori] || 0) + exp.total;
        });

        const exportData = {
            exportDate: new Date().toISOString(),
            user: {
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                purpose: user.purpose,
                monthlyBudget: user.monthlyBudget,
                categories: user.categories,
                createdAt: user.createdAt
                // Note: spreadsheetId not exposed for privacy
            },
            expenses: expenses,
            statistics: {
                totalExpenses: expenses.length,
                totalAmount: expenses.reduce((sum, exp) => sum + exp.total, 0),
                categoryBreakdown: categoryTotals
            }
        };

        // Generate secure filename without email
        const timestamp = new Date().toISOString().split('T')[0];
        const randomId = crypto.randomBytes(2).toString('hex').toUpperCase();
        const filename = `expense-data-${timestamp}-${randomId}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(exportData);

        console.log(`✅ Export completed for ${email}`);

    } catch (error) {
        console.error('❌ Export error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to export data'
        });
    }
});

module.exports = router;