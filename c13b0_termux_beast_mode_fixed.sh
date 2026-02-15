#!/usr/bin/env bash
# 🔥 C13B0 TERMUX BEAST MODE (FIXED)

set -euo pipefail

USER="pewpi-infinity"
EMAIL="marvaseater@gmail.com"
START_TIME=$(date +%s)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Use Termux temp directory
TEMP_DIR="$HOME/.c13b0_temp"
mkdir -p "$TEMP_DIR"

termux-wake-lock 2>/dev/null || true

echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo -e "${CYAN}🔥 C13B0 TERMUX BEAST MODE ACTIVATED${NC}"
echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo ""

# Stats
show_stats() {
    local elapsed=$(($(date +%s) - START_TIME))
    local hours=$((elapsed / 3600))
    local mins=$(( (elapsed % 3600) / 60 ))
    local secs=$((elapsed % 60))
    
    echo -e "${BLUE}⏱️  Runtime: ${hours}h ${mins}m ${secs}s${NC}"
    echo -e "${GREEN}📊 Repos scanned: ${REPOS_SCANNED:-0}${NC}"
    echo -e "${GREEN}🌱 Repos seeded: ${REPOS_SEEDED:-0}${NC}"
    echo -e "${GREEN}📚 Words collected: ${WORDS_COLLECTED:-0}${NC}"
    echo ""
}

cd ~/infinity-crown-index

echo -e "${YELLOW}📋 Installing dependencies${NC}"
pip install requests --break-system-packages -q 2>/dev/null || true
echo -e "${GREEN}✅ Ready${NC}"
echo ""

echo -e "${YELLOW}🔥 Starting scanner${NC}"
echo ""

python3 <<EOPY
import requests
import re
import json
import base64
import time
from collections import Counter
from datetime import datetime, timezone

USER = "${USER}"
TEMP_DIR = "${TEMP_DIR}"

print("\033[1;35m════════════════════════════════════════\033[0m")
print("\033[1;36m🧠 DICTIONARY BUILDER\033[0m")
print("\033[1;35m════════════════════════════════════════\033[0m\n")

all_words = Counter()
repo_data = {}
empty_repos = []
rich_repos = []

page = 1
total_repos = 0
total_words_scanned = 0

while page < 20:
    print(f"\033[0;33m📡 Page {page}...\033[0m", flush=True)
    
    try:
        r = requests.get(
            f"https://api.github.com/users/{USER}/repos?per_page=100&page={page}",
            timeout=10
        )
        
        if r.status_code != 200:
            print(f"\033[0;31m⚠️  Status {r.status_code}\033[0m")
            break
        
        repos = r.json()
        if not repos:
            break
        
        print(f"\033[0;36m   {len(repos)} repos\033[0m")
        
        for idx, repo in enumerate(repos, 1):
            total_repos += 1
            name = repo['name']
            
            print(f"\033[0;34m   [{idx}/{len(repos)}] {name}\033[0m", end=" ", flush=True)
            
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
                    
                    words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
                    all_words.update(words)
                    word_count = len(words)
                    total_words_scanned += word_count
                
                tree_r = requests.get(
                    f"https://api.github.com/repos/{USER}/{name}/git/trees/main?recursive=1",
                    timeout=5
                )
                
                if tree_r.status_code == 200:
                    tree = tree_r.json()
                    file_count = len(tree.get('tree', []))
                
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
                    "files": file_count
                }
                
            except Exception as e:
                print(f"\033[0;31m⚠️  {e}\033[0m")
            
            if total_repos % 10 == 0:
                time.sleep(1)
        
        page += 1
        time.sleep(2)
        
    except Exception as e:
        print(f"\033[0;31m❌ {e}\033[0m")
        break

print(f"\n\033[1;35m════════════════════════════════════════\033[0m")
print(f"\033[1;32m✅ SCAN COMPLETE\033[0m")
print(f"\033[1;35m════════════════════════════════════════\033[0m")
print(f"\033[0;36m📊 Total repos: {total_repos}\033[0m")
print(f"\033[0;36m📚 Unique words: {len(all_words)}\033[0m")
print(f"\033[0;31m❌ Empty repos: {len(empty_repos)}\033[0m")
print(f"\033[0;32m✅ Rich repos: {len(rich_repos)}\033[0m")
print(f"\033[1;35m════════════════════════════════════════\033[0m\n")

top_words = dict(all_words.most_common(500))

dictionary = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "total_repos": total_repos,
    "total_unique_words": len(all_words),
    "total_words_scanned": total_words_scanned,
    "top_words": top_words,
    "empty_repos": empty_repos,
    "rich_repos": sorted(rich_repos, key=lambda x: x['words'], reverse=True)
}

with open("api/dictionary.json", "w") as f:
    json.dump(dictionary, f, indent=2)

print("\033[0;32m✅ Dictionary saved\033[0m\n")

# Save stats
with open(f"{TEMP_DIR}/stats.txt", "w") as f:
    f.write(f"REPOS_SCANNED={total_repos}\n")
    f.write(f"WORDS_COLLECTED={len(all_words)}\n")
EOPY

# Load stats
source "$TEMP_DIR/stats.txt" 2>/dev/null || true

echo ""
show_stats
echo ""

# Commit
echo -e "${YELLOW}🚀 Committing${NC}"
git add api/dictionary.json
git commit -m "🔥 Beast scan - $(date)" || true

echo -e "${CYAN}Pushing...${NC}"
git push origin main || gh repo sync --force

echo ""
echo -e "${GREEN}✅ Complete!${NC}"
echo ""
show_stats
echo -e "${CYAN}📱 https://pewpi-infinity.github.io/infinity-crown-index/dashboard/${NC}"
echo ""

termux-wake-unlock 2>/dev/null || true
