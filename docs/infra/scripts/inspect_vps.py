from _vps import connect

def ssh_execute_and_dump():
    try:
        client = connect(timeout=10)
        print("Connected successfully.")
        
        commands = [
            "echo '--- UPTIME ---'",
            "uptime",
            "echo '--- OS ---'",
            "cat /etc/os-release",
            "echo '--- MEMORY ---'",
            "free -h",
            "echo '--- DISK ---'",
            "df -h",
            "echo '--- DOCKER CONTAINERS ---'",
            "sudo docker ps -a",
            "echo '--- PORTS ---'",
            "sudo ss -tulpn | grep LISTEN"
        ]
        
        full_output = ""
        for cmd in commands:
            stdin, stdout, stderr = client.exec_command(cmd)
            full_output += stdout.read().decode('utf-8')
            full_output += stderr.read().decode('utf-8')
            
        with open('vps_inspection.txt', 'w', encoding='utf-8') as f:
            f.write(full_output)
            
        print("Inspection saved to vps_inspection.txt")
        client.close()
    except Exception as e:
        print("Failed:", str(e))

if __name__ == '__main__':
    ssh_execute_and_dump()
