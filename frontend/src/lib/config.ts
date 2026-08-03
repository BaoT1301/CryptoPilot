/**
 * Central runtime configuration.
 *
 * Every `VITE_*` value is inlined into the public bundle at build time, so these
 * must be non-secret. On Railway these are set as build-time variables on the
 * frontend service.
 */

const DEFAULT_BACKEND_ORIGIN = "http://localhost:3000";

/** Base URL for REST calls, including the `/api` prefix. */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || `${DEFAULT_BACKEND_ORIGIN}/api`;

/**
 * Origin for the socket.io connection. The backend serves websockets from the
 * same origin as the REST API, so this is derived from API_BASE_URL by stripping
 * the trailing `/api`. VITE_SOCKET_URL overrides it if they ever diverge.
 */
export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");
