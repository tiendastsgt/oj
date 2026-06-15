from _vps import connect

def fix():
    client = connect()

    commands = [
        "sudo apt-get install -y unzip",
        "cd /opt/sged-lite && unzip -o bundle.zip",
        "sudo ufw allow 8085/tcp",
        "cd /opt/sged-lite && sudo docker compose build sged-frontend",
        "cd /opt/sged-lite && sudo docker compose build sged-backend",
        "cd /opt/sged-lite && sudo docker compose up -d"
    ]

    for cmd in commands:
        print(f"Executing: {cmd}")
        _, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
        
    client.close()

if __name__ == '__main__':
    fix()
