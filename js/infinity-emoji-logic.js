/* infinity-emoji-logic.js — Sovereign Toolset v1.0
 * 9-button Emoji-Logic Command System for Infinity Spark Control
 * Deployed across the Infinity ecosystem
 */
(function(){
  "use strict";

  const REPO = document.querySelector('meta[name="infinity-repo"]')?.content || 'unknown';
  const USER = 'pewpi-infinity';
  const BASE = `https://${USER}.github.io`;
  const API = 'https://api.github.com';

  // ══ Command Definitions ══
  const COMMANDS = {
    '🍄': {
      name: 'Double Down',
      desc: 'Double the depth of research on this page',
      color: '#e53935',
      action: doubleDown
    },
    '🟡': {
      name: 'Token Wallet',
      desc: 'Access Infinity wealth and burn-rate metrics',
      color: '#ffd700',
      action: tokenWallet
    },
    '⭐': {
      name: 'Trend Flight',
      desc: 'Inject high-velocity trending metadata',
      color: '#ff9800',
      action: trendFlight
    },
    '👑': {
      name: 'Royal Treatment',
      desc: 'AI guides, trivia, automated cross-linking',
      color: '#9c27b0',
      action: royalTreatment
    },
    '💎': {
      name: 'Facet',
      desc: 'Cut a diamond chunk of data for next build',
      color: '#00bcd4',
      action: facetCut
    },
    '🧱': {
      name: 'Hash/Lock',
      desc: 'Encode with 4-Hash system',
      color: '#795548',
      action: hashLock
    },
    '🦾': {
      name: 'Bot Auto',
      desc: 'Deploy automation agents for page growth',
      color: '#607d8b',
      action: botAuto
    },
    '🧲': {
      name: 'Magnet',
      desc: 'Pull assets into next sequential repo',
      color: '#f44336',
      action: magnetPull
    },
    '🕹️': {
      name: 'Search Mech',
      desc: 'Bespoke search engine for this node',
      color: '#4caf50',
      action: searchMech
    }
  };

  // ══ Build the toolbar ══
  // Skip on pages that have their own toolbar/UI
  const SKIP_PAGES = ["infinity-crown-index","infinity-master-hub","repo-dashboard-hub"];
  const currentRepo = location.pathname.split("/").filter(Boolean)[0] || "";
  if (SKIP_PAGES.includes(currentRepo)) return;

  function buildToolbar() {
    const bar = document.createElement('div');
    bar.id = 'infinity-forge-bar';
    bar.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:10000;
      background:linear-gradient(135deg,#0a0a1a,#1a0a2e);
      border-top:2px solid #6c63ff;padding:6px 12px;
      display:flex;gap:4px;justify-content:center;flex-wrap:wrap;
      font-family:system-ui,sans-serif;
    `;

    for (const [emoji, cmd] of Object.entries(COMMANDS)) {
      const btn = document.createElement('button');
      btn.innerHTML = `<span style="font-size:1.2rem">${emoji}</span><span style="font-size:0.6rem;display:block;color:#aaa">${cmd.name}</span>`;
      btn.title = cmd.desc;
      btn.style.cssText = `
        background:#161640;border:1px solid #2a2a5a;border-radius:10px;
        padding:6px 10px;cursor:pointer;color:#e8e8f0;text-align:center;
        min-width:60px;transition:all 0.2s;
      `;
      btn.onmouseenter = () => { btn.style.borderColor = cmd.color; btn.style.transform = 'translateY(-2px)'; };
      btn.onmouseleave = () => { btn.style.borderColor = '#2a2a5a'; btn.style.transform = 'none'; };
      btn.onclick = () => cmd.action();
      bar.appendChild(btn);
    }

    // Collapse toggle
    const toggle = document.createElement('div');
    toggle.style.cssText = 'position:absolute;top:-20px;right:10px;background:#161640;border:1px solid #6c63ff;border-radius:8px 8px 0 0;padding:2px 12px;cursor:pointer;color:#6c63ff;font-size:0.7rem;';
    toggle.textContent = '▼ Forge';
    let collapsed = false;
    toggle.onclick = () => {
      collapsed = !collapsed;
      bar.style.height = collapsed ? '4px' : 'auto';
      bar.style.overflow = collapsed ? 'hidden' : 'visible';
      toggle.textContent = collapsed ? '▲ Forge' : '▼ Forge';
    };
    bar.appendChild(toggle);

    document.body.appendChild(bar);
    document.body.style.paddingBottom = '60px';
  }

  // ══ Panel builder ══
  function showPanel(title, content, color) {
    // Remove existing
    const old = document.getElementById('forge-panel');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'forge-panel';
    panel.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      width:90%;max-width:500px;max-height:80vh;overflow-y:auto;
      background:#0a0a1a;border:2px solid ${color||'#6c63ff'};
      border-radius:16px;padding:20px;z-index:10001;
      box-shadow:0 20px 60px rgba(0,0,0,0.8);
      font-family:system-ui,sans-serif;color:#e8e8f0;
    `;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="color:${color||'#ffd700'};font-size:1.1rem;margin:0">${title}</h3>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:#888;font-size:1.3rem;cursor:pointer">✕</button>
      </div>
      <div>${content}</div>
    `;

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;';
    backdrop.onclick = () => { panel.remove(); backdrop.remove(); };
    backdrop.id = 'forge-backdrop';

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
  }

  // ══ Command Implementations ══

  // 🍄 DOUBLE DOWN — Find related repos and show deeper research links
  function doubleDown() {
    showPanel('🍄 Double Down — Deep Research', `
      <p style="color:#aaa;margin-bottom:12px">Doubling depth on: <b style="color:#ffd700">${REPO}</b></p>
      <div style="display:grid;gap:8px">
        <a href="${BASE}/mongoose.os/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          🔬 <b>Mongoose.os Research</b><br><span style="color:#888;font-size:0.8rem">Full research database — oxide brains, piezoelectric systems</span>
        </a>
        <a href="${BASE}/infinity-crown-index/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          👑 <b>Crown Index</b><br><span style="color:#888;font-size:0.8rem">958 repositories indexed — find deeper content</span>
        </a>
        <a href="${BASE}/smug_look/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          🎮 <b>Smug Look Hub</b><br><span style="color:#888;font-size:0.8rem">C13B0 system, carts, research engine</span>
        </a>
        <a href="https://github.com/${USER}?tab=repositories&q=${encodeURIComponent(REPO.split('-')[0])}" target="_blank" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          🔎 <b>Related Repos</b><br><span style="color:#888;font-size:0.8rem">Find all repos in this category on GitHub</span>
        </a>
      </div>
    `, '#e53935');
  }

  // 🟡 TOKEN WALLET
  function tokenWallet() {
    const start = new Date('2025-02-15');
    const now = new Date();
    const days = Math.floor((now - start) / (1000*60*60*24));
    const value = 1111 + days;
    const daily48 = 48;
    showPanel('🟡 Token Wallet — Infinity Bank', `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:2.5rem;font-weight:800;color:#ffd700">$${value.toLocaleString()}</div>
        <div style="color:#888;font-size:0.85rem">Base $1,111 + $1/day × ${days} days</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;text-align:center">
          <div style="color:#888;font-size:0.7rem">Daily Tokens</div>
          <div style="color:#ffd700;font-size:1.3rem;font-weight:700">${daily48}</div>
        </div>
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;text-align:center">
          <div style="color:#888;font-size:0.7rem">Repos</div>
          <div style="color:#ffd700;font-size:1.3rem;font-weight:700">958</div>
        </div>
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;text-align:center">
          <div style="color:#888;font-size:0.7rem">4-Hash Layers</div>
          <div style="color:#ffd700;font-size:1.3rem;font-weight:700">4</div>
        </div>
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;text-align:center">
          <div style="color:#888;font-size:0.7rem">Growth</div>
          <div style="color:#4caf50;font-size:1.3rem;font-weight:700">+$1/day</div>
        </div>
      </div>
      <div style="font-size:0.8rem;color:#888;margin-top:8px">
        <b style="color:#ffd700">4-Hash System:</b><br>
        #1 Sovereign Research — Primary jump-links<br>
        #2 Validation Data — Raw logic & source verification<br>
        #3 Bibliography/Network — Research articles<br>
        #4 Master Zip — Unified blockchain token
      </div>
      <div style="text-align:center;margin-top:12px">
        <a href="https://www.paypal.com/paypalme/marvasweater@gmail.com/${value}" target="_blank"
           style="display:inline-block;background:#ffd700;color:#000;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none">
          Buy License Token — $${value.toLocaleString()}
        </a>
      </div>
    `, '#ffd700');
  }

  // ⭐ TREND FLIGHT
  function trendFlight() {
    showPanel('⭐ Trend Flight — Velocity Metadata', `
      <p style="color:#aaa;margin-bottom:12px">Injecting trending metadata for: <b style="color:#ffd700">${REPO}</b></p>
      <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:8px">
        <div style="color:#ff9800;font-weight:600;margin-bottom:4px">SEO Tags Generated</div>
        <code style="color:#aaa;font-size:0.75rem;word-break:break-all">
          infinity-spark, quantum-research, ${REPO}, pewpi-infinity, aluminum-oxide, piezoelectric, bio-energy, sovereign-tech
        </code>
      </div>
      <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:8px">
        <div style="color:#ff9800;font-weight:600;margin-bottom:4px">Open Graph</div>
        <div style="color:#aaa;font-size:0.8rem">
          Title: ${REPO} — Infinity Sovereign Research<br>
          Type: Quantum Intelligence Node<br>
          Image: Crown Index Thumbnail
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <a href="https://github.com/${USER}/${REPO}" target="_blank" style="display:block;background:#161640;border:1px solid #ff9800;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none;text-align:center">
          ⭐ Star This Repo
        </a>
        <a href="https://github.com/${USER}/${REPO}/network" target="_blank" style="display:block;background:#161640;border:1px solid #ff9800;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none;text-align:center">
          🔗 Fork Network
        </a>
      </div>
    `, '#ff9800');
  }

  // 👑 ROYAL TREATMENT
  function royalTreatment() {
    const links = [
      {name:'Crown Index',url:`${BASE}/infinity-crown-index/`,icon:'👑'},
      {name:'Crown Hub',url:`${BASE}/infinity-crown-hub/`,icon:'🏗️'},
      {name:'Spark Engine',url:`${BASE}/infinity-spark-engine/`,icon:'⚡'},
      {name:'Spark Vault',url:`${BASE}/infinity-spark-vault/`,icon:'🔐'},
      {name:'Spark Control',url:`${BASE}/infinity-spark-control/`,icon:'🎛️'},
      {name:'Spark Theater',url:`${BASE}/infinity-spark-theater/`,icon:'🎭'},
      {name:'Infinity Belt',url:`${BASE}/infinity-belt/`,icon:'♾️'},
      {name:'Infinity Lock',url:`${BASE}/infinity-lock/`,icon:'🔒'},
    ];
    const linkHtml = links.map(l =>
      `<a href="${l.url}" style="display:flex;align-items:center;gap:8px;background:#161640;border:1px solid #333;border-radius:8px;padding:8px 12px;color:#e8e8f0;text-decoration:none;transition:all 0.2s" onmouseenter="this.style.borderColor='#9c27b0'" onmouseleave="this.style.borderColor='#333'">
        <span style="font-size:1.2rem">${l.icon}</span>
        <span>${l.name}</span>
      </a>`
    ).join('');
    showPanel('👑 Royal Treatment — Cross-Link Network', `
      <p style="color:#aaa;margin-bottom:12px">AI-guided navigation from <b style="color:#ffd700">${REPO}</b></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${linkHtml}</div>
    `, '#9c27b0');
  }

  // 💎 FACET — Data extraction
  function facetCut() {
    showPanel('💎 Facet — Data Extractor', `
      <p style="color:#aaa;margin-bottom:12px">Cut a diamond chunk from: <b style="color:#ffd700">${REPO}</b></p>
      <div style="background:#161640;border:1px solid #00bcd4;border-radius:8px;padding:12px;margin-bottom:10px">
        <div style="color:#00bcd4;font-weight:600;margin-bottom:6px">Extract Options</div>
        <div style="display:grid;gap:6px">
          <button onclick="facetExtract('metadata')" style="background:#0a1a2e;border:1px solid #00bcd4;border-radius:8px;padding:8px;color:#e8e8f0;cursor:pointer;text-align:left">
            📋 <b>Metadata</b> — Repo info, size, language, dates
          </button>
          <button onclick="facetExtract('files')" style="background:#0a1a2e;border:1px solid #00bcd4;border-radius:8px;padding:8px;color:#e8e8f0;cursor:pointer;text-align:left">
            📁 <b>File Manifest</b> — Complete file listing
          </button>
          <button onclick="facetExtract('dictionary')" style="background:#0a1a2e;border:1px solid #00bcd4;border-radius:8px;padding:8px;color:#e8e8f0;cursor:pointer;text-align:left">
            📖 <b>Dictionary</b> — Key terms from this repo
          </button>
          <button onclick="facetExtract('links')" style="background:#0a1a2e;border:1px solid #00bcd4;border-radius:8px;padding:8px;color:#e8e8f0;cursor:pointer;text-align:left">
            🔗 <b>Link Map</b> — All connections to other repos
          </button>
        </div>
      </div>
      <div id="facet-output" style="background:#0d0d0d;border:1px solid #333;border-radius:8px;padding:12px;font-family:monospace;font-size:0.75rem;color:#4caf50;max-height:200px;overflow-y:auto;display:none"></div>
    `, '#00bcd4');
  }

  // 🧱 HASH/LOCK
  function hashLock() {
    showPanel('🧱 Hash/Lock — 4-Hash Encoder', `
      <div style="margin-bottom:12px">
        <div style="color:#795548;font-weight:600;margin-bottom:8px">4-Hash Layers for: ${REPO}</div>
        <div style="display:grid;gap:8px">
          <div style="background:#161640;border-left:3px solid #e53935;border-radius:0 8px 8px 0;padding:10px">
            <b style="color:#e53935">#1 Sovereign Research</b><br>
            <span style="color:#888;font-size:0.8rem">Primary jump-links to sub-tokens</span>
          </div>
          <div style="background:#161640;border-left:3px solid #ff9800;border-radius:0 8px 8px 0;padding:10px">
            <b style="color:#ff9800">#2 Validation Data</b><br>
            <span style="color:#888;font-size:0.8rem">Raw logic & source verification</span>
          </div>
          <div style="background:#161640;border-left:3px solid #ffd700;border-radius:0 8px 8px 0;padding:10px">
            <b style="color:#ffd700">#3 Bibliography/Network</b><br>
            <span style="color:#888;font-size:0.8rem">Research articles used to build this node</span>
          </div>
          <div style="background:#161640;border-left:3px solid #4caf50;border-radius:0 8px 8px 0;padding:10px">
            <b style="color:#4caf50">#4 Master Zip</b><br>
            <span style="color:#888;font-size:0.8rem">Unified token for blockchain identification</span>
          </div>
        </div>
      </div>
      <div style="text-align:center">
        <div style="background:#0d0d0d;border:1px solid #795548;border-radius:8px;padding:8px;font-family:monospace;font-size:0.7rem;color:#795548;word-break:break-all">
          HASH: INF-${REPO.toUpperCase().replace(/[^A-Z0-9]/g,'')}-${Date.now().toString(36).toUpperCase()}
        </div>
      </div>
    `, '#795548');
  }

  // 🦾 BOT AUTO
  function botAuto() {
    showPanel('🦾 Bot Auto — Automation Agents', `
      <p style="color:#aaa;margin-bottom:12px">Deploy automation for: <b style="color:#ffd700">${REPO}</b></p>
      <div style="display:grid;gap:8px">
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">
          <span style="font-size:1.5rem">🔄</span>
          <div><b>Sync Agent</b><br><span style="color:#888;font-size:0.8rem">Auto-sync with Crown Index every 6 hours</span></div>
          <span style="color:#4caf50;font-size:0.75rem">ACTIVE</span>
        </div>
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">
          <span style="font-size:1.5rem">📖</span>
          <div><b>Dictionary Agent</b><br><span style="color:#888;font-size:0.8rem">Extract key terms to shared dictionary</span></div>
          <span style="color:#4caf50;font-size:0.75rem">ACTIVE</span>
        </div>
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">
          <span style="font-size:1.5rem">🔗</span>
          <div><b>Link Agent</b><br><span style="color:#888;font-size:0.8rem">Cross-link to related repos automatically</span></div>
          <span style="color:#4caf50;font-size:0.75rem">ACTIVE</span>
        </div>
        <div style="background:#161640;border:1px solid #333;border-radius:8px;padding:10px;display:flex;align-items:center;gap:10px">
          <span style="font-size:1.5rem">📊</span>
          <div><b>Growth Agent</b><br><span style="color:#888;font-size:0.8rem">Track page metrics and optimize visibility</span></div>
          <span style="color:#ffd700;font-size:0.75rem">STANDBY</span>
        </div>
      </div>
    `, '#607d8b');
  }

  // 🧲 MAGNET — Pull assets into next repo
  function magnetPull() {
    showPanel('🧲 Magnet — Asset Pull', `
      <p style="color:#aaa;margin-bottom:12px">Pull assets from <b style="color:#ffd700">${REPO}</b> into next sequential repo</p>
      <div style="background:#161640;border:1px solid #f44336;border-radius:8px;padding:12px;margin-bottom:10px">
        <div style="color:#f44336;font-weight:600;margin-bottom:6px">Bismuth Signal Bounce</div>
        <div style="color:#888;font-size:0.8rem">
          This transfers the current repo's data signature to the next repo in the chain.
          The receiving repo inherits the research context and dictionary terms.
        </div>
      </div>
      <div style="display:grid;gap:8px">
        <a href="${BASE}/infinity-crown-index/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          🧲 Pull to Crown Index
        </a>
        <a href="${BASE}/smug_look/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          🧲 Pull to Smug Look
        </a>
        <a href="${BASE}/mongoose.os/" style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:10px;color:#e8e8f0;text-decoration:none">
          🧲 Pull to Mongoose Research
        </a>
      </div>
    `, '#f44336');
  }

  // 🕹️ SEARCH MECH — Search this repo/ecosystem
  function searchMech() {
    showPanel('🕹️ Search Mech — Node Search', `
      <div style="margin-bottom:12px">
        <input type="text" id="mech-search" placeholder="Search ${REPO} and ecosystem..."
          style="width:100%;background:#0d0d0d;border:1px solid #4caf50;border-radius:8px;padding:10px;color:#e8e8f0;font-size:0.9rem">
      </div>
      <div id="mech-results" style="max-height:300px;overflow-y:auto"></div>
      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <a href="https://github.com/search?q=user%3A${USER}+${REPO.split('-')[0]}&type=repositories" target="_blank"
           style="display:block;background:#161640;border:1px solid #4caf50;border-radius:8px;padding:8px;color:#e8e8f0;text-decoration:none;text-align:center;font-size:0.8rem">
          🔎 GitHub Search
        </a>
        <a href="${BASE}/infinity-crown-index/#search=${REPO}" target="_blank"
           style="display:block;background:#161640;border:1px solid #4caf50;border-radius:8px;padding:8px;color:#e8e8f0;text-decoration:none;text-align:center;font-size:0.8rem">
          👑 Crown Search
        </a>
      </div>
    `, '#4caf50');

    // Wire up search
    setTimeout(() => {
      const input = document.getElementById('mech-search');
      if (input) {
        input.focus();
        input.addEventListener('input', async function() {
          const q = this.value.trim();
          if (q.length < 2) { document.getElementById('mech-results').innerHTML = ''; return; }
          try {
            const r = await fetch(`${API}/search/repositories?q=user:${USER}+${encodeURIComponent(q)}&per_page=10`);
            const data = await r.json();
            const results = document.getElementById('mech-results');
            results.innerHTML = (data.items||[]).map(repo =>
              `<a href="${repo.has_pages ? BASE+'/'+repo.name+'/' : repo.html_url}" target="_blank"
                style="display:block;background:#161640;border:1px solid #333;border-radius:8px;padding:8px 12px;margin-bottom:4px;color:#e8e8f0;text-decoration:none;font-size:0.85rem">
                ${repo.name} <span style="color:#888;font-size:0.7rem">${repo.size}KB ${repo.has_pages?'🌐':''}</span>
              </a>`
            ).join('') || '<div style="color:#888;padding:8px">No results</div>';
          } catch(e) {}
        });
      }
    }, 100);
  }

  // Expose for inline handlers
  window.facetExtract = async function(type) {
    const output = document.getElementById('facet-output');
    if (!output) return;
    output.style.display = 'block';
    output.textContent = 'Extracting...';
    try {
      const r = await fetch(`${API}/repos/${USER}/${REPO}`);
      const repo = await r.json();
      switch(type) {
        case 'metadata':
          output.textContent = JSON.stringify({
            name: repo.name, size: repo.size+'KB', language: repo.language,
            created: repo.created_at, updated: repo.updated_at,
            stars: repo.stargazers_count, pages: repo.has_pages,
            description: repo.description
          }, null, 2);
          break;
        case 'files':
          const r2 = await fetch(`${API}/repos/${USER}/${REPO}/contents/`);
          const files = await r2.json();
          output.textContent = (files||[]).map(f => f.name + ' (' + f.size + 'B)').join('\n');
          break;
        case 'dictionary':
          output.textContent = `Dictionary terms for ${REPO}:\n` +
            REPO.split(/[-_]/).filter(w=>w.length>2).join(', ') +
            '\n\n(Full dictionary at Crown Index → api/dictionary.json)';
          break;
        case 'links':
          output.textContent = `Cross-links for ${REPO}:\n` +
            `Crown Index: ${BASE}/infinity-crown-index/\n` +
            `GitHub: https://github.com/${USER}/${REPO}\n` +
            `Pages: ${BASE}/${REPO}/`;
          break;
      }
    } catch(e) {
      output.textContent = 'Error: ' + e.message;
    }
  };

  // ══ Init ══
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToolbar);
  } else {
    buildToolbar();
  }
})();
