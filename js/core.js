/* ═══════════════════════════════════════════════════════════
   AXIOM · core — state, memory model, grading, prediction
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX = window.AX || {};

  /* ── tiny event bus ───────────────────────────────────── */
  const handlers = {};
  AX.on = (evt, fn) => (handlers[evt] = handlers[evt] || []).push(fn);
  AX.emit = (evt, payload) => (handlers[evt] || []).forEach(fn => { try { fn(payload); } catch (e) { console.warn(e); } });

  /* ── helpers ──────────────────────────────────────────── */
  const clamp = AX.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  AX.lerp = (a, b, t) => a + (b - a) * t;
  AX.pct = (v, d = 0) => (v * 100).toFixed(d) + '%';
  AX.sig = x => 1 / (1 + Math.exp(-x));
  AX.avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  AX.uid = () => Math.random().toString(36).slice(2, 9);
  AX.now = () => Date.now();

  /* ── state ────────────────────────────────────────────── */
  const DEFAULT_PROFILE = {
    alias: 'aarav-node',
    xp: 2480, level: 7, streak: 12,
    attempts: [],          // {qid, predicted, correct, difficulty, ts}
    predictions: [],       // calibration pairs
    bugs: {},              // taxonomy key -> count
    reviews: [],           // {node, ts, type}
    traces: [],            // root-cause traces
    meshPackets: 0,
    lastActive: Date.now()
  };

  AX.state = {
    view: 'graph',
    selected: null,
    forecastDays: 0,
    mode: 'intuition',
    nodes: [],
    profile: JSON.parse(JSON.stringify(DEFAULT_PROFILE)),
    arena: null,
    studyNode: 'rotation',
    vault: { q: '', year: 'all', stream: 'all', diff: 'all', topics: [], open: null },
    graph: { autoRotate: true }
  };

  /* seed node runtime copies */
  AX.state.nodes = NODES.map(n => ({ ...n, mastery: n.mastery, daysSince: n.days }));

  /* ── persistence ──────────────────────────────────────── */
  const KEY = 'axiom.state.v3';
  AX.persist = function () {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        nodes: AX.state.nodes.map(n => ({ id: n.id, mastery: n.mastery, daysSince: n.daysSince })),
        profile: AX.state.profile, studyNode: AX.state.studyNode
      }));
    } catch (e) { /* private mode — run ephemeral */ }
  };
  AX.restore = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.nodes) s.nodes.forEach(saved => {
        const n = AX.getNode(saved.id);
        if (n) { n.mastery = saved.mastery; n.daysSince = saved.daysSince; }
      });
      if (s.profile) AX.state.profile = Object.assign(AX.state.profile, s.profile);
      if (s.studyNode) AX.state.studyNode = s.studyNode;
    } catch (e) { /* ignore corrupt state */ }
  };
  AX.resetProgress = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    AX.state.nodes = NODES.map(n => ({ ...n }));
    AX.state.profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
    AX.emit('refresh');
  };

  AX.getNode = id => AX.state.nodes.find(n => n.id === id);
  AX.dependentsOf = id => AX.state.nodes.filter(n => n.deps.includes(id));

  /* transitive ancestor closure */
  AX.ancestorsOf = function (id, seen = new Set()) {
    const node = AX.getNode(id); if (!node) return seen;
    node.deps.forEach(d => { if (!seen.has(d)) { seen.add(d); AX.ancestorsOf(d, seen); } });
    return seen;
  };

  /* ── memory model ─────────────────────────────────────── */
  /* stability grows with mastery — stronger memories decay slower */
  AX.stability = n => Math.max(1.5, n.hl * (0.55 + 1.15 * n.mastery));

  AX.retentionOf = function (n, extraDays = 0) {
    const t = Math.max(0, n.daysSince + extraDays);
    return clamp(Math.exp(-t / AX.stability(n)), 0.02, 1);
  };

  AX.meanMastery = () => AX.avg(AX.state.nodes.map(n => n.mastery));
  AX.meanRetention = (extra = 0) => AX.avg(AX.state.nodes.map(n => AX.retentionOf(n, extra)));

  /* impact = how many concepts sit downstream of this node */
  AX.impactOf = function (id) {
    let count = 0;
    AX.state.nodes.forEach(n => { if (n.id !== id && AX.ancestorsOf(n.id).has(id)) count++; });
    return count;
  };

  AX.isBottleneck = n => n.mastery < 0.45 && AX.impactOf(n.id) >= 1;

  AX.nodeState = function (n, extra = 0) {
    const r = AX.retentionOf(n, extra);
    if (AX.isBottleneck(n)) return 'critical';
    if (r < 0.62) return 'decay';
    if (n.mastery < 0.7) return 'learning';
    return 'mastery';
  };

  AX.STATE_RGB = {
    mastery: [63, 122, 82],
    learning: [154, 107, 63],
    decay: [184, 134, 11],
    critical: [184, 84, 80]
  };
  AX.STATE_HEX = { mastery: '#3f7a52', learning: '#9a6b3f', decay: '#b8860b', critical: '#b85450' };
  AX.STATE_LABEL = { mastery: 'mastered', learning: 'learning', decay: 'decaying', critical: 'bottleneck' };

  AX.bottlenecks = function () {
    return AX.state.nodes
      .filter(AX.isBottleneck)
      .sort((a, b) => (a.mastery - b.mastery) || (AX.impactOf(b.id) - AX.impactOf(a.id)));
  };

  /* ── review scheduling ────────────────────────────────── */
  const THRESHOLD = 0.72;
  AX.hoursUntilReview = function (n) {
    const stab = AX.stability(n);
    const target = -stab * Math.log(THRESHOLD);      // days at which R hits threshold
    const dueIn = target - n.daysSince;
    return dueIn * 24;
  };
  AX.reviewQueue = function () {
    return AX.state.nodes
      .map(n => ({ node: n, hours: AX.hoursUntilReview(n), retention: AX.retentionOf(n) }))
      .sort((a, b) => a.hours - b.hours);
  };
  AX.dueCount = () => AX.state.nodes.filter(n => AX.retentionOf(n) < THRESHOLD).length;

  AX.logReview = function (id, quality = 1) {
    const n = AX.getNode(id); if (!n) return;
    n.daysSince = 0;
    n.mastery = clamp(n.mastery + 0.10 * (1 - n.mastery) * quality, 0.05, 1);
    AX.state.profile.reviews.unshift({ node: id, ts: AX.now(), type: 'maintenance' });
    AX.state.profile.xp += 25;
    AX.logDailyActivity();
    AX.persist();
    AX.emit('refresh');
  };

  /* ── prediction model ─────────────────────────────────── */
  AX.predictSuccess = function (q, fatigue = 0) {
    const ids = (q.chain || [q.node]).filter(id => AX.getNode(id));
    const ms = ids.map(id => AX.getNode(id));
    const m = AX.avg(ms.map(n => n.mastery));
    const r = AX.avg(ms.map(n => AX.retentionOf(n)));
    const hist = AX.state.profile.attempts;
    const acc = hist.length ? AX.avg(hist.slice(0, 20).map(a => a.correct ? 1 : 0)) : 0.6;
    const z = 3.4 * (0.5 * m + 0.5 * r - q.difficulty) + 0.95 + (acc - 0.6) * 1.5 - fatigue * 1.4;
    return clamp(AX.sig(z), 0.05, 0.97);
  };

  AX.recordPrediction = function (q, predicted) {
    q._predicted = predicted;
  };

  /* ── symbolic grading ─────────────────────────────────── */
  const ALLOWED = /^(Math|PI|E|exp|log|sqrt|sin|cos|tan|asin|acos|atan|abs|min|max|pow|floor|ceil|round|sign|hypot)$/;
  const SANITIZE = /^[0-9a-zA-Z_$.+\-*/%()<>=!?:,[\]\s]*$/;

  function compileExpr(expr, varNames) {
    if (typeof expr !== 'string' || !expr.trim()) throw new Error('empty expression');
    let src = expr.trim().replace(/\^/g, '**').replace(/π/g, 'Math.PI').replace(/×/g, '*').replace(/÷/g, '/');
    if (!SANITIZE.test(src)) throw new Error('unsupported character');
    const idents = src.match(/[A-Za-z_$][\w$]*/g) || [];
    for (const id of idents) {
      if (varNames.includes(id)) continue;
      if (/^Math$/.test(id)) continue;
      if (ALLOWED.test(id)) continue;
      if (/^(true|false|null|undefined)$/.test(id)) continue;
      throw new Error('unknown identifier “' + id + '”');
    }
    const js = /Math\.|PI|E|exp|log|sqrt|sin|cos|tan|abs|min|max|pow/.test(src) ? src : src; // expressions are pure
    return new Function(...varNames, 'return (' + js + ');');
  }

  AX.checkNumeric = function (given, expected, tol) {
    const clean = String(given).replace(/[,\s]/g, '').replace(/[()]/g, '');
    if (!clean) return { ok: false, reason: 'No answer submitted.', value: NaN };
    if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(clean)) {
      /* tolerate simple fractions like 1/3 */
      try {
        const v = compileExpr(clean, [])();
        if (!isFinite(v)) throw 0;
        return Math.abs(v - expected) <= Math.max(tol, Math.abs(expected) * 1e-6)
          ? { ok: true, value: v } : { ok: false, value: v, reason: 'Value is correct in form but off numerically.', expected };
      } catch (e) {
        return { ok: false, reason: 'That is not a number. Use digits, decimals or a simple fraction.', value: NaN };
      }
    }
    const v = parseFloat(clean);
    const ok = Math.abs(v - expected) <= Math.max(tol, Math.abs(expected) * 1e-6);
    return { ok, value: v, expected };
  };

  AX.checkExpr = function (given, expected, vars) {
    if (!given || !given.trim()) return { ok: false, reason: 'No expression submitted.' };
    const names = Object.keys(vars || {});
    let userFn, oracleFn;
    try { userFn = compileExpr(given, names); }
    catch (e) { return { ok: false, reason: e.message, kind: 'compile' }; }
    try { oracleFn = compileExpr(expected, names); } catch (e) { return { ok: false, reason: 'oracle failed' }; }
    const samples = [];
    const n = names.length ? vars[names[0]].length : 1;
    for (let i = 0; i < n; i++) {
      const args = names.map(k => vars[k][i]);
      let u, o;
      try { u = userFn(...args); } catch (e) { return { ok: false, reason: 'Expression could not be evaluated: ' + e.message, kind: 'runtime' }; }
      try { o = oracleFn(...args); } catch (e) { return { ok: false, reason: 'oracle failed' }; }
      if (typeof u !== 'number' || !isFinite(u)) return { ok: false, reason: 'Expression did not produce a finite number.', kind: 'runtime' };
      samples.push([u, o]);
    }
    const ok = samples.every(([u, o]) => Math.abs(u - o) <= 1e-6 * Math.max(1, Math.abs(o)));
    return { ok, samples };
  };

  const BANNED = /\b(window|document|globalThis|self|top|parent|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|eval|Function|import|require|process|alert|open|constructor|__proto__|prototype|WebSocket|Worker)\b/;

  AX.checkCode = function (code, tests) {
    if (!code || !code.trim()) return { ok: false, reason: 'No code submitted.' };
    if (BANNED.test(code)) return { ok: false, reason: 'Restricted token used — the sandbox only allows pure computation.' };
    if (/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/.test(code)) return { ok: false, reason: 'Unbounded loop rejected by the sandbox.' };
    let fn;
    try {
      fn = new Function('return (' + code + ');')();
    } catch (e) { return { ok: false, reason: 'Parse error: ' + e.message, kind: 'compile' }; }
    if (typeof fn !== 'function') return { ok: false, reason: 'Expected a function. Wrap your solution as (args) => { … }.' };
    for (let i = 0; i < tests.length; i++) {
      const [args, expected] = tests[i];
      let got;
      try { got = fn(args); } catch (e) { return { ok: false, reason: 'Runtime error on test ' + (i + 1) + ': ' + e.message, kind: 'runtime' }; }
      const same = Array.isArray(expected)
        ? Array.isArray(got) && expected.length === got.length && expected.every((v, j) => v === got[j])
        : (typeof expected === 'number' ? Math.abs(got - expected) < 1e-9 : got === expected);
      if (!same) return { ok: false, reason: 'Test ' + (i + 1) + ' failed: expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(got), kind: 'runtime', testsPassed: i };
    }
    return { ok: true, testsPassed: tests.length };
  };

  /* ── cognitive bug classifier ─────────────────────────── */
  AX.classifyBug = function (step, result, given) {
    const g = Number(result && result.value);
    const e = step.answer !== undefined ? Number(step.answer) : NaN;
    const txt = String(given || '');
    if (!txt.trim()) return BUG_TAXONOMY.find(b => b.key === 'empty');
    if (result && result.kind === 'compile') return BUG_TAXONOMY.find(b => b.key === 'precedence');
    if (result && result.kind === 'runtime' && /undefined|not defined|undefined variable|unknown identifier/i.test(result.reason || ''))
      return BUG_TAXONOMY.find(b => b.key === 'undefined');
    if (/[a-zA-Z]/.test(txt) && /\b(sin|cos|tan|log|sqrt|exp)\b/.test(txt) && !/Math\./.test(txt))
      return BUG_TAXONOMY.find(b => b.key === 'undefined');
    if (isFinite(g) && isFinite(e)) {
      if (e !== 0 && Math.abs(g + e) <= Math.max(step.tol || .01, Math.abs(e) * .02)) return BUG_TAXONOMY.find(b => b.key === 'sign');
      if (e !== 0 && (Math.abs(g - 2 * e) <= Math.abs(e) * .02 || Math.abs(g - e / 2) <= Math.abs(e) * .02)) return BUG_TAXONOMY.find(b => b.key === 'factor2');
      if (Math.abs(g - e) <= Math.max((step.tol || .01) * 6, Math.abs(e) * .03)) return BUG_TAXONOMY.find(b => b.key === 'precision');
      if (Math.abs(Math.abs(g - e) - 1) < 1e-6) return BUG_TAXONOMY.find(b => b.key === 'offbyone');
    }
    return BUG_TAXONOMY.find(b => b.key === 'logic');
  };

  AX.stampBug = function (bug) {
    if (!bug) return;
    const p = AX.state.profile;
    p.bugs[bug.key] = (p.bugs[bug.key] || 0) + 1;
    AX.persist();
  };

  /* ── root bottleneck tracing ──────────────────────────── */
  AX.traceRoots = function (nodeId) {
    const ancestors = [...AX.ancestorsOf(nodeId)].map(id => AX.getNode(id)).filter(Boolean);
    const chain = [AX.getNode(nodeId), ...ancestors].filter(Boolean);
    if (!chain.length) return [];
    /* weakest ancestor, weighted by how deep it sits below the failing node */
    const weighted = chain.map((n, i) => ({ n, i, score: n.mastery + i * 0.045 }));
    weighted.sort((a, b) => a.score - b.score);
    const root = weighted[0].n;
    const path = [];
    /* walk from the failing node back to the chosen root by weakest-parent descent */
    let cur = AX.getNode(nodeId);
    const guard = new Set();
    while (cur && !guard.has(cur.id)) {
      guard.add(cur.id);
      path.unshift(cur);
      if (cur.id === root.id) break;
      const parents = cur.deps.map(id => AX.getNode(id)).filter(Boolean);
      if (!parents.length) break;
      parents.sort((a, b) => a.mastery - b.mastery);
      cur = parents[0];
    }
    return { root, path };
  };

  AX.flashNode = function (id) {
    AX.state.selected = id;
    AX.emit('flash-node', id);
  };

  /* ── mastery updates ──────────────────────────────────── */
  AX.awardStep = function (nodeId, amount = 0.015) {
    const n = AX.getNode(nodeId); if (!n) return;
    n.mastery = clamp(n.mastery + amount * (1 - n.mastery), 0, 1);
    n.daysSince = Math.max(0, n.daysSince * 0.5);
  };

  AX.completeQuestion = function (q, accuracy = 1) {
    const n = AX.getNode(q.node);
    if (n) {
      n.mastery = clamp(n.mastery + 0.11 * accuracy * (1 - n.mastery), 0, 1);
      n.daysSince = 0;
    }
    (q.chain || []).forEach(id => {
      const a = AX.getNode(id); if (a && a.id !== q.node) a.mastery = clamp(a.mastery + 0.02 * accuracy, 0, 1);
    });
    AX.state.profile.xp += Math.round(60 * accuracy);
    AX.state.profile.streak += 0;
    AX.state.profile.attempts.unshift({ qid: q.id, predicted: q._predicted || 0, correct: accuracy > .6, difficulty: q.difficulty, ts: AX.now() });
    AX.state.profile.attempts = AX.state.profile.attempts.slice(0, 60);
    AX.logDailyActivity();
    AX.persist();
    AX.emit('refresh');
  };

  /* ── calibration ──────────────────────────────────────── */
  AX.calibration = function () {
    const a = AX.state.profile.attempts.filter(x => x.predicted > 0).slice(0, 40);
    if (!a.length) return { buckets: [0, 0, 0, 0, 0], n: 0, brier: 0 };
    const buckets = [0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0];
    let brier = 0;
    a.forEach(x => {
      const i = clamp(Math.floor(x.predicted * 5), 0, 4);
      counts[i]++; buckets[i] += x.correct ? 1 : 0;
      brier += Math.pow(x.predicted - (x.correct ? 1 : 0), 2);
    });
    return {
      buckets: buckets.map((v, i) => counts[i] ? v / counts[i] : 0),
      counts, n: a.length, brier: (brier / a.length)
    };
  };

  /* ── toasts ───────────────────────────────────────────── */
  AX.toast = function (title, body, kind = 'info') {
    const stack = document.getElementById('toasts');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    const icon = kind === 'good' ? 'i-check' : kind === 'bad' ? 'i-x' : kind === 'warn' ? 'i-bolt' : 'i-spark';
    el.innerHTML = '<div class="ti"><svg class="ic"><use href="#' + icon + '"/></svg></div>' +
      '<div><b>' + title + '</b>' + (body || '') + '</div>';
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 4200);
  };

  AX.logDailyActivity = function () {
    const today = new Date().toISOString().slice(0, 10);
    const p = AX.state.profile;
    if (!p.dailyActivity) p.dailyActivity = [];
    if (!p.dailyActivity.includes(today)) {
      p.dailyActivity.push(today);
      p.dailyActivity = p.dailyActivity.slice(-365); // keep last year
    }
    AX.persist();
  };

  /* ── generative synthetic deficit testing ─────────────── */
  AX.weakestPair = function () {
    const scored = AX.state.nodes
      .filter(n => AX.impactOf(n.id) >= 1)
      .map(n => ({ n, score: n.mastery * .68 + AX.retentionOf(n) * .32 }))
      .sort((a, b) => a.score - b.score);
    if (scored.length >= 2) return [scored[0].n, scored[1].n];
    return [AX.state.nodes[0], AX.state.nodes[1]];
  };

  function mulberry(seed) {
    let a = seed >>> 0;
    return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  AX.synthesizeQuestion = function (opts = {}) {
    const pair = AX.weakestPair();
    const target = AX.getNode(opts.target) || pair[0];
    const second = AX.getNode(opts.second) || pair.find(n => n.id !== target.id) || pair[1];
    const r = mulberry((Date.now() % 100000) + 7);
    const pick = arr => arr[Math.floor(r() * arr.length)];
    const B = (min, max) => min + r() * (max - min);
    const H = (a, b, c, d) => [a, b, c, d].filter(Boolean);

    const templates = {
      shm() {
        const m = pick([.4, .5, .8, 1.2]), k = pick([100, 200, 320, 500]), A = pick([.06, .08, .1, .12]);
        const om = Math.sqrt(k / m), vmax = om * A, E = .5 * k * A * A, amax = om * om * A;
        return {
          prompt: 'A ' + m + ' kg block on a frictionless surface is attached to a spring of stiffness ' + k + ' N/m and released from rest at x = ' + A + ' m.',
          given: ['m = ' + m + ' kg', 'k = ' + k + ' N/m', 'A = ' + A + ' m'],
          steps: [
            { kind: 'num', prompt: 'Angular frequency ω.', unit: 'rad/s', answer: om, tol: .02,
              hints: H('ω depends on both stiffness and inertia.', 'ω = √(k/m).', '√(' + k + '/' + m + ') = ' + om.toFixed(3), 'ω ≈ ' + om.toFixed(2) + ' rad/s') },
            { kind: 'num', prompt: 'Maximum speed.', unit: 'm/s', answer: vmax, tol: .01,
              hints: H('Speed peaks at equilibrium.', 'v_max = ωA.', om.toFixed(2) + ' × ' + A, 'v_max ≈ ' + vmax.toFixed(3) + ' m/s') },
            { kind: 'num', prompt: 'Total mechanical energy.', unit: 'J', answer: E, tol: .01,
              hints: H('At the turning point, all energy is potential.', 'E = ½kA².', 'A² = ' + (A * A).toFixed(4), 'E ≈ ' + E.toFixed(3) + ' J') },
            { kind: 'num', prompt: 'Maximum acceleration magnitude.', unit: 'm/s²', answer: amax, tol: .02,
              hints: H('Acceleration is largest at maximum displacement.', 'a_max = ω²A.', 'ω² = ' + (om * om).toFixed(2), 'a_max ≈ ' + amax.toFixed(2) + ' m/s²') }
          ]
        };
      },
      integration() {
        const a = pick([1, 2, 3]);
        const e2 = Math.exp(2);
        return {
          prompt: 'Consider ∫ ' + a + 'x·eˣ dx. Derive the antiderivative, then evaluate it over two intervals.',
          given: ['∫ ' + a + 'x eˣ dx', 'bounds 0 → 1 and 0 → 2'],
          steps: [
            { kind: 'expr', prompt: 'Antiderivative of ' + a + 'x·eˣ, in terms of x.',
              vars: { x: [.37, 1.21, 2.02] }, answer: a + '*(x-1)*Math.exp(x)',
              hints: H('Take u = x, dv = eˣ dx.', '∫u dv = uv − ∫v du.', '= x eˣ − eˣ = eˣ(x−1).', 'Multiply by ' + a + ': ' + a + '(x−1)eˣ') },
            { kind: 'num', prompt: 'Evaluate ∫₀¹ ' + a + 'x eˣ dx.', unit: '', answer: a, tol: .01,
              hints: H('Apply F(1) − F(0).', 'F(1) = 0.', 'F(0) = −' + a + '.', '0 − (−' + a + ') = ' + a) },
            { kind: 'num', prompt: 'Evaluate ∫₀² ' + a + 'x eˣ dx.', unit: '', answer: a * (e2 + 1), tol: .05,
              hints: H('Same antiderivative.', 'F(2) = ' + a + '(1)e².', 'F(0) = −' + a + '.', a + '(e² + 1) ≈ ' + (a * (e2 + 1)).toFixed(3)) }
          ]
        };
      },
      dp() {
        const n = 8 + Math.floor(r() * 3);
        const arr = Array.from({ length: n }, () => Math.floor(B(-7, 10)));
        let best = -Infinity, cur = 0;
        arr.forEach(x => { cur = Math.max(x, cur + x); best = Math.max(best, cur); });
        return {
          prompt: 'Synthesised array: [' + arr.join(', ') + ']. Find the maximum contiguous subarray sum using the recurrence you already derived.',
          given: ['n = ' + n, 'elements ∈ [-7, 9]'],
          steps: [
            { kind: 'expr', prompt: 'Best sum ending at i, given prev and ai.',
              vars: { prev: [-3, 4, -1, 2], ai: [2, -5, 3, -1] }, answer: 'Math.max(ai, prev + ai)',
              hints: H('Extend or restart.', 'prev + ai vs ai.', 'Take the maximum.', 'Math.max(prev + ai, ai)') },
            { kind: 'num', prompt: 'Maximum contiguous sum of this array.', unit: '', answer: best, tol: .001,
              hints: H('Scan once, carrying a running sum.', 'cur = max(x, cur + x).', 'Record the best cur seen.', 'The maximum is ' + best) },
            { kind: 'num', prompt: 'The optimal algorithm runs in O(n^k). Give k.', unit: '', answer: 1, tol: .001,
              hints: H('One pass.', 'No nested loop.', 'Linear.', 'k = 1') }
          ]
        };
      },
      kinematics() {
        const v0 = pick([12, 16, 20, 24]), ang = pick([30, 45, 60]);
        const a = ang * Math.PI / 180, vy = v0 * Math.sin(a), vx = v0 * Math.cos(a), tf = 2 * vy / 9.8;
        return {
          prompt: 'A projectile is launched at ' + v0 + ' m/s at ' + ang + '° from level ground. g = 9.8 m/s², no air resistance.',
          given: ['v₀ = ' + v0 + ' m/s', 'θ = ' + ang + '°', 'g = 9.8'],
          steps: [
            { kind: 'num', prompt: 'Vertical component of launch velocity.', unit: 'm/s', answer: vy, tol: .05,
              hints: H('Resolve into axes.', 'v_y = v₀ sin θ.', v0 + ' × sin ' + ang + '°', 'v_y ≈ ' + vy.toFixed(2) + ' m/s') },
            { kind: 'num', prompt: 'Time of flight.', unit: 's', answer: tf, tol: .03,
              hints: H('Time up equals time down.', 't = 2v_y / g.', '2 × ' + vy.toFixed(2) + ' / 9.8', 't ≈ ' + tf.toFixed(3) + ' s') },
            { kind: 'num', prompt: 'Horizontal range.', unit: 'm', answer: vx * tf, tol: .2,
              hints: H('Horizontal speed is constant.', 'x = vₓ t.', 'vₓ = ' + vx.toFixed(2), 'range ≈ ' + (vx * tf).toFixed(2) + ' m') }
          ]
        };
      },
      electrostatics() {
        const C0 = pick([2, 3, 4]), V0 = pick([10, 12, 20]), kap = pick([2, 3, 4]);
        const Q = C0 * V0, Cn = kap * C0, Vn = V0 / kap, U = .5 * Cn * Vn * Vn;
        return {
          prompt: 'A ' + C0 + ' µF capacitor is charged to ' + V0 + ' V and disconnected. A dielectric of κ = ' + kap + ' is then inserted.',
          given: ['C₀ = ' + C0 + ' µF', 'V₀ = ' + V0 + ' V', 'κ = ' + kap, 'battery disconnected'],
          steps: [
            { kind: 'num', prompt: 'Plate charge.', unit: 'µC', answer: Q, tol: .05,
              hints: H('Charge is frozen once disconnected.', 'Q = C₀V₀.', C0 + ' × ' + V0, 'Q = ' + Q + ' µC') },
            { kind: 'num', prompt: 'Capacitance after insertion.', unit: 'µF', answer: Cn, tol: .03,
              hints: H('The dielectric multiplies C.', 'C = κC₀.', kap + ' × ' + C0, 'C = ' + Cn + ' µF') },
            { kind: 'num', prompt: 'New potential difference.', unit: 'V', answer: Vn, tol: .02,
              hints: H('Charge is conserved.', 'V = Q/C.', Q + ' / ' + Cn, 'V = ' + Vn + ' V') },
            { kind: 'num', prompt: 'Energy stored after insertion.', unit: 'µJ', answer: U, tol: .05,
              hints: H('Use the new C and V.', 'U = ½CV².', '½ × ' + Cn + ' × ' + Vn + '²', 'U = ' + U + ' µJ') }
          ]
        };
      },
      vectors() {
        const mag = pick([2, 3, 4, 5]), ang = pick([30, 45, 60]);
        const a = ang * Math.PI / 180, cx = mag * Math.cos(a), cy = mag * Math.sin(a);
        return {
          prompt: 'A vector v has magnitude ' + mag + ' and makes ' + ang + '° with the positive x-axis.',
          given: ['|v| = ' + mag, 'θ = ' + ang + '°'],
          steps: [
            { kind: 'num', prompt: 'x-component vₓ = |v|cosθ.', unit: '', answer: cx, tol: .02,
              hints: H('Project onto x.', 'vₓ = |v| cos θ.', mag + ' × cos ' + ang + '°', 'vₓ ≈ ' + cx.toFixed(3)) },
            { kind: 'num', prompt: 'y-component v_y = |v|sinθ.', unit: '', answer: cy, tol: .02,
              hints: H('Project onto y.', 'v_y = |v| sin θ.', mag + ' × sin ' + ang + '°', 'v_y ≈ ' + cy.toFixed(3)) },
            { kind: 'num', prompt: 'v · v (the squared magnitude).', unit: '', answer: mag * mag, tol: .001,
              hints: H('Dot with itself.', 'v·v = vₓ² + v_y².', 'Same as |v|².', '= ' + (mag * mag)) }
          ]
        };
      }
    };

    const keyOf = id => (templates[id] ? id : 'kinematics');
    const tpl = templates[keyOf(target.id)]();
    const difficulty = clamp(1 - (target.mastery * .55 + second.mastery * .2) + .12, .3, .95);

    return {
      id: 'synth-' + Date.now(),
      synth: true,
      node: target.id,
      chain: [...new Set([target.id, second.id, ...(AX.ancestorsOf(target.id) || [])])],
      title: 'Synthetic drill · ' + target.label + ' ∩ ' + second.label,
      tag: target.subject + ' · generative',
      difficulty,
      minutes: 7,
      prompt: tpl.prompt,
      given: tpl.given,
      steps: tpl.steps,
      _targets: [target.label, second.label]
    };
  };

  AX.levelFromXp = xp => Math.floor(xp / 1000) + 1;

  /* ── boot restore ─────────────────────────────────────── */
  AX.restore();
  AX.state.profile.level = AX.levelFromXp(AX.state.profile.xp);

  window.addEventListener('beforeunload', () => AX.persist());
})();
