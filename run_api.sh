#!/usr/bin/env bash
# Start FastAPI with auto-reload. Only watches ./app (Python) — avoids scanning
# frontend/node_modules, where optional platform packages can break uvicorn's file watcher on macOS.
set -euo pipefail
cd "$(dirname "$0")"
exec ./venv/bin/uvicorn app.main:app --reload --reload-dir app --host 127.0.0.1 --port 8004
