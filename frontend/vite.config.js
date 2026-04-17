import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'audio/*.mp3', 'audio/*.m4a', 'mushaf/*.png', 'mushaf/*.webp', 'mushaf/*.jpg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,m4a,webp,jpg}'],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\/mushaf\/.+\.(png|webp|jpg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mushaf-pages-cache',
              expiration: {
                maxEntries: 700,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/QuranHub\/quran-pages-images\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-images-cache',
              expiration: {
                maxEntries: 604,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/mp3quran\.net\/(api|.*\.mp3)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-audio-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365 // سنة كاملة
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
        ]
      },
      manifest: {
        name: 'زاد السلامة - تطبيق إسلامي',
        short_name: 'زاد السلامة',
        description: 'تطبيق إسلامي لمواقيت الصلاة والأذكار والقرآن الكريم',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    }
  },
  optimizeDeps: {
    include: ['recharts']
  }
})
