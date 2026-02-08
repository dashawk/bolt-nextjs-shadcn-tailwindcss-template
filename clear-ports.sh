#!/usr/bin/env bash
# Kill processes on ports 3000-3005 and clear Next.js cache

PORTS=(3000 3001 3002 3003 3004 3005)

for port in "${PORTS[@]}"; do
  pid=$(lsof -ti :"$port" 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid 2>/dev/null
  fi
done

if [ -d ".next" ]; then
  rm -rf .next
  echo "Cleared .next cache"
fi

echo "Done"

