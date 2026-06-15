from _vps import connect

client = connect(timeout=30)

stdin, stdout, stderr = client.exec_command("sudo docker logs sged-backend-lite --tail 2000")
with open("backend_logs.txt", "w", encoding='utf-8') as f:
    f.write(stdout.read().decode('utf-8', errors='replace'))
    f.write("\n--- STDERR ---\n")
    f.write(stderr.read().decode('utf-8', errors='replace'))

client.close()
