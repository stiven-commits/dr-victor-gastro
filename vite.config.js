import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cropped-iso-victor-150x150.jpg'], // Tu logo actual en public/
      manifest: {
        name: 'CRM Dr. Víctor',
        short_name: 'CRM Dr. Víctor',
        description: 'Sistema de Gestión de Pacientes y Citas del Dr. Víctor Manrique',
        theme_color: '#0056b3', // Tu color azul institucional
        background_color: '#ffffff',
        display: 'standalone', // Esto oculta la barra de direcciones (modo App)
        icons: [
          {
            src: '/cropped-iso-victor-150x150.jpg',
            sizes: '150x150',
            type: 'image/jpeg'
          },
          // TRUCO: Engañamos a los móviles por ahora con el mismo logo, 
          // luego puedes subir las imágenes exactas de 192x192 y 512x512 en formato PNG a /public
          {
            src: '/cropped-iso-victor-150x150.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/cropped-iso-victor-150x150.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
})