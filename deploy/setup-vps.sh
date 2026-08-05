#!/bin/bash
set -euo pipefail

APP_DIR="/opt/bot-hosting"
DOMAIN="bots.cxm.buzz"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-bot_hosting_secure_2026}"

echo "==> Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw

echo "==> Installing Node.js 20..."
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "==> Installing pnpm and pm2..."
npm install -g pnpm@8.15.0 pm2

echo "==> Ensuring Docker is running..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker

echo "==> Starting PostgreSQL and Redis..."
cd "$APP_DIR/deploy"

COMPOSE_SERVICES=()
if ss -tln | grep -q ':5432'; then
  echo "PostgreSQL already running on port 5432"
else
  COMPOSE_SERVICES+=(postgres)
fi

if ss -tln | grep -q ':6379'; then
  echo "Redis already running on port 6379"
else
  COMPOSE_SERVICES+=(redis)
fi

if [ ${#COMPOSE_SERVICES[@]} -gt 0 ]; then
  POSTGRES_PASSWORD="$POSTGRES_PASSWORD" docker compose up -d "${COMPOSE_SERVICES[@]}"
  sleep 5
else
  echo "Using existing PostgreSQL and Redis services"
fi

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
cd "$APP_DIR"
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
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "==> Configuring nginx..."
mkdir -p /var/www/certbot
cp "$APP_DIR/deploy/nginx-bots.cxm.buzz.conf" /etc/nginx/sites-available/bots.cxm.buzz
ln -sf /etc/nginx/sites-available/bots.cxm.buzz /etc/nginx/sites-enabled/bots.cxm.buzz
rm -f /etc/nginx/sites-enabled/default

# Temporary HTTP-only config for certbot if SSL certs don't exist yet
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
  nginx -t && systemctl reload nginx

  echo "==> Obtaining SSL certificate..."
  certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
    --non-interactive --agree-tos --email admin@cxm.buzz || \
  certbot certonly --nginx -d "$DOMAIN" \
    --non-interactive --agree-tos --email admin@cxm.buzz

  cp "$APP_DIR/deploy/nginx-bots.cxm.buzz.conf" /etc/nginx/sites-available/bots.cxm.buzz
fi

nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

echo ""
echo "============================================"
echo "  Deploy complete!"
echo "  Site: https://${DOMAIN}"
echo "  PM2:  pm2 status"
echo "  Logs: pm2 logs"
echo "============================================"
