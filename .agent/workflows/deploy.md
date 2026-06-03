---
description: How to deploy updates to the production server
---

# Deploy Instructions

The backend is managed by **PM2** (process name: `tripsforua`).
The bot runs in a separate **screen** session (`405593.bot`) — **do NOT touch it**.

## Full Deploy (code + frontend + backend)

```bash
# 1. Pull latest code
cd /var/www/tripsforua && git fetch origin main && git reset --hard origin/main

# 2. Rebuild frontend
cd client && npm run build && cd ..

# 3. Restart backend via PM2
pm2 restart tripsforua
```

## Quick Deploy (code changes only, no frontend changes)

```bash
cd /var/www/tripsforua && git fetch origin main && git reset --hard origin/main && pm2 restart tripsforua
```

## Check Status

```bash
pm2 show tripsforua
```

## View Logs

```bash
pm2 logs tripsforua --lines 50
# or
tail -n 50 /var/www/tripsforua/app.log
```
