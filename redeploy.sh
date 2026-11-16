#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

git pull

# Build Docker image
sudo docker build -f portfolio/Dockerfile -t yasirsgarage:portfolio .

# Restart container via systemd
sudo systemctl restart portfolio

# Wait for container to be healthy
echo "Waiting for container to be healthy..."
for i in {1..30}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "000")
  if [ "$status" = "200" ]; then
    echo "portfolio ok (HTTP $status)"
    break
  fi
  if [ "$i" = 30 ]; then
    echo "error: portfolio failed to come up after redeploy" >&2
    exit 1
  fi
  echo "Attempt $i: HTTP $status, retrying..."
  sleep 1
done

# Prod runs the compiled dist/, which git pull doesn't update
(cd locationservice && npm ci && npx tsc --noEmitOnError)
sudo systemctl restart locationservice

for i in {1..15}; do
  if curl -sf http://127.0.0.1:3001/health > /dev/null; then
    echo "locationservice ok"
    exit 0
  fi
  sleep 1
done

echo "error: locationservice failed to come up after redeploy" >&2
exit 1
