import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Send /api requests to the backend. The browser sees one origin, so the auth cookie just works.
    proxy: {
      "/api": "http://localhost:9000",
    },
  },
});
