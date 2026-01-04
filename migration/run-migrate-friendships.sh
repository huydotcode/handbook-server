#!/usr/bin/env bash
set -euo pipefail

# Usage: MONGODB_URI="mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.9/handbook" ./migration/run-migrate-friendships.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI is required" >&2
  exit 1
fi

npx ts-node ./migration/migrate-friends-to-friendships.ts
