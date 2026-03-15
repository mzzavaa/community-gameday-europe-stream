import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allow importing compositions from the parent project
      "@compositions": path.resolve(__dirname, ".."),
    },
  },
  // Serve the parent public/ folder for static assets (logos, faces, etc.)
  publicDir: path.resolve(__dirname, "..", "public"),
});
