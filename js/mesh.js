/* ═══════════════════════════════════════════════════════════
   AXIOM · zero-knowledge peer mesh
   BroadcastChannel + storage fallback · hashed aggregates only
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  const CHANNEL = 'axiom-mesh-v3';
  const STORE_KEY = 'axiom.mesh.packet.v3';

  const NAMES = ['aarav-node', 'kiran-node', 'meera-node', 'ishaan-node', 'zoya-node', 'ravi-node', 'ananya-node'];
  const state = {
    me: null, peers: new Map(), sims: new Map(), packets: [], channel: null,
    salt: Math.random().toString(36).slice(2, 10), seen: new Set(), timer: null, hash: '…'
  };

  function nowTime() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
  }

  function fallbackHash(str) {
    let h1 = 0x811c9dc5, h2 = 0x1000193;
    for (let i = 0; i < str.length; i++) {
      h1 ^= str.charCodeAt(i); h1 = Math.imul(h1, 0x01000193);
      h2 = Math.imul(h2 ^ str.charCodeAt(i), 0x85ebca6b);
    }
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  }

  async function fingerprint(payload) {
    const str = payload + '|' + state.salt;
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* fall through */ }
    return fallbackHash(str).slice(0, 16);
  }

  function meAggregate() {
    const p = AX.state.profile;
    return {
      mastery: AX.meanMastery(),
      retention: AX.meanRetention(),
      streak: p.streak,
      xp: p.xp,
      due: AX.dueCount()
    };
  }

  async function buildMe() {
    if (!state.me) {
      const id = 'nd_' + Math.random().toString(36).slice(2, 10);
      const alias = NAMES[Math.floor(Math.random() * NAMES.length)];
      state.me = { id, alias, joined: Date.now() };
      try { sessionStorage.setItem('axiom.mesh.id', id); } catch (e) {}
    }
    const agg = meAggregate();
    state.hash = await fingerprint(JSON.stringify(agg));
    state.me = { ...state.me, ...agg, fingerprint: state.hash, kind: 'live' };
    paintMe();
  }

  /* ── broadcast ────────────────────────────────────────── */
  function send(type) {
    if (!state.me) return;
    const packet = {
      type, id: state.me.id, alias: state.me.alias,
      mastery: +state.me.mastery.toFixed(3), retention: +state.me.retention.toFixed(3),
      streak: state.me.streak, due: state.me.due,
      fingerprint: state.me.fingerprint, ts: Date.now(), pid: AX.uid()
    };
    try {
      if (state.channel) state.channel.postMessage(packet);
      else localStorage.setItem(STORE_KEY, JSON.stringify(packet));
    } catch (e) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(packet)); } catch (err) {}
    }
    logPacket(type, packet.alias, packet.fingerprint, 'out');
  }

  function ingest(packet) {
    if (!packet || packet.id === state.me.id || state.seen.has(packet.pid)) return;
    state.seen.add(packet.pid);
    if (state.seen.size > 300) state.seen = new Set([...state.seen].slice(-150));
    const prev = state.peers.get(packet.id);
    state.peers.set(packet.id, {
      id: packet.id, alias: packet.alias, mastery: packet.mastery,
      retention: packet.retention, streak: packet.streak, due: packet.due,
      fingerprint: packet.fingerprint, kind: 'live', lastSeen: Date.now(),
      joined: prev ? prev.joined : Date.now()
    });
    logPacket(packet.type, packet.alias, packet.fingerprint, 'in');
    if (packet.type === 'hello') send('ack');
    renderPeers();
  }

  function logPacket(type, alias, fp, dir) {
    state.packets.unshift({ t: nowTime(), type: type.toUpperCase(), alias, fp: fp || '…', dir });
    state.packets = state.packets.slice(0, 60);
    renderLog();
  }

  function prune() {
    const cut = Date.now() - 9000;
    let changed = false;
    state.peers.forEach((p, id) => { if (p.lastSeen < cut) { state.peers.delete(id); changed = true; } });
    if (changed) renderPeers();
  }

  /* ── simulated peers ──────────────────────────────────── */
  function addSim() {
    if (state.sims.size >= 3) { AX.toast('Mesh saturated', 'Maximum 3 simulated peers in the demo.', 'warn'); return; }
    const id = 'sim_' + AX.uid();
    const alias = ['nisha-sim', 'dev-sim', 'tara-sim'][state.sims.size % 3];
    state.sims.set(id, {
      id, alias, kind: 'sim', mastery: .38 + Math.random() * .4,
      retention: .4 + Math.random() * .35, streak: 4 + Math.floor(Math.random() * 20),
      due: 2 + Math.floor(Math.random() * 8), fingerprint: fallbackHash(id + state.salt).slice(0, 16),
      lastSeen: Date.now(), joined: Date.now()
    });
    logPacket('hello', alias, fallbackHash(id + state.salt).slice(0, 16), 'in');
    AX.toast('Simulated peer joined', alias + ' — clearly labelled, never mutates your profile.', 'info');
    renderPeers();
  }

  function tickSims() {
    state.sims.forEach(p => {
      p.mastery = AX.clamp(p.mastery + (Math.random() - .45) * .02, .12, .96);
      p.retention = AX.clamp(p.retention + (Math.random() - .5) * .03, .1, .98);
      p.streak += Math.random() > .94 ? 1 : 0;
      if (Math.random() > .8) logPacket('beat', p.alias, p.fingerprint, 'in');
    });
    if (state.sims.size) renderPeers();
  }

  /* ── rendering ────────────────────────────────────────── */
  function paintMe() {
    const me = state.me; if (!me) return;
    const av = document.getElementById('me-avatar');
    if (av) av.textContent = me.alias.slice(0, 2).toUpperCase();
    const a = document.getElementById('me-alias');
    if (a) a.textContent = me.alias;
    const fp = document.getElementById('me-fingerprint');
    if (fp) fp.textContent = 'fingerprint ' + me.fingerprint + ' · salt ' + state.salt;
    const h = document.getElementById('me-hash');
    if (h) h.textContent = 'sha256(aggregate ∥ salt) = ' + me.fingerprint;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('me-mastery', Math.round((me.mastery || 0) * 100) + '%');
    set('me-streak', (me.streak || 0) + 'd');
    set('me-packets', state.packets.length);
  }

  function peersAll() {
    return [...state.peers.values(), ...state.sims.values()];
  }

  function renderPeers() {
    const grid = document.getElementById('peer-grid');
    if (!grid) return;
    const list = peersAll();
    const count = document.getElementById('peer-count');
    if (count) count.textContent = list.length + ' online';
    const chip = document.getElementById('mesh-chip-txt');
    if (chip) chip.textContent = list.length ? 'mesh · ' + list.length + ' peer' + (list.length > 1 ? 's' : '') : 'mesh online';

    if (!list.length) {
      grid.innerHTML = '<div class="peer" style="grid-column:1/-1;border-style:dashed;text-align:center;padding:26px 14px;color:var(--txt-3);font-size:11px">' +
        'No peers discovered yet.<br><span style="opacity:.75">Open a second tab, or spawn a simulated peer.</span></div>';
      paintMe();
      return;
    }
    const mine = meAggregate();
    grid.innerHTML = list.map(p => {
      const dBadge = p.kind === 'sim' ? '<span class="tag-mini">simulated</span>' : '<span class="tag-mini ok">live tab</span>';
      const delta = (p.mastery - mine.mastery) * 100;
      return '<div class="peer ' + (p.kind === 'sim' ? 'sim' : '') + '">' +
        '<div class="peer-top"><span class="peer-av">' + p.alias.slice(0, 2).toUpperCase() + '</span><b>' + p.alias + '</b>' + dBadge + '</div>' +
        '<div class="peer-bars">' +
        bar('mastery', p.mastery, '#37f0a5') +
        bar('retention', p.retention, '#3ce8ff') +
        '<div class="peer-bar"><span>streak</span><div class="bar"><i style="width:' + Math.min(100, p.streak * 4) + '%;background:#ffc154"></i></div><b>' + p.streak + 'd</b></div>' +
        '</div>' +
        '<div style="margin-top:8px;font-size:9px;color:var(--txt-3);letter-spacing:.04em">' +
        (delta >= 0 ? '+' : '') + delta.toFixed(1) + ' pts vs you · fp ' + p.fingerprint.slice(0, 8) + '…</div>' +
        '</div>';
    }).join('') + peersEmptySlot();
    paintMe();
  }

  function bar(label, v, color) {
    return '<div class="peer-bar"><span>' + label + '</span><div class="bar"><i style="width:' + (v * 100) + '%;background:' + color + '"></i></div><b>' + Math.round(v * 100) + '%</b></div>';
  }

  function peersEmptySlot() {
    return state.sims.size >= 3 ? '' :
      '<button class="peer sim" id="peer-add" style="display:flex;align-items:center;justify-content:center;min-height:118px;color:var(--txt-3);font-size:11px;gap:7px">' +
      '<svg class="ic" style="width:15px;height:15px"><use href="#i-spark"/></svg>spawn simulated peer</button>';
  }

  function renderLog() {
    const box = document.getElementById('packet-log');
    if (!box) return;
    if (!state.packets.length) {
      box.innerHTML = '<div class="pkt"><time>--:--:--</time><b>IDLE</b> waiting for broadcast traffic…</div>';
      return;
    }
    box.innerHTML = state.packets.slice(0, 40).map(p =>
      '<div class="pkt ' + (p.alias.includes('sim') ? 'sim' : '') + '"><time>' + p.t + '</time><b>' + p.type + '</b>' +
      p.alias + ' · fp ' + (p.fp || '…').slice(0, 10) + '… · agg-only</div>'
    ).join('');
    const mp = document.getElementById('me-packets');
    if (mp) mp.textContent = state.packets.length;
  }

  /* ── streak calendar ──────────────────────────────────── */
  function renderStreakCalendar() {
    const cal = document.getElementById('streak-calendar');
    const monthLabel = document.getElementById('streak-month');
    const stats = document.getElementById('streak-stats');
    if (!cal) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (monthLabel) monthLabel.textContent = monthNames[month] + ' ' + year;

    const activity = (AX.state.profile.dailyActivity || []);
    const activitySet = new Set(activity);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = dayLabels.map(d => '<div class="streak-day-label">' + d + '</div>').join('');

    // empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="streak-cell future"></div>';
    }

    let activeDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const isActive = activitySet.has(dateStr);
      if (isActive) activeDays++;
      const isToday = d === today;
      const isFuture = d > today;
      let cls = 'streak-cell';
      if (isActive) cls += ' active';
      if (isToday) cls += ' today';
      if (isFuture) cls += ' future';
      html += '<div class="' + cls + '">' + d + '</div>';
    }

    cal.innerHTML = html;

    if (stats) {
      const streak = AX.state.profile.streak || 0;
      // compute longest streak
      let longest = 0, current = 0;
      const sorted = [...activity].sort();
      for (let i = 0; i < sorted.length; i++) {
        if (i === 0) { current = 1; }
        else {
          const prev = new Date(sorted[i-1]);
          const curr = new Date(sorted[i]);
          const diffDays = (curr - prev) / (1000*60*60*24);
          if (diffDays === 1) current++;
          else current = 1;
        }
        longest = Math.max(longest, current);
      }
      stats.innerHTML = '<span>Current streak: <b>' + streak + ' days</b></span>' +
        '<span>Active this month: <b>' + activeDays + ' days</b></span>' +
        '<span>Longest streak: <b>' + longest + ' days</b></span>' +
        '<span>Total active days: <b>' + activity.length + '</b></span>';
    }
  }
  async function refreshMe() {
    if (!state.me) return;
    const agg = meAggregate();
    state.me = { ...state.me, ...agg };
    state.hash = await fingerprint(JSON.stringify(agg));
    state.me.fingerprint = state.hash;
    paintMe();
  }

  function init() {
    buildMe();

    try { state.channel = new BroadcastChannel(CHANNEL); } catch (e) { state.channel = null; }

    const onPacket = ev => {
      let packet = ev;
      if (ev && ev.data && ev.data.type) packet = ev.data;
      ingest(packet);
    };
    if (state.channel) state.channel.onmessage = onPacket;
    window.addEventListener('storage', e => {
      if (e.key !== STORE_KEY || !e.newValue) return;
      try { ingest(JSON.parse(e.newValue)); } catch (err) {}
    });

    setTimeout(() => send('hello'), 220);
    state.timer = setInterval(() => {
      refreshMe().then(() => send('beat'));
      prune();
      tickSims();
    }, 2600);

    document.getElementById('mesh-sim').onclick = addSim;
    document.getElementById('mesh-tab').onclick = () => {
      const win = window.open(location.href, '_blank');
      if (!win) AX.toast('Popup blocked', 'Allow popups to spawn a second real node.', 'warn');
      else AX.toast('Second node opened', 'That tab joins the mesh with its own identity and hashed aggregate.', 'good');
    };
    document.getElementById('peer-grid').addEventListener('click', e => {
      if (e.target.closest('#peer-add')) addSim();
    });

    renderPeers();
    renderLog();
    renderStreakCalendar();
    AX.on('refresh', () => { refreshMe().then(() => { renderPeers(); paintMe(); renderStreakCalendar(); }); });
  }

  AX.Mesh = { init, render: () => { renderPeers(); renderStreakCalendar(); } };
})();
