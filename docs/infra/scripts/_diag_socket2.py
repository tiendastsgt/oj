import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=120)

def run(cmd, label, wait=20):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=wait)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(out)
    if err: print('STDERR:', err[:400])
    return out

# Limpiar y arrancar soffice UNO
run('sudo docker exec sged-backend-lite pkill -9 -f soffice 2>/dev/null; sleep 1; echo done', 'Limpiar')
run(
    'sudo docker exec -d sged-backend-lite bash -c '
    '"soffice --headless --norestore --nologo '
    '--accept=\\"socket,host=127.0.0.1,port=2002;urp;StarOffice.ServiceManager\\" '
    '>> /tmp/soffice2.log 2>&1"',
    'Arrancar soffice UNO'
)

# Polling cada 5s con check correcto
for i in range(12):
    time.sleep(5)
    elapsed = (i + 1) * 5
    stdin, stdout, stderr = client.exec_command(
        'sudo docker exec sged-backend-lite bash -c '
        '"ss -tlnp | grep :2002; pgrep -a soffice | wc -l"'
    )
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    lines = out.splitlines()
    port_bound = any(':2002' in l for l in lines)
    procs = lines[-1].strip() if lines else '0'
    status = 'BOUND' if port_bound else 'waiting'
    print(f't+{elapsed:2d}s: port={status} procs={procs}')
    if port_bound:
        print('Puerto 2002 escuchando!')
        break
    if procs == '0':
        print('soffice murió!')
        break

run('sudo docker exec sged-backend-lite cat /tmp/soffice2.log', 'Logs soffice final')
run('sudo docker exec sged-backend-lite pkill -9 -f soffice 2>/dev/null; echo done', 'Limpiar')
client.close()
