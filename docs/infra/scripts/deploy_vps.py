import zipfile
import os
import paramiko

def create_bundle():
    print("Creating bundle.zip...")
    with zipfile.ZipFile('bundle.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        def add_dir(path):
            for root, dirs, files in os.walk(path):
                if 'node_modules' in root or 'target' in root or '.angular' in root or '.git' in root:
                    continue
                for file in files:
                    zipf.write(os.path.join(root, file))
        
        # Package Backend
        print("Adding backend...")
        add_dir('sGED-backend/src')
        zipf.write('sGED-backend/pom.xml')
        zipf.write('sGED-backend/Dockerfile')
        
        # Package Frontend
        print("Adding frontend...")
        add_dir('sGED-frontend/dist')
        zipf.write('sGED-frontend/nginx.conf')
        zipf.write('sGED-frontend/Dockerfile.vps', arcname='sGED-frontend/Dockerfile')
        
        # Deploy Compose
        zipf.write('docker-compose-vps.yml', arcname='docker-compose.yml')
    print("Bundle created successfully.")

def deploy():
    print("Connecting to VPS 51.161.32.204...")
    hostname = '51.161.32.204'
    port = 52022
    username = 'ubuntu'
    password = 'ElyLov10$'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)

    # 1. Transfer file
    print("Transferring bundle.zip...")
    sftp = client.open_sftp()
    
    # Ensure remote directory exists
    client.exec_command("sudo mkdir -p /opt/sged-lite && sudo chown ubuntu:ubuntu /opt/sged-lite")
    sftp.put('bundle.zip', '/opt/sged-lite/bundle.zip')
    sftp.close()
    
    print("Extracting remotely...")
    # 2. Extract
    stdin, stdout, stderr = client.exec_command("cd /opt/sged-lite && unzip -o bundle.zip")
    print(stdout.read().decode())
    
    # 3. Build & Run Sequentially
    print("Building frontend...")
    stdin, stdout, stderr = client.exec_command("cd /opt/sged-lite && sudo docker compose build sged-frontend")
    print(stdout.read().decode())
    print(stderr.read().decode())

    print("Building backend (this will take a moment)...")
    stdin, stdout, stderr = client.exec_command("cd /opt/sged-lite && sudo docker compose build sged-backend")
    print(stdout.read().decode())
    print(stderr.read().decode())

    print("Starting containers...")
    stdin, stdout, stderr = client.exec_command("cd /opt/sged-lite && sudo docker compose up -d")
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("Deployment cycle completed.")
    client.close()

if __name__ == '__main__':
    create_bundle()
    deploy()
