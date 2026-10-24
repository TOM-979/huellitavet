import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// "npm run vista-previa" genera un solo HTML que se abre con doble clic (sin servidor)
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'archivo' ? [viteSingleFile()] : [])],
  build: mode === 'archivo' ? { outDir: 'vista-previa', assetsInlineLimit: 100000000 } : {},
}))
