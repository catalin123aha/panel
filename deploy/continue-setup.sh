#!/bin/bash
# Continue setup after infrastructure is ready
set -euo pipefail

APP_DIR="/opt/bot-hosting"
DOMAIN="bots.cxm.buzz"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-bot_hosting_secure_2026}"

cd "$APP_DIR"

echo "==> Writing production .env..."
JWT_SECRET=$(openssl rand -hex 32)
cat > "$APP_DIR/.env" <<EOF
APP_NAME=Discord Bot Hosting
APP_URL=https://${DOMAIN}
APP_PORT=3000
NODE_ENV=production

DISCORD_CLIENT_ID=1534552405167968396
DISCORD_CLIENT_SECRET=4Nv1i83rEmaqhRwpfmFXHwUZsHkVVuUz
DISCORD_CALLBACK_URL=https://${DOMAIN}/api/auth/discord/callback
DISCORD_SCOPES=identify,guilds

JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

DATABASE_URL=postgresql://botuser:${POSTGRES_PASSWORD}@127.0.0.1:5432/bot_hosting

REDIS_URL=redis://127.0.0.1:6379

DOCKER_SOCKET_PATH=/var/run/docker.sock
DOCKER_NETWORK=bot-hosting

STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage

GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 16)

MAX_BOTS_PER_USER=5
MAX_CPU_PER_BOT=1.0
MAX_MEMORY_PER_BOT=512
MAX_DISK_PER_BOT=10240

DAEMON_PORT=4001

FRONTEND_URL=https://${DOMAIN}
NEXT_PUBLIC_API_URL=https://${DOMAIN}
NEXT_PUBLIC_WS_URL=https://${DOMAIN}
EOF

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "==> Generating Prisma client and pushing schema..."
cd "$APP_DIR/packages/database"
pnpm exec prisma generate
pnpm exec prisma db push --accept-data-loss

echo "==> Building all packages..."
cd "$APP_DIR"
pnpm build

echo "==> Starting services with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start "$APP_DIR/deploy/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash || true

echo "==> Configuring nginx..."
mkdir -p /var/www/certbot

if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  cat > /etc/nginx/sites-available/bots.cxm.buzz <<'NGINX_HTTP'
server {
    listen 80;
    server_name bots.cxm.buzz;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_HTTP
  ln -sf /etc/nginx/sites-available/bots.cxm.buzz /etc/nginx/sites-enabled/bots.cxm.buzz
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx

  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
    --non-interactive --agree-tos --email admin@cxm.buzz || \
  certbot certonly --nginx -d "$DOMAIN" \
    --non-interactive --agree-tos --email admin@cxm.buzz || true
fi

cp "$APP_DIR/deploy/nginx-bots.cxm.buzz.conf" /etc/nginx/sites-available/bots.cxm.buzz
ln -sf /etc/nginx/sites-available/bots.cxm.buzz /etc/nginx/sites-enabled/bots.cxm.buzz
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

ufw allow OpenSSH 2>/dev/null || true
ufw allow 'Nginx Full' 2>/dev/null || true
ufw --force enable 2>/dev/null || true

echo ""
echo "============================================"
echo "  Deploy complete!"
echo "  Site: https://${DOMAIN}"
echo "  PM2:  pm2 status"
echo "============================================"
