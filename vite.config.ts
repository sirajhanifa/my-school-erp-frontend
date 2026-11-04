import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Lets imports use "@/x" for "src/x" (needed by shadcn components).
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    // Send /api requests to the backend. The browser sees one origin, so the auth cookie just works.
    proxy: {
      "/api": "http://localhost:9000",
    },
  },
});
