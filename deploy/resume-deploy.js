const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const HOST = '31.6.1.167';
const USER = 'root';
const PASSWORD = 'catalin123***';
const REMOTE_DIR = '/opt/bot-hosting';

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      stream.on('data', (d) => process.stdout.write(d.toString()));
      stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
      stream.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
    });
  });
}

function upload(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      sftp.fastPut(local, remote, (e) => (e ? reject(e) : resolve()));
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 30000,
    });
  });

  const setupPath = path.join(__dirname, 'continue-setup.sh');
  await upload(conn, setupPath, `${REMOTE_DIR}/deploy/continue-setup.sh`);
  await upload(conn, path.join(__dirname, 'nginx-bots.cxm.buzz.conf'), `${REMOTE_DIR}/deploy/nginx-bots.cxm.buzz.conf`);
  await upload(conn, path.join(__dirname, 'ecosystem.config.cjs'), `${REMOTE_DIR}/deploy/ecosystem.config.cjs`);

  await exec(conn, `
set -e
cd ${REMOTE_DIR}
chmod +x deploy/continue-setup.sh

if ! ss -tln | grep -q ':5432'; then
  POSTGRES_PASSWORD=bot_hosting_secure_2026 docker compose -f deploy/docker-compose.yml up -d postgres
  sleep 8
fi

bash deploy/continue-setup.sh
`);

  conn.end();
  console.log('Done!');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
