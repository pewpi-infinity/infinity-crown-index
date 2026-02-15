#!/usr/bin/env bash
# ⚡ TURBO MODE - VERSION FIXED

# 1. Force Token check
if [ -z "$GITHUB_TOKEN" ]; then
    export GITHUB_TOKEN=$(gh auth token 2>/dev/null)
fi

termux-wake-lock 2>/dev/null || true
mkdir -p api

while true; do
    echo -e "\033[0;36m🔥 TURBO STARTING...\033[0m"
    
    # --- FIXED SCANNER ---
    python3 <<'EOPY'
import requests, json, base64, concurrent.futures, os, re
from datetime import datetime, timezone

USER = "pewpi-infinity"
TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

def scan_repo(repo):
    name = repo['name']
    # Corrected URL path with proper slashes
    url = f"https://api.github.com/repos/{USER}/{name}/readme"
    try:
        r = requests.get(url, headers=HEADERS, timeout=3)
        words = 0
        if r.status_code == 200:
            content = base64.b64decode(r.json()['content']).decode('utf-8', errors='ignore')
            words = len(re.findall(r'\b[a-zA-Z]{3,}\b', content.lower()))
        return {"name": name, "words": words}
    except: return {"name": name, "words": 0}

# Corrected base URL
repo_url = f"https://api.github.com/users/{USER}/repos?per_page=100"
r = requests.get(repo_url, headers=HEADERS)
repos = r.json() if r.status_code == 200 else []

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
    results = list(ex.map(scan_repo, repos))

empty = [r for r in results if r['words'] < 5]
with open("api/dictionary.json", "w") as f:
    json.dump({"empty_repos": empty, "total": len(results)}, f)
print(f"SCAN COMPLETE: {len(results)} repos found.")
EOPY

    # --- FIXED SEEDER ---
    python3 <<'EOPY'
import requests, json, base64, concurrent.futures, os
USER = "pewpi-infinity"
TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

def seed(repo):
    name = repo['name']
    url = f"https://api.github.com/repos/{USER}/{name}/contents/index.html"
    html = f"<html><body style='background:#000;color:#0f0;'><h1>⚡ {name}</h1><p>INFINITY SEED</p></body></html>"
    content = base64.b64encode(html.encode()).decode()
    try:
        # GET SHA to allow update
        curr = requests.get(url, headers=HEADERS, timeout=2)
        payload = {"message": "⚡ TURBO", "content": content}
        if curr.status_code == 200:
            payload["sha"] = curr.json()["sha"]
        
        # PUT file [Verification: https://docs.github.com]
        put_r = requests.put(url, json=payload, headers=HEADERS, timeout=4)
        return 1 if put_r.status_code in [200, 201] else 0
    except: return 0

with open("api/dictionary.json") as f:
    targets = json.load(f).get("empty_repos", [])[:10]

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    success = list(ex.map(seed, targets))
print(f"SEEDED: {sum(success)} pages.")
EOPY

    # --- FIXED GIT PUSH ---
    git add .
    git commit -m "⚡ TURBO UPDATE" 2>/dev/null
    git push origin main 2>/dev/null
    
    echo -e "\033[0;32m✅ CYCLE COMPLETE. SLEEPING 10s...\033[0m"
    sleep 10
done
