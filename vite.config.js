import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Reto Activo',
        short_name: 'Reto Activo',
        description: 'Plataforma de bienestar y retos corporativos. Conectá tu actividad física y sumá puntos con tu empresa.',
        theme_color: '#1CBC8C',
        background_color: '#F5F7FA',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['health', 'fitness', 'lifestyle'],
        icons: [
          {
            src: '/icons/icon-192.png?v=2',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png?v=2',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-512.png?v=2',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Reto Activo - Dashboard'
          }
        ]
      },
      workbox: {
        // Cache all app shell assets aggressively
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Keep the SW registration from breaking hot-reload in dev
        cleanupOutdatedCaches: true,
        // Runtime caching: fonts and external images
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Avatar images from Unsplash and CDN (emoji)
            urlPattern: /^https:\/\/(images\.unsplash\.com|cdn\.jsdelivr\.net)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'avatar-images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      },
      devOptions: {
        // Enable PWA in dev mode for testing (disabled by default to avoid caching issues)
        enabled: false
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('react') || id.includes('lucide-react')) {
              return 'vendor';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  }
})
