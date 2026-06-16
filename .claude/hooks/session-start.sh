#!/bin/bash
# SessionStart hook — prepares the repo so lint/build work immediately
# in Claude Code on the web (avoids a manual `npm install` second step).
set -euo pipefail

# Only run in the remote (web) environment; local setups manage their own deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

APP_DIR="$CLAUDE_PROJECT_DIR/suite-clinica-galilea"

echo "[session-start] Installing dependencies in suite-clinica-galilea…"
cd "$APP_DIR"

# npm install (not ci) so the cached container layer is reused on resume.
npm install --no-audit --no-fund

echo "[session-start] Dependencies ready. Available: npm run lint · npm run build · npm run dev"
