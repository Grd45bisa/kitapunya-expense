// routes/user.js - Enhanced with Personal Spreadsheet per User
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');

const router = express.Router();
const HEADERS = ['UID', 'Email', 'Name', 'Nickname', 'Purpose', 'MonthlyBudget', 'Categories', 'IsSetupComplete', 'CreatedAt', 'LastLogin', 'Picture', 'SpreadsheetId'];

class UserService {
    constructor() {
        this.sheet = null;
        this.auth = this.initAuth();
        this.drive = null;
        this.sheets = null;
        
        if (this.auth) {
            this.drive = google.drive({ version: 'v3', auth: this.auth });
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        }
    }

    initAuth() {
        const { email, key, spreadsheetId } = {
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID // Master spreadsheet for users
        };

        if (!email || !key || !spreadsheetId) return null;

        return new JWT({
            email, key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file'
            ]
        });
    }

    async getSheet() {
        if (!this.auth) throw new Error('Sheets not configured');
        if (this.sheet) return this.sheet;

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, this.auth);
        await doc.loadInfo();
        
        let sheet = doc.sheetsByTitle['Users'] || await doc.addSheet({ 
            title: 'Users', 
            headerValues: HEADERS 
        });
        
        await sheet.loadHeaderRow();
        this.sheet = sheet;
        return sheet;
    }

    // Create personal spreadsheet for user
    async createPersonalSpreadsheet(userEmail, userName) {
        try {
            if (!this.sheets || !this.drive) {
                console.warn('⚠️ Sheets API not available');
                return null;
            }

            console.log(`📊 Creating personal spreadsheet for ${userEmail}`);

            // Create new spreadsheet
            const spreadsheet = await this.sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title: `Expense Tracker - ${userName || userEmail}`
                    },
                    sheets: [{
                        properties: {
                            title: 'Expenses',
                            gridProperties: { rowCount: 1000, columnCount: 10 }
                        }
                    }]
                }
            });

            const spreadsheetId = spreadsheet.data.spreadsheetId;
            console.log(`✅ Created spreadsheet: ${spreadsheetId}`);

            // Set headers
            await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Expenses!A1:J1',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [['ID', 'Toko', 'Kategori', 'Total', 'Tanggal', 'Alamat', 'Catatan', 'Filename', 'DriveLink', 'Timestamp']]
                }
            });

            // Share with user (optional - if they have Gmail)
            try {
                await this.drive.permissions.create({
                    fileId: spreadsheetId,
                    requestBody: {
                        type: 'user',
                        role: 'writer',
                        emailAddress: userEmail
                    }
                });
                console.log(`✅ Shared with ${userEmail}`);
            } catch (shareError) {
                console.log(`ℹ️ Could not share with ${userEmail} (might not be Gmail)`);
            }

            return spreadsheetId;

        } catch (error) {
            console.error('❌ Create personal spreadsheet error:', error.message);
            return null;
        }
    }

    async findUser(email) {
        try {
            const sheet = await this.getSheet();
            const rows = await sheet.getRows();
            const row = rows.find(r => r.get('Email') === email);
            
            if (!row) return null;
            
            return {
                uid: row.get('UID'),
                email: row.get('Email'),
                name: row.get('Name'),
                nickname: row.get('Nickname'),
                purpose: row.get('Purpose'),
                monthlyBudget: row.get('MonthlyBudget'),
                categories: JSON.parse(row.get('Categories') || '[]'),
                isSetupComplete: row.get('IsSetupComplete') === 'true',
                createdAt: row.get('CreatedAt'),
                lastLogin: row.get('LastLogin'),
                picture: row.get('Picture'),
                spreadsheetId: row.get('SpreadsheetId')
            };
        } catch (error) {
            console.error('Find user error:', error.message);
            return null;
        }
    }

    async createUser(userData) {
        const sheet = await this.getSheet();
        
        // Create personal spreadsheet
        const spreadsheetId = await this.createPersonalSpreadsheet(
            userData.email, 
            userData.name || userData.email.split('@')[0]
        );
        
        await sheet.addRow({
            UID: userData.uid,
            Email: userData.email,
            Name: userData.name || '',
            Nickname: userData.nickname || '',
            Purpose: userData.purpose || '',
            MonthlyBudget: userData.monthlyBudget || '',
            Categories: JSON.stringify(userData.categories || []),
            IsSetupComplete: userData.isSetupComplete ? 'true' : 'false',
            CreatedAt: new Date().toISOString(),
            LastLogin: new Date().toISOString(),
            Picture: userData.picture || '',
            SpreadsheetId: spreadsheetId || ''
        });
        
        const user = await this.findUser(userData.email);
        return { ...user, autoCreated: !!spreadsheetId };
    }

    async updateUser(email, updates) {
        const sheet = await this.getSheet();
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('Email') === email);
        
        if (!row) throw new Error('User not found');
        
        // Check if user needs a spreadsheet
        if (!row.get('SpreadsheetId') && this.sheets) {
            const userName = updates.nickname || row.get('Name') || email.split('@')[0];
            const spreadsheetId = await this.createPersonalSpreadsheet(email, userName);
            if (spreadsheetId) {
                row.set('SpreadsheetId', spreadsheetId);
                console.log(`📊 Created spreadsheet for existing user: ${email}`);
            }
        }
        
        Object.entries(updates).forEach(([key, value]) => {
            const headerMap = {
                nickname: 'Nickname',
                purpose: 'Purpose', 
                monthlyBudget: 'MonthlyBudget',
                categories: 'Categories',
                isSetupComplete: 'IsSetupComplete',
                picture: 'Picture',
                spreadsheetId: 'SpreadsheetId'
            };
            
            if (headerMap[key]) {
                const headerName = headerMap[key];
                if (key === 'categories') value = JSON.stringify(value);
                if (key === 'isSetupComplete') value = value ? 'true' : 'false';
                row.set(headerName, value);
            }
        });
        
        row.set('LastLogin', new Date().toISOString());
        await row.save();
        
        return this.findUser(email);
    }

    async getUserSpreadsheetId(email) {
        const user = await this.findUser(email);
        return user?.spreadsheetId || null;
    }
}

const userService = new UserService();

// POST /api/user/register
router.post('/register', async (req, res) => {
    try {
        const { uid, email, name, picture } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        if (!userService.auth) {
            return res.json({
                success: true,
                user: { uid, email, name, picture, isSetupComplete: false },
                isNew: true
            });
        }

        let user = await userService.findUser(email);
        
        if (user) {
            user = await userService.updateUser(email, { picture });
            return res.json({ success: true, user, isNew: false });
        } else {
            const result = await userService.createUser({
                uid: uid || `user_${Date.now()}`,
                email, name, picture,
                isSetupComplete: false
            });
            return res.json({ 
                success: true, 
                user: result, 
                isNew: true,
                autoCreated: result.autoCreated 
            });
        }
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// POST /api/user/setup
router.post('/setup', async (req, res) => {
    try {
        const { email, nickname, purpose, monthlyBudget, categories } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        if (!userService.auth) {
            return res.json({
                success: true,
                user: { email, nickname, purpose, monthlyBudget, categories, isSetupComplete: true }
            });
        }

        const user = await userService.updateUser(email, {
            nickname, purpose, monthlyBudget, categories,
            isSetupComplete: true
        });
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Setup error:', error.message);
        res.status(500).json({ success: false, error: 'Setup failed' });
    }
});

// GET /api/user/profile/:email
router.get('/profile/:email', async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        
        if (!userService.auth) {
            return res.json({ success: false, error: 'Service not configured' });
        }

        const user = await userService.findUser(email);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to get profile' });
    }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
    try {
        const { email, ...updates } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        if (!userService.auth) {
            return res.json({ success: true, user: { email, ...updates } });
        }

        const user = await userService.updateUser(email, updates);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

// GET /api/user/spreadsheet/:email
router.get('/spreadsheet/:email', async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const spreadsheetId = await userService.getUserSpreadsheetId(email);
        
        res.json({ 
            success: true, 
            spreadsheetId,
            url: spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : null
        });
    } catch (error) {
        console.error('Get spreadsheet error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to get spreadsheet' });
    }
});

// DELETE /api/user/delete-account - Auto-delete account & spreadsheet
router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        console.log(`🗑️ Starting auto-delete for user: ${email}`);

        if (!userService.auth) {
            return res.status(503).json({ 
                success: false, 
                error: 'Service not configured' 
            });
        }

        // Find user first
        const user = await userService.findUser(email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        let spreadsheetDeleted = false;

        // Auto-delete Google Spreadsheet if exists
        if (user.spreadsheetId && userService.drive) {
            try {
                console.log(`📊 Deleting spreadsheet: ${user.spreadsheetId}`);
                
                await userService.drive.files.delete({
                    fileId: user.spreadsheetId
                });
                
                spreadsheetDeleted = true;
                console.log(`✅ Spreadsheet deleted successfully`);
            } catch (deleteError) {
                console.error(`⚠️ Failed to delete spreadsheet:`, deleteError.message);
                // Continue even if spreadsheet deletion fails
            }
        }

        // Delete user from master spreadsheet
        try {
            const sheet = await userService.getSheet();
            const rows = await sheet.getRows();
            const userRow = rows.find(r => r.get('Email') === email);
            
            if (userRow) {
                await userRow.delete();
                console.log(`✅ User removed from master spreadsheet`);
            }
        } catch (deleteUserError) {
            console.error(`⚠️ Failed to delete user from master:`, deleteUserError.message);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to delete user data' 
            });
        }

        console.log(`✅ Auto-delete completed for ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Account and personal spreadsheet deleted successfully',
            autoDeleted: spreadsheetDeleted,
            details: {
                userDeleted: true,
                spreadsheetDeleted: spreadsheetDeleted
            }
        });

    } catch (error) {
        console.error('❌ Delete account error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete account',
            details: error.message
        });
    }
});

// GET /api/user/export-data/:email - Export user data
router.get('/export-data/:email', async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        
        if (!userService.auth) {
            return res.status(503).json({ 
                success: false, 
                error: 'Service not configured' 
            });
        }

        console.log(`📤 Exporting data for: ${email}`);

        // Get user data
        const user = await userService.findUser(email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Get user's expenses
        let expenses = [];
        if (user.spreadsheetId) {
            try {
                const personalSheetsService = new (require('./expense')).PersonalSheetsService();
                if (personalSheetsService.isReady()) {
                    expenses = await personalSheetsService.getExpenses(email);
                }
            } catch (expenseError) {
                console.warn('⚠️ Could not get expenses:', expenseError.message);
            }
        }

        // Prepare export data
        const exportData = {
            exportDate: new Date().toISOString(),
            user: {
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                purpose: user.purpose,
                monthlyBudget: user.monthlyBudget,
                categories: user.categories,
                createdAt: user.createdAt,
                spreadsheetId: user.spreadsheetId
            },
            expenses: expenses,
            statistics: {
                totalExpenses: expenses.length,
                totalAmount: expenses.reduce((sum, exp) => sum + exp.total, 0)
            }
        };

        console.log(`✅ Exported ${expenses.length} expenses for ${email}`);

        // Send as downloadable JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="expense-data-${email.split('@')[0]}-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);

    } catch (error) {
        console.error('❌ Export data error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to export data',
            details: error.message
        });
    }
});

module.exports = router;
module.exports.userService = userService;