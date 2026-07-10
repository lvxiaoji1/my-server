import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/users": { target: "http://localhost:3000", changeOrigin: true },
      "/env": { target: "http://localhost:3000", changeOrigin: true },
      "/auth": { target: "http://localhost:3000", changeOrigin: true },
      "/posts": { target: "http://localhost:3000", changeOrigin: true },
      "/products": { target: "http://localhost:3000", changeOrigin: true },
      "/orders": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
})
