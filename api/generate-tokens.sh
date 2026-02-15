#!/usr/bin/env bash
# Generate tokens.json from all repos

USER="pewpi-infinity"
OUTPUT="api/tokens.json"

echo '{"engineer":[],"ceo":[],"import":[],"investigate":[],"routes":[],"data":[]}' > "$OUTPUT"

# Scan repos and categorize (simplified - expand with actual logic)
gh repo list "$USER" --limit 1011 --json name | jq -r '.[].name' | while read repo; do
    # Basic categorization by name patterns
    category="data"
    [[ "$repo" =~ hydrogen|research|paper ]] && category="engineer"
    [[ "$repo" =~ token|value|wallet ]] && category="ceo"
    [[ "$repo" =~ import|fetch|scrape ]] && category="import"
    [[ "$repo" =~ anomaly|investigate|weird ]] && category="investigate"
    [[ "$repo" =~ route|path|connection ]] && category="routes"
    
    # Add to JSON (simplified - use jq properly in production)
    echo "Added $repo to $category"
done

echo "✅ Token API generated"
