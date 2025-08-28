// routes/receipt.js - Base64 Only Receipt Processing (No Drive Upload)
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

const router = express.Router();

// Enhanced file upload config
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Convert image to Base64 with compression
async function convertToBase64(buffer, originalName) {
    try {
        console.log(`Converting to Base64: ${originalName}, size: ${Math.round(buffer.length / 1024)}KB`);
        
        // Compress image
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
        
        const base64String = compressedBuffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        
        // Check size limit for Google Sheets
        if (dataUrl.length > 50000) {
            console.log('Image too large, applying more compression...');
            
            compressedBuffer = await sharp(buffer)
                .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 50 })
                .toBuffer();
            
            const newBase64 = compressedBuffer.toString('base64');
            return `data:image/jpeg;base64,${newBase64}`;
        }
        
        return dataUrl;
        
    } catch (error) {
        console.error('Base64 conversion failed:', error.message);
        throw new Error('Failed to convert image to Base64');
    }
}

// Main receipt analysis endpoint with Base64 conversion
router.post('/analyze-receipt', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No photo uploaded' 
            });
        }

        const userEmail = req.body.userEmail || req.headers['x-user-email'];
        console.log(`📸 Processing receipt: ${req.file.originalname} for user: ${userEmail || 'anonymous'}`);
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 5).toUpperCase();
        const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
        const filename = `${randomId}_${timestamp}.${fileExtension}`;
        
        // Convert to Base64
        let photoBase64 = null;
        try {
            photoBase64 = await convertToBase64(req.file.buffer, filename);
            console.log(`✅ Image converted to Base64, size: ${Math.round(photoBase64.length / 1024)}KB`);
        } catch (base64Error) {
            console.error('❌ Base64 conversion failed:', base64Error.message);
            // Continue without photo
        }

        // Process with OCR (existing functionality)
        const analysis = await processImage(req.file, filename);
        
        // Enhanced response with Base64 data
        const response = {
            success: true,
            analysis: {
                ...analysis,
                filename,
                photoBase64, // Include Base64 data in response
                hasPhoto: !!photoBase64
            }
        };

        console.log('✅ Receipt processing completed successfully');
        res.json(response);

    } catch (error) {
        console.error('❌ Receipt processing failed:', error.message);
        res.status(500).json({
            success: false,
            error: 'Processing failed',
            details: error.message
        });
    }
});

// Simplified image processing
async function processImage(file, filename) {
    // Try N8N webhook first
    if (process.env.N8N_ANALYZE_WEBHOOK_URL) {
        try {
            return await callN8NWebhook(file, filename);
        } catch (error) {
            console.warn('⚠️ N8N failed, using mock:', error.message);
        }
    }
    
    // Fallback to mock data
    return generateMockData();
}

// N8N webhook call
async function callN8NWebhook(file, filename) {
    const formData = new FormData();
    formData.append('file', file.buffer, {
        filename,
        contentType: file.mimetype
    });

    const response = await axios.post(
        process.env.N8N_ANALYZE_WEBHOOK_URL,
        formData,
        {
            headers: formData.getHeaders(),
            timeout: 60000
        }
    );

    return {
        toko: response.data.toko || 'Unknown Store',
        kategori: response.data.kategori || 'lainnya',
        total: parseInt(response.data.total) || 0,
        tanggal: response.data.tanggal || new Date().toISOString().split('T')[0],
        alamat: response.data.alamat || '',
        catatan: response.data.catatan || '',
        confidence: response.data.confidence || 0.8
    };
}

// Mock data generator
function generateMockData() {
    const stores = ['Alfamart', 'Indomaret', 'KFC', 'McDonald\'s', 'Starbucks'];
    const categories = ['makanan', 'belanja', 'transportasi'];
    const amounts = [15000, 25000, 35000, 45000, 65000];
    
    return {
        toko: stores[Math.floor(Math.random() * stores.length)],
        kategori: categories[Math.floor(Math.random() * categories.length)],
        total: amounts[Math.floor(Math.random() * amounts.length)],
        tanggal: new Date().toISOString().split('T')[0],
        alamat: 'Jl. Sudirman No. 123',
        catatan: 'Auto-generated mock data',
        confidence: 0.9,
        mock: true
    };
}

// Health check endpoint
router.get('/extractor-health', async (req, res) => {
    res.json({
        status: 'healthy',
        services: {
            n8n: !!process.env.N8N_ANALYZE_WEBHOOK_URL,
            base64Storage: true
        },
        features: {
            photoStorage: 'base64_sheets',
            compression: true,
            mockData: true
        }
    });
});

module.exports = router;