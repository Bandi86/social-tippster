#!/bin/bash
# Unified backend test runner for all backend test scripts and specs
# Usage: bash tests/backend/run-all-backend-tests.sh

set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

# Ensure dev server is running (per project policy, do NOT start it here)
echo "[INFO] Make sure 'npm run dev' is running before executing this script."
echo "[INFO] Backend should be available at http://localhost:3001"

# Run all .spec.ts Jest tests (unit/integration)
echo "[1/5] Running Jest backend unit/integration tests..."
npm test -- --runInBand --testPathPattern=tests/backend/ --coverage || true

# Run Playwright-based backend tests (if any)
echo "[2/5] Running Playwright backend tests..."
npx playwright test tests/backend/*.spec.ts --reporter=line || true

# Run all backend JS test scripts (API, validation, manual, etc.)
echo "[3/5] Running backend JS API/validation scripts..."
for script in tests/backend/*.js; do
  if [[ "$script" != *".spec.js" && "$script" != *".test.js" ]]; then
    echo "Running $script..."
    node "$script" || true
  fi
done

# Run all backend .test.js scripts (integration/manual)
echo "[4/5] Running backend .test.js scripts..."
for script in tests/backend/*.test.js; do
  echo "Running $script..."
  node "$script" || true
done

# Run all backend shell test scripts
echo "[5/5] Running backend shell test scripts..."
for script in tests/backend/*.sh; do
  if [ -x "$script" ]; then
    echo "Running $script..."
    bash "$script" || true
  else
    echo "Skipping non-executable $script"
  fi
done

echo "[DONE] All backend tests executed. Review output above and in tests/backend/errors/ for details."
