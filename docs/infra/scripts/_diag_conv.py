import paramiko, json

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

DOC_PATH = '/opt/sged-docs/2026/04/60/191/191_GUI_N_SIMULACI_N_DE_JUICIO.doc'

# 1. Verificar magic bytes del .doc (OLE: D0 CF 11 E0)
run(f'sudo docker exec sged-backend-lite xxd {DOC_PATH!r} | head -2', 'Magic bytes doc 191')

# 2. Intentar conversión manual con soffice headless directamente en el contenedor
run(
    f'sudo docker exec sged-backend-lite bash -c '
    f'"mkdir -p /tmp/conv_test && soffice --headless --convert-to pdf '
    f'--outdir /tmp/conv_test {DOC_PATH!r} 2>&1"',
    'soffice conversión directa'
)

# 3. Ver si el PDF se generó
run('sudo docker exec sged-backend-lite ls -la /tmp/conv_test/', 'Resultado en /tmp/conv_test')

# 4. Probar con un .docx del seed (debería ser más estándar)
DOCX_PATH = '/opt/sged-docs/2026/04/47/137/137_memorial_presentacion.docx'
run(f'sudo docker exec sged-backend-lite xxd {DOCX_PATH!r} | head -2', 'Magic bytes .docx 137')
run(
    f'sudo docker exec sged-backend-lite bash -c '
    f'"soffice --headless --convert-to pdf '
    f'--outdir /tmp/conv_test {DOCX_PATH!r} 2>&1"',
    'soffice conversión .docx 137'
)
run('sudo docker exec sged-backend-lite ls -la /tmp/conv_test/', 'Resultado tras .docx')

# 5. Ver logs recientes de JODConverter dentro del contenedor
run(
    'sudo docker logs sged-backend-lite --tail 30 2>&1 | grep -i -A3 "soffice\\|jod\\|convert\\|office"',
    'Logs backend conversion-related'
)

client.close()
