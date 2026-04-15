import urllib.request
import json

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/documents?user_id=123")
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Data:", response.read().decode())
except Exception as e:
    print("Error:", e)
