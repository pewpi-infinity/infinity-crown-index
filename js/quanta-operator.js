/* quanta-operator.js — Quantum State Navigator v1.0
 * Searches for State Intersections, not just keywords.
 * Forward Search: Predicts next quanta yield
 * Reverse Search: Traces quanta origin (Second Dimension)
 * FCL Tracking: Maps data along curvature of x and y
 * freq_hz: 432
 */
(function(){
  "use strict";
  var USER = "pewpi-infinity";
  var BASE = "https://" + USER + ".github.io";
  var API_BASE = BASE + "/infinity-crown-index/api";

  // ══ QUANTA MATRIX ══
  var QUANTA = {
    water:      { flow: "fluid-dynamics",    state: "entropy-low",  icon: "\u{1F30A}", color: "#3b82f6" },
    earth:      { flow: "solid-structure",   state: "fcl-max",      icon: "\u{1F30D}", color: "#22c55e" },
    racing:     { flow: "high-velocity",     state: "propulsion",   icon: "\u26A1",    color: "#eab308" },
    traffic:    { flow: "network-routing",   state: "union",        icon: "\u{1F310}", color: "#8b5cf6" },
    coins:      { flow: "probability-yield", state: "currency",     icon: "\u{1F4B0}", color: "#f59e0b" },
    propulsion: { flow: "acceleration",      state: "thrust",       icon: "\u{1F680}", color: "#ef4444" },
    union:      { flow: "bridge-merge",      state: "convergence",  icon: "\u{1F531}", color: "#06b6d4" }
  };

  // ══ QUANTA ALPHABET ══
  // |Q| = Quantum Ion (single unit of high-value data)
  // |=>| = Propulsion (move data between repo-machines)
  // |O| = Entropy State (hidden in second dimension, awaiting trigger)
  var ALPHABET = {
    "Q":  { symbol: "|Q|",  meaning: "Quantum Ion — single unit of high-value data" },
    "=>": { symbol: "|=>|", meaning: "Propulsion — move data between repo-machines" },
    "O":  { symbol: "|\u00D8|", meaning: "Entropy State — hidden, awaiting trigger" },
    "Au": { symbol: "|Au|", meaning: "Gold Standard — purest current value (#FFD700)" },
    "Pt": { symbol: "|Pt|", meaning: "Platinum Legacy — archived foundation" },
    "FCL":{ symbol: "|FCL|",meaning: "Finite Curvature Limit — distance = state shift" }
  };

  // ══ GOLDEN RATIO SEARCH ══
  var PHI = 1.618033988749895;

  function quantaSearch(target, dimension) {
    dimension = dimension || "fcl";
    var searchRadius = Math.PI * PHI;

    // Forward search: predict next quanta yield
    var forward = [];
    // Reverse search: trace quanta origin
    var reverse = [];

    // Check quanta matrix for state intersections
    Object.keys(QUANTA).forEach(function(key) {
      var q = QUANTA[key];
      // Calculate "distance" using golden ratio spiral
      var stateMatch = q.state.indexOf(target) >= 0 || q.flow.indexOf(target) >= 0;
      var dimMatch = dimension === "fcl" || q.state === dimension;

      if (stateMatch) {
        forward.push({ key: key, quanta: q, score: searchRadius * (dimMatch ? PHI : 1) });
      }
      // Reverse: everything NOT matching is in the "second dimension"
      if (!stateMatch) {
        reverse.push({ key: key, quanta: q, score: searchRadius / PHI });
      }
    });

    return { forward: forward, reverse: reverse, radius: searchRadius };
  }

  // ══ FCL TRACKER ══
  // Maps data along curvature — "traveling" is just shifting coordinates
  function fclTransfer(sourceRepo, targetRepo, fileData) {
    return {
      phase1: { action: "assign_probability_coin", source: sourceRepo, value: fileData.size || 1 },
      phase2: { action: "encode_entropy_state", state: "hidden", dimension: "second" },
      phase3: { action: "rematerialize", target: targetRepo, coordinates: "shifted" },
      note: "Data never traveled — curvature coordinates shifted"
    };
  }

  // ══ QUANTA SEARCH PANEL ══
  function buildQuantaPanel() {
    var existing = document.getElementById("quanta-panel-btn");
    if (existing) return;

    // Add quanta search button to quantum surface if it exists
    var surface = document.getElementById("quantum-surface");
    if (!surface) return;

    var btn = document.createElement("button");
    btn.id = "quanta-panel-btn";
    btn.innerHTML = "\u{1F52E}<span style='display:block;font-size:0.45rem;color:#FFD700'>Quanta</span>";
    btn.title = "Quanta Operator — State Intersection Search";
    btn.style.cssText = "background:#1a0a00;border:2px solid #FFD700;border-radius:10px;" +
      "padding:4px 8px;cursor:pointer;color:#FFD700;text-align:center;min-width:48px;" +
      "transition:all 0.2s;font-size:0.85rem;";
    btn.onmouseenter = function(){ btn.style.transform = "translateY(-2px)"; btn.style.boxShadow = "0 4px 12px rgba(255,215,0,.3)"; };
    btn.onmouseleave = function(){ btn.style.transform = "none"; btn.style.boxShadow = "none"; };
    btn.onclick = function(){ openQuantaSearch(); };

    // Insert before the collapse toggle
    var rows = surface.querySelectorAll("div");
    if (rows.length > 1) {
      rows[1].appendChild(btn);
    } else {
      surface.appendChild(btn);
    }
  }

  function openQuantaSearch() {
    var old = document.getElementById("quanta-search-panel");
    if (old) { old.remove(); document.getElementById("quanta-bg") && document.getElementById("quanta-bg").remove(); return; }

    var bg = document.createElement("div");
    bg.id = "quanta-bg";
    bg.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:10003;";

    var panel = document.createElement("div");
    panel.id = "quanta-search-panel";
    panel.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);" +
      "width:92%;max-width:480px;max-height:85vh;overflow-y:auto;" +
      "background:linear-gradient(135deg,#0a0800 0%,#1a0f00 100%);" +
      "border:2px solid #FFD700;border-radius:16px;padding:20px;z-index:10004;" +
      "box-shadow:0 0 40px rgba(255,215,0,.2);font-family:system-ui,sans-serif;color:#e8e8f0;";

    panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
      '<h3 style="color:#FFD700;font-size:1.1rem;margin:0">\u{1F52E} Quanta Operator</h3>' +
      '<button id="quanta-close" style="background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer">\u2715</button></div>' +

      '<div style="margin-bottom:12px">' +
      '<input id="quanta-input" placeholder="Enter quanta state to search..." style="width:100%;background:#0a0a1a;border:1px solid #FFD700;border-radius:8px;padding:10px;color:#FFD700;font-family:monospace;font-size:0.9rem;box-sizing:border-box"/>' +
      '</div>' +

      '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">' +
      Object.keys(QUANTA).map(function(key) {
        var q = QUANTA[key];
        return '<button class="q-tag" data-q="' + key + '" style="background:#161630;border:1px solid ' + q.color + ';border-radius:6px;padding:4px 10px;cursor:pointer;color:' + q.color + ';font-size:0.75rem">' + q.icon + ' ' + key + '</button>';
      }).join("") +
      '</div>' +

      '<div style="margin-bottom:12px">' +
      '<div style="font-size:0.7rem;color:#888;margin-bottom:4px">Quanta Alphabet:</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
      Object.keys(ALPHABET).map(function(key) {
        var a = ALPHABET[key];
        return '<span title="' + a.meaning + '" style="background:#0a0a1a;border:1px solid #333;border-radius:4px;padding:2px 8px;color:#FFD700;font-family:monospace;font-size:0.7rem;cursor:help">' + a.symbol + '</span>';
      }).join("") +
      '</div></div>' +

      '<div id="quanta-results" style="min-height:100px"></div>';

    document.body.appendChild(bg);
    document.body.appendChild(panel);

    // Wire up close
    document.getElementById("quanta-close").onclick = function(){ panel.remove(); bg.remove(); };
    bg.onclick = function(){ panel.remove(); bg.remove(); };

    // Wire up search
    document.getElementById("quanta-input").onkeyup = function(e) {
      if (e.key === "Enter") runQuantaSearch(this.value);
    };

    // Wire up quanta tags
    panel.querySelectorAll(".q-tag").forEach(function(tag) {
      tag.onclick = function() {
        document.getElementById("quanta-input").value = this.dataset.q;
        runQuantaSearch(this.dataset.q);
      };
    });
  }

  function runQuantaSearch(query) {
    var results = quantaSearch(query);
    var el = document.getElementById("quanta-results");
    if (!el) return;

    var html = '<div style="border-top:1px solid #333;padding-top:12px">';
    html += '<div style="color:#FFD700;font-size:0.8rem;margin-bottom:8px">\u{1F50D} Forward Search (next yield):</div>';

    if (results.forward.length > 0) {
      results.forward.forEach(function(r) {
        html += '<div style="background:#161630;border:1px solid ' + r.quanta.color + ';border-radius:8px;padding:8px;margin:4px 0">' +
          '<span style="color:' + r.quanta.color + '">' + r.quanta.icon + ' ' + r.key + '</span>' +
          '<span style="color:#888;font-size:0.7rem;margin-left:8px">' + r.quanta.flow + ' | ' + r.quanta.state + '</span>' +
          '<span style="float:right;color:#FFD700;font-size:0.7rem">' + r.score.toFixed(1) + 'pt</span></div>';
      });
    } else {
      html += '<div style="color:#666;font-size:0.8rem;padding:8px">No forward matches — data in entropy state</div>';
    }

    html += '<div style="color:#a855f7;font-size:0.8rem;margin:12px 0 8px">\u{1F52E} Reverse Search (second dimension):</div>';
    results.reverse.forEach(function(r) {
      html += '<div style="background:#0d0d2a;border:1px solid #1a1a3a;border-radius:8px;padding:8px;margin:4px 0;opacity:0.7">' +
        '<span style="color:#666">' + r.quanta.icon + ' ' + r.key + '</span>' +
        '<span style="color:#555;font-size:0.7rem;margin-left:8px">' + r.quanta.flow + '</span>' +
        '<span style="float:right;color:#555;font-size:0.7rem">|\u00D8| hidden</span></div>';
    });

    html += '<div style="margin-top:12px;padding:8px;background:#0a0800;border:1px solid #FFD700;border-radius:8px;font-size:0.7rem;color:#FFD700">' +
      '|FCL| Search Radius: ' + results.radius.toFixed(4) + ' | \u03C6 = ' + PHI.toFixed(6) + ' | Curvature: shifted</div>';
    html += '</div>';

    el.innerHTML = html;
  }

  // ══ GOLD STANDARD BADGE ══
  function addGoldBadge() {
    var path = location.pathname.split("/").filter(Boolean);
    var repo = path[0] || "unknown";
    var SKIP = ["infinity-crown-index","infinity-master-hub","repo-dashboard-hub"];
    if (SKIP.indexOf(repo) >= 0) return;

    var badge = document.createElement("div");
    badge.style.cssText = "position:fixed;top:8px;right:8px;z-index:9999;" +
      "background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;" +
      "padding:3px 10px;border-radius:12px;font-size:0.6rem;font-weight:700;" +
      "font-family:system-ui,sans-serif;box-shadow:0 2px 8px rgba(255,215,0,.3);" +
      "cursor:pointer;";
    badge.textContent = "\u{1F451} GOLD";
    badge.title = "Gold Standard — C13B0\u2077 Distribution Active";
    badge.onclick = function() {
      window.open(BASE + "/infinity-crown-index/", "_self");
    };
    document.body.appendChild(badge);
  }

  // ══ INIT ══
  function init() {
    addGoldBadge();
    setTimeout(buildQuantaPanel, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for CLI usage
  if (typeof window !== "undefined") {
    window.QuantaOperator = { search: quantaSearch, transfer: fclTransfer, QUANTA: QUANTA, ALPHABET: ALPHABET };
  }
})();
