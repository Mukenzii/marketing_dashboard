import type { NextConfig } from "next"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack resolves the local `next` package
  // reliably. Without this, Turbopack's root inference intermittently fails
  // with "Next.js package not found", which manifests as the dev server
  // reload-looping on app routes.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
}

export default nextConfig
