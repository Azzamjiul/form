import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router'],

          // Editor and UI libraries
          'editor-vendor': [
            '@tiptap/core',
            '@tiptap/extension-link',
            '@tiptap/extension-underline',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities'
          ],

          // Data fetching and utilities
          'utils-vendor': [
            '@tanstack/react-query',
            'ky',
            'dompurify'
          ],

          // Tailwind CSS utilities (line-clamp)
          'tailwind-vendor': [
            '@tailwindcss/line-clamp'
          ]
        }
      }
    },
    // Increase chunk size warning limit slightly to account for vendor chunks
    chunkSizeWarningLimit: 600
  }
})
