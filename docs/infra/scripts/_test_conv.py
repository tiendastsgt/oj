import paramiko, json, time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=30)

def run(cmd, label, wait=20):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=wait)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(out)
    if err: print('STDERR:', err[:300])
    return out

# Esperar que el backend esté listo
print('Esperando backend...')
for i in range(20):
    time.sleep(3)
    stdin, stdout, _ = client.exec_command(
        'curl -s http://localhost:8086/actuator/health 2>/dev/null'
    )
    resp = stdout.read().decode('utf-8', errors='ignore').strip()
    if '"status":"UP"' in resp:
        print(f'Backend listo (t={i*3+3}s)')
        break
    print(f't={i*3+3}s: {resp[:60] or "no response"}')
else:
    print('Backend no respondió en 60s')

# Login
stdin, stdout, stderr = client.exec_command(
    'curl -s -X POST http://localhost:8086/api/v1/auth/login '
    '-H "Content-Type: application/json" '
    "-d '{\"username\":\"admin.qa\",\"password\":\"QAPassword123!\"}'"
)
body = stdout.read().decode('utf-8', errors='ignore')
try:
    token = json.loads(body)['data']['token']
    print(f'\nLogin OK')
except Exception as e:
    print(f'Login failed: {body[:200]}')
    client.close()
    exit(1)

# Test conversión doc 191 (Word .doc)
print('\nTestando conversión doc 191 (.doc)...')
run(
    f'curl -s -D - -o /dev/null '
    f'http://localhost:8086/api/v1/documentos/191/contenido '
    f'-H "Authorization: Bearer {token}"',
    'Headers respuesta doc 191'
)

# Ver si el PDF se generó en disco
run(
    'sudo docker exec sged-backend-lite find /opt/sged-docs/2026/04/60/191 -ls',
    'Archivos doc 191 en disco'
)

# Ver logs del backend (últimas 20 líneas)
run('sudo docker logs sged-backend-lite --tail 20 2>&1', 'Últimos logs backend')

# Test con un .docx también
stdin, stdout, stderr = client.exec_command(
    f'curl -s http://localhost:8086/api/v1/expedientes/47/documentos '
    f'-H "Authorization: Bearer {token}"'
)
docs_resp = stdout.read().decode('utf-8', errors='ignore')
try:
    docs_data = json.loads(docs_resp).get('data', {})
    docs = docs_data.get('content', []) if isinstance(docs_data, dict) else []
    docx_id = next((d['id'] for d in docs if d.get('extension', '').lower() == 'docx'), None)
    if docx_id:
        print(f'\nTestando conversión doc {docx_id} (.docx)...')
        run(
            f'curl -s -D - -o /dev/null '
            f'http://localhost:8086/api/v1/documentos/{docx_id}/contenido '
            f'-H "Authorization: Bearer {token}"',
            f'Headers respuesta doc {docx_id}'
        )
    else:
        print('\nNo se encontró .docx en expediente 47')
except Exception as e:
    print(f'Error consultando docs: {e}')

client.close()
