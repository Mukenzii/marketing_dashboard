import type { NextConfig } from "next"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const isProd = process.env.NODE_ENV === "production"

/**
 * Security headers applied to every response.
 * - HSTS: force HTTPS for a year incl. subdomains (only takes effect over TLS).
 * - X-Frame-Options / frame-ancestors: block clickjacking (no framing).
 * - X-Content-Type-Options: no MIME sniffing.
 * - Referrer-Policy: don't leak full URLs cross-origin.
 * - Permissions-Policy: drop powerful features the app never uses.
 * - CSP: same-origin by default. 'unsafe-inline' is required for Next/React's
 *   injected hydration scripts and styles; 'unsafe-eval' only in dev (Turbopack).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // NOTE: no `upgrade-insecure-requests` — it would force asset requests to
  // https and break plain-http access (e.g. http://<ip>:3000). All subresources
  // are same-origin, so it adds nothing. HTTPS is enforced by HSTS once you
  // serve the app over TLS (e.g. behind Caddy).
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
]

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker runtime image.
  output: "standalone",
  // Don't advertise the framework.
  poweredByHeader: false,
  reactStrictMode: true,

  // Pin the workspace root so Turbopack resolves the local `next` package
  // reliably. Without this, Turbopack's root inference intermittently fails
  // with "Next.js package not found", which manifests as the dev server
  // reload-looping on app routes.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
