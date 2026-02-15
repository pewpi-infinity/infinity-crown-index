#!/usr/bin/env bash
# 🔥 C13B0 TERMUX BEAST MODE
# Pushes as hard as possible while reporting everything

set -euo pipefail

USER="pewpi-infinity"
START_TIME=$(date +%s)

# Colors for terminal
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
    echo "Seeding will be skipped."
fi

# Keep screen awake
termux-wake-lock 2>/dev/null || true

echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo -e "${CYAN}🔥 C13B0 TERMUX BEAST MODE ACTIVATED${NC}"
echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo ""

# Real-time stats function
show_stats() {
    local elapsed=$(($(date +%s) - START_TIME))
    local hours=$((elapsed / 3600))
    local mins=$(( (elapsed % 3600) / 60 ))
    local secs=$((elapsed % 60))
    
    echo -e "${BLUE}⏱️  Runtime: ${hours}h ${mins}m ${secs}s${NC}"
    echo -e "${GREEN}📊 Repos scanned: $REPOS_SCANNED${NC}"
    echo -e "${GREEN}🌱 Repos seeded: $REPOS_SEEDED${NC}"
    echo -e "${GREEN}📚 Words collected: $WORDS_COLLECTED${NC}"
    echo -e "${GREEN}🚀 API calls made: $API_CALLS${NC}"
    echo ""
}

# Initialize counters
REPOS_SCANNED=0
REPOS_SEEDED=0
WORDS_COLLECTED=0
API_CALLS=0

cd ~/infinity-crown-index

echo -e "${YELLOW}📋 PHASE 1: Installing Python dependencies${NC}"
pip install requests --break-system-packages -q 2>/dev/null || true
echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# ================================
# BEAST MODE SCANNER
# ================================
echo -e "${YELLOW}🔥 PHASE 2: Starting BEAST MODE scanner${NC}"
echo ""

python3 <<'EOPY'
import requests
import re
import json
import base64
import time
from collections import Counter
from datetime import datetime

USER = "pewpi-infinity"

print("\033[1;35m════════════════════════════════════════\033[0m")
print("\033[1;36m🧠 DICTIONARY BUILDER STARTING\033[0m")
print("\033[1;35m════════════════════════════════════════\033[0m\n")

all_words = Counter()
repo_data = {}
empty_repos = []
rich_repos = []

page = 1
total_repos = 0
total_words_scanned = 0

while page < 20:  # Scan up to 2000 repos
    print(f"\033[0;33m📡 Fetching page {page}...\033[0m", flush=True)
    
    try:
        r = requests.get(
            f"https://api.github.com/users/{USER}/repos?per_page=100&page={page}",
            timeout=10
        )
        
        if r.status_code != 200:
            print(f"\033[0;31m⚠️  API returned {r.status_code}, stopping\033[0m")
            break
        
        repos = r.json()
        if not repos:
            print("\033[0;32m✅ No more repos to scan\033[0m")
            break
        
        print(f"\033[0;36m   Found {len(repos)} repos on this page\033[0m")
        
        for idx, repo in enumerate(repos, 1):
            total_repos += 1
            name = repo['name']
            
            print(f"\033[0;34m   [{idx}/{len(repos)}] {name}\033[0m", end=" ", flush=True)
            
            # Get README
            try:
                readme_r = requests.get(
                    f"https://api.github.com/repos/{USER}/{name}/readme",
                    timeout=5
                )
                
                word_count = 0
                file_count = 0
                
                if readme_r.status_code == 200:
                    content = base64.b64decode(
                        readme_r.json()['content']
                    ).decode('utf-8', errors='ignore')
                    
                    # Extract words
                    words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
                    all_words.update(words)
                    word_count = len(words)
                    total_words_scanned += word_count
                
                # Count files
                tree_r = requests.get(
                    f"https://api.github.com/repos/{USER}/{name}/git/trees/main?recursive=1",
                    timeout=5
                )
                
                if tree_r.status_code == 200:
                    tree = tree_r.json()
                    file_count = len(tree.get('tree', []))
                
                # Status color
                if word_count < 10 and file_count < 3:
                    status = "\033[0;31m❌ EMPTY\033[0m"
                    empty_repos.append({
                        "name": name,
                        "url": repo['html_url'],
                        "words": word_count,
                        "files": file_count
                    })
                elif word_count > 100 or file_count > 10:
                    status = "\033[0;32m✅ RICH\033[0m"
                    rich_repos.append({
                        "name": name,
                        "url": repo['html_url'],
                        "words": word_count,
                        "files": file_count
                    })
                else:
                    status = "\033[0;33m⚠️  SPARSE\033[0m"
                
                print(f"{status} ({word_count}w, {file_count}f)")
                
                repo_data[name] = {
                    "name": name,
                    "url": repo['html_url'],
                    "words": word_count,
                    "files": file_count,
                    "size": repo.get('size', 0)
                }
                
            except Exception as e:
                print(f"\033[0;31m⚠️  Error: {e}\033[0m")
            
            # Rate limit safety
            if total_repos % 10 == 0:
                print(f"\033[0;35m💤 Cooling down... (scanned {total_repos} repos)\033[0m")
                time.sleep(1)
        
        page += 1
        time.sleep(2)  # Page-level cooldown
        
    except Exception as e:
        print(f"\033[0;31m❌ Page {page} failed: {e}\033[0m")
        break

print(f"\n\033[1;35m════════════════════════════════════════\033[0m")
print(f"\033[1;32m✅ SCAN COMPLETE\033[0m")
print(f"\033[1;35m════════════════════════════════════════\033[0m")
print(f"\033[0;36m📊 Total repos: {total_repos}\033[0m")
print(f"\033[0;36m📚 Unique words: {len(all_words)}\033[0m")
print(f"\033[0;36m📝 Total words: {total_words_scanned}\033[0m")
print(f"\033[0;31m❌ Empty repos: {len(empty_repos)}\033[0m")
print(f"\033[0;32m✅ Rich repos: {len(rich_repos)}\033[0m")
print(f"\033[1;35m════════════════════════════════════════\033[0m\n")

# Save everything
top_words = dict(all_words.most_common(500))

dictionary = {
    "timestamp": datetime.utcnow().isoformat(),
    "total_repos": total_repos,
    "total_unique_words": len(all_words),
    "total_words_scanned": total_words_scanned,
    "top_words": top_words,
    "empty_repos": empty_repos,
    "rich_repos": sorted(rich_repos, key=lambda x: x['words'], reverse=True)
}

with open("api/dictionary.json", "w") as f:
    json.dump(dictionary, f, indent=2)

print("\033[0;32m✅ Dictionary saved to api/dictionary.json\033[0m\n")

# Export stats for bash
with open("/tmp/c13b0_stats.txt", "w") as f:
    f.write(f"REPOS_SCANNED={total_repos}\n")
    f.write(f"WORDS_COLLECTED={len(all_words)}\n")
    f.write(f"API_CALLS={total_repos * 3}\n")
EOPY

# Load stats from Python
source /tmp/c13b0_stats.txt 2>/dev/null || true

echo ""
show_stats
echo ""

# ================================
# REPO SEEDER
# ================================
echo -e "${YELLOW}🌱 PHASE 3: Seeding empty repos${NC}"
echo ""

python3 <<'EOPY'
import requests
import json
import base64
import os
from datetime import datetime
import time

USER = "pewpi-infinity"

print("\033[1;35m════════════════════════════════════════\033[0m")
print("\033[1;36m🌱 REPO SEEDER STARTING\033[0m")
print("\033[1;35m════════════════════════════════════════\033[0m\n")

# Load dictionary
with open("api/dictionary.json") as f:
    data = json.load(f)

empty_repos = data.get("empty_repos", [])[:20]  # Seed 20 at a time
seeded_count = 0

for idx, repo_info in enumerate(empty_repos, 1):
    repo_name = repo_info['name']
    
    print(f"\033[0;33m[{idx}/{len(empty_repos)}] {repo_name}\033[0m", end=" ", flush=True)
    
    try:
        # Create seed content
        readme_content = f"""# {repo_name}

**🌱 Seeded by C13B0 Overnight Builder**

Part of the Infinity Realm - 1011+ repo ecosystem

## Status
- Seeded: {datetime.utcnow().isoformat()}
- Growing: Content populating based on realm dictionary
- Connected: Part of semantic network

## Quick Actions
Use Crown Index emoji buttons to build this repo:
- 🤓 Add research content
- 🦾 Deploy automation
- ⚙️ Add dev tools
- 💰 Extract value
"""
        
        url = f"https://api.github.com/repos/{USER}/{repo_name}/contents/README.md"

        content_b64 = base64.b64encode(readme_content.encode()).decode()

        payload = {
            "message": "Seeded by C13B0",
            "content": content_b64
        }

        TOKEN = os.environ.get("GITHUB_TOKEN", "")
        if not TOKEN:
            print("\033[0;31mNo GITHUB_TOKEN - skipping seed\033[0m")
            break
        HEADERS = {"Authorization": f"token {TOKEN}"}

        check = requests.get(url, headers=HEADERS, timeout=5)
        if check.status_code == 200:
            payload["sha"] = check.json()["sha"]

        result = requests.put(url, json=payload, headers=HEADERS, timeout=10)

        if result.status_code in [200, 201]:
            print("\033[0;32mSeeded\033[0m")
            seeded_count += 1
        elif result.status_code == 401:
            print("\033[0;31mAUTH FAILED - check token\033[0m")
            break
        elif result.status_code == 403:
            wait = int(result.headers.get("Retry-After", 60))
            print(f"\033[0;31mRate limited {wait}s\033[0m")
            time.sleep(wait)
        else:
            print(f"\033[0;31mHTTP {result.status_code}\033[0m")

        time.sleep(1)

    except requests.exceptions.RequestException as e:
        print(f"\033[0;31mERR: {e}\033[0m")

print(f"\n\033[1;32m✅ Seeded {seeded_count}/{len(empty_repos)} repos\033[0m\n")

with open("/tmp/c13b0_seeded.txt", "w") as f:
    f.write(f"REPOS_SEEDED={seeded_count}\n")
EOPY

source /tmp/c13b0_seeded.txt 2>/dev/null || true

echo ""
show_stats
echo ""

# ================================
# COMMIT & PUSH
# ================================
echo -e "${YELLOW}🚀 PHASE 4: Committing and pushing${NC}"
echo ""

git add api/dictionary.json
git commit -m "🔥 Beast mode scan - $(date)" || true

echo -e "${CYAN}Pushing to GitHub...${NC}"
git push origin main || gh repo sync --force

echo ""
echo -e "${GREEN}✅ Push complete!${NC}"
echo ""

# ================================
# FINAL STATS
# ================================
echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo -e "${CYAN}🏁 BEAST MODE COMPLETE${NC}"
echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo ""
show_stats
echo -e "${CYAN}📱 Dashboard: https://pewpi-infinity.github.io/infinity-crown-index/dashboard/${NC}"
echo ""
echo -e "${GREEN}💤 Termux can sleep now - GitHub Actions will continue building${NC}"
echo -e "${PURPLE}════════════════════════════════════════${NC}"

# Release wake lock
termux-wake-unlock 2>/dev/null || true
