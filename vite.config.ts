import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // The built game is hosted on GitHub Pages at /scam-shield/ (so `npm run preview` is
  // too); `npm run dev` stays at /
  base: command === 'serve' && !isPreview ? '/' : '/scam-shield/',
}))
