import paramiko
import sys

def get_logs():
    hostname = '51.161.32.204'
    port = 52022
    username = 'ubuntu'
    password = 'ElyLov10$'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, port=port, username=username, password=password)
        print("Connected to VPS. Fetching logs...")
        
        # Get last 100 lines of backend logs
        stdin, stdout, stderr = client.exec_command("sudo docker logs --tail 100 sged-backend-lite")
        print("--- BACKEND LOGS ---")
        print(stdout.read().decode())
        print("--- ERROR LOGS ---")
        print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    get_logs()
