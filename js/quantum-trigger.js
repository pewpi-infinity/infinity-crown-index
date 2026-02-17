/* quantum-trigger.js — Quantum Intent Collapser v1.0
 * Color-coded intent vectors that turn clicks into forge commands.
 * Deployed to infinity-crown-index/js/ — loadable by any repo.
 * freq_hz: 432
 */
(function(){
  "use strict";
  var USER = "pewpi-infinity";
  var BASE = "https://" + USER + ".github.io";
  var API_BASE = BASE + "/infinity-crown-index/api";

  // Current repo detection
  var path = location.pathname.split("/").filter(Boolean);
  var REPO = path[0] || "unknown";

  // Skip on hub pages that have own UI
  var SKIP = ["infinity-crown-index","infinity-master-hub","repo-dashboard-hub"];
  if (SKIP.indexOf(REPO) >= 0) return;

  // ══ INTENT VECTORS ══
  var VECTORS = {
    red:    {emoji:"\u{1F534}",label:"Ascend",   color:"#ef4444",desc:"Find higher-value versions"},
    orange: {emoji:"\u{1F7E0}",label:"Evolve",   color:"#f97316",desc:"Branch to what's next"},
    yellow: {emoji:"\u{1F7E1}",label:"Extract",  color:"#eab308",desc:"Pull raw data points"},
    blue:   {emoji:"\u{1F535}",label:"Synthesize",color:"#3b82f6",desc:"Merge with personal data"},
    green:  {emoji:"\u{1F7E2}",label:"Engineer", color:"#22c55e",desc:"Build the repo structure"},
    purple: {emoji:"\u{1F7E3}",label:"Assimilate",color:"#a855f7",desc:"Map into transformer index"}
  };

  // ══ FORGE TOOLS ══
  var TOOLS = {
    search:  {emoji:"\u{1F579}",label:"Search",  color:"#6b7280",desc:"Probe for hidden variables"},
    magnet:  {emoji:"\u{1F9F2}",label:"Magnet",  color:"#ef4444",desc:"Lock and persist to hive"},
    auto:    {emoji:"\u{1F9BE}",label:"Autopilot",color:"#6b7280",desc:"Continuous until full-auto"},
    facet:   {emoji:"\u{1F48E}",label:"Facet",   color:"#06b6d4",desc:"Categorize and store"},
    platinum:{emoji:"\u{26AA}",label:"Platinum", color:"#e5e7eb",desc:"Clone-and-save to new repo"},
    network: {emoji:"\u{1F310}",label:"Network", color:"#8b5cf6",desc:"Link to Crown Index"},
    prime:   {emoji:"\u{2604}",label:"Prime Time",color:"#f59e0b",desc:"Generate content loop"}
  };

  // ══ BUILD QUANTUM SURFACE ══
  function build() {
    if (document.getElementById("quantum-surface")) return;

    var surface = document.createElement("div");
    surface.id = "quantum-surface";
    surface.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:10000;" +
      "background:linear-gradient(135deg,#0a0a1a 0%,#1a0a2e 50%,#0a1a1a 100%);" +
      "border-top:2px solid #6c63ff;padding:6px 8px;" +
      "font-family:system-ui,sans-serif;";

    // Intent vector row
    var row1 = document.createElement("div");
    row1.style.cssText = "display:flex;gap:3px;justify-content:center;margin-bottom:4px;";

    Object.keys(VECTORS).forEach(function(key) {
      var v = VECTORS[key];
      var btn = document.createElement("button");
      btn.innerHTML = v.emoji + '<span style="display:block;font-size:0.5rem;color:#888">' + v.label + '</span>';
      btn.title = v.desc;
      btn.style.cssText = "background:#161640;border:1px solid #2a2a5a;border-radius:10px;" +
        "padding:4px 8px;cursor:pointer;color:#e8e8f0;text-align:center;min-width:48px;" +
        "transition:all 0.2s;font-size:0.85rem;";
      btn.onmouseenter = function(){ btn.style.borderColor = v.color; btn.style.transform = "translateY(-2px)"; };
      btn.onmouseleave = function(){ btn.style.borderColor = "#2a2a5a"; btn.style.transform = "none"; };
      btn.onclick = function(){ triggerIntent(key); };
      row1.appendChild(btn);
    });

    // Tool row
    var row2 = document.createElement("div");
    row2.style.cssText = "display:flex;gap:3px;justify-content:center;";

    Object.keys(TOOLS).forEach(function(key) {
      var t = TOOLS[key];
      var btn = document.createElement("button");
      btn.innerHTML = t.emoji + '<span style="display:block;font-size:0.5rem;color:#666">' + t.label + '</span>';
      btn.title = t.desc;
      btn.style.cssText = "background:#0d0d2a;border:1px solid #1a1a3a;border-radius:8px;" +
        "padding:3px 6px;cursor:pointer;color:#a0a0b0;text-align:center;min-width:42px;" +
        "transition:all 0.2s;font-size:0.75rem;";
      btn.onmouseenter = function(){ btn.style.borderColor = t.color; };
      btn.onmouseleave = function(){ btn.style.borderColor = "#1a1a3a"; };
      btn.onclick = function(){ triggerTool(key); };
      row2.appendChild(btn);
    });

    // Collapse toggle
    var toggle = document.createElement("div");
    toggle.style.cssText = "position:absolute;top:-18px;right:8px;background:#161640;" +
      "border:1px solid #6c63ff;border-radius:6px 6px 0 0;padding:1px 10px;cursor:pointer;" +
      "color:#6c63ff;font-size:0.6rem;";
    toggle.textContent = "\u25BC Quantum";
    var collapsed = false;
    toggle.onclick = function() {
      collapsed = !collapsed;
      surface.style.height = collapsed ? "4px" : "auto";
      surface.style.overflow = collapsed ? "hidden" : "visible";
      toggle.textContent = collapsed ? "\u25B2 Quantum" : "\u25BC Quantum";
    };

    surface.appendChild(row1);
    surface.appendChild(row2);
    surface.appendChild(toggle);
    document.body.appendChild(surface);
    document.body.style.paddingBottom = "75px";
  }

  // ══ INTENT HANDLERS ══
  function triggerIntent(vector) {
    var v = VECTORS[vector];
    var panel = showPanel(v.emoji + " " + v.label + " — " + v.desc, v.color);

    switch(vector) {
      case "red": // Ascension — find higher-value
        panel.innerHTML += '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Scanning for higher-authority content related to <b style="color:#ffd700">' + REPO + '</b></p>' +
          '<a href="' + BASE + '/infinity-crown-index/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F451} <b>Crown Index</b> — Search all 980+ repos</a>' +
          '<a href="' + BASE + '/mongoose.os/research/index.html" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F4DA} <b>Research Book</b> — 5 chapters, 48 terms</a>' +
          '<a href="https://github.com/' + USER + '?tab=repositories&q=' + REPO.split("-")[0] + '" target="_blank" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F50E} <b>GitHub Search</b> — Related repos</a></div>';
        break;

      case "orange": // Evolution — what's next
        panel.innerHTML += '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Evolution branches from <b style="color:#ffd700">' + REPO + '</b></p></div>';
        // Load machine routing for next
        fetch(API_BASE + "/machine_routing.json").then(function(r){return r.json()}).then(function(routing) {
          if (routing[REPO]) {
            panel.innerHTML += '<a href="' + BASE + '/' + routing[REPO].next + '/" style="display:block;background:#161640;border:1px solid #f97316;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 12px;text-decoration:none">' +
              '\u27A1 <b>Next Machine:</b> ' + routing[REPO].next + '</a>' +
              '<a href="' + BASE + '/' + routing[REPO].prev + '/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 12px;text-decoration:none">' +
              '\u2B05 <b>Previous:</b> ' + routing[REPO].prev + '</a>';
          }
        }).catch(function(){});
        break;

      case "yellow": // Extract — pull data
        panel.innerHTML += '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Extracting data from <b style="color:#ffd700">' + REPO + '</b></p>' +
          '<div style="background:#0a0a1a;border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.75rem">' +
          '<div style="color:#eab308">Repo: ' + REPO + '</div>' +
          '<div style="color:#888">URL: ' + location.href + '</div>' +
          '<div style="color:#888">Title: ' + document.title + '</div>' +
          '<div style="color:#888">Meta tags: ' + document.querySelectorAll("meta").length + '</div>' +
          '<div style="color:#888">Links: ' + document.querySelectorAll("a").length + '</div>' +
          '<div style="color:#888">Scripts: ' + document.querySelectorAll("script").length + '</div>' +
          '<div style="color:#888">Images: ' + document.querySelectorAll("img").length + '</div>' +
          '</div></div>';
        break;

      case "blue": // Synthesize
        panel.innerHTML += '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Synthesis mode — merge context with <b style="color:#ffd700">' + REPO + '</b></p>' +
          '<textarea style="width:100%;background:#0a0a1a;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;min-height:100px;font-family:monospace;font-size:0.8rem" placeholder="Enter your notes to synthesize with this repo..."></textarea>' +
          '<button onclick="navigator.clipboard.writeText(document.querySelector(\'.synth-area\').value)" style="background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:6px 16px;cursor:pointer;margin-top:6px">Copy Synthesis</button></div>';
        break;

      case "green": // Engineer — build
        panel.innerHTML += '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Engineering tools for <b style="color:#ffd700">' + REPO + '</b></p>' +
          '<a href="https://github.com/' + USER + '/' + REPO + '" target="_blank" style="display:block;background:#161640;border:1px solid #22c55e;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F527} <b>GitHub Repo</b> — Edit source</a>' +
          '<a href="https://github.com/' + USER + '/' + REPO + '/settings" target="_blank" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u2699 <b>Settings</b> — Pages, actions</a>' +
          '<a href="' + BASE + '/infinity-tools/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F9BE} <b>Infinity Tools</b> — Upload, scripts</a></div>';
        break;

      case "purple": // Assimilate
        panel.innerHTML += '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Assimilating <b style="color:#ffd700">' + REPO + '</b> into transformer index</p>' +
          '<div style="background:#0a0a1a;border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.75rem;color:#a855f7">' +
          'Mapping: ' + REPO + ' \u2192 Crown Index \u2192 Machine Network \u2192 Research Vault</div>' +
          '<a href="' + BASE + '/infinity-crown-index/" style="display:block;background:#161640;border:1px solid #a855f7;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F451} <b>View in Crown Index</b></a>' +
          '<a href="' + BASE + '/mongoose.os/research/index.html" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;margin:6px 0;text-decoration:none">' +
          '\u{1F4DA} <b>Research Book</b> — Check if indexed</a></div>';
        break;
    }
  }

  function triggerTool(tool) {
    var t = TOOLS[tool];
    switch(tool) {
      case "search":
        var q = prompt("\u{1F50D} Quantum Search — enter query:");
        if (q) location.href = BASE + "/infinity-crown-index/?q=" + encodeURIComponent(q);
        break;
      case "magnet":
        showPanel(t.emoji + " Magnet — Persisting " + REPO + " to Hive Mind", t.color).innerHTML +=
          '<div style="margin:12px 0;color:#aaa;font-size:0.8rem">Data locked. View in <a href="' + BASE + '/infinity-crown-index/">Crown Index</a></div>';
        break;
      case "auto":
        showPanel(t.emoji + " Autopilot engaged for " + REPO, t.color).innerHTML +=
          '<div style="margin:12px 0;color:#aaa;font-size:0.8rem">Continuous analysis mode. Forge toolbar active.</div>';
        break;
      case "facet":
        showPanel(t.emoji + " Facet — Categorizing " + REPO, t.color).innerHTML +=
          '<div style="margin:12px 0;color:#aaa;font-size:0.8rem">Stored in Platinum Token layer.</div>';
        break;
      case "platinum":
        showPanel(t.emoji + " Platinum Token — Clone and Save", t.color).innerHTML +=
          '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Clone <b>' + REPO + '</b> as a new enhanced repo</p>' +
          '<input style="width:100%;background:#0a0a1a;border:1px solid #333;border-radius:8px;padding:8px;color:#e8e8f0;margin:6px 0" placeholder="New repo name..." id="pt-name"/>' +
          '<button onclick="alert('Platinum clone: ' + document.getElementById(\'pt-name\').value)" style="background:#e5e7eb;color:#000;border:none;border-radius:6px;padding:6px 16px;cursor:pointer;font-weight:700">Forge Clone</button></div>';
        break;
      case "network":
        location.href = BASE + "/infinity-crown-index/";
        break;
      case "prime":
        showPanel("\u{2604} Prime Time — Content Generator", t.color).innerHTML +=
          '<div style="margin:12px 0">' +
          '<p style="color:#aaa;font-size:0.8rem">Prime Time loop for <b style="color:#ffd700">' + REPO + '</b></p>' +
          '<div style="display:grid;gap:6px">' +
          '<a href="' + BASE + '/infinity-spark/" style="display:block;background:#161640;border:1px solid #f59e0b;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">\u26A1 Spark Pipeline</a>' +
          '<a href="' + BASE + '/mongoose.os/research/index.html" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">\u{1F4DA} Research Book</a>' +
          '<a href="' + BASE + '/infinity-tools/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">\u{1F527} Build Tools</a></div></div>';
        break;
    }
  }

  // ══ PANEL SYSTEM ══
  function showPanel(title, color) {
    var old = document.getElementById("quantum-panel");
    if (old) old.remove();
    var oldBg = document.getElementById("quantum-bg");
    if (oldBg) oldBg.remove();

    var bg = document.createElement("div");
    bg.id = "quantum-bg";
    bg.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;";
    bg.onclick = function(){ bg.remove(); panel.remove(); };

    var panel = document.createElement("div");
    panel.id = "quantum-panel";
    panel.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);" +
      "width:90%;max-width:450px;max-height:80vh;overflow-y:auto;" +
      "background:#0a0a1a;border:2px solid " + (color||"#6c63ff") + ";" +
      "border-radius:16px;padding:20px;z-index:10002;" +
      "box-shadow:0 20px 60px rgba(0,0,0,.8);font-family:system-ui,sans-serif;color:#e8e8f0;";
    panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '<h3 style="color:' + (color||"#ffd700") + ';font-size:1rem;margin:0">' + title + '</h3>' +
      '<button onclick="this.parentElement.parentElement.remove();document.getElementById(\'quantum-bg\').remove()" style="background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer">\u2715</button></div>';

    document.body.appendChild(bg);
    document.body.appendChild(panel);
    return panel;
  }

  // ══ INIT ══
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
