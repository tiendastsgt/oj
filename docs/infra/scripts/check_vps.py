import paramiko

def check():
    hostname = '51.161.32.204'
    port = 52022
    username = 'ubuntu'
    password = 'ElyLov10$'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)

    commands = [
        "sudo docker ps -a | grep sged",
        "sudo docker logs sged-frontend-lite --tail 20",
        "sudo docker logs sged-backend-lite --tail 20",
        "sudo ufw status"
    ]

    for cmd in commands:
        print(f"--- {cmd} ---")
        _, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
        
    client.close()

if __name__ == '__main__':
    check()
