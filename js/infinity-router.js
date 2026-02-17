/* infinity-router.js — Unified Repo Router v1.0
 * Auto-discovers repo position in the machine network
 * Provides search, navigation, and cross-linking
 * freq_hz: 432
 */
(function(){
  "use strict";
  const USER = "pewpi-infinity";
  const BASE = `https://${USER}.github.io`;
  const API_BASE = `${BASE}/infinity-crown-index/api`;

  // Detect current repo
  const path = location.pathname.split("/").filter(Boolean);
  const REPO = path[0] || "unknown";

  // Hub repos
  const HUBS = {
    "infinity-crown-index": {icon:"👑",label:"Crown"},
    "infinity-master-hub": {icon:"🌐",label:"Hub"},
    "infinity-spark-market": {icon:"💰",label:"Market"},
    "infinity-tools": {icon:"🔧",label:"Tools"},
    "mongoose.os": {icon:"🧲",label:"MOS"},
    "smug_look": {icon:"🧱",label:"Octave"},
    "MARIO-TOKENS": {icon:"🎮",label:"Mario"},
    "DJVertigo-token": {icon:"🦾",label:"DJV"}
  };

  // Skip on hub pages that have their own navigation
  const SKIP_REPOS = ["infinity-crown-index","infinity-master-hub"];

  // Build router UI
  function init() {
    // Don't double-init or init on hub pages
    if (document.getElementById("infinity-router")) return;
    if (SKIP_REPOS.includes(REPO)) return;

    const nav = document.createElement("div");
    nav.id = "infinity-router";
    nav.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:10001;
      background:linear-gradient(90deg,#0a0a1a,#1a0a2e,#0a0a1a);
      border-bottom:1px solid #6c63ff40;padding:4px 8px;
      display:flex;align-items:center;justify-content:space-between;
      font-family:system-ui,sans-serif;font-size:0.7rem;
    `;

    // Left: current repo name
    const left = document.createElement("div");
    left.style.cssText = "color:#6c63ff;font-weight:700;";
    left.textContent = REPO;

    // Center: hub quick links
    const center = document.createElement("div");
    center.style.cssText = "display:flex;gap:3px;";
    for (const [name, info] of Object.entries(HUBS)) {
      if (name === REPO) continue;
      const a = document.createElement("a");
      a.href = `${BASE}/${name}/`;
      a.textContent = info.icon;
      a.title = info.label;
      a.style.cssText = "text-decoration:none;font-size:0.85rem;padding:2px;border-radius:4px;";
      a.onmouseenter = () => a.style.background = "#6c63ff30";
      a.onmouseleave = () => a.style.background = "none";
      center.appendChild(a);
    }

    // Right: search + machine nav
    const right = document.createElement("div");
    right.style.cssText = "display:flex;gap:4px;align-items:center;";

    // Prev/Next buttons (loaded from routing map)
    const prevBtn = document.createElement("a");
    prevBtn.textContent = "◀";
    prevBtn.style.cssText = "color:#888;cursor:pointer;padding:2px 6px;border:1px solid #333;border-radius:4px;text-decoration:none;font-size:0.7rem;";
    const nextBtn = document.createElement("a");
    nextBtn.textContent = "▶";
    nextBtn.style.cssText = "color:#888;cursor:pointer;padding:2px 6px;border:1px solid #333;border-radius:4px;text-decoration:none;font-size:0.7rem;";

    // Search button
    const searchBtn = document.createElement("button");
    searchBtn.textContent = "🔍";
    searchBtn.style.cssText = "background:none;border:1px solid #333;border-radius:4px;color:#888;cursor:pointer;padding:2px 6px;font-size:0.7rem;";
    searchBtn.onclick = showSearch;

    right.appendChild(prevBtn);
    right.appendChild(nextBtn);
    right.appendChild(searchBtn);

    nav.appendChild(left);
    nav.appendChild(center);
    nav.appendChild(right);
    document.body.appendChild(nav);
    document.body.style.paddingTop = "28px";

    // Load routing map for prev/next
    fetch(`${API_BASE}/machine_routing.json`)
      .then(r => r.json())
      .then(routing => {
        if (routing[REPO]) {
          prevBtn.href = `${BASE}/${routing[REPO].prev}/`;
          prevBtn.style.color = "#6c63ff";
          nextBtn.href = `${BASE}/${routing[REPO].next}/`;
          nextBtn.style.color = "#6c63ff";
        }
      })
      .catch(() => {});
  }

  // Search panel
  function showSearch() {
    const old = document.getElementById("router-search");
    if (old) { old.remove(); return; }

    const panel = document.createElement("div");
    panel.id = "router-search";
    panel.style.cssText = `
      position:fixed;top:28px;right:0;width:320px;max-height:80vh;
      background:#0a0a1a;border:1px solid #6c63ff;border-radius:0 0 0 12px;
      z-index:10002;padding:12px;overflow-y:auto;
      font-family:system-ui,sans-serif;
    `;
    panel.innerHTML = `
      <input id="router-q" placeholder="Search repos..." style="width:100%;background:#161640;border:1px solid #333;border-radius:8px;padding:8px;color:#e8e8f0;outline:none;font-size:0.8rem;margin-bottom:8px"/>
      <div id="router-results" style="font-size:0.75rem"></div>
    `;
    document.body.appendChild(panel);

    const input = document.getElementById("router-q");
    const results = document.getElementById("router-results");
    input.focus();

    // Load machine list
    fetch(`${API_BASE}/machines.json`)
      .then(r => r.json())
      .then(data => {
        const machines = data.machines || [];
        input.oninput = () => {
          const q = input.value.toLowerCase();
          if (q.length < 2) { results.innerHTML = ""; return; }
          const matches = machines.filter(m => m.name.includes(q) || m.category.includes(q)).slice(0, 20);
          results.innerHTML = matches.map(m =>
            `<a href="${m.url}" style="display:block;padding:6px;color:#e8e8f0;text-decoration:none;border-bottom:1px solid #222">${m.name}</a>`
          ).join("");
        };
      })
      .catch(() => {
        results.innerHTML = '<span style="color:#888">Search unavailable</span>';
      });
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
