module.exports = {
  apps: [
    {
      name: 'panel-web',
      cwd: '/opt/bot-hosting/apps/panel-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
    },
    {
      name: 'panel-api',
      cwd: '/opt/bot-hosting/apps/panel-api',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production', PORT: 4000 },
      instances: 1,
      autorestart: true,
    },
    {
      name: 'daemon',
      cwd: '/opt/bot-hosting/apps/daemon',
      script: 'dist/index.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
    },
    {
      name: 'worker',
      cwd: '/opt/bot-hosting/apps/worker',
      script: 'dist/index.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
    },
  ],
};
