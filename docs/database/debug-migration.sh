#!/bin/bash
cd /home/bandi/Documents/social-tippster/backend

echo "=== Checking current directory ==="
pwd

echo "=== Checking if node_modules exists ==="
ls -la node_modules/.bin/typeorm* || echo "TypeORM not found in node_modules"

echo "=== Running TypeORM migration ==="
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts

echo "=== Migration process completed ==="
