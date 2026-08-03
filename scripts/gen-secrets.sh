#!/usr/bin/env bash
# Generate strong random secrets for a production .env.
# Usage:
#   ./scripts/gen-secrets.sh          # print to stdout
#   ./scripts/gen-secrets.sh >> .env  # append to your env file
set -euo pipefail

pw() { openssl rand -base64 24 | tr -d '/+=' | cut -c1-24; }

cat <<EOF
# --- generated $(date -u +%Y-%m-%dT%H:%M:%SZ) — do not commit ---
OWNER_DB_PASSWORD=$(pw)
APP_DB_PASSWORD=$(pw)
AUTH_DB_PASSWORD=$(pw)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
EOF
