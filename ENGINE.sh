#!/usr/bin/env bash
# THE ENGINE - Continuous scan/seed/analytics loop

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
    echo "Seeding will be skipped. Read-only scanning will continue."
fi

termux-wake-lock 2>/dev/null || true

CYCLE=0
START=$(date +%s)

while true; do
    CYCLE=$((CYCLE + 1))
    NOW=$(date +%s)
    ELAPSED=$((NOW - START))

    clear
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    echo -e "${CYAN}ENGINE CYCLE $CYCLE${NC}"
    echo -e "${BLUE}Runtime: $((ELAPSED / 3600))h $((ELAPSED % 3600 / 60))m${NC}"
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    echo ""

    # ── SCAN (read-only, works unauthenticated) ──
    echo -e "${YELLOW}SCANNING...${NC}"
    python3 - <<'EOPY'
import requests, re, json, base64, os, sys, time
from collections import Counter
from datetime import datetime, timezone

USER = "pewpi-infinity"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
HEADERS = {"Authorization": f"token {TOKEN}"} if TOKEN else {}

all_words = Counter()
empty, rich = [], []
total = 0

for page in range(1, 20):
    r = requests.get(
        f"https://api.github.com/users/{USER}/repos?per_page=100&page={page}",
        headers=HEADERS, timeout=10
    )
    if r.status_code == 403:
        print(f"\033[0;31mRate limited. Waiting 60s...\033[0m")
        time.sleep(60)
        continue
    if r.status_code != 200 or not r.json():
        break

    for repo in r.json():
        total += 1
        name = repo['name']
        print(f"\033[0;34m  {name}\033[0m", end=" ", flush=True)

        try:
            readme = requests.get(
                f"https://api.github.com/repos/{USER}/{name}/readme",
                headers=HEADERS, timeout=5
            )
            words = 0
            if readme.status_code == 200:
                content = base64.b64decode(readme.json()['content']).decode('utf-8', errors='ignore')
                word_list = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
                all_words.update(word_list)
                words = len(word_list)

            if words < 10:
                print("\033[0;31mX\033[0m")
                empty.append({"name": name, "url": repo['html_url'], "words": words})
            elif words > 100:
                print("\033[0;32mOK\033[0m")
                rich.append({"name": name, "url": repo['html_url'], "words": words})
            else:
                print("\033[0;33m~\033[0m")
        except requests.exceptions.RequestException as e:
            print(f"\033[0;31mERR: {e}\033[0m")

    # Rate-limit courtesy pause between pages
    time.sleep(1)

with open("api/dictionary.json", "w") as f:
    json.dump({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_repos": total,
        "total_unique_words": len(all_words),
        "top_words": dict(all_words.most_common(500)),
        "empty_repos": empty,
        "rich_repos": sorted(rich, key=lambda x: x['words'], reverse=True)
    }, f, indent=2)

print(f"\n\033[0;32m{total} repos | {len(all_words)} words | {len(empty)} empty | {len(rich)} rich\033[0m")
EOPY

    # ── SEED (requires token) ──
    echo ""
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        echo -e "${YELLOW}SEEDING...${NC}"
        python3 - <<'EOPY'
import requests, json, base64, os, sys, time
from datetime import datetime, timezone

USER = "pewpi-infinity"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not TOKEN:
    print("No GITHUB_TOKEN. Skipping seed.")
    sys.exit(0)

HEADERS = {"Authorization": f"token {TOKEN}"}

with open("api/dictionary.json") as f:
    data = json.load(f)

seeded = 0
for repo in data.get("empty_repos", [])[:10]:
    name = repo['name']
    print(f"\033[0;33m  {name}\033[0m", end=" ", flush=True)

    try:
        content = base64.b64encode(f"""# {name}

Seeded by ENGINE

Part of Infinity Realm - Building autonomously

## Status
- Seeded: {datetime.now(timezone.utc).isoformat()}
- Building: Continuous
- Connected: Yes

## Actions Available
Use Crown Index to build this repo further
""".encode()).decode()

        url = f"https://api.github.com/repos/{USER}/{name}/contents/README.md"
        check = requests.get(url, headers=HEADERS, timeout=5)

        payload = {"message": "ENGINE seed", "content": content}
        if check.status_code == 200:
            payload["sha"] = check.json()["sha"]

        result = requests.put(url, json=payload, headers=HEADERS, timeout=10)
        if result.status_code in [200, 201]:
            print("\033[0;32mOK\033[0m")
            seeded += 1
        elif result.status_code == 401:
            print("\033[0;31mAUTH FAILED - check token\033[0m")
            break
        elif result.status_code == 403:
            wait = int(result.headers.get("Retry-After", 60))
            print(f"\033[0;31mRate limited. Waiting {wait}s\033[0m")
            time.sleep(wait)
        else:
            print(f"\033[0;31mHTTP {result.status_code}\033[0m")
    except requests.exceptions.RequestException as e:
        print(f"\033[0;31mERR: {e}\033[0m")

    time.sleep(1)  # Rate limit courtesy

print(f"\n\033[0;32mSeeded {seeded} repos\033[0m")
EOPY
    else
        echo -e "${YELLOW}Skipping seed (no GITHUB_TOKEN)${NC}"
    fi

    # ── ANALYTICS (local file merge, no API needed) ──
    echo ""
    echo -e "${YELLOW}ANALYTICS...${NC}"
    python3 - <<'EOPY'
import json
from datetime import datetime, timezone

with open("api/dictionary.json") as f:
    data = json.load(f)

try:
    with open("api/tokens.json") as f:
        tokens = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    tokens = {}

analytics = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "overview": {
        "total_repos": data["total_repos"],
        "total_words": data["total_unique_words"],
        "empty_repos": len(data["empty_repos"]),
        "rich_repos": len(data["rich_repos"])
    },
    "categories": {cat: len(repos) for cat, repos in tokens.items() if isinstance(repos, list)},
    "top_content_repos": data["rich_repos"][:20],
    "charts": {
        "category_distribution": {cat: len(repos) for cat, repos in tokens.items() if isinstance(repos, list)},
        "content_density": {
            "empty": len(data["empty_repos"]),
            "rich": len(data["rich_repos"])
        }
    }
}

with open("api/analytics.json", "w") as f:
    json.dump(analytics, f, indent=2)

print("\033[0;32mAnalytics updated\033[0m")
EOPY

    # ── PUSH ──
    echo ""
    echo -e "${YELLOW}PUSHING...${NC}"
    git add api/*.json 2>/dev/null
    git commit -m "ENGINE cycle $CYCLE - $(date)" 2>/dev/null || echo -e "${YELLOW}  No changes${NC}"
    git push origin main 2>/dev/null && echo -e "${GREEN}Pushed${NC}" || echo -e "${YELLOW}Push skipped${NC}"

    echo ""
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}CYCLE $CYCLE COMPLETE${NC}"
    echo -e "${CYAN}Cooling down 5 minutes...${NC}"
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    echo ""

    sleep 300
done
