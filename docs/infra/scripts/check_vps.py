from _vps import connect

def check():
    client = connect()

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
