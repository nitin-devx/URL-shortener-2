import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The browser talks to this dev server; /url requests are forwarded to your backend.
// If your backend PORT in .env is not 8000, change it here.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/url": "http://localhost:8000" } },
});
