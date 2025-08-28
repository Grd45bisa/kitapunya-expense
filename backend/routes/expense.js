// routes/expense.js - Base64 Only Storage (No Google Drive)
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const sharp = require('sharp');

const router = express.Router();

// Updated headers with Base64 column only
const SHEET_HEADERS = ['ID', 'Toko', 'Kategori', 'Total', 'Tanggal', 'Alamat', 'Catatan', 'Filename', 'Timestamp', 'Base64'];

// Image compression and Base64 conversion with random identifier
async function processImageToBase64(buffer, originalName) {
    try {
        console.log(`Processing image: ${originalName}, original size: ${Math.round(buffer.length / 1024)}KB`);
        
        // First pass: Moderate compression
        let compressedBuffer = await sharp(buffer)
            .resize(800, 1200, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ 
                quality: 75,
                progressive: true
            })
            .toBuffer();
        
        let base64String = compressedBuffer.toString('base64');
        
        // Generate random prefix for Base64 data
        const randomPrefix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        
        // If still too large for Google Sheets, compress more aggressively
        if (dataUrl.length > 45000) {
            console.log('Image too large, applying aggressive compression...');
            
            compressedBuffer = await sharp(buffer)
                .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 50, progressive: true })
                .toBuffer();
            
            base64String = compressedBuffer.toString('base64');
            
            if (base64String.length > 40000) {
                throw new Error('Image too large even after compression. Try a smaller image.');
            }
        }
        
        const compressionRatio = Math.round((1 - compressedBuffer.length / buffer.length) * 100);
        
        return {
            base64: `data:image/jpeg;base64,${base64String}`,
            randomId: randomPrefix,
            originalSize: buffer.length,
            compressedSize: compressedBuffer.length,
            compressionRatio,
            success: true
        };
        
    } catch (error) {
        console.error('Image processing failed:', error.message);
        throw new Error(`Failed to process image: ${error.message}`);
    }
}

// Personal Sheets connection with Base64 support
class PersonalSheetsService {
    constructor() {
        this.auth = this.initAuth();
        this.sheetsCache = {};
        
        if (this.auth) {
            console.log('✅ PersonalSheetsService initialized successfully');
        } else {
            console.warn('⚠️ PersonalSheetsService not configured - missing credentials');
        }
    }

    initAuth() {
        const { email, key } = {
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };

        if (!email || !key) {
            console.warn('❌ Missing Google credentials - Email:', !!email, 'Key:', !!key);
            return null;
        }

        return new JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    }

    async ensureUserExists(userEmail, userName) {
        try {
            const { userService } = require('./user');
            
            if (!userService || !userService.auth) {
                console.warn('⚠️ UserService not available');
                return true;
            }

            let user = await userService.findUser(userEmail);
            
            if (!user) {
                console.log(`🆕 Auto-creating user: ${userEmail}`);
                
                await userService.createUser({
                    uid: `auto_${Date.now()}`,
                    email: userEmail,
                    name: userName || userEmail.split('@')[0],
                    isSetupComplete: true
                });
                
                console.log(`✅ User auto-created: ${userEmail}`);
                return true;
            }

            if (!user.spreadsheetId) {
                console.log(`📊 Creating spreadsheet for existing user: ${userEmail}`);
                await userService.updateUser(userEmail, {
                    isSetupComplete: true
                });
            }

            return true;
            
        } catch (error) {
            console.error('❌ Failed to ensure user exists:', error.message);
            throw new Error(`User verification failed: ${error.message}`);
        }
    }

    async getUserSpreadsheetId(userEmail) {
        const { userService } = require('./user');
        return await userService.getUserSpreadsheetId(userEmail);
    }

    async getUserSheet(userEmail) {
        if (!this.auth) {
            throw new Error('Google Sheets service not configured');
        }

        const sheetName = await this.getUserSpreadsheetId(userEmail);
        
        if (!sheetName) {
            throw new Error(`No spreadsheet found for user: ${userEmail}`);
        }

        console.log(`📋 Loading sheet ${sheetName} for ${userEmail}`);

        const cacheKey = `${userEmail}_${sheetName}`;
        if (this.sheetsCache[cacheKey]) {
            try {
                // Test if cached sheet is still valid by trying to load headers
                await this.sheetsCache[cacheKey].loadHeaderRow();
                return this.sheetsCache[cacheKey];
            } catch (error) {
                console.log('🔄 Cached sheet no longer valid, recreating...');
                delete this.sheetsCache[cacheKey];
            }
        }

        try {
            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, this.auth);
            await doc.loadInfo();
            
            let sheet = doc.sheetsByTitle[sheetName];
            
            if (!sheet) {
                console.log(`🔨 Sheet ${sheetName} not found, creating new one...`);
                
                sheet = await doc.addSheet({ 
                    title: sheetName, 
                    headerValues: SHEET_HEADERS
                });
                
                console.log(`✅ Created new sheet with headers: ${sheetName}`);
            } else {
                // Check if headers exist and are correct
                try {
                    await sheet.loadHeaderRow();
                    
                    if (!sheet.headerValues || sheet.headerValues.length === 0) {
                        console.log(`🔧 Sheet ${sheetName} has no headers, adding them...`);
                        await sheet.setHeaderRow(SHEET_HEADERS);
                        await sheet.loadHeaderRow();
                    } else if (!sheet.headerValues.includes('Base64')) {
                        console.log('➕ Adding Base64 column to existing sheet');
                        const newHeaders = [...sheet.headerValues, 'Base64'];
                        await sheet.setHeaderRow(newHeaders);
                        await sheet.loadHeaderRow();
                    }
                } catch (headerError) {
                    console.log(`🔧 Header error on sheet ${sheetName}, recreating headers...`);
                    await sheet.setHeaderRow(SHEET_HEADERS);
                    await sheet.loadHeaderRow();
                }
            }

            this.sheetsCache[cacheKey] = sheet;
            setTimeout(() => delete this.sheetsCache[cacheKey], 5 * 60 * 1000);

            return sheet;

        } catch (error) {
            console.error(`❌ Failed to load/create sheet for ${userEmail}:`, error.message);
            throw error;
        }
    }

    async saveExpense(userEmail, expenseData) {
        const sheet = await this.getUserSheet(userEmail);
        return await sheet.addRow(expenseData);
    }

    async getExpenses(userEmail) {
        try {
            const sheet = await this.getUserSheet(userEmail);
            const rows = await sheet.getRows();
            
            return rows.map(row => ({
                id: row.get('ID') || '',
                toko: row.get('Toko') || '',
                kategori: row.get('Kategori') || '',
                total: parseInt(row.get('Total')) || 0,
                tanggal: row.get('Tanggal') || '',
                alamat: row.get('Alamat') || '',
                catatan: row.get('Catatan') || '',
                filename: row.get('Filename') || 'No',
                timestamp: row.get('Timestamp') || '',
                base64: row.get('Base64') || ''
            })).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        } catch (error) {
            if (error.message.includes('404') || error.message.includes('not found')) {
                return [];
            }
            throw error;
        }
    }

    isReady() {
        return !!this.auth;
    }
}

const personalSheetsService = new PersonalSheetsService();

// Save expense endpoint with Base64 photo storage only
router.post('/save-expense', async (req, res) => {
    try {
        const { toko, kategori, total, tanggal, alamat, catatan, filename, photoData, userEmail, userName } = req.body;
        
        console.log(`💾 Save expense request for: ${userEmail}`);

        // Validate required fields
        if (!toko || !kategori || !total || !tanggal) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: toko, kategori, total, tanggal' 
            });
        }

        if (!userEmail) {
            return res.status(400).json({ 
                success: false, 
                error: 'User email required for personal spreadsheet' 
            });
        }

        if (!personalSheetsService.isReady()) {
            return res.status(503).json({ 
                success: false, 
                error: 'Google Sheets service not configured'
            });
        }

        // Auto-create user if needed
        await personalSheetsService.ensureUserExists(userEmail, userName);

        // Process photo data if provided
        let processedBase64 = '';
        let photoFilename = 'No';
        
        if (photoData && photoData.startsWith('data:image/')) {
            try {
                console.log(`📷 Processing photo data: ${Math.round(photoData.length / 1024)}KB`);
                
                // Extract base64 data without the data URL prefix
                const base64Data = photoData.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Detect original format from data URL
                const mimeMatch = photoData.match(/data:image\/([^;]+)/);
                const originalFormat = mimeMatch ? mimeMatch[1] : 'jpeg';
                console.log(`🔍 Detected format: ${originalFormat}`);
                
                const processed = await processImageToBase64(buffer, filename || 'photo.jpg');
                processedBase64 = processed.base64;
                photoFilename = `${processed.randomId}_${filename || `photo.${originalFormat}`}`;
                
                console.log(`✅ Photo processed: ${processed.compressionRatio}% compression, ID: ${processed.randomId}`);
            } catch (photoError) {
                console.error('❌ Photo processing failed:', photoError.message);
                // Continue without photo
                processedBase64 = '';
                photoFilename = 'No';
            }
        } else if (photoData) {
            console.warn('⚠️ Invalid photo data format received');
        }

        // Prepare expense data
        const expenseData = {
            ID: `exp_${Date.now()}`,
            Toko: toko,
            Kategori: kategori,
            Total: parseInt(total),
            Tanggal: tanggal,
            Alamat: alamat || '',
            Catatan: catatan || '',
            Filename: photoFilename,
            Timestamp: new Date().toISOString(),
            Base64: processedBase64
        };

        // Save to user's personal spreadsheet
        await personalSheetsService.saveExpense(userEmail, expenseData);
        console.log(`✅ Saved to ${userEmail}'s personal spreadsheet with Base64 photo`);
        
        res.json({ 
            success: true, 
            message: 'Expense saved with Base64 photo', 
            expense: {
                id: expenseData.ID,
                toko: expenseData.Toko,
                kategori: expenseData.Kategori,
                total: expenseData.Total,
                tanggal: expenseData.Tanggal,
                alamat: expenseData.Alamat,
                catatan: expenseData.Catatan,
                filename: expenseData.Filename,
                hasPhoto: !!expenseData.Base64,
                timestamp: expenseData.Timestamp,
                base64: expenseData.Base64
            }
        });
        
    } catch (error) {
        console.error('❌ Save expense error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save expense',
            details: error.message
        });
    }
});

// Get expenses endpoint
router.get('/expenses', async (req, res) => {
    try {
        const { userEmail, userName } = req.query;

        if (!userEmail) {
            return res.status(400).json({ 
                success: false, 
                error: 'User email required',
                expenses: []
            });
        }

        if (!personalSheetsService.isReady()) {
            return res.json({ 
                success: true, 
                expenses: [], 
                warning: 'Sheets service not configured' 
            });
        }

        try {
            await personalSheetsService.ensureUserExists(userEmail, userName);
        } catch (userError) {
            console.warn(`⚠️ User verification failed: ${userError.message}`);
        }

        const expenses = await personalSheetsService.getExpenses(userEmail);
        
        console.log(`✅ Found ${expenses.length} expenses for ${userEmail}`);
        res.json({ success: true, expenses });
        
    } catch (error) {
        console.error('❌ Get expenses error:', error.message);
        res.json({ 
            success: true, 
            expenses: [], 
            warning: 'Failed to load from personal spreadsheet'
        });
    }
});

module.exports = router;
module.exports.PersonalSheetsService = PersonalSheetsService;