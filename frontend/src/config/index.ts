// src/config/index.ts - Enhanced centralized configuration with subdomain support

interface AppConfig {
  // Domain & API Configuration
  domain: {
    base: string;           // Base frontend domain (e.g., 'kitapunya.web.id' or 'localhost:5173')
    backendBase?: string;   // Backend domain for subdomain setup (e.g., 'api.kitapunya.web.id')
    protocol: string;       // 'https' or 'http'
    frontendPath: string;   // Frontend path (usually '/')
    backendPath: string;    // Backend path (e.g., '/a' for path-based or '' for subdomain)
    apiPath: string;        // API path (e.g., '/api')
    useSubdomain: boolean;  // Whether to use subdomain for backend
  };
  
  // Authentication
  auth: {
    googleClientId: string;
    redirectUri?: string;
  };
  
  // App Settings
  app: {
    name: string;
    version: string;
    isDevelopment: boolean;
  };
  
  // Feature Flags
  features: {
    googleAuth: boolean;
    demoMode: boolean;
    receiptOCR: boolean;
    debugMode: boolean;
  };
  
  // Computed URLs (auto-generated)
  urls: {
    frontend: string;
    backend: string;
    api: string;
  };
}

// Environment variables with fallbacks
const ENV = {
  // Domain configuration
  DOMAIN_BASE: import.meta.env.VITE_DOMAIN_BASE || 'localhost',
  BACKEND_DOMAIN: import.meta.env.VITE_BACKEND_DOMAIN || '', // For subdomain setup
  DOMAIN_PROTOCOL: import.meta.env.VITE_DOMAIN_PROTOCOL || 'http',
  FRONTEND_PORT: import.meta.env.VITE_FRONTEND_PORT || '5173',
  BACKEND_PATH: import.meta.env.VITE_BACKEND_PATH || '/a',
  USE_SUBDOMAIN: import.meta.env.VITE_USE_SUBDOMAIN === 'true',
  
  // Google Auth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '239631746781-7urh02bi2g6ambo1g0ea628p26mce5e1.apps.googleusercontent.com',
  
  // App settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Kita Punya Catatan',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Feature flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_DEMO: import.meta.env.VITE_ENABLE_DEMO !== 'false', // Default true
};

// Detect environment type
const isNgrok = ENV.DOMAIN_BASE.includes('.ngrok') || ENV.DOMAIN_BASE.includes('.ngrok.io');
const isLocal = ENV.DOMAIN_BASE.includes('localhost') || ENV.DOMAIN_BASE.includes('127.0.0.1');
const isProduction = !isNgrok && !isLocal;

// Build base URLs
const buildUrls = () => {
  let frontendUrl: string;
  let backendUrl: string;
  let apiUrl: string;
  
  // Build frontend URL
  if (isLocal) {
    frontendUrl = `${ENV.DOMAIN_PROTOCOL}://${ENV.DOMAIN_BASE}`;
    if (ENV.FRONTEND_PORT && ENV.FRONTEND_PORT !== '80' && ENV.FRONTEND_PORT !== '443') {
      frontendUrl += `:${ENV.FRONTEND_PORT}`;
    }
  } else {
    frontendUrl = `${ENV.DOMAIN_PROTOCOL}://${ENV.DOMAIN_BASE}`;
  }
  
  // Build backend URL based on subdomain configuration
  if (ENV.USE_SUBDOMAIN && ENV.BACKEND_DOMAIN) {
    // Using subdomain (e.g., api.kitapunya.web.id)
    backendUrl = `${ENV.DOMAIN_PROTOCOL}://${ENV.BACKEND_DOMAIN}`;
    apiUrl = `${backendUrl}/api`;
  } else {
    // Using path-based routing (e.g., kitapunya.web.id/a)
    if (ENV.BACKEND_PATH) {
      backendUrl = frontendUrl + ENV.BACKEND_PATH;
      apiUrl = backendUrl + '/api';
    } else {
      // Backend on same domain, no path
      backendUrl = frontendUrl;
      apiUrl = frontendUrl + '/api';
    }
  }
  
  return {
    frontend: frontendUrl,
    backend: backendUrl,
    api: apiUrl
  };
};

// Main configuration object
const config: AppConfig = {
  domain: {
    base: ENV.DOMAIN_BASE,
    backendBase: ENV.BACKEND_DOMAIN || undefined,
    protocol: ENV.DOMAIN_PROTOCOL,
    frontendPath: '/',
    backendPath: ENV.BACKEND_PATH,
    apiPath: '/api',
    useSubdomain: ENV.USE_SUBDOMAIN
  },
  
  auth: {
    googleClientId: ENV.GOOGLE_CLIENT_ID,
    redirectUri: undefined // Will be set based on environment
  },
  
  app: {
    name: ENV.APP_NAME,
    version: '2.3.0', // Updated version for subdomain support
    isDevelopment: ENV.NODE_ENV === 'development' || import.meta.env.DEV
  },
  
  features: {
    googleAuth: true,
    demoMode: ENV.ENABLE_DEMO,
    receiptOCR: true,
    debugMode: ENV.ENABLE_DEBUG || import.meta.env.DEV
  },
  
  urls: buildUrls()
};

// Set redirect URI for Google Auth
config.auth.redirectUri = config.urls.frontend;

// Validation and warnings
const validateConfig = () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Validate Google Client ID
  if (!config.auth.googleClientId || config.auth.googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
    warnings.push('Google Client ID not properly configured');
  }
  
  // Validate domain
  if (!config.domain.base) {
    errors.push('Domain base is required');
  }
  
  // Validate subdomain setup
  if (config.domain.useSubdomain && !config.domain.backendBase) {
    errors.push('Backend domain is required when using subdomain mode');
  }
  
  // Log configuration in development
  if (config.app.isDevelopment || config.features.debugMode) {
    console.log('🔧 App Configuration:', {
      environment: isNgrok ? 'ngrok' : isLocal ? 'local' : 'production',
      mode: config.domain.useSubdomain ? 'subdomain' : 'path-based',
      urls: config.urls,
      features: config.features,
      googleClientId: config.auth.googleClientId.slice(0, 20) + '...'
    });
    
    if (warnings.length > 0) {
      console.warn('⚠️ Configuration warnings:', warnings);
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:', errors);
    throw new Error('Invalid configuration');
  }
};

// Validate on load
validateConfig();

// Helper functions
export const getApiUrl = (endpoint: string = ''): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.urls.api}/${cleanEndpoint}`;
};

export const getFrontendUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.urls.frontend}/${cleanPath}`;
};

export const getBackendUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.urls.backend}/${cleanPath}`;
};

// Environment detection helpers
export const isProductionEnv = (): boolean => isProduction;
export const isDevelopment = (): boolean => config.app.isDevelopment;
export const isNgrokEnvironment = (): boolean => isNgrok;
export const isLocalEnvironment = (): boolean => isLocal;
export const isUsingSubdomain = (): boolean => config.domain.useSubdomain;

// Export main config as default
export default config;

// Export individual config sections for convenience
export const {
  domain,
  auth,
  app,
  features,
  urls
} = config;

// Legacy exports for backward compatibility
export const googleClientId = config.auth.googleClientId;
export const apiBaseUrl = config.urls.api;
export const appName = config.app.name;

// Debug helper
export const debugConfig = () => {
  if (config.features.debugMode) {
    console.table({
      'Frontend URL': config.urls.frontend,
      'Backend URL': config.urls.backend,
      'API URL': config.urls.api,
      'Environment': isNgrok ? 'ngrok' : isLocal ? 'local' : 'production',
      'Backend Mode': config.domain.useSubdomain ? 'Subdomain' : 'Path-based',
      'Debug Mode': config.features.debugMode,
      'Google Auth': config.features.googleAuth
    });
  }
};

// CORS helper for backend configuration
export const getCorsOrigins = (): string[] => {
  const origins = [config.urls.frontend];
  
  // Add www variant if production
  if (isProduction && !config.domain.base.startsWith('www.')) {
    origins.push(`${config.domain.protocol}://www.${config.domain.base}`);
  }
  
  // Add localhost for development
  if (config.app.isDevelopment) {
    origins.push('http://localhost:5173');
    origins.push('http://localhost:3000');
  }
  
  return origins;
};