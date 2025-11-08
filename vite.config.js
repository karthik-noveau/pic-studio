import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

let pathURL = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@imgly/background-removal"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  resolve: {
    alias: {
      // Fix for __dirname not defined in ES modules
      "@assets": path.resolve(pathURL, "./src/assets"),
      "@common": path.resolve(pathURL, "./src/common"),
      "@pages": path.resolve(pathURL, "./src/pages"),
      "@theme": path.resolve(pathURL, "./src/theme"),
    },
  },
});
