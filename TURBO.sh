#!/usr/bin/env bash
# TURBO MODE - Fast parallel scanning with auth and rate-limit safety

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Auth: load token from env file, never hardcoded ──
if [ -f "$HOME/.infinity-env" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.infinity-env"
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo -e "${RED}GITHUB_TOKEN not set. Create ~/.infinity-env with:${NC}"
    echo '  GITHUB_TOKEN=ghp_yourtoken'
    echo "Write operations will be skipped."
fi

termux-wake-lock 2>/dev/null || true

CYCLE=0
TOTAL_OPS=0

while true; do
    CYCLE=$((CYCLE + 1))
    CYCLE_OPS=0

    echo -e "${CYAN}TURBO CYCLE $CYCLE${NC}"

    # ── PARALLEL SCAN (5 workers, not 50) ──
    python3 <<'EOPY' &
import requests, re, json, base64, os, time, concurrent.futures
from collections import Counter
from datetime import datetime, timezone

USER = "pewpi-infinity"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
HEADERS = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

def scan_repo(repo):
    name = repo['name']
    try:
        r = requests.get(
            f"https://api.github.com/repos/{USER}/{name}/readme",
            headers=HEADERS, timeout=5
        )
        if r.status_code == 200:
            content = base64.b64decode(r.json()['content']).decode('utf-8', errors='ignore')
            words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
            return {"name": name, "words": len(words), "url": repo['html_url'], "data": words}
        if r.status_code == 403:
            time.sleep(5)
    except requests.exceptions.RequestException:
        pass
    return {"name": name, "words": 0, "url": repo['html_url'], "data": []}

all_words = Counter()

repos = []
for page in range(1, 20):
    r = requests.get(
        f"https://api.github.com/users/{USER}/repos?per_page=100&page={page}",
        headers=HEADERS, timeout=10
    )
    if r.status_code != 200:
        break
    batch = r.json()
    if not batch:
        break
    repos.extend(batch)
    time.sleep(0.5)

# 5 workers max to respect rate limits
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(scan_repo, repos))

for r in results:
    if r['data']:
        all_words.update(r['data'])

empty = [r for r in results if r['words'] < 10]
rich = [r for r in results if r['words'] > 100]

with open("api/dictionary.json", "w") as f:
    json.dump({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_repos": len(results),
        "total_unique_words": len(all_words),
        "operations": len(results),
        "top_words": dict(all_words.most_common(500)),
        "empty_repos": [{"name": r["name"], "url": r["url"], "words": r["words"]} for r in empty],
        "rich_repos": sorted(
            [{"name": r["name"], "url": r["url"], "words": r["words"]} for r in rich],
            key=lambda x: x['words'], reverse=True
        )
    }, f, indent=2)

print(f"SCANNED: {len(results)} repos")
EOPY

    # ── PARALLEL SEED (3 workers, requires token) ──
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        python3 <<'EOPY' &
import requests, json, base64, os, sys, time, concurrent.futures
from datetime import datetime, timezone

USER = "pewpi-infinity"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not TOKEN:
    print("SEED SKIPPED: no token")
    sys.exit(0)

HEADERS = {"Authorization": f"token {TOKEN}"}

try:
    with open("api/dictionary.json") as f:
        data = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    print("SEED SKIPPED: no dictionary.json")
    sys.exit(0)

def seed_repo(repo):
    name = repo['name']
    try:
        content = base64.b64encode(f"# {name}\nTURBO SEEDED\n".encode()).decode()
        url = f"https://api.github.com/repos/{USER}/{name}/contents/README.md"
        check = requests.get(url, headers=HEADERS, timeout=5)
        payload = {"message": "TURBO seed", "content": content}
        if check.status_code == 200:
            payload["sha"] = check.json()["sha"]
        r = requests.put(url, json=payload, headers=HEADERS, timeout=10)
        if r.status_code == 401:
            print(f"AUTH FAILED for {name}")
            return 0
        if r.status_code == 403:
            time.sleep(int(r.headers.get("Retry-After", 30)))
            return 0
        return 1 if r.status_code in [200, 201] else 0
    except requests.exceptions.RequestException as e:
        print(f"ERR {name}: {e}")
        return 0

# 3 workers max, 20 repos per cycle
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(seed_repo, data.get("empty_repos", [])[:20]))

print(f"SEEDED: {sum(results)} repos")
EOPY
    fi

    # ── ANALYTICS (local, no API) ──
    python3 <<'EOPY' &
import json, os
from datetime import datetime, timezone

try:
    with open("api/dictionary.json") as f:
        data = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    print("ANALYTICS SKIPPED: no dictionary.json")
    import sys; sys.exit(0)

try:
    with open("api/tokens.json") as f:
        tokens = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    tokens = {}

cycle = os.environ.get("CYCLE", "0")

analytics = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "cycle": int(cycle) if cycle.isdigit() else 0,
    "total_operations": data.get("operations", 0),
    "overview": {
        "total_repos": data["total_repos"],
        "total_words": data["total_unique_words"],
        "empty_repos": len(data.get("empty_repos", [])),
        "rich_repos": len(data.get("rich_repos", []))
    },
    "categories": {cat: len(repos) for cat, repos in tokens.items() if isinstance(repos, list)},
    "charts": {
        "category_distribution": {cat: len(repos) for cat, repos in tokens.items() if isinstance(repos, list)},
        "content_density": {
            "empty": len(data.get("empty_repos", [])),
            "rich": len(data.get("rich_repos", []))
        }
    }
}

with open("api/analytics.json", "w") as f:
    json.dump(analytics, f, indent=2)

print("ANALYTICS: Updated")
EOPY

    wait

    CYCLE_OPS=$(($(python3 -c "import json; print(json.load(open('api/dictionary.json')).get('operations', 0))" 2>/dev/null || echo 0)))
    TOTAL_OPS=$((TOTAL_OPS + CYCLE_OPS))

    echo -e "${GREEN}CYCLE $CYCLE: $CYCLE_OPS ops | TOTAL: $TOTAL_OPS${NC}"

    git add api/*.json 2>/dev/null
    git commit -m "TURBO $CYCLE - $TOTAL_OPS ops" 2>/dev/null || true
    git push origin main 2>/dev/null || echo -e "${YELLOW}Push skipped${NC}"

    # 30 second cooldown between cycles
    echo -e "${CYAN}Cooldown 30s...${NC}"
    sleep 30
done
