#!/bin/sh
set -e

echo "[ INFO ] Starting SentinelForge backend..."

# Wait for SQL Server to be ready
echo "[ INFO ] Waiting for database..."
sleep 15

export TS_NODE_PROJECT=tsconfig.knex.json

# Run migrations
echo "[ INFO ] Running database migrations..."
node -r ts-node/register ./node_modules/knex/bin/cli.js migrate:latest --knexfile knexfile.ts || {
  echo "[ WARN ] Migration failed, continuing..."
}

# Run seeds (will skip if data exists)
echo "[ INFO ] Running database seeds..."
node -r ts-node/register ./node_modules/knex/bin/cli.js seed:run --knexfile knexfile.ts || {
  echo "[ WARN ] Seeding failed, continuing..."
}

echo "[ INFO ] Starting Node.js server..."
exec node dist/server.js
