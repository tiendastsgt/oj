import os
import paramiko
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def force_reseed():
    hostname = os.environ['VPS_HOST']
    port = int(os.environ.get('VPS_PORT', 52022))
    username = os.environ['VPS_USER']
    password = os.environ['VPS_PASSWORD']

    print(f"Connecting to VPS {hostname} to force re-seed...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=30)

    # 1. Clean DB
    clean_sql = "SET FOREIGN_KEY_CHECKS=0; DELETE FROM documento; DELETE FROM expediente; SET FOREIGN_KEY_CHECKS=1;"
    cmd_clean = f'sudo docker exec -i sged-mysql-lite mysql -u sged_user -psged_password sged_db -e "{clean_sql}"'
    print(f"Cleaning database tables...")
    stdin, stdout, stderr = client.exec_command(cmd_clean)
    print(stdout.read().decode())
    print(stderr.read().decode())

    # 2. Restart sged-backend to trigger DbDataInitializer
    cmd_restart = "cd /opt/sged-lite && sudo docker compose restart sged-backend"
    print("Restarting sged-backend to trigger re-seeding...")
    stdin, stdout, stderr = client.exec_command(cmd_restart)
    print(stdout.read().decode())
    print(stderr.read().decode())

    print("Checking logs of sged-backend...")
    stdin, stdout, stderr = client.exec_command("sudo docker logs --tail 50 sged-backend-lite")
    print(stdout.read().decode())

    client.close()
    print("Force re-seed completed!")

if __name__ == '__main__':
    force_reseed()
