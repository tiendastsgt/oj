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

# 1. Obtener token
stdin, stdout, stderr = client.exec_command(
    'curl -s -X POST http://localhost:8086/api/v1/auth/login '
    '-H "Content-Type: application/json" '
    "-d '{\"username\":\"admin.qa\",\"password\":\"QAPassword123!\"}'"
)
token = json.loads(stdout.read().decode())['data']['token']
print(f'Token OK: {token[:30]}...')

# 2. Marcar timestamp antes del request
run('date -u', 'Timestamp antes de conversión')

# 3. Disparar conversión del doc 191 (descarga + headers)
run(
    f'curl -s -D - -o /dev/null '
    f'http://localhost:8086/api/v1/documentos/191/contenido '
    f'-H "Authorization: Bearer {token}"',
    'Headers respuesta doc 191'
)

# 4. Capturar logs completos post-conversión (últimas 80 líneas, sin filtrar)
run('sudo docker logs sged-backend-lite --tail 80 2>&1', 'Logs backend (últimas 80 líneas)')

# 5. Ver si JODConverter dejó un userInstallation o tmp
run('sudo docker exec sged-backend-lite ls -la /root/.config/libreoffice/ 2>/dev/null || echo "No existe"', 'LibreOffice user profile')
run('sudo docker exec sged-backend-lite ls -la /tmp/ | grep -i "jod\\|office\\|soffice"', 'Temp JODConverter')

# 6. Ver si soffice está corriendo AHORA (después del intento)
run('sudo docker exec sged-backend-lite pgrep -a soffice 2>/dev/null || echo "soffice no está corriendo"', 'soffice process post-request')

client.close()
