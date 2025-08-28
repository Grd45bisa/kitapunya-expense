// debug.js - Debug Environment Variables (temporary file for testing)
require('dotenv').config();

console.log('🔍 Environment Variables Debug');
console.log('================================');

// Check all auth-related environment variables
const envVars = {
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
    'FIREBASE_SERVICE_ACCOUNT': process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET (JSON)' : 'NOT SET',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL': process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    'GOOGLE_PRIVATE_KEY': process.env.GOOGLE_PRIVATE_KEY ? 'SET' : 'NOT SET',
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT
};

Object.entries(envVars).forEach(([key, value]) => {
    if (key === 'GOOGLE_CLIENT_ID' && value) {
        console.log(`${key}: ${value.substring(0, 20)}...`);
    } else if (key === 'GOOGLE_CLIENT_SECRET' && value) {
        console.log(`${key}: ${value.substring(0, 10)}...`);
    } else {
        console.log(`${key}: ${value || 'NOT SET'}`);
    }
});

console.log('\n🧪 Testing OAuth2Client Creation');
console.log('=================================');

try {
    const { OAuth2Client } = require('google-auth-library');
    
    // Test 1: Basic client creation
    const client1 = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log('✅ Basic OAuth2Client created successfully');
    
    // Test 2: Client with secret
    if (process.env.GOOGLE_CLIENT_SECRET) {
        const client2 = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        });
        console.log('✅ OAuth2Client with secret created successfully');
    }
    
    // Test 3: Firebase Service Account parsing
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log(`✅ Firebase Service Account parsed - Project: ${serviceAccount.project_id}`);
        } catch (error) {
            console.error('❌ Firebase Service Account JSON parsing failed:', error.message);
        }
    }
    
} catch (error) {
    console.error('❌ OAuth2Client creation failed:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n🔧 Recommendations');
console.log('==================');

if (!process.env.GOOGLE_CLIENT_ID) {
    console.log('❌ Add GOOGLE_CLIENT_ID to your .env file');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️ Consider adding GOOGLE_CLIENT_SECRET for better security');
}

console.log('✅ Debug complete - check the logs above for issues');