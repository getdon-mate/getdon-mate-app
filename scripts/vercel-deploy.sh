#!/usr/bin/env bash

set -euo pipefail

TARGET="${1:-}"

if [[ "${TARGET}" != "preview" && "${TARGET}" != "production" ]]; then
  echo "Usage: bash scripts/vercel-deploy.sh [preview|production]"
  exit 1
fi

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${VERCEL_ORG_ID:?VERCEL_ORG_ID is required}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is required}"

DEPLOY_ENV="preview"
DEPLOY_FLAGS=()

if [[ "${TARGET}" == "production" ]]; then
  DEPLOY_ENV="production"
  DEPLOY_FLAGS+=(--prod)
fi

run_vercel() {
  npx --yes vercel@latest "$@"
}

echo "[vercel] pull (${DEPLOY_ENV})"
run_vercel pull --yes --environment="${DEPLOY_ENV}" --token="${VERCEL_TOKEN}"

echo "[vercel] build (prebuilt)"
run_vercel build --token="${VERCEL_TOKEN}"

echo "[vercel] deploy (${TARGET})"
run_vercel deploy --prebuilt "${DEPLOY_FLAGS[@]}" --token="${VERCEL_TOKEN}"
