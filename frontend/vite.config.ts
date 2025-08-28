/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  
  return {
    
    plugins: [react()],
    base: '/',
    server: {
      host: '0.0.0.0',
      port: 5173, // Ubah ke 3001 jika port 3000 dipakai backend
      strictPort: false, // Jika port dipakai, coba port lain
      cors: true,
      allowedHosts: [
        'kitapunya.web.id' // host yang mau diijinkan
      ],
      hmr: {
        port: 5173,
        host: 'localhost'
      }
    },
    
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      },
      sourcemap: mode === 'development' // Enable sourcemap in dev
    },
    define: {
      // Optional: Add app version from package.json
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
    },
    // Explicitly set which env variables prefix to use (default is VITE_)
    envPrefix: 'VITE_',
  }
})