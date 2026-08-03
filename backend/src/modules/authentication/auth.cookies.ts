import type { CookieOptions } from "express";

/**
 * Auth cookie attributes.
 *
 * When the frontend and backend are served from different domains (the default
 * on Railway: `*.up.railway.app` for each service), the browser will only keep
 * a cookie sent on a cross-site response if it carries `SameSite=None; Secure`.
 * The previous hardcoded `sameSite: "lax", secure: false` caused the browser to
 * silently drop `access_token`/`refresh_token`, breaking /auth/refresh and
 * /auth/logout in production.
 *
 * Set CROSS_SITE_COOKIES=true for a split-domain HTTPS deploy. Leave it unset
 * for local http://localhost development, where Secure cookies are not sent.
 */
const crossSite = process.env.CROSS_SITE_COOKIES === "true";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: crossSite,
  sameSite: crossSite ? "none" : "lax",
};

/** Options for setting an auth cookie with the given lifetime in ms. */
export function authCookieOptions(maxAge: number): CookieOptions {
  return { ...baseOptions, maxAge };
}

/**
 * Options for clearing an auth cookie. A cookie is only removed when the
 * clearing response repeats the same attributes it was set with.
 */
export const clearAuthCookieOptions: CookieOptions = baseOptions;
