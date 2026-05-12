import paramiko, json

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=30)

def run(cmd, label):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore').strip())

# Obtener info del doc 191 vía API
stdin, stdout, stderr = client.exec_command(
    'curl -s -X POST http://localhost:8086/api/v1/auth/login '
    '-H "Content-Type: application/json" '
    "-d '{\"username\":\"admin.qa\",\"password\":\"QAPassword123!\"}'"
)
token = json.loads(stdout.read().decode())['data']['token']

stdin, stdout, stderr = client.exec_command(
    f'curl -s http://localhost:8086/api/v1/documentos/191 -H "Authorization: Bearer {token}"'
)
doc_info = stdout.read().decode('utf-8', errors='ignore')
print(f'\n=== Doc 191 metadata ===\n{doc_info}')

# Explorar directorio de documentos completo
run('sudo docker exec sged-backend-lite find /opt/sged-docs -name "*.doc" -o -name "*.docx" 2>/dev/null | head -20', 'Archivos .doc/.docx en storage')
run('sudo docker exec sged-backend-lite find /opt/sged-docs/2026 -ls 2>/dev/null | head -20', 'Contenido /opt/sged-docs/2026')

# Tamaño del archivo doc 191 específico
run(
    'sudo docker exec sged-backend-lite find /opt/sged-docs -name "*191*" -ls 2>/dev/null',
    'Archivo doc 191 en disco'
)

client.close()
