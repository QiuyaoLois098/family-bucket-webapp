import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    port: 5188,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
    proxy: {
      "/api": "http://localhost:3002",
      "/generated": "http://localhost:3002",
      "/socket.io": {
        target: "http://localhost:3002",
        ws: true,
      },
    },
  },
});
