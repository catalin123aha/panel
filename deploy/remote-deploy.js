const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const HOST = '31.6.1.167';
const USER = 'root';
const PASSWORD = 'catalin123***';
const REMOTE_DIR = '/opt/bot-hosting';
const LOCAL_ROOT = path.resolve(__dirname, '..');

const SKIP = new Set(['node_modules', '.git', '.next', 'dist', '.turbo', 'coverage', '.cursor']);

function createArchive() {
  const archive = path.join(os.tmpdir(), 'bot-hosting-deploy.tar.gz');
  if (fs.existsSync(archive)) fs.unlinkSync(archive);

  const excludes = [...SKIP].map((d) => `--exclude=${d}`).join(' ');
  execSync(
    `tar -czf "${archive}" ${excludes} --exclude=.env -C "${LOCAL_ROOT}" .`,
    { stdio: 'inherit', shell: true },
  );
  return archive;
}

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
      const read = fs.createReadStream(local);
      const write = sftp.createWriteStream(remote);
      write.on('close', resolve);
      write.on('error', reject);
      read.pipe(write);
    });
  });
}

async function main() {
  console.log('Creating archive...');
  const archive = createArchive();
  const sizeMb = (fs.statSync(archive).size / 1024 / 1024).toFixed(1);
  console.log(`Archive: ${sizeMb} MB`);

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn
      .on('ready', resolve)
      .on('error', reject)
      .connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 30000 });
  });

  console.log('Connected. Uploading...');
  await exec(conn, `mkdir -p ${REMOTE_DIR}`);
  await upload(conn, archive, '/tmp/bot-hosting.tar.gz');
  fs.unlinkSync(archive);

  console.log('Running setup (5-10 min)...');
  await exec(conn, `
set -e
mkdir -p ${REMOTE_DIR}
cd ${REMOTE_DIR}
tar -xzf /tmp/bot-hosting.tar.gz
rm /tmp/bot-hosting.tar.gz
chmod +x deploy/setup-vps.sh
bash deploy/setup-vps.sh
`);

  conn.end();
  console.log('Deploy complete! https://bots.cxm.buzz');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
