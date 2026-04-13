import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=30)

stdin, stdout, stderr = client.exec_command("sudo docker logs sged-backend-lite --tail 2000")
with open("backend_logs.txt", "w", encoding='utf-8') as f:
    f.write(stdout.read().decode('utf-8', errors='replace'))
    f.write("\n--- STDERR ---\n")
    f.write(stderr.read().decode('utf-8', errors='replace'))

client.close()
