/* infinity-menu.js — Floating Hamburger Menu v1.0
 * Adds a non-intrusive menu button to every repo page.
 * Does NOT modify existing DOM — sits on top as fixed overlay.
 * Easy to add links: just edit the MENU_ITEMS array.
 * freq_hz: 432
 */
(function(){
  "use strict";
  var USER = "pewpi-infinity";
  var BASE = "https://" + USER + ".github.io";

  // Current repo detection
  var path = location.pathname.split("/").filter(Boolean);
  var REPO = path[0] || "unknown";

  // ══ MENU ITEMS — Add new links here ══
  var MENU_ITEMS = [
    { emoji: "\u{1F531}", label: "Buy DJVertigo Token", url: BASE + "/DJVertigo-token/", color: "#FFD700", highlight: true },
    { emoji: "\u{1F451}", label: "Crown Index",         url: BASE + "/infinity-crown-index/" },
    { emoji: "\u26A1",    label: "Spark Pipeline",      url: BASE + "/infinity-spark/" },
    { emoji: "\u{1F4DA}", label: "Research Book",       url: BASE + "/mongoose.os/research/index.html" },
    { emoji: "\u{1F527}", label: "Tools",               url: BASE + "/infinity-tools/" },
    { emoji: "\u{1F3AE}", label: "Smug Look",           url: BASE + "/smug_look/" },
    { emoji: "\u{1F3B5}", label: "MARIO Tokens",        url: BASE + "/MARIO-TOKENS/" },
    { emoji: "\u{1F4CA}", label: "Dashboard",           url: BASE + "/repo-dashboard-hub/" },
    { type: "divider" },
    { emoji: "\u{1F310}", label: "This Repo on GitHub",  url: "https://github.com/" + USER + "/" + REPO, external: true },
    { emoji: "\u{1F50D}", label: "Search All Repos",     url: "https://github.com/orgs/" + USER + "/repositories", external: true }
  ];

  // ══ BUILD MENU ══
  function build() {
    if (document.getElementById("inf-menu-btn")) return;

    // Hamburger button
    var btn = document.createElement("button");
    btn.id = "inf-menu-btn";
    btn.setAttribute("aria-label", "Menu");
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect y="3" width="20" height="2" rx="1" fill="currentColor"/><rect y="9" width="20" height="2" rx="1" fill="currentColor"/><rect y="15" width="20" height="2" rx="1" fill="currentColor"/></svg>';
    btn.style.cssText = "position:fixed;top:12px;left:12px;z-index:10010;" +
      "width:40px;height:40px;border-radius:10px;border:none;" +
      "background:rgba(10,10,26,0.9);color:#ccc;cursor:pointer;" +
      "display:flex;align-items:center;justify-content:center;" +
      "box-shadow:0 2px 12px rgba(0,0,0,0.4);backdrop-filter:blur(8px);" +
      "transition:all 0.2s;-webkit-backdrop-filter:blur(8px);";
    btn.onmouseenter = function(){ btn.style.background = "rgba(26,10,46,0.95)"; btn.style.color = "#FFD700"; };
    btn.onmouseleave = function(){ if (!menuOpen) { btn.style.background = "rgba(10,10,26,0.9)"; btn.style.color = "#ccc"; } };
    btn.onclick = toggleMenu;

    // Menu panel
    var panel = document.createElement("div");
    panel.id = "inf-menu-panel";
    panel.style.cssText = "position:fixed;top:0;left:-280px;z-index:10009;" +
      "width:270px;height:100vh;overflow-y:auto;" +
      "background:rgba(10,10,26,0.97);border-right:1px solid #2a2a4a;" +
      "padding:60px 0 20px;font-family:system-ui,sans-serif;" +
      "transition:left 0.25s ease;box-shadow:4px 0 20px rgba(0,0,0,0.5);" +
      "backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);";

    // Current repo label at top
    var repoLabel = document.createElement("div");
    repoLabel.style.cssText = "padding:0 16px 12px;margin-bottom:8px;border-bottom:1px solid #1a1a3a;" +
      "font-size:0.7rem;color:#666;";
    repoLabel.textContent = REPO;
    panel.appendChild(repoLabel);

    // Menu items
    MENU_ITEMS.forEach(function(item) {
      if (item.type === "divider") {
        var div = document.createElement("div");
        div.style.cssText = "height:1px;background:#1a1a3a;margin:8px 16px;";
        panel.appendChild(div);
        return;
      }

      var link = document.createElement("a");
      link.href = item.url;
      if (item.external) link.target = "_blank";

      // Highlight current page
      var isCurrent = item.url && item.url.indexOf("/" + REPO + "/") >= 0 && !item.external;

      link.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 16px;" +
        "color:" + (isCurrent ? "#FFD700" : "#ccc") + ";text-decoration:none;font-size:0.85rem;" +
        "transition:all 0.15s;border-left:3px solid " + (isCurrent ? "#FFD700" : "transparent") + ";";

      if (item.highlight) {
        link.style.background = "linear-gradient(90deg, rgba(255,215,0,0.08), transparent)";
        link.style.color = item.color || "#FFD700";
        link.style.fontWeight = "700";
      }

      link.onmouseenter = function() {
        link.style.background = "rgba(255,255,255,0.05)";
        link.style.borderLeftColor = item.color || "#FFD700";
      };
      link.onmouseleave = function() {
        link.style.background = item.highlight ? "linear-gradient(90deg, rgba(255,215,0,0.08), transparent)" : "transparent";
        link.style.borderLeftColor = isCurrent ? "#FFD700" : "transparent";
      };

      var emoji = document.createElement("span");
      emoji.textContent = item.emoji;
      emoji.style.cssText = "font-size:1.1rem;min-width:24px;text-align:center;";

      var label = document.createElement("span");
      label.textContent = item.label;

      link.appendChild(emoji);
      link.appendChild(label);

      if (item.external) {
        var ext = document.createElement("span");
        ext.textContent = "\u2197";
        ext.style.cssText = "margin-left:auto;font-size:0.7rem;color:#555;";
        link.appendChild(ext);
      }

      panel.appendChild(link);
    });

    // Backdrop
    var backdrop = document.createElement("div");
    backdrop.id = "inf-menu-backdrop";
    backdrop.style.cssText = "position:fixed;inset:0;z-index:10008;background:rgba(0,0,0,0.4);" +
      "opacity:0;pointer-events:none;transition:opacity 0.25s;";
    backdrop.onclick = toggleMenu;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }

  var menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    var panel = document.getElementById("inf-menu-panel");
    var backdrop = document.getElementById("inf-menu-backdrop");
    var btn = document.getElementById("inf-menu-btn");

    if (menuOpen) {
      panel.style.left = "0";
      backdrop.style.opacity = "1";
      backdrop.style.pointerEvents = "auto";
      btn.style.background = "rgba(26,10,46,0.95)";
      btn.style.color = "#FFD700";
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    } else {
      panel.style.left = "-280px";
      backdrop.style.opacity = "0";
      backdrop.style.pointerEvents = "none";
      btn.style.background = "rgba(10,10,26,0.9)";
      btn.style.color = "#ccc";
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect y="3" width="20" height="2" rx="1" fill="currentColor"/><rect y="9" width="20" height="2" rx="1" fill="currentColor"/><rect y="15" width="20" height="2" rx="1" fill="currentColor"/></svg>';
    }
  }

  // Close on Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && menuOpen) toggleMenu();
  });

  // ══ INIT ══
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
