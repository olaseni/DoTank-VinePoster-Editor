import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // ES6 target configuration
  esbuild: {
    target: 'es2015', // ES6
    format: 'esm',
  },
  
  build: {
    target: 'es2015', // ES6
    outDir: 'build',
    lib: {
      entry: resolve(__dirname, 'assets/js/editor.tsx'),
      name: 'ContentManager',
      fileName: 'editor',
      formats: ['iife'], // WordPress needs IIFE format
    },
    rollupOptions: {
      // WordPress externals - don't bundle these
      external: [
        'react',
        'react-dom',
        '@wordpress/element',
        '@wordpress/plugins',
        '@wordpress/edit-post',
        '@wordpress/components',
        '@wordpress/data',
        '@wordpress/hooks',
        '@wordpress/i18n',
        '@wordpress/api-fetch',
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/element': 'wp.element',
          '@wordpress/plugins': 'wp.plugins',
          '@wordpress/edit-post': 'wp.editPost',
          '@wordpress/components': 'wp.components',
          '@wordpress/data': 'wp.data',
          '@wordpress/hooks': 'wp.hooks',
          '@wordpress/i18n': 'wp.i18n',
          '@wordpress/api-fetch': 'wp.apiFetch',
        },
        // ES6+ features enabled
        format: 'iife',
        name: 'ContentManager',
      },
    },
    
    // Enable modern features
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'esbuild',
  },
  
  // Development server
  server: {
    port: 3000,
    open: false,
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'assets'),
      '@components': resolve(__dirname, 'assets/components'),
      '@types': resolve(__dirname, 'assets/types'),
      '@utils': resolve(__dirname, 'assets/utils'),
    },
  },
});