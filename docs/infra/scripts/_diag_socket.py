import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=60)

def run(cmd, label, wait=15):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=wait)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(out)
    if err: print('STDERR:', err[:400])
    return out

# Matar cualquier soffice previo
run('sudo docker exec sged-backend-lite pkill -9 -f soffice 2>/dev/null; sleep 1; echo done', 'Limpiar soffice previo')

# Arrancar soffice en modo UNO
run(
    'sudo docker exec -d sged-backend-lite bash -c '
    '"soffice --headless --norestore --nologo '
    '--accept=\\"socket,host=127.0.0.1,port=2002;urp;StarOffice.ServiceManager\\" '
    '>> /tmp/soffice_uno.log 2>&1"',
    'Arrancar soffice UNO'
)

# Polling cada 5 segundos hasta 60s
for i in range(12):
    time.sleep(5)
    t = (i + 1) * 5
    stdin, stdout, stderr = client.exec_command(
        'sudo docker exec sged-backend-lite bash -c '
        '"ss -tlnp | grep 2002 && echo BOUND || echo NOT_BOUND; pgrep -c soffice 2>/dev/null || echo 0"'
    )
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    print(f't+{t:2d}s: {out.replace(chr(10), " | ")}')
    if 'BOUND' in out:
        break
    if '0' == out.strip().split()[-1]:
        print(f't+{t:2d}s: soffice process died!')
        break

# Logs finales
run('sudo docker exec sged-backend-lite cat /tmp/soffice_uno.log', 'Logs soffice UNO final')
run('sudo docker exec sged-backend-lite pgrep -a soffice || echo "sin proceso"', 'Proceso final')

# Limpiar
run('sudo docker exec sged-backend-lite pkill -9 -f soffice 2>/dev/null; echo done', 'Limpiar')

client.close()
