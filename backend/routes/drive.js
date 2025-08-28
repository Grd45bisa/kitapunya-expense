// routes/drive.js - Enhanced Google Drive Service with Photo Display
const { google } = require('googleapis');
const { Readable } = require('stream');

class DriveService {
    constructor() {
        this.drive = null;
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // Your folder ID
        this.authType = process.env.GOOGLE_AUTH_TYPE || 'service_account';
        
        try {
            this.auth = this.initAuth();
            if (this.auth) {
                this.drive = google.drive({ version: 'v3', auth: this.auth });
                console.log(`✅ Drive initialized with ${this.authType}`);
            }
        } catch (error) {
            console.warn('⚠️ Drive initialization failed:', error.message);
        }
    }

    initAuth() {
        if (this.authType === 'oauth2') {
            return this.initOAuth2();
        } else {
            return this.initServiceAccount();
        }
    }

    // OAuth 2.0 Client initialization
    initOAuth2() {
        const { client_id, client_secret, refresh_token } = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        };

        if (!client_id || !client_secret || !refresh_token) {
            console.warn('⚠️ Missing OAuth2 credentials');
            return null;
        }

        const oauth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            'urn:ietf:wg:oauth:2.0:oob'
        );

        oauth2Client.setCredentials({
            refresh_token: refresh_token
        });

        return oauth2Client;
    }

    // Service Account initialization
    initServiceAccount() {
        const { email, key } = {
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };

        if (!email || !key) {
            console.warn('⚠️ Missing Service Account credentials');
            return null;
        }

        return new google.auth.JWT({
            email,
            key,
            scopes: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive'
            ]
        });
    }

    // Enhanced upload with proper permissions for hybrid display
    async uploadFile(buffer, filename, mimeType = 'image/jpeg', userEmail = null) {
        if (!this.isReady()) {
            throw new Error('Drive service not configured');
        }

        try {
            // Upload file to your specific folder
            const response = await this.drive.files.create({
                requestBody: {
                    name: filename,
                    parents: this.folderId ? [this.folderId] : undefined,
                    description: userEmail ? `Receipt for ${userEmail}` : 'Receipt photo'
                },
                media: {
                    mimeType,
                    body: Readable.from(buffer)
                },
                fields: 'id,name,webViewLink,webContentLink,thumbnailLink'
            });

            const fileId = response.data.id;
            
            // Make file publicly viewable for hybrid approach
            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            console.log(`✅ Uploaded and shared: ${response.data.name}`);
            
            return {
                id: fileId,
                name: response.data.name,
                viewLink: response.data.webViewLink,
                // Direct image URL for hybrid display
                directUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
                // Thumbnail for faster loading
                thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
                // High quality image
                downloadUrl: response.data.webContentLink
            };

        } catch (error) {
            console.error('❌ Upload failed:', error.message);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    // Get file info and generate display URLs
    async getFileInfo(fileId) {
        if (!this.isReady()) {
            throw new Error('Drive service not configured');
        }

        try {
            const response = await this.drive.files.get({
                fileId: fileId,
                fields: 'id,name,webViewLink,webContentLink,thumbnailLink,mimeType,size,createdTime'
            });

            const file = response.data;
            
            return {
                id: file.id,
                name: file.name,
                viewLink: file.webViewLink,
                directUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
                thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
                downloadUrl: file.webContentLink,
                mimeType: file.mimeType,
                size: file.size,
                createdTime: file.createdTime
            };
        } catch (error) {
            console.error('❌ Get file info failed:', error.message);
            throw new Error(`Get file info failed: ${error.message}`);
        }
    }

    // Generate different image sizes for responsive display
    async generateImageUrls(fileId, sizes = ['w200', 'w400', 'w800']) {
        const urls = {};
        
        sizes.forEach(size => {
            urls[size] = `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
        });

        // Add full size URL
        urls.full = `https://drive.google.com/uc?export=view&id=${fileId}`;
        
        return urls;
    }

    // Test if file is accessible (for hybrid approach validation)
    async testFileAccess(fileId) {
        try {
            const response = await fetch(`https://drive.google.com/uc?export=view&id=${fileId}`, {
                method: 'HEAD'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Connection test
    async testConnection() {
        if (!this.isReady()) {
            return { status: 'not_configured' };
        }

        try {
            if (this.folderId) {
                // Test folder access
                await this.drive.files.get({ fileId: this.folderId });
                return { 
                    status: 'connected',
                    folderId: this.folderId,
                    folderUrl: `https://drive.google.com/drive/folders/${this.folderId}`
                };
            } else {
                // Test general access
                await this.drive.about.get({ fields: 'user' });
                return { status: 'connected', folder: 'root' };
            }
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    isReady() {
        return this.drive && this.auth;
    }
}

module.exports = DriveService;