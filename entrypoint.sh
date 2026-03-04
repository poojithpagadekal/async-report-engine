#!/bin/sh

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting worker in background..."
node dist/workers/worker-server.js &

echo "Starting server..."
exec node dist/server.js