import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "Authorization": "token 03afbb36be363d9:502e552c427bf28",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

url = "https://crm.upsccoaching.in/api/resource/Email%20Account"

payload = {
    "email_id": "upsccoachinginbox@gmail.com",
    "email_account_name": "UPSC Gmail Outgoing",
    "enable_outgoing": 1,
    "default_outgoing": 1,
    "smtp_server": "smtp.gmail.com",
    "smtp_port": "587",
    "use_tls": 1,
    "use_ssl": 0,
    "login_id": "upsccoachinginbox@gmail.com",
    "password": "vmbntsbwvqsczwrt"
}

print("=== Configuring UPSC Gmail Outgoing in Frappe CRM ===")
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Success! Email Account configured:", response.read().decode('utf-8'))
except Exception as e:
    if hasattr(e, 'read'):
        body = e.read().decode('utf-8')
        if "already exists" in body or "DuplicateEntryError" in body:
            print("Email account already exists. Updating it...")
            update_url = f"{url}/UPSC%20Gmail%20Outgoing"
            req_update = urllib.request.Request(update_url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='PUT')
            try:
                with urllib.request.urlopen(req_update, context=ctx) as res_up:
                    print("Success! Email Account updated:", res_up.read().decode('utf-8'))
            except Exception as e2:
                if hasattr(e2, 'read'):
                    print("Failed to update Email Account:", e2, e2.read().decode('utf-8'))
                else:
                    print("Failed to update Email Account:", e2)
        else:
            print("Failed to create Email Account:", e, body)
    else:
        print("Failed to create Email Account:", e)
