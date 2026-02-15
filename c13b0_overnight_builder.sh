#!/usr/bin/env bash
# 🌙 C13B0 OVERNIGHT BUILDER
# Scans all repos, fills empty ones, builds real analytics
# ONE RUN = Wake up to a working system

set -euo pipefail

USER="pewpi-infinity"
DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

echo "🌙 C13B0 OVERNIGHT BUILDER STARTING"
echo "🕒 $DATE"
echo ""

cd ~/infinity-crown-index

# ================================
# PHASE 1: DICTIONARY BUILDER
# Extracts ALL words from ALL repos
# ================================
cat > .github/workflows/dictionary-builder.yml <<'EODICT'
name: 📚 Dictionary Builder (Continuous)

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes (never stops)
  workflow_dispatch:

jobs:
  build-dictionary:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Scan All Repos for Words
        run: |
          python3 <<'EOPY'
import requests
import re
import json
from collections import Counter
from datetime import datetime

USER = "pewpi-infinity"

print("📚 Building Infinity Dictionary...")

all_words = Counter()
repo_data = {}
empty_repos = []
rich_repos = []

page = 1
total_repos = 0

while page < 15:
    print(f"  Scanning page {page}...")
    r = requests.get(f"https://api.github.com/users/{USER}/repos?per_page=100&page={page}")
    
    if r.status_code != 200:
        break
    
    repos = r.json()
    if not repos:
        break
    
    for repo in repos:
        total_repos += 1
        name = repo['name']
        
        # Get README
        readme_url = f"https://api.github.com/repos/{USER}/{name}/readme"
        readme_r = requests.get(readme_url)
        
        word_count = 0
        file_count = 0
        
        if readme_r.status_code == 200:
            import base64
            content = base64.b64decode(readme_r.json()['content']).decode('utf-8', errors='ignore')
            
            # Extract words
            words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
            all_words.update(words)
            word_count = len(words)
        
        # Count files
        tree_url = f"https://api.github.com/repos/{USER}/{name}/git/trees/main?recursive=1"
        tree_r = requests.get(tree_url)
        if tree_r.status_code == 200:
            tree = tree_r.json()
            file_count = len(tree.get('tree', []))
        
        # Categorize
        repo_info = {
            "name": name,
            "url": repo['html_url'],
            "words": word_count,
            "files": file_count,
            "size": repo.get('size', 0)
        }
        
        repo_data[name] = repo_info
        
        if word_count < 10 and file_count < 3:
            empty_repos.append(repo_info)
        elif word_count > 100 or file_count > 10:
            rich_repos.append(repo_info)
        
        # Rate limit safety
        if total_repos % 50 == 0:
            import time
            time.sleep(2)
    
    page += 1

# Top words (Infinity realm vocabulary)
top_words = dict(all_words.most_common(500))

# Save dictionary
dictionary = {
    "timestamp": datetime.utcnow().isoformat(),
    "total_repos": total_repos,
    "total_unique_words": len(all_words),
    "top_words": top_words,
    "empty_repos": empty_repos[:100],
    "rich_repos": sorted(rich_repos, key=lambda x: x['words'], reverse=True)[:50]
}

with open("api/dictionary.json", "w") as f:
    json.dump(dictionary, f, indent=2)

print(f"✅ Dictionary built: {len(all_words)} unique words across {total_repos} repos")
print(f"📊 Empty repos: {len(empty_repos)} | Rich repos: {len(rich_repos)}")
EOPY
      
      - name: Commit Dictionary
        run: |
          git config user.name "Dictionary Bot"
          git config user.email "dict@infinity.ai"
          git add api/dictionary.json
          git commit -m "📚 Dictionary update - ${{ github.run_number }}" || true
          git push || true
EODICT

# ================================
# PHASE 2: REPO SEEDER
# Seeds empty repos with content
# ================================
cat > .github/workflows/repo-seeder.yml <<'EOSEED'
name: 🌱 Repo Seeder (Continuous)

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  seed-repos:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Seed Empty Repos
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python3 <<'EOPY'
import requests
import json
import base64
from datetime import datetime

import os, sys, time

USER = "pewpi-infinity"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not TOKEN:
    print("No GITHUB_TOKEN. Exiting.")
    sys.exit(1)

HEADERS = {"Authorization": f"token {TOKEN}"}

try:
    with open("api/dictionary.json") as f:
        data = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    print("No dictionary.json. Run dictionary-builder first.")
    sys.exit(0)

empty_repos = data.get("empty_repos", [])[:10]
seeded = 0

for repo_info in empty_repos:
    repo_name = repo_info['name']
    print(f"Seeding {repo_name}...", end=" ", flush=True)

    readme_content = f"""# {repo_name}

**Part of the Infinity Realm**

## Status
- Seeded: {datetime.utcnow().isoformat()}
- Connected: Part of 1011+ repo ecosystem

## Actions
Click emoji buttons in Crown Index to build this repo.
"""

    url = f"https://api.github.com/repos/{USER}/{repo_name}/contents/README.md"
    content_b64 = base64.b64encode(readme_content.encode()).decode()

    payload = {
        "message": "Seeded by C13B0 Overnight Builder",
        "content": content_b64
    }

    try:
        check = requests.get(url, headers=HEADERS, timeout=10)
        if check.status_code == 200:
            payload["sha"] = check.json()["sha"]

        result = requests.put(url, json=payload, headers=HEADERS, timeout=10)
        if result.status_code in [200, 201]:
            seeded += 1
            print("OK")
        elif result.status_code == 401:
            print("AUTH FAILED")
            break
        elif result.status_code == 403:
            wait = int(result.headers.get("Retry-After", 60))
            print(f"Rate limited {wait}s")
            time.sleep(wait)
        else:
            print(f"HTTP {result.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"ERR: {e}")

    time.sleep(1)

print(f"Seeded {seeded}/{len(empty_repos)} repos")
EOPY
EOSEED

# ================================
# PHASE 3: ANALYTICS ENGINE
# Builds real charts and metrics
# ================================
cat > .github/workflows/analytics-engine.yml <<'EOANALYTICS'
name: 📊 Analytics Engine

on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
  workflow_dispatch:

jobs:
  build-analytics:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Generate Analytics
        run: |
          python3 <<'EOPY'
import json
from datetime import datetime
from collections import Counter

# Load dictionary
with open("api/dictionary.json") as f:
    data = json.load(f)

# Load existing token data
with open("api/tokens.json") as f:
    tokens = json.load(f)

# Build analytics
analytics = {
    "timestamp": datetime.utcnow().isoformat(),
    "overview": {
        "total_repos": data["total_repos"],
        "total_words": data["total_unique_words"],
        "empty_repos": len(data["empty_repos"]),
        "rich_repos": len(data["rich_repos"])
    },
    "categories": {
        cat: len(repos) for cat, repos in tokens.items()
    },
    "top_content_repos": data["rich_repos"][:20],
    "seeding_targets": data["empty_repos"][:20],
    "word_cloud": dict(list(data["top_words"].items())[:100]),
    "charts": {
        "category_distribution": {
            cat: len(repos) for cat, repos in tokens.items()
        },
        "content_density": {
            "empty": len(data["empty_repos"]),
            "sparse": len([r for r in data.get("rich_repos", []) if r["words"] < 500]),
            "rich": len([r for r in data.get("rich_repos", []) if r["words"] >= 500])
        }
    },
    "recommendations": []
}

# Generate recommendations
if len(data["empty_repos"]) > 50:
    analytics["recommendations"].append({
        "type": "seeding",
        "urgency": "high",
        "message": f"⚠️ {len(data['empty_repos'])} repos need content - seeder running"
    })

if len(data["rich_repos"]) > 100:
    analytics["recommendations"].append({
        "type": "value",
        "urgency": "medium",
        "message": f"💰 {len(data['rich_repos'])} repos with substantial content - ready for value extraction"
    })

with open("api/analytics.json", "w") as f:
    json.dump(analytics, f, indent=2)

print("📊 Analytics generated")
EOPY
      
      - name: Commit Analytics
        run: |
          git config user.name "Analytics Bot"
          git config user.email "analytics@infinity.ai"
          git add api/analytics.json
          git commit -m "📊 Analytics update" || true
          git push || true
EOANALYTICS

# ================================
# PHASE 4: UPGRADED DASHBOARD
# Real analytics, charts, actionable data
# ================================
cat > dashboard/index.html <<'EODASH'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👑 Infinity Crown Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            color: #e0e7ff;
            font-family: 'Courier New', monospace;
            padding: 2rem;
        }
        h1 { text-align: center; margin-bottom: 2rem; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: rgba(46, 42, 94, 0.5);
            padding: 1.5rem;
            border-radius: 15px;
            border: 2px solid #4c4580;
        }
        .stat-value { font-size: 2rem; font-weight: bold; color: #10b981; }
        .stat-label { font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem; }
        .charts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .chart-container {
            background: rgba(46, 42, 94, 0.5);
            padding: 1.5rem;
            border-radius: 15px;
            border: 2px solid #4c4580;
        }
        .recommendations {
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .rec-item {
            padding: 0.75rem;
            margin: 0.5rem 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        .loading { text-align: center; padding: 2rem; font-size: 1.5rem; }
    </style>
</head>
<body>
    <h1>👑 Infinity Crown Dashboard - LIVE ANALYTICS</h1>
    
    <div id="loading" class="loading">🔄 Loading analytics...</div>
    
    <div id="content" style="display:none;">
        <div class="stats" id="stats"></div>
        
        <div id="recommendations"></div>
        
        <div class="charts">
            <div class="chart-container">
                <h3>Category Distribution</h3>
                <canvas id="categoryChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Content Density</h3>
                <canvas id="densityChart"></canvas>
            </div>
        </div>
        
        <div style="text-align:center;margin-top:2rem;">
            <a href="../index.html" style="color:#6366f1;text-decoration:none;font-size:1.2rem;">
                👑 Return to Crown Index
            </a>
        </div>
    </div>
    
    <script>
        async function loadAnalytics() {
            try {
                const res = await fetch('../api/analytics.json');
                const data = await res.json();
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
                
                // Stats cards
                const statsHtml = `
                    <div class="stat-card">
                        <div class="stat-value">${data.overview.total_repos}</div>
                        <div class="stat-label">Total Repos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.overview.total_words.toLocaleString()}</div>
                        <div class="stat-label">Total Words</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color:#f59e0b;">${data.overview.empty_repos}</div>
                        <div class="stat-label">Empty Repos (Seeding...)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color:#10b981;">${data.overview.rich_repos}</div>
                        <div class="stat-label">Rich Repos (Ready)</div>
                    </div>
                `;
                document.getElementById('stats').innerHTML = statsHtml;
                
                // Recommendations
                if (data.recommendations.length > 0) {
                    const recHtml = '<h3>⚠️ System Recommendations</h3>' +
                        data.recommendations.map(rec => `
                            <div class="rec-item">
                                <strong>${rec.type.toUpperCase()}</strong>: ${rec.message}
                            </div>
                        `).join('');
                    document.getElementById('recommendations').innerHTML = `
                        <div class="recommendations">${recHtml}</div>
                    `;
                }
                
                // Category Chart
                const catCtx = document.getElementById('categoryChart').getContext('2d');
                new Chart(catCtx, {
                    type: 'pie',
                    data: {
                        labels: Object.keys(data.categories),
                        datasets: [{
                            data: Object.values(data.categories),
                            backgroundColor: [
                                '#10b981', '#f59e0b', '#3b82f6', 
                                '#ec4899', '#ef4444', '#eab308'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { labels: { color: '#e0e7ff' } }
                        }
                    }
                });
                
                // Density Chart
                const densCtx = document.getElementById('densityChart').getContext('2d');
                new Chart(densCtx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(data.charts.content_density),
                        datasets: [{
                            label: 'Repos',
                            data: Object.values(data.charts.content_density),
                            backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { labels: { color: '#e0e7ff' } }
                        },
                        scales: {
                            y: { ticks: { color: '#e0e7ff' } },
                            x: { ticks: { color: '#e0e7ff' } }
                        }
                    }
                });
                
            } catch (error) {
                document.getElementById('loading').textContent = 
                    '⚠️ Waiting for first analytics run... (refresh in 2 hours)';
            }
        }
        
        loadAnalytics();
        setInterval(loadAnalytics, 300000); // Refresh every 5 minutes
    </script>
</body>
</html>
EODASH

# ================================
# COMMIT EVERYTHING
# ================================
git add -A
git commit -m "🌙 Overnight Builder - Complete System

- Dictionary builder (every 30 min)
- Repo seeder (hourly)
- Analytics engine (every 2 hours)
- Live dashboard with charts

Never stops building. Wake up to progress. $DATE"

git push origin main

echo ""
echo "✅ OVERNIGHT BUILDER DEPLOYED!"
echo ""
echo "🌙 System Status:"
echo "  📚 Dictionary builder: Running every 30 minutes"
echo "  🌱 Repo seeder: Running hourly"
echo "  📊 Analytics engine: Running every 2 hours"
echo ""
echo "📱 Dashboard: https://pewpi-infinity.github.io/infinity-crown-index/dashboard/"
echo ""
echo "💤 GO TO SLEEP - Wake up to:"
echo "  - Full dictionary of all your words"
echo "  - Empty repos seeded with content"
echo "  - Real analytics and charts"
echo "  - Actionable recommendations"
echo ""
echo "👑 Never stops moving. Forever."
