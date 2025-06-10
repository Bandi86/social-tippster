#!/bin/bash

# Fix all Dockerfiles to use Node 20 and handle dependency conflicts

echo "🔧 Updating all Dockerfiles..."

for dockerfile in services/*/Dockerfile; do
    if [ -f "$dockerfile" ]; then
        echo "Updating $dockerfile"

        # Update Node version from 18 to 20
        sed -i 's/node:18-alpine/node:20-alpine/g' "$dockerfile"

        # Replace npm ci with npm install --legacy-peer-deps
        sed -i 's/npm ci/npm install --legacy-peer-deps/g' "$dockerfile"

        echo "✅ Updated $dockerfile"
    fi
done

echo "🎯 All Dockerfiles updated!"
echo ""
echo "Changes made:"
echo "- Node version: 18-alpine → 20-alpine"
echo "- Package installation: npm ci → npm install --legacy-peer-deps"
echo ""
echo "This fixes:"
echo "- NestJS 11.1.3 requirement for Node >= 20"
echo "- Redis dependency conflicts with TypeORM"
