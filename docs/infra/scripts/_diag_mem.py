import paramiko, json, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=30)

def run(cmd, label):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(out)
    if err: print('STDERR:', err)
    return out

# 1. Memoria del contenedor AHORA (sin conversión activa)
run('docker stats sged-backend-lite --no-stream --format "{{.MemUsage}} / {{.MemPerc}}"', 'Memoria contenedor actual')

# 2. OOM kills en dmesg
run('dmesg | grep -i "oom\\|killed\\|memory" | tail -20', 'dmesg OOM events')

# 3. Memoria VPS total
run('free -m', 'Memoria VPS total')

# 4. Obtener token para prueba
stdin, stdout, stderr = client.exec_command(
    'curl -s -X POST http://localhost:8086/api/v1/auth/login '
    '-H "Content-Type: application/json" '
    "-d '{\"username\":\"admin.qa\",\"password\":\"QAPassword123!\"}'"
)
token = json.loads(stdout.read().decode())['data']['token']

# 5. Monitorear memoria DURANTE una conversión (polling en background)
# Lanzar request async y medir memoria a los 2s
stdin, stdout, stderr = client.exec_command(
    f'curl -s -o /dev/null http://localhost:8086/api/v1/documentos/191/contenido '
    f'-H "Authorization: Bearer {token}" &'
    f' sleep 2 && docker stats sged-backend-lite --no-stream --format "{{{{.MemUsage}}}}"'
)
time.sleep(4)
out = stdout.read().decode('utf-8', errors='ignore').strip()
print(f'\n=== Memoria durante conversión (t+2s) ===\n{out}')

# 6. Check jodconverter properties efectivas en el proceso
run(
    'docker exec sged-backend-lite bash -c '
    '"cat /proc/$(pgrep -f app.jar)/cmdline 2>/dev/null | tr \'\\0\' \'\\n\' | grep -i jod"',
    'JODConverter JVM flags'
)

# 7. Ver puerto 2002 (UNO socket de JODConverter)
run('ss -tlnp | grep 2002 || echo "Puerto 2002 libre"', 'Puerto UNO JODConverter')
run('docker exec sged-backend-lite ss -tlnp | grep 2002 || echo "Puerto 2002 libre dentro del contenedor"', 'Puerto UNO dentro del contenedor')

client.close()
