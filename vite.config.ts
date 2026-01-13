import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from other devices on the network
    port: 5173,
    strictPort: true, // Fail if port is already in use
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'clerk': ['@clerk/clerk-react'],
          'supabase': ['@supabase/supabase-js'],
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
          
          // Group pages by functionality
          'admin-pages': [
            './src/pages/AdminPage',
            './src/pages/AdminModerationPage'
          ],
          'company-pages': [
            './src/pages/CompanyLoginPage',
            './src/pages/CompanySignupPage',
            './src/pages/CompanyDashboard',
            './src/pages/PostJobPage',
            './src/pages/CandidateDetailsPage'
          ],
          'job-pages': [
            './src/pages/JobsPage',
            './src/pages/EmployerPage'
          ]
        }
      }
    },
    // Increase chunk size warning limit to 1000kb to reduce warnings
    chunkSizeWarningLimit: 1000
  }
});
