// routes/user.js - Simplified version with random spreadsheet names
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const crypto = require('crypto');

const router = express.Router();
const HEADERS = ['UID', 'Email', 'Name', 'Nickname', 'Purpose', 'MonthlyBudget', 'Categories', 'IsSetupComplete', 'CreatedAt', 'LastLogin', 'Picture', 'SpreadsheetId'];

class UserService {
    constructor() {
        this.sheet = null;
        this.auth = this.initAuth();
    }

    initAuth() {
        const { email, key, spreadsheetId } = {
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
        };

        if (!email || !key || !spreadsheetId) return null;

        return new JWT({
            email, key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
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

    // Generate random spreadsheet name for privacy
    generateRandomSpreadsheetName() {
        const adjectives = ['Swift', 'Bright', 'Clear', 'Fresh', 'Smart', 'Quick', 'Active', 'Dynamic', 'Prime', 'Ultra'];
        const nouns = ['Ledger', 'Tracker', 'Record', 'Journal', 'Book', 'Log', 'Notes', 'Data', 'File', 'Sheet'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomId = crypto.randomBytes(3).toString('hex').toUpperCase();
        
        return `${randomAdj}${randomNoun}_${randomId}`;
    }

    // Create personal spreadsheet with random name
    async createPersonalSpreadsheet(userEmail, userName) {
        try {
            console.log(`📊 Creating personal sheet for ${userEmail}`);
            
            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, this.auth);
            await doc.loadInfo();
            
            // Generate unique random name
            let sheetName;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
                sheetName = this.generateRandomSpreadsheetName();
                
                // Check if sheet name already exists
                if (!doc.sheetsByTitle[sheetName]) {
                    break;
                }
                
                attempts++;
                console.log(`⚠️ Sheet name ${sheetName} already exists, regenerating...`);
            }
            
            if (attempts === maxAttempts) {
                // Fallback to timestamp-based name
                sheetName = `Sheet_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
            }
            
            // Create the sheet with random name
            const userSheet = await doc.addSheet({
                title: sheetName,
                headerValues: ['ID', 'Toko', 'Kategori', 'Total', 'Tanggal', 'Alamat', 'Catatan', 'Filename', 'DriveLink', 'Timestamp']
            });
            
            console.log(`✅ Created sheet with random name: ${sheetName} for user ${userEmail}`);
            
            return sheetName;

        } catch (error) {
            console.error('❌ Create personal sheet error:', error.message);
            
            // Fallback name generation
            const fallbackSheetName = `Sheet_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
            console.log(`⚠️ Using fallback sheet name: ${fallbackSheetName}`);
            return fallbackSheetName;
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
        
        // Create personal sheet with random name
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
        
        // Check if user needs a sheet with random name
        if (!row.get('SpreadsheetId')) {
            const userName = updates.nickname || row.get('Name') || email.split('@')[0];
            const spreadsheetId = await this.createPersonalSpreadsheet(email, userName);
            if (spreadsheetId) {
                row.set('SpreadsheetId', spreadsheetId);
                console.log(`📊 Created random sheet for existing user: ${email}`);
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
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return null;
        }
        console.log(`📊 User ${email} spreadsheet: ${user.spreadsheetId || 'NOT SET'}`);
        return user?.spreadsheetId || null;
    }

    async deleteUserSpreadsheet(spreadsheetId) {
        try {
            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, this.auth);
            await doc.loadInfo();
            
            const sheet = doc.sheetsByTitle[spreadsheetId];
            if (sheet) {
                await sheet.delete();
                console.log(`✅ Deleted sheet: ${spreadsheetId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`⚠️ Could not delete sheet:`, error.message);
            return false;
        }
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

// DELETE /api/user/delete-account
router.delete('/delete-account', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email required' });
        }

        console.log(`🗑️ Starting delete for user: ${email}`);

        if (!userService.auth) {
            return res.status(503).json({ 
                success: false, 
                error: 'Service not configured' 
            });
        }

        const user = await userService.findUser(email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        let spreadsheetDeleted = false;

        // Delete user's sheet
        if (user.spreadsheetId) {
            spreadsheetDeleted = await userService.deleteUserSpreadsheet(user.spreadsheetId);
        }

        // Delete user from master
        try {
            const sheet = await userService.getSheet();
            const rows = await sheet.getRows();
            const userRow = rows.find(r => r.get('Email') === email);
            
            if (userRow) {
                await userRow.delete();
                console.log(`✅ User removed from master`);
            }
        } catch (deleteUserError) {
            console.error(`⚠️ Failed to delete user:`, deleteUserError.message);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to delete user data' 
            });
        }

        console.log(`✅ Delete completed for ${email}`);
        
        res.json({ 
            success: true, 
            message: 'Account and data deleted successfully',
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

// GET /api/user/export-data/:email
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

        const user = await userService.findUser(email);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Get user's expenses from their sheet
        let expenses = [];
        if (user.spreadsheetId) {
            try {
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
                }
            } catch (expenseError) {
                console.warn('⚠️ Could not get expenses:', expenseError.message);
            }
        }

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
            },
            expenses: expenses,
            statistics: {
                totalExpenses: expenses.length,
                totalAmount: expenses.reduce((sum, exp) => sum + exp.total, 0)
            }
        };

        console.log(`✅ Exported ${expenses.length} expenses for ${email}`);

        // Generate filename without email for privacy
        const timestamp = new Date().toISOString().split('T')[0];
        const randomId = crypto.randomBytes(2).toString('hex').toUpperCase();
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="expense-data-${timestamp}-${randomId}.json"`);
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
            url: process.env.GOOGLE_SPREADSHEET_ID ? 
                `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}/edit#gid=${spreadsheetId}` : 
                null
        });
    } catch (error) {
        console.error('Get spreadsheet error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to get spreadsheet' });
    }
});

module.exports = router;
module.exports.userService = userService;