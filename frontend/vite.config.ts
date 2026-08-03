import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Served at the domain root by default. Set VITE_BASE_PATH (e.g. "/crypto-pilot/")
  // only when deploying under a subpath, such as GitHub Pages.
  const base = env.VITE_BASE_PATH || "/";

  // Dev-only proxy target for the local backend.
  const devApiTarget = env.VITE_DEV_API_PROXY || "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: devApiTarget,
          changeOrigin: true,
        },
      },
    },
    base,
  };
});
