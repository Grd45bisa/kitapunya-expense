// utils/helpers.js - Utility Functions

/**
 * Map category from AI/OCR result to predefined categories
 * @param {string} aiCategory - Category detected by AI
 * @returns {string} - Mapped category
 */
function mapCategoryFromAI(aiCategory) {
    const categoryMap = {
        // Food & Dining
        'food': 'makanan',
        'restaurant': 'makanan',
        'grocery': 'makanan',
        'groceries': 'makanan',
        'dining': 'makanan',
        'cafe': 'makanan',
        'fastfood': 'makanan',
        'kfc': 'makanan',
        'mcdonald': 'makanan',
        'pizza': 'makanan',
        'starbucks': 'makanan',
        
        // Transportation
        'transport': 'transportasi',
        'transportation': 'transportasi',
        'taxi': 'transportasi',
        'bus': 'transportasi',
        'train': 'transportasi',
        'fuel': 'transportasi',
        'gasoline': 'transportasi',
        'parking': 'transportasi',
        'toll': 'transportasi',
        'ojek': 'transportasi',
        'gojek': 'transportasi',
        'grab': 'transportasi',
        
        // Shopping
        'shopping': 'belanja',
        'retail': 'belanja',
        'store': 'belanja',
        'supermarket': 'belanja',
        'mall': 'belanja',
        'clothing': 'belanja',
        'electronics': 'belanja',
        'indomaret': 'belanja',
        'alfamart': 'belanja',
        
        // Entertainment
        'entertainment': 'hiburan',
        'movie': 'hiburan',
        'cinema': 'hiburan',
        'game': 'hiburan',
        'sports': 'hiburan',
        'recreation': 'hiburan',
        'gym': 'hiburan',
        'streaming': 'hiburan',
        
        // Health
        'health': 'kesehatan',
        'medical': 'kesehatan',
        'pharmacy': 'kesehatan',
        'hospital': 'kesehatan',
        'doctor': 'kesehatan',
        'medicine': 'kesehatan',
        'clinic': 'kesehatan',
        
        // Education
        'education': 'pendidikan',
        'school': 'pendidikan',
        'university': 'pendidikan',
        'course': 'pendidikan',
        'book': 'pendidikan',
        'training': 'pendidikan'
    };

    if (!aiCategory) return 'belanja'; // default category
    
    const lowercaseCategory = aiCategory.toLowerCase().trim();
    
    // Try exact match first
    if (categoryMap[lowercaseCategory]) {
        return categoryMap[lowercaseCategory];
    }
    
    // Try partial match
    for (const [key, value] of Object.entries(categoryMap)) {
        if (lowercaseCategory.includes(key) || key.includes(lowercaseCategory)) {
            return value;
        }
    }
    
    return 'belanja'; // default fallback
}

/**
 * Parse amount from various string formats
 * @param {string|number} amountString - Amount in various formats
 * @returns {number} - Parsed amount as integer
 */
function parseAmount(amountString) {
    if (typeof amountString === 'number') {
        return Math.round(amountString);
    }
    
    if (!amountString) return 0;
    
    // Convert to string and clean up
    let cleanAmount = amountString.toString().trim();
    
    // Remove common currency symbols and words
    cleanAmount = cleanAmount
        .replace(/[Rp\$â‚¬Â£Â¥]/gi, '') // Currency symbols
        .replace(/rupiah|dollar|euro|pound/gi, '') // Currency words
        .replace(/\s+/g, '') // Remove all spaces
        .replace(/[^\d.,]/g, ''); // Keep only digits, commas, and dots
    
    // Handle Indonesian number format (dots as thousand separators)
    // Example: 1.500.000,50 -> 1500000.50
    if (cleanAmount.includes('.') && cleanAmount.includes(',')) {
        // Remove dots (thousand separators) and replace comma with dot
        cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
    } else if (cleanAmount.includes('.') && !cleanAmount.includes(',')) {
        // Check if dot is decimal or thousand separator
        const parts = cleanAmount.split('.');
        if (parts.length === 2 && parts[1].length <= 2) {
            // Likely decimal point
            cleanAmount = cleanAmount;
        } else {
            // Likely thousand separators
            cleanAmount = cleanAmount.replace(/\./g, '');
        }
    } else if (cleanAmount.includes(',') && !cleanAmount.includes('.')) {
        // Replace comma with dot for decimal
        cleanAmount = cleanAmount.replace(',', '.');
    }
    
    const parsed = parseFloat(cleanAmount);
    return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Format date string to YYYY-MM-DD format
 * @param {string} dateString - Date in various formats
 * @returns {string|null} - Formatted date or null if invalid
 */
function formatDate(dateString) {
    if (!dateString) return null;
    
    try {
        // Handle various date formats
        let date;
        
        // Try parsing as-is first
        date = new Date(dateString);
        
        // If invalid, try common Indonesian formats
        if (isNaN(date.getTime())) {
            // Try DD/MM/YYYY or DD-MM-YYYY
            const ddmmyyyy = dateString.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (ddmmyyyy) {
                const [, day, month, year] = ddmmyyyy;
                date = new Date(year, month - 1, day);
            }
        }
        
        if (isNaN(date.getTime())) return null;
        
        // Return in YYYY-MM-DD format
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.warn('Invalid date format:', dateString);
        return null;
    }
}

/**
 * Validate date string in YYYY-MM-DD format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid
 */
function isValidDate(dateString) {
    if (!dateString) return false;
    
    // Check format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && 
           date.toISOString().split('T')[0] === dateString;
}

/**
 * Generate unique ID with prefix
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Generated ID
 */
function generateId(prefix = 'id') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: IDR)
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, currency = 'IDR') {
    if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
    
    if (currency === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    if (!filename) return 'file';
    
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .toLowerCase();
}

module.exports = {
    mapCategoryFromAI,
    parseAmount,
    formatDate,
    isValidDate,
    generateId,
    formatCurrency,
    sanitizeFilename
};