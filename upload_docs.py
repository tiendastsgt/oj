"""Upload files from medios_para_test to expediente 60 via API."""
import json
import urllib.request
import os
import sys

VPS = "http://51.161.32.204:8086/api/v1"

# 1. Login
login_data = json.dumps({"username": "admin.qa", "password": "QAPassword123!"}).encode()
req = urllib.request.Request(f"{VPS}/auth/login", data=login_data, headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = urllib.request.urlopen(req)
    body = json.loads(resp.read().decode())
    print(f"Login: {body['success']}")
    if not body["success"]:
        print("Login failed"); sys.exit(1)
    token = body["data"]["token"]
    print(f"Token: {token[:40]}...")
except Exception as e:
    print(f"Login error: {e}")
    # Try reading error body
    if hasattr(e, 'read'):
        print(e.read().decode())
    sys.exit(1)

# 2. Check what files exist
files_dir = r"C:\proyectos\oj\medios_para_test"
files = os.listdir(files_dir)
print(f"\nFiles to upload: {files}")

# 3. Upload each file
for fname in files:
    fpath = os.path.join(files_dir, fname)
    fsize = os.path.getsize(fpath)
    print(f"\nUploading {fname} ({fsize:,} bytes)...")
    
    # Build multipart form data manually
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    with open(fpath, "rb") as f:
        file_data = f.read()
    
    body_parts = []
    # file part
    body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"archivo\"; filename=\"{fname}\"\r\nContent-Type: application/octet-stream\r\n\r\n".encode())
    body_parts.append(file_data)
    body_parts.append(b"\r\n")
    # tipoDocumentoId part (1 = generic)
    body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"tipoDocumentoId\"\r\n\r\n1\r\n".encode())
    body_parts.append(f"--{boundary}--\r\n".encode())
    
    body_bytes = b"".join(body_parts)
    
    upload_req = urllib.request.Request(
        f"{VPS}/expedientes/60/documentos",
        data=body_bytes,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST"
    )
    
    try:
        resp = urllib.request.urlopen(upload_req, timeout=120)
        result = json.loads(resp.read().decode())
        print(f"  Result: {result.get('success', 'unknown')}")
    except Exception as e:
        print(f"  Upload error: {e}")
        if hasattr(e, 'read'):
            print(f"  Details: {e.read().decode()}")

print("\nDone!")
