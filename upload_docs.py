"""Crea un expediente demo y sube los decretos de prueba vía API SGED.

Credenciales y destino por variables de entorno (sin secretos hardcodeados):
    VPS_API_BASE   opcional  base de la API. Default http://{VPS_HOST}:8086/api/v1
    VPS_HOST       requerida si no se da VPS_API_BASE
    QA_USER        opcional  default "admin.qa"
    QA_PASSWORD    requerida
    DOCS_DIR       opcional  carpeta con los archivos a subir
                             (default: medios_para_test/formatos de decretos de distintas materias)
    EXPEDIENTE_ID  opcional  si se da, sube a ese expediente; si no, crea uno demo
"""
import json
import os
import sys
import urllib.request

API = os.environ.get("VPS_API_BASE")
if not API:
    vps_host = os.environ.get("VPS_HOST")
    if not vps_host:
        sys.exit("Falta VPS_HOST en el entorno (o define VPS_API_BASE directamente).")
    API = f"http://{vps_host}:8086/api/v1"
QA_USER = os.environ.get("QA_USER", "admin.qa")
QA_PASSWORD = os.environ.get("QA_PASSWORD")
DOCS_DIR = os.environ.get(
    "DOCS_DIR",
    os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "medios_para_test",
        "formatos de decretos de distintas materias",
    ),
)

if not QA_PASSWORD:
    sys.exit("Falta QA_PASSWORD en el entorno.")


def api(path, data=None, token=None, method="GET", multipart=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if multipart is not None:
        boundary, body = multipart
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
        data = body
        method = "POST"
    elif data is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(data).encode()
        method = "POST"
    req = urllib.request.Request(f"{API}/{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


# 1. Login
token = api("auth/login", data={"username": QA_USER, "password": QA_PASSWORD})["data"]["token"]
print(f"Login OK ({QA_USER})")

# 2. Expediente destino: usar el dado o crear uno demo
exp_id = os.environ.get("EXPEDIENTE_ID")
if exp_id:
    print(f"Usando expediente existente id={exp_id}")
else:
    from datetime import date

    nuevo = api(
        "expedientes",
        token=token,
        data={
            "numero": "DEMO-2026-DECRETOS",
            "tipoProcesoId": 1,
            "juzgadoId": 1,
            "estadoId": 1,
            "fechaInicio": date.today().isoformat(),
            "descripcion": "DEMO - Formatos de decretos de distintas materias",
        },
    )
    exp_id = nuevo["data"]["id"]
    print(f"Expediente demo creado: id={exp_id} numero={nuevo['data'].get('numero')}")

# 3. Subir cada archivo (solo archivos, saltando subdirectorios)
files = sorted(
    f for f in os.listdir(DOCS_DIR) if os.path.isfile(os.path.join(DOCS_DIR, f))
)
print(f"\n{len(files)} archivos a subir desde: {DOCS_DIR}\n")

ok = 0
for fname in files:
    fpath = os.path.join(DOCS_DIR, fname)
    with open(fpath, "rb") as fh:
        file_data = fh.read()
    ext = os.path.splitext(fname)[1].lower()
    ctype = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }.get(ext, "application/octet-stream")
    boundary = "----SGEDDemoBoundary7MA4YWxkTrZu0gW"
    body = b"".join([
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; '
        f'filename="{fname}"\r\nContent-Type: {ctype}\r\n\r\n'.encode(),
        file_data,
        b"\r\n",
        f'--{boundary}\r\nContent-Disposition: form-data; name="tipoDocumentoId"\r\n\r\n1\r\n'.encode(),
        f"--{boundary}--\r\n".encode(),
    ])
    try:
        res = api(f"expedientes/{exp_id}/documentos", token=token, multipart=(boundary, body))
        status = "OK" if res.get("success") else f"FALLO: {res.get('message')}"
        if res.get("success"):
            ok += 1
        print(f"  [{status}] {fname} ({len(file_data):,} bytes)")
    except Exception as e:
        detail = e.read().decode()[:200] if hasattr(e, "read") else str(e)
        print(f"  [ERROR] {fname}: {detail}")

print(f"\nListo: {ok}/{len(files)} subidos al expediente {exp_id}.")
