import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('51.161.32.204', port=52022, username='ubuntu', password='ElyLov10$', timeout=30)

def run(cmd, label):
    print(f'\n=== {label} ===')
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out: print(out)
    if err: print('STDERR:', err[:300])
    return out

# Stats del contenedor backend
run('sudo docker stats sged-backend-lite --no-stream', 'Container stats')

# Uso real de memoria en cgroup del contenedor
run(
    'sudo cat /sys/fs/cgroup/memory/docker/'
    '$(sudo docker inspect sged-backend-lite --format "{{.Id}}")'
    '/memory.usage_in_bytes 2>/dev/null || '
    'sudo docker exec sged-backend-lite cat /sys/fs/cgroup/memory/memory.usage_in_bytes 2>/dev/null || '
    'sudo docker exec sged-backend-lite cat /sys/fs/cgroup/memory.current 2>/dev/null',
    'Uso de memoria cgroup'
)

# Límite del cgroup
run(
    'sudo docker exec sged-backend-lite cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || '
    'sudo docker exec sged-backend-lite cat /sys/fs/cgroup/memory.max 2>/dev/null',
    'Límite cgroup'
)

# OOM kills del cgroup
run(
    'sudo docker exec sged-backend-lite cat /sys/fs/cgroup/memory/memory.oom_control 2>/dev/null || '
    'sudo docker exec sged-backend-lite cat /sys/fs/cgroup/memory.events 2>/dev/null',
    'OOM events en cgroup'
)

# Procesos más pesados en el contenedor
run(
    'sudo docker exec sged-backend-lite ps aux --sort=-%mem | head -10',
    'Top procesos en contenedor'
)

# Logs del kernel (dmesg) con sudo
run('sudo dmesg | grep -i "oom\\|killed\\|memory fail" | tail -20', 'dmesg OOM kernel')

client.close()
