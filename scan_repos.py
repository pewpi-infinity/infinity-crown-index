import requests
import json

print('📡 Scanning repos...')

repos = []
for page in range(1, 15):
    url = f'https://api.github.com/users/pewpi-infinity/repos?per_page=100&page={page}'
    r = requests.get(url)
    if r.status_code != 200:
        break
    batch = r.json()
    if not batch:
        break
    repos.extend(batch)

print(f'✅ Found {len(repos)} repos')

categories = {
    'engineer': [],
    'ceo': [],
    'import': [],
    'investigate': [],
    'routes': [],
    'data': []
}

for repo in repos:
    name = repo['name'].lower()
    
    if 'hydrogen' in name or 'research' in name or 'paper' in name:
        cat = 'engineer'
    elif 'token' in name or 'wallet' in name or 'spark' in name:
        cat = 'ceo'
    elif 'scrape' in name or 'fetch' in name or 'import' in name:
        cat = 'import'
    elif 'brain' in name or 'mongoose' in name:
        cat = 'investigate'
    elif 'route' in name or 'path' in name or 'link' in name:
        cat = 'routes'
    else:
        cat = 'data'
    
    categories[cat].append({
        'name': repo['name'],
        'title': repo['name'].replace('-', ' ').title(),
        'topics': [cat],
        'value': 50,
        'url': repo['html_url']
    })

with open('api/tokens.json', 'w') as f:
    json.dump(categories, f, indent=2)

print('✅ Created api/tokens.json')
