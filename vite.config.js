import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'video-vendor': ['@videosdk.live/react-sdk'],
          'socket-vendor': ['socket.io-client'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
    
    // Chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
  },
  
  server: {
    port: 3000,
    open: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'socket.io-client', 'framer-motion'],
  },
});
