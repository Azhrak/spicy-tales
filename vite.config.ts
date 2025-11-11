import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      // Configure Nitro for Vercel deployment
      nitro: {
        preset: process.env.VERCEL ? 'vercel' : undefined,
      },
    }),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: ['@node-rs/argon2'],
  },
})

export default config
