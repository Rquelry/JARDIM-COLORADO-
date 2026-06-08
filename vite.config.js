import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  logLevel: "error",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
