"""Upload project to VPS and run setup script."""
import os
import sys
import tarfile
import tempfile
import stat

try:
    import paramiko
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "-q"])
    import paramiko

HOST = "31.6.1.167"
USER = "root"
PASSWORD = "catalin123***"
REMOTE_DIR = "/opt/bot-hosting"
LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SKIP_DIRS = {
    "node_modules", ".git", ".next", "dist", ".turbo", "coverage",
    ".cursor", "terminals", "agent-transcripts",
}
SKIP_FILES = {".env"}


def should_skip(path: str) -> bool:
    parts = path.replace("\\", "/").split("/")
    if any(p in SKIP_DIRS for p in parts):
        return True
    if os.path.basename(path) in SKIP_FILES:
        return True
    return False


def create_archive() -> str:
    tmp = tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False)
    tmp.close()
    with tarfile.open(tmp.name, "w:gz") as tar:
        for root, dirs, files in os.walk(LOCAL_ROOT):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            rel_root = os.path.relpath(root, LOCAL_ROOT)
            if rel_root == ".":
                rel_root = ""
            for name in files:
                full = os.path.join(root, name)
                rel = os.path.join(rel_root, name) if rel_root else name
                if should_skip(full):
                    continue
                tar.add(full, arcname=rel)
    return tmp.name


def run():
    print(f"Creating archive from {LOCAL_ROOT}...")
    archive = create_archive()
    size_mb = os.path.getsize(archive) / 1024 / 1024
    print(f"Archive size: {size_mb:.1f} MB")

    print(f"Connecting to {USER}@{HOST}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    print("Uploading project...")
    sftp = client.open_sftp()
    client.exec_command(f"mkdir -p {REMOTE_DIR}")
    sftp.put(archive, "/tmp/bot-hosting.tar.gz")
    sftp.close()
    os.unlink(archive)

    commands = f"""
set -e
mkdir -p {REMOTE_DIR}
cd {REMOTE_DIR}
tar -xzf /tmp/bot-hosting.tar.gz
rm /tmp/bot-hosting.tar.gz
chmod +x deploy/setup-vps.sh
bash deploy/setup-vps.sh
"""
    print("Running setup on VPS (this may take several minutes)...")
    stdin, stdout, stderr = client.exec_command(commands, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="")
    err = stderr.read().decode()
    if err:
        print(err, file=sys.stderr)
    exit_code = stdout.channel.recv_exit_status()
    client.close()

    if exit_code != 0:
        print(f"Setup failed with exit code {exit_code}")
        sys.exit(exit_code)
    print("Done!")


if __name__ == "__main__":
    run()
