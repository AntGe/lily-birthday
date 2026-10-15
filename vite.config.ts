import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub project pages live under /<repo>/. Override with BASE_PATH=/ for a user site.
const base = process.env.BASE_PATH ?? '/birthday-trip/'

export default defineConfig({
  base,
  plugins: [react()],
})
