import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use React's automatic JSX runtime everywhere (including test files), so JSX
  // works without an explicit `import React`.
  esbuild: { jsx: 'automatic' },
  test: {
    // Component/navigation tests render React, so they need a DOM. Node-only
    // service tests still run fine under jsdom.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
