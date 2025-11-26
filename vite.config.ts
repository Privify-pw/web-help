import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'WebHelpLibrary',
      fileName: (format) => `web-help-library.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@privify-pw/web-help/src/services'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@privify-pw/web-help/src/services': 'services',
        },
      },
    },
  },
});
