/* ═══════════════════════════════════════════════════════════
   AXIOM · shell — routing, palette, graph inspector, ambience
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const VIEWS = {
    learn: { crumb: 'Study Anything', name: 'Learn' },
    graph: { crumb: 'Knowledge Graph', name: 'Command' },
    study: { crumb: 'Study Deck', name: 'Learn' },
    arena: { crumb: 'Testing Arena', name: 'Prove' },
    vault: { crumb: 'Exam Vault', name: 'Rehearse' },
    diag: { crumb: 'Diagnostics', name: 'Inspect' },
    mesh: { crumb: 'Peer Mesh', name: 'Connect' }
  };

  /* ── routing ──────────────────────────────────────────── */
  AX.route = function (view) {
    if (!VIEWS[view]) view = 'graph';
    AX.state.view = view;
    $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === view));
    $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
    $('#crumb-a').textContent = VIEWS[view].name;
    $('#crumb-b').textContent = VIEWS[view].crumb;
    document.title = 'AXIOM · ' + VIEWS[view].crumb;

    if (view === 'graph' && AX.graph) requestAnimationFrame(() => AX.graph.resize());
    if (view === 'study' && AX.Study) AX.Study.renderDeck(), AX.Study.renderSchedule();
    if (view === 'learn' && AX.Learn) AX.Learn.render();
    if (view === 'diag' && AX.Diag) AX.Diag.render();
    if (view === 'vault' && AX.Vault) AX.Vault.render();
    if (view === 'arena') {
      if (!AX.state.arena) AX.startArena(QUESTIONS[0].id);
      else AX.Arena.render();
    }
    if (view === 'mesh' && AX.Mesh) AX.Mesh.render();
    closePalette();
  };

  /* ── header ───────────────────────────────────────────── */
  function paintHeader() {
    const p = AX.state.profile;
    p.level = AX.levelFromXp(p.xp);
    const span = 1000;
    const into = p.xp % span;
    $('#lvl').textContent = p.level;
    $('#xp-txt').textContent = into.toLocaleString('en-IN').replace(/,/g, ' ') + ' / 1 000 XP';
    $('#xp-fill').style.width = Math.max(4, (into / span) * 100) + '%';
    $('#streak-n').textContent = p.streak;
    $('#profile-rank').textContent = 'Rank · ' + (AX.meanMastery() > .72 ? 'Contender' : AX.meanMastery() > .55 ? 'Challenger' : 'Apprentice');
  }

  /* ── intel panel ──────────────────────────────────────── */
  function sparkline(el, color, seed) {
    if (!el) return;
    const pts = [];
    let v = .5;
    for (let i = 0; i < 12; i++) {
      v = AX.clamp(v + (Math.sin(seed + i * 1.7) * .18) + (Math.random() - .5) * .05, .05, .95);
      pts.push(v);
    }
    const d = pts.map((p, i) => (i / 11 * 44).toFixed(1) + ',' + (20 - p * 18).toFixed(1)).join(' ');
    el.innerHTML = '<svg width="44" height="20" viewBox="0 0 44 20"><polyline points="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.4" stroke-linejoin="round" opacity=".9"/></svg>';
  }

  function paintIntel() {
    const extra = AX.state.forecastDays || 0;
    const mastery = AX.meanMastery();
    const ret = AX.meanRetention(extra);
    const bottles = AX.state.nodes.filter(n => AX.isBottleneck(n) || (extra > 0 && AX.retentionOf(n, extra) < .45 && AX.impactOf(n.id) >= 2));
    $('#kpi-mastery').textContent = Math.round(mastery * 100) + '%';
    $('#kpi-retention').textContent = Math.round(ret * 100) + '%';
    $('#kpi-bottle').textContent = bottles.length;
    $('#kpi-review').textContent = AX.state.nodes.filter(n => AX.retentionOf(n, extra) < .72).length;
    sparkline($('#spark-m'), '#37f0a5', 1.2);
    sparkline($('#spark-r'), '#3ce8ff', 3.7);

    const list = $('#bottleneck-list');
    if (list) {
      list.innerHTML = bottles.slice(0, 5).map(n => {
        const r = AX.retentionOf(n, extra);
        return '<div class="bn" data-node="' + n.id + '"><i></i>' + n.label + '<b>' + Math.round(n.mastery * 100) + '%</b></div>';
      }).join('') || '<p class="empty-note">No bottlenecks. The graph is structurally clean.</p>';
      list.querySelectorAll('.bn').forEach(b => b.onclick = () => AX.selectNode(b.dataset.node));
    }

    const note = $('#tm-note');
    if (note) {
      if (extra === 0) note.textContent = 'Scrub forward to watch retention decay propagate through dependent concepts.';
      else {
        const drop = AX.state.nodes.filter(n => AX.retentionOf(n, extra) < .6).length;
        note.textContent = 'At day ' + Math.round(extra) + ': ' + drop + ' concepts fall below 60% retention. ' +
          (drop > 8 ? 'Bottlenecks begin to cascade through the ancestry.' : 'Decay is still contained by current stability.');
      }
    }
  }

  /* ── inspector ────────────────────────────────────────── */
  function paintInspector() {
    const box = $('#inspect-body');
    if (!box) return;
    const id = AX.state.selected;
    if (!id) {
      box.className = 'inspect-empty';
      box.innerHTML = '<svg class="ic big"><use href="#i-graph"/></svg><b>No node selected</b><p>Click any sphere to read its mastery, memory half-life and dependency ancestry.</p>';
      return;
    }
    const n = AX.getNode(id); if (!n) return;
    box.className = '';
    const st = AX.nodeState(n);
    const r = AX.retentionOf(n);
    const impact = AX.impactOf(id);
    const anc = [...AX.ancestorsOf(id)].map(a => AX.getNode(a)).filter(Boolean).sort((a, b) => a.mastery - b.mastery).slice(0, 6);
    const trace = AX.traceRoots(id);
    const q = QUESTIONS.find(q => q.node === id);

    box.innerHTML =
      '<div class="insp-title"><span class="insp-dot" style="background:' + AX.STATE_HEX[st] + ';box-shadow:0 0 14px ' + AX.STATE_HEX[st] + '"></span>' +
      '<div><h3>' + n.label + '</h3><p>' + n.subject + ' · tier ' + n.tier + ' · blocks ' + impact + ' concepts</p></div></div>' +
      '<p class="insp-desc">' + n.blurb + '</p>' +
      '<div class="stat-rows">' +
      row('Mastery', n.mastery, '#37f0a5') +
      row('Retention now', r, '#3ce8ff') +
      row('Stability', AX.clamp(AX.stability(n) / 40, 0, 1), '#9b6bff', Math.round(AX.stability(n)) + ' day half-life') +
      '</div>' +
      '<div class="chain-title">Dependency ancestry · weakest first</div>' +
      '<div class="chain">' + anc.map(a => {
        const weak = a.mastery < .52;
        return '<div class="chain-item ' + (weak ? 'weak' : '') + '"><span class="cd"></span>' + a.label + '<b>' + Math.round(a.mastery * 100) + '%</b></div>';
      }).join('') + '</div>' +
      (trace.root && trace.root.id !== id ? '<div style="margin-top:10px;font-size:10.5px;color:#ffb3c1;line-height:1.6">Root bottleneck traced → <b>' + trace.root.label + '</b> (' + Math.round(trace.root.mastery * 100) + '%)</div>' : '') +
      '<div class="insp-actions">' +
      '<button class="btn primary" data-act="study"><svg class="ic"><use href="#i-book"/></svg>Open in study deck</button>' +
      '<button class="btn ghost" data-act="test"><svg class="ic"><use href="#i-terminal"/></svg>' + (q ? 'Test this concept' : 'Open testing arena') + '</button>' +
      '<button class="btn ghost" data-act="roots"><svg class="ic"><use href="#i-route"/></svg>Trace root bottleneck</button>' +
      '<button class="btn ghost" data-act="review"><svg class="ic"><use href="#i-check"/></svg>Log review · reschedule</button>' +
      '</div>';

    box.querySelector('[data-act="study"]').onclick = () => { AX.state.studyNode = id; AX.route('study'); };
    box.querySelector('[data-act="test"]').onclick = () => AX.startArena(q ? q.id : QUESTIONS[0].id);
    box.querySelector('[data-act="roots"]').onclick = () => {
      const t = AX.traceRoots(id);
      if (!t.root) return;
      AX.selectNode(t.root.id);
      AX.graph && AX.graph.flash(t.root.id, 2600);
      AX.toast('Ancestry traced', 'Weakest ancestor: ' + t.root.label + ' (' + Math.round(t.root.mastery * 100) + '%).', 'warn');
    };
    box.querySelector('[data-act="review"]').onclick = () => { AX.logReview(id); paintInspector(); paintIntel(); };
  }

  function row(label, v, color, note) {
    return '<div class="stat-row"><div class="lab"><span>' + label + '</span><b>' + (note || Math.round(v * 100) + '%') + '</b></div>' +
      '<div class="bar"><i style="width:' + (v * 100) + '%;background:' + color + ';box-shadow:0 0 12px ' + color + '55"></i></div></div>';
  }

  AX.selectNode = function (id) {
    AX.state.selected = id;
    paintInspector();
    if (AX.graph) { AX.graph.focusNode(id); AX.graph.flash(id, 1400); }
    if (AX.Diag && AX.state.view === 'diag') AX.Diag.setNode(id);
  };

  /* ── palette ──────────────────────────────────────────── */
  let palItems = [], palIndex = 0;

  function paletteItems() {
    const items = [];
    Object.entries(VIEWS).forEach(([k, v]) => items.push({ label: 'Go to ' + v.crumb, hint: 'view', icon: 'i-layers', action: () => AX.route(k) }));
    items.push({ label: 'Forecast retention decay', hint: 'action', icon: 'i-spark', action: () => forecast() });
    items.push({ label: 'Trace root bottleneck', hint: 'action', icon: 'i-route', action: () => traceSelected() });
    items.push({ label: 'Spawn simulated mesh peer', hint: 'action', icon: 'i-mesh', action: () => { AX.route('mesh'); setTimeout(() => document.getElementById('mesh-sim').click(), 100); } });
    items.push({ label: 'Export learner profile', hint: 'action', icon: 'i-archive', action: () => { AX.route('diag'); setTimeout(() => document.getElementById('diag-export').click(), 150); } });
    items.push({ label: 'Reset prototype data', hint: 'action', icon: 'i-sync', action: () => { AX.resetProgress(); boot(); AX.toast('Prototype reset', 'Local progress cleared.', 'warn'); } });

    if (window.PACKS) Object.keys(window.PACKS).forEach(k => items.push({
      label: 'Study ' + window.PACKS[k].title, hint: 'topic', icon: 'i-book',
      action: () => { AX.route('learn'); setTimeout(() => { const el = document.getElementById('learn-topic'); if (el) { el.value = window.PACKS[k].title; document.getElementById('learn-generate').click(); } }, 120); }
    }));

    AX.state.nodes.forEach(n => items.push({
      label: n.label, hint: n.subject, icon: 'i-graph', node: n.id,
      action: () => { AX.route('graph'); AX.selectNode(n.id); }
    }));
    EXAMS.slice(0, 10).forEach(e => items.push({
      label: e.exam + ' ' + e.year + ' · ' + e.paper, hint: 'paper', icon: 'i-archive',
      action: () => { AX.state.vault.open = e.id; AX.route('vault'); }
    }));
    return items;
  }

  function openPalette() {
    const ov = $('#palette');
    ov.hidden = false;
    const inp = $('#palette-input');
    inp.value = '';
    palItems = paletteItems();
    palIndex = 0;
    renderPalette('');
    setTimeout(() => inp.focus(), 30);
  }
  function closePalette() { $('#palette').hidden = true; }

  function renderPalette(q) {
    const list = palItems.filter(i => (i.label + ' ' + i.hint).toLowerCase().includes(q.toLowerCase())).slice(0, 24);
    palItems = list;
    palIndex = Math.min(palIndex, Math.max(0, list.length - 1));
    const box = $('#palette-results');
    if (!list.length) { box.innerHTML = '<div style="padding:22px;text-align:center;color:var(--txt-3);font-size:12px">Nothing matches “' + q + '”.</div>'; return; }
    box.innerHTML = list.map((i, k) =>
      '<button class="pal-item ' + (k === palIndex ? 'sel' : '') + '" data-k="' + k + '"><span class="pal-icon"><svg class="ic"><use href="#' + i.icon + '"/></svg></span>' +
      i.label + '<small>' + i.hint + '</small></button>').join('');
    box.querySelectorAll('.pal-item').forEach(b => b.onclick = () => runPaletteItem(+b.dataset.k));
  }

  function runPaletteItem(k) {
    const item = palItems[k]; if (!item) return;
    closePalette();
    item.action();
  }

  /* ── actions ──────────────────────────────────────────── */
  function traceSelected() {
    AX.route('graph');
    const id = AX.state.selected || (AX.bottlenecks()[0] || {}).id;
    if (!id) return;
    const t = AX.traceRoots(id);
    if (t.root) {
      AX.selectNode(t.root.id);
      AX.graph && AX.graph.flash(t.root.id, 3000);
      AX.toast('Root bottleneck located', t.path.map(n => n.label).join(' → '), 'warn');
    }
  }

  let forecasting = false;
  function forecast(target = 90) {
    if (forecasting) return;
    forecasting = true;
    const slider = $('#tm-range');
    const start = AX.state.forecastDays;
    const t0 = performance.now();
    const dur = 1700;
    function step(t) {
      const k = AX.clamp((t - t0) / dur, 0, 1);
      const eased = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = Math.round(start + (target - start) * eased);
      AX.state.forecastDays = v;
      slider.value = v;
      slider.style.setProperty('--fill', (v / 120 * 100) + '%');
      $('#tm-day').textContent = 'Day ' + v;
      paintIntel();
      if (k < 1) requestAnimationFrame(step);
      else {
        forecasting = false;
        const drop = AX.state.nodes.filter(n => AX.retentionOf(n, v) < .6).length;
        AX.toast('Forecast complete', 'By day ' + v + ', ' + drop + ' concepts cross the decay threshold. Schedule reviews for the red ones.', 'warn');
      }
    }
    requestAnimationFrame(step);
  }

  /* ── profile sheet ────────────────────────────────────── */
  function openProfile() {
    const p = AX.state.profile;
    const rows = [
      ['Mastery index', Math.round(AX.meanMastery() * 100) + '%', '#37f0a5'],
      ['Mean retention', Math.round(AX.meanRetention() * 100) + '%', '#3ce8ff'],
      ['Streak', p.streak + ' days', '#ffc154'],
      ['Bottlenecks', AX.bottlenecks().length, '#ff4d6d'],
      ['Reviews logged', p.reviews.length, '#9b6bff'],
      ['Bugs classified', Object.values(p.bugs).reduce((a, b) => a + b, 0), '#ff7ae0']
    ];
    const topBugs = BUG_TAXONOMY.map(b => ({ ...b, n: p.bugs[b.key] || 0 })).filter(b => b.n).sort((a, b) => b.n - a.n).slice(0, 4);
    $('#sheet-body').innerHTML =
      '<div class="sheet-kpis">' +
      '<div class="sheet-kpi"><small>mastery</small><b>' + Math.round(AX.meanMastery() * 100) + '%</b></div>' +
      '<div class="sheet-kpi"><small>level</small><b>' + p.level + '</b></div>' +
      '<div class="sheet-kpi"><small>xp</small><b>' + p.xp.toLocaleString() + '</b></div>' +
      '</div>' +
      rows.map(([l, v, c]) => '<div class="sheet-row"><i style="background:' + c + '"></i>' + l + '<b>' + v + '</b></div>').join('') +
      '<div class="chain-title" style="margin-top:18px">Cognitive bug profile</div>' +
      (topBugs.length ? topBugs.map(b => '<div class="sheet-row"><i style="background:' + b.color + '"></i>' + b.label + '<b>' + b.n + '</b></div>').join('') : '<p class="panel-note" style="padding:6px 0">No mistakes classified yet.</p>') +
      '<div class="chain-title" style="margin-top:18px">Recent attempts</div>' +
      (p.attempts.length ? p.attempts.slice(0, 5).map(a => {
        const q = QUESTIONS.find(x => x.id === a.qid);
        return '<div class="sheet-row"><i style="background:' + (a.correct ? 'var(--green)' : 'var(--red)') + '"></i>' + (q ? q.title : a.qid) +
          '<b>' + Math.round(a.predicted * 100) + '% → ' + (a.correct ? 'pass' : 'review') + '</b></div>';
      }).join('') : '<p class="panel-note" style="padding:6px 0">Run the arena to populate the prediction ledger.</p>');
    $('#profile-sheet').hidden = false;
  }

  /* ── background stars ─────────────────────────────────── */
  function initStars() {
    const cv = $('#bg-canvas');
    const ctx = cv.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars = [];
    function resize() {
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: 110 }, () => ({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        z: .2 + Math.random() * .8, r: .5 + Math.random() * 1.6,
        p: Math.random() * Math.PI * 2, s: .2 + Math.random() * .5
      }));
    }
    resize();
    window.addEventListener('resize', resize);
    let mx = 0, my = 0;
    window.addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); });
    function draw(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      stars.forEach(s => {
        const tw = .35 + Math.abs(Math.sin(t / 2400 * s.s + s.p)) * .65;
        const x = s.x + mx * 26 * s.z, y = s.y + my * 18 * s.z;
        ctx.beginPath(); ctx.arc(x, y, s.r * s.z, 0, 7);
        ctx.fillStyle = 'rgba(150,210,255,' + (tw * .5 * s.z) + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ── boot ─────────────────────────────────────────────── */
  function boot() {
    paintHeader();
    paintInspector();
    paintIntel();

    AX.graph = new AX.Graph3D($('#graph-canvas'));

    AX.Study.init();
    AX.Learn.init();
    AX.Arena.init();
    AX.Vault.init();
    AX.Diag.init();
    AX.Mesh.init();

    $$('.nav-item').forEach(b => b.onclick = () => AX.route(b.dataset.view));
    $('#search-btn').onclick = openPalette;
    $('#profile-btn').onclick = openProfile;
    $('#sync-btn').onclick = () => { AX.persist(); AX.toast('Device synced', 'All progress is local-first — no server round trip.', 'good'); };
    $('#inspect-close').onclick = () => { AX.state.selected = null; paintInspector(); };
    $('#btn-recenter').onclick = () => {
      if (!AX.graph) return;
      AX.graph.target = { yaw: -0.42, pitch: 0.26, dist: 6.9 };
      AX.graph.target = { yaw: -0.42, pitch: 0.26, dist: 6.9, __set: true };
      AX.graph.cam = AX.graph.cam; AX.graph.snap = true;
      AX.graph.target.dist = 6.9;
      AX.graph.target.yaw = -0.42; AX.graph.target.pitch = 0.26;
      AX.graph.snap = true;
    };
    $('#btn-roots').onclick = traceSelected;
    $('#btn-forecast').onclick = () => forecast(90);
    $('#autorotate').onclick = e => {
      AX.state.graph.autoRotate = !AX.state.graph.autoRotate;
      e.currentTarget.setAttribute('aria-pressed', String(AX.state.graph.autoRotate));
      e.currentTarget.innerHTML = '<span class="dot"></span>' + (AX.state.graph.autoRotate ? 'auto-orbit' : 'orbit paused');
    };

    /* time machine */
    const slider = $('#tm-range');
    slider.addEventListener('input', e => {
      const v = +e.target.value;
      AX.state.forecastDays = v;
      e.target.style.setProperty('--fill', (v / 120 * 100) + '%');
      $('#tm-day').textContent = 'Day ' + v;
      paintIntel();
      if ($('#inspect-body').className === '') paintInspector();
    });
    slider.style.setProperty('--fill', '0%');

    /* palette */
    $('#palette-input').addEventListener('input', e => { palIndex = 0; renderPalette(e.target.value); });
    $('#palette').addEventListener('click', e => { if (e.target.id === 'palette') closePalette(); });
    $('#palette-input').addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); palIndex = Math.min(palItems.length - 1, palIndex + 1); renderPalette($('#palette-input').value); }
      if (e.key === 'ArrowUp') { e.preventDefault(); palIndex = Math.max(0, palIndex - 1); renderPalette($('#palette-input').value); }
      if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(palIndex); }
    });

    /* sheets */
    $('#profile-sheet').addEventListener('click', e => {
      if (e.target.id === 'profile-sheet' || e.target.closest('[data-close]')) $('#profile-sheet').hidden = true;
    });

    /* keyboard */
    window.addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
      if (e.key === 'Escape') { closePalette(); $('#profile-sheet').hidden = true; return; }
      if (typing) return;
      const map = { '0': 'learn', '1': 'graph', '2': 'study', '3': 'arena', '4': 'vault', '5': 'diag', '6': 'mesh' };
      if (map[e.key]) AX.route(map[e.key]);
    });

    /* mobile drawer */
    $('#menu-btn').onclick = () => document.body.classList.toggle('rail-open');

    /* keep canvases crisp */
    window.addEventListener('resize', () => {
      if (AX.graph) AX.graph.resize();
      if (AX.state.view === 'diag') AX.Diag.render();
    });

    AX.on('refresh', () => { paintHeader(); paintIntel(); paintInspector(); });
    AX.on('flash-node', id => {
      if (AX.graph) AX.graph.flash(id, 2000);
      AX.state.selected = id;
      paintInspector();
    });

    AX.route('graph');
    setTimeout(() => {
      AX.toast('AXIOM online', '37 papers · 9 study packs · 7 views loaded.', 'good');
    }, 900);
    setTimeout(() => paintHeader(), 500);
  }

  initStars();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
