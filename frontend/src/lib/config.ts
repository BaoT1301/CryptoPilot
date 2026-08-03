/**
 * Central runtime configuration.
 *
 * Every `VITE_*` value is inlined into the public bundle at build time, so these
 * must be non-secret. On Railway these are set as build-time variables on the
 * frontend service.
 */

const DEFAULT_BACKEND_ORIGIN = "http://localhost:3000";

const rawApiUrl: string =
  import.meta.env.VITE_API_URL || `${DEFAULT_BACKEND_ORIGIN}/api`;

/**
 * Base URL for REST calls, including the `/api` prefix.
 *
 * All backend routes are mounted under `/api`, so the suffix is required. It is
 * easy to set VITE_API_URL to the bare backend origin by mistake, which turns
 * every request into a 404 that only shows up at runtime. Normalise here
 * instead: strip any trailing slash, then append `/api` if it is missing, so
 * both `https://host` and `https://host/api` resolve correctly.
 */
export const API_BASE_URL: string = (() => {
  const trimmed = rawApiUrl.replace(/\/+$/, "");
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
})();

/**
 * Origin for the socket.io connection. The backend serves websockets from the
 * same origin as the REST API, so this is derived from API_BASE_URL by stripping
 * the trailing `/api`. VITE_SOCKET_URL overrides it if they ever diverge.
 */
export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");
