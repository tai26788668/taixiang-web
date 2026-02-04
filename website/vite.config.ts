import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // 確保使用根路徑
  server: {
    port: 5173,
    host: true,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/hooks/useScrollSpy', './src/hooks/useIntersectionObserver']
        }
      }
    }
  },
  css: {
    devSourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  // 確保靜態資源正確處理
  publicDir: 'public'
})