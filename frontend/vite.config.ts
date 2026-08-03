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

  /**
   * Where the dev server forwards API and websocket traffic.
   *
   * Proxying means the browser only ever talks to the dev server, so requests
   * are same-origin and CORS never applies. Without this, pointing
   * VITE_API_URL straight at the deployed API gives a confusing half-working
   * state: live prices arrive (the websocket transport does not enforce CORS
   * the same way) while every authenticated request fails with
   * "Failed to fetch".
   *
   * Point VITE_DEV_API_PROXY at a locally running backend to develop fully
   * offline instead.
   */
  const devApiTarget = env.VITE_DEV_API_PROXY || "http://localhost:3000";

  /**
   * The proxy forwards the browser's Origin (http://localhost:...), which a
   * deployed backend will not have in its allow-list. Presenting an allowed
   * Origin instead lets local development work against the deployed API
   * without adding localhost to the server's CORS config.
   *
   * Only ever applied by the dev server; production builds talk to the API
   * directly and send their real origin.
   */
  const devProxyHeaders = env.VITE_DEV_PROXY_ORIGIN
    ? { origin: env.VITE_DEV_PROXY_ORIGIN }
    : undefined;

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
          headers: devProxyHeaders,
        },
        // socket.io needs its own entry with ws enabled, otherwise the upgrade
        // request is proxied as plain HTTP and the connection never completes.
        "/socket.io": {
          target: devApiTarget,
          changeOrigin: true,
          ws: true,
          headers: devProxyHeaders,
        },
      },
    },
    base,
  };
});
