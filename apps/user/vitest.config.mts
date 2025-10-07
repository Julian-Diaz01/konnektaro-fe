import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.tsx'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    isolate: true,
  },
  esbuild: {
    jsx: 'automatic',
    jsxDev: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@shared/components': path.resolve(__dirname, '../../packages/shared/src/components'),
      '@shared/hooks': path.resolve(__dirname, '../../packages/shared/src/hooks'),
      '@shared/services': path.resolve(__dirname, '../../packages/shared/src/services'),
      '@shared/lib': path.resolve(__dirname, '../../packages/shared/src/lib'),
      '@shared/types': path.resolve(__dirname, '../../packages/shared/src/types'),
      '@shared/utils': path.resolve(__dirname, '../../packages/shared/src/utils'),
      '@shared/contexts': path.resolve(__dirname, '../../packages/shared/src/contexts'),
    },
  },
})


