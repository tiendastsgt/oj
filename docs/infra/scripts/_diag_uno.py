import paramiko, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=30)

def run(cmd, label, wait=10):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=wait)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(out)
    if err: print('STDERR:', err[:500])
    return out

# 1. Arrancar soffice en modo UNO (como lo hace JODConverter) - en background
run(
    'sudo docker exec -d sged-backend-lite bash -c '
    '"soffice --headless --norestore --nologo '
    '--accept=\\"socket,host=127.0.0.1,port=2002;urp;StarOffice.ServiceManager\\" '
    '> /tmp/soffice_uno.log 2>&1"',
    'Arrancar soffice en modo UNO'
)

# 2. Esperar que arranque
time.sleep(8)

# 3. Ver si el proceso está vivo
run('sudo docker exec sged-backend-lite pgrep -a soffice', 'soffice proceso post-inicio')

# 4. Ver si el puerto 2002 está escuchando dentro del contenedor
run('sudo docker exec sged-backend-lite ss -tlnp | grep 2002 || echo "Puerto 2002 NO escucha"', 'Puerto 2002 UNO')

# 5. Ver logs de soffice
run('sudo docker exec sged-backend-lite cat /tmp/soffice_uno.log 2>/dev/null || echo "sin logs"', 'Logs soffice UNO')

# 6. Matar soffice
run('sudo docker exec sged-backend-lite pkill -f soffice 2>/dev/null; echo done', 'Matar soffice')

# 7. Revisar pom.xml para versión de JODConverter
run(
    'sudo docker exec sged-backend-lite bash -c '
    '"unzip -p /app/app.jar BOOT-INF/lib/*.jar | strings | grep -i jodconverter | head -5 2>/dev/null || '
    'find /app -name \'*.jar\' | xargs -I{} unzip -p {} META-INF/MANIFEST.MF 2>/dev/null | grep -i jodconv | head -3"',
    'Versión JODConverter en classpath'
)

client.close()
