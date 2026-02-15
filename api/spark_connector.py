#!/usr/bin/env python3
"""Spark Connector - Links all infinity-spark-* repos into the Crown Index
Scans for spark repos, checks their status, builds a unified registry,
and generates the spark_network.json consumed by the Crown Index dashboard.

Run from infinity-crown-index/ directory.
"""

import requests
import json
import os
import time
import base64
from datetime import datetime, timezone

USER = "pewpi-infinity"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
HEADERS = {"Authorization": f"token {TOKEN}"} if TOKEN else {}
API_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)))

# Core spark repos (not timestamped duplicates)
SPARK_CORE = {
    "infinity-spark":          {"role": "main",       "icon": "star",    "tier": 1},
    "infinity-spark-core":     {"role": "core",       "icon": "cpu",     "tier": 1},
    "infinity-spark-engine":   {"role": "engine",     "icon": "zap",     "tier": 1},
    "infinity-spark-bridge":   {"role": "connector",  "icon": "link",    "tier": 1},
    "infinity-spark-relay":    {"role": "connector",  "icon": "relay",   "tier": 2},
    "infinity-spark-gateway":  {"role": "connector",  "icon": "gate",    "tier": 2},
    "infinity-spark-nexus":    {"role": "connector",  "icon": "nexus",   "tier": 2},
    "infinity-spark-hub":      {"role": "hub",        "icon": "hub",     "tier": 1},
    "infinity-spark-network":  {"role": "network",    "icon": "globe",   "tier": 2},
    "infinity-spark-terminal": {"role": "interface",  "icon": "terminal","tier": 1},
    "infinity-spark-console":  {"role": "interface",  "icon": "monitor", "tier": 2},
    "infinity-spark-market":   {"role": "commerce",   "icon": "shop",    "tier": 1},
    "infinity-spark-token":    {"role": "commerce",   "icon": "coin",    "tier": 2},
    "infinity-spark-mint":     {"role": "commerce",   "icon": "mint",    "tier": 2},
    "infinity-spark-ledger":   {"role": "commerce",   "icon": "ledger",  "tier": 2},
    "infinity-spark-vault":    {"role": "storage",    "icon": "lock",    "tier": 2},
    "infinity-spark-forge":    {"role": "builder",    "icon": "hammer",  "tier": 1},
    "infinity-spark-builder":  {"role": "builder",    "icon": "wrench",  "tier": 2},
    "infinity-spark-studio":   {"role": "builder",    "icon": "palette", "tier": 2},
    "infinity-spark-lab":      {"role": "research",   "icon": "flask",   "tier": 2},
    "infinity-spark-research": {"role": "research",   "icon": "book",    "tier": 2},
    "infinity-spark-scanner":  {"role": "analysis",   "icon": "radar",   "tier": 2},
    "infinity-spark-search":   {"role": "analysis",   "icon": "search",  "tier": 2},
    "infinity-spark-signal":   {"role": "comms",      "icon": "signal",  "tier": 2},
    "infinity-spark-stream":   {"role": "comms",      "icon": "stream",  "tier": 2},
    "infinity-spark-pulse":    {"role": "comms",      "icon": "pulse",   "tier": 2},
    "infinity-spark-portal":   {"role": "access",     "icon": "door",    "tier": 2},
    "infinity-spark-orbit":    {"role": "expansion",  "icon": "orbit",   "tier": 3},
    "infinity-spark-reactor":  {"role": "power",      "icon": "atom",    "tier": 2},
    "infinity-spark-grid":     {"role": "infra",      "icon": "grid",    "tier": 2},
    "infinity-spark-matrix":   {"role": "infra",      "icon": "matrix",  "tier": 2},
    "infinity-spark-lattice":  {"role": "infra",      "icon": "lattice", "tier": 3},
    "infinity-spark-archive":  {"role": "storage",    "icon": "archive", "tier": 3},
    "infinity-spark-vision":   {"role": "ai",         "icon": "eye",     "tier": 2},
    "infinity-spark-writer":   {"role": "content",    "icon": "pen",     "tier": 2},
    "infinity-spark-theater":  {"role": "media",      "icon": "theater", "tier": 3},
    "infinity-spark-tickets":  {"role": "commerce",   "icon": "ticket",  "tier": 3},
    "infinity-spark-tour":     {"role": "showcase",   "icon": "map",     "tier": 3},
}

# Connection map: which repos connect to which
CONNECTIONS = [
    ("infinity-spark-core", "infinity-spark-engine", "powers"),
    ("infinity-spark-engine", "infinity-spark-forge", "builds"),
    ("infinity-spark-bridge", "infinity-spark-relay", "routes"),
    ("infinity-spark-bridge", "infinity-spark-gateway", "routes"),
    ("infinity-spark-hub", "infinity-spark-nexus", "aggregates"),
    ("infinity-spark-market", "infinity-spark-token", "trades"),
    ("infinity-spark-market", "infinity-spark-mint", "creates"),
    ("infinity-spark-market", "infinity-spark-ledger", "records"),
    ("infinity-spark-terminal", "infinity-spark-console", "interfaces"),
    ("infinity-spark-vault", "infinity-spark-archive", "stores"),
    ("infinity-spark-scanner", "infinity-spark-search", "discovers"),
    ("infinity-spark-signal", "infinity-spark-stream", "transmits"),
    ("infinity-spark-signal", "infinity-spark-pulse", "monitors"),
    # Crown system connections
    ("infinity-spark-hub", "infinity-crown-index", "feeds"),
    ("infinity-spark-market", "infinity-crown-index", "lists"),
    ("infinity-spark-bridge", "infinity-master-hub", "links"),
    ("infinity-spark-scanner", "mongoose-brain-scanner", "scans"),
    ("infinity-spark-research", "infinity-research-engine", "researches"),
]


def check_repo_status(name):
    """Check if a repo exists and get basic info."""
    try:
        r = requests.get(
            f"https://api.github.com/repos/{USER}/{name}",
            headers=HEADERS, timeout=5
        )
        if r.status_code == 200:
            data = r.json()
            return {
                "exists": True,
                "has_pages": data.get("has_pages", False),
                "updated": data.get("updated_at", "")[:10],
                "size": data.get("size", 0),
                "language": data.get("language") or "None",
                "url": data["html_url"],
                "pages_url": f"https://{USER}.github.io/{name}/" if data.get("has_pages") else None,
            }
        return {"exists": False}
    except requests.exceptions.RequestException:
        return {"exists": False}


def build_network():
    """Build the full spark network registry."""
    print("Building Spark Network...")
    nodes = []
    checked = 0

    for name, meta in SPARK_CORE.items():
        print(f"  Checking {name}...", end=" ", flush=True)
        status = check_repo_status(name)
        checked += 1

        node = {
            "name": name,
            "role": meta["role"],
            "icon": meta["icon"],
            "tier": meta["tier"],
            **status,
        }
        nodes.append(node)

        if status["exists"]:
            print(f"OK (pages={status['has_pages']}, {status['language']})")
        else:
            print("NOT FOUND")

        # Rate limit courtesy
        if checked % 10 == 0:
            time.sleep(2)
        else:
            time.sleep(0.3)

    # Build edges
    edges = []
    node_names = {n["name"] for n in nodes if n["exists"]}
    for src, dst, rel in CONNECTIONS:
        if src in node_names or dst in node_names:
            edges.append({"from": src, "to": dst, "relationship": rel})

    # Stats
    active = [n for n in nodes if n["exists"]]
    with_pages = [n for n in active if n.get("has_pages")]
    roles = {}
    for n in active:
        roles.setdefault(n["role"], []).append(n["name"])

    network = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "total_defined": len(SPARK_CORE),
            "active": len(active),
            "with_pages": len(with_pages),
            "roles": {k: len(v) for k, v in roles.items()},
        },
        "nodes": nodes,
        "edges": edges,
        "roles": roles,
    }

    out_path = os.path.join(API_DIR, "spark_network.json")
    with open(out_path, "w") as f:
        json.dump(network, f, indent=2)

    print(f"\nSpark Network: {len(active)}/{len(SPARK_CORE)} active, {len(with_pages)} with pages")
    print(f"Saved: {out_path}")
    return network


if __name__ == "__main__":
    build_network()
