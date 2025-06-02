#!/bin/bash
cd /home/bandi/Documents/social-tippster/backend
echo "Running database migrations..."
npm run migration:run
echo "Migration completed!"
