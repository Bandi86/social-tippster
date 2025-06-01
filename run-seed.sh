#!/bin/bash
cd /home/bandi/Documents/social-tippster/backend

echo "=== Running seed script ==="
npx ts-node src/database/seed.ts

echo "=== Seed completed ==="
