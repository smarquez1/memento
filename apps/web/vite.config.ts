import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Memento",
        short_name: "Memento",
        description: "A calmer way to organize what matters today.",
        theme_color: "#111111",
        background_color: "#111111",
        display: "standalone",
        start_url: "/",
        icons: [],
      },
    }),
  ],
})
