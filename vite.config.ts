import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.lib.json',
      include: ['src/**/*'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'vite.config.ts',
      ],
      outDir: 'dist',
      entryRoot: 'src',
      insertTypesEntry: false,
      copyDtsFiles: true,
      staticImport: true,
      clearPureImport: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'WebHelpLibrary',
      fileName: (format) => `web-help-library.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // Optional peer dependencies
        'mermaid',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          mermaid: 'mermaid',
        },
      },
    },
  },
});
