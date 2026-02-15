#!/usr/bin/env bash
# Generate tokens.json from all repos using gh + jq
set -euo pipefail

USER="pewpi-infinity"
OUTPUT="api/tokens.json"
TMPFILE=$(mktemp)

# Initialize categories
cat > "$TMPFILE" <<'EOF'
{"engineer":[],"ceo":[],"import":[],"investigate":[],"routes":[],"data":[]}
EOF

# Fetch all repos as JSON
REPOS=$(gh repo list "$USER" --limit 1100 --json name,url 2>/dev/null || echo "[]")

if [ "$REPOS" = "[]" ]; then
  echo "No repos found or gh not authenticated. Using empty output."
  cp "$TMPFILE" "$OUTPUT"
  rm "$TMPFILE"
  exit 0
fi

# Categorize each repo by name patterns and build the JSON
echo "$REPOS" | jq --raw-output '
  reduce .[] as $repo (
    {"engineer":[],"ceo":[],"import":[],"investigate":[],"routes":[],"data":[]};

    ($repo.name | ascii_downcase) as $name |
    (
      if ($name | test("hydrogen|research|paper|lab|science|experiment"))
        then "engineer"
      elif ($name | test("token|value|wallet|spark|mint|treasury|coin"))
        then "ceo"
      elif ($name | test("import|fetch|scrape|feed|ingest|crawl"))
        then "import"
      elif ($name | test("anomaly|investigate|brain|mongoose|detect|pattern"))
        then "investigate"
      elif ($name | test("route|path|connection|link|bridge|relay"))
        then "routes"
      else "data"
      end
    ) as $cat |

    .[$cat] += [{
      name: $repo.name,
      title: ($repo.name | gsub("-"; " ")),
      topics: [$cat],
      value: 50,
      url: $repo.url
    }]
  )
' > "$OUTPUT"

rm "$TMPFILE"

TOTAL=$(echo "$REPOS" | jq 'length')
echo "Categorized $TOTAL repos into $OUTPUT"
