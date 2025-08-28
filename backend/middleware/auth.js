// middleware/auth.js - Simple Auth Middleware
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Optional authentication - doesn't block requests
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (token && client) {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: GOOGLE_CLIENT_ID
                });
                
                const payload = ticket.getPayload();
                req.user = {
                    uid: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture
                };
            } catch (error) {
                // Token invalid but continue anyway (optional auth)
                console.log('⚠️ Optional auth: Invalid token');
            }
        }
    } catch (error) {
        console.error('⚠️ Optional auth error:', error.message);
    }
    
    next();
};

// Check if auth is configured
const isConfigured = () => {
    return !!client;
};

module.exports = {
    optionalAuth,
    isConfigured
};