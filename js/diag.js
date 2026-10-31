/* ═══════════════════════════════════════════════════════════
   AXIOM · diagnostics
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  let decayNodeId = null;

  function fit(cv) {
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    if (cv.width !== Math.floor(w * dpr) || cv.height !== Math.floor(h * dpr)) {
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return { w, h, ctx: cv.getContext('2d') };
  }

  /* ── radar ────────────────────────────────────────────── */
  function radar() {
    const cv = document.getElementById('radar-canvas');
    if (!cv) return;
    const { w, h, ctx } = fit(cv);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2 + 4;
    const R = Math.min(w, h) * .31;
    const subs = ['Physics', 'Mathematics', 'Computer Science'];
    const angles = subs.map((_, i) => -Math.PI / 2 + i * Math.PI * 2 / 3);

    /* rings */
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      angles.forEach((a, i) => {
        const x = cx + Math.cos(a) * R * ring / 4, y = cy + Math.sin(a) * R * ring / 4;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(120,180,230,' + (0.16 - ring * .02) + ')';
      ctx.lineWidth = 1; ctx.stroke();
    }
    /* axes */
    angles.forEach((a, i) => {
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.strokeStyle = 'rgba(120,180,230,.14)'; ctx.stroke();
      const lx = cx + Math.cos(a) * (R + 22), ly = cy + Math.sin(a) * (R + 22);
      ctx.fillStyle = 'rgba(200,218,245,.8)';
      ctx.font = '500 10.5px "Segoe UI", system-ui';
      ctx.textAlign = Math.abs(Math.cos(a)) < .2 ? 'center' : Math.cos(a) > 0 ? 'left' : 'right';
      ctx.fillText(subs[i].replace('Computer Science', 'CS'), lx, ly + 3);
    });

    const avg = subj => {
      const ns = AX.state.nodes.filter(n => n.subject === subj);
      return { m: AX.avg(ns.map(n => n.mastery)), r: AX.avg(ns.map(n => AX.retentionOf(n))) };
    };
    const series = [
      { key: 'm', color: 'rgba(55,240,165,', fill: 'rgba(55,240,165,.16)' },
      { key: 'r', color: 'rgba(60,232,255,', fill: 'rgba(60,232,255,.10)' }
    ];
    series.forEach(s => {
      ctx.beginPath();
      subs.forEach((sub, i) => {
        const v = avg(sub)[s.key];
        const x = cx + Math.cos(angles[i]) * R * v, y = cy + Math.sin(angles[i]) * R * v;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = s.fill; ctx.fill();
      ctx.strokeStyle = s.color + '.9)'; ctx.lineWidth = 1.6;
      ctx.shadowColor = s.color + '.8)'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      subs.forEach((sub, i) => {
        const v = avg(sub)[s.key];
        const x = cx + Math.cos(angles[i]) * R * v, y = cy + Math.sin(angles[i]) * R * v;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7);
        ctx.fillStyle = s.color + '1)'; ctx.fill();
      });
    });

    /* centre readout */
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(233,237,247,.92)';
    ctx.font = '600 18px "Segoe UI", system-ui';
    ctx.fillText(Math.round(AX.meanMastery() * 100) + '%', cx, cy + 4);
    ctx.font = '9px "Segoe UI", system-ui';
    ctx.fillStyle = 'rgba(154,166,192,.8)';
    ctx.fillText('MASTERY', cx, cy + 17);
  }

  /* ── decay curve ──────────────────────────────────────── */
  function decay() {
    const cv = document.getElementById('decay-canvas');
    if (!cv) return;
    const { w, h, ctx } = fit(cv);
    ctx.clearRect(0, 0, w, h);

    const node = AX.getNode(decayNodeId) || AX.bottlenecks()[0] || AX.state.nodes[0];
    if (!node) return;
    decayNodeId = node.id;
    const tag = document.getElementById('decay-node');
    if (tag) tag.textContent = node.label;

    const R0 = AX.retentionOf(node);
    const stab = AX.stability(node);
    const maxT = Math.max(30, Math.ceil(stab * 3));
    const padL = 40, padR = 16, padT = 14, padB = 26;
    const gw = w - padL - padR, gh = h - padT - padB;

    /* grid */
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + gh * i / 4;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.font = '8.5px "Segoe UI"'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(100 - i * 25) + '%', padL - 7, y + 3);
    }
    for (let i = 0; i <= 4; i++) {
      const x = padL + gw * i / 4;
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.textAlign = 'center';
      ctx.fillText(Math.round(maxT * i / 4) + 'd', x, h - 8);
    }

    const xOf = t => padL + (t / maxT) * gw;
    const yOf = r => padT + (1 - r) * gh;

    /* threshold */
    ctx.save();
    ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(255,77,109,.5)';
    ctx.beginPath(); ctx.moveTo(padL, yOf(.72)); ctx.lineTo(w - padR, yOf(.72)); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,120,140,.65)'; ctx.font = '8px "Segoe UI"'; ctx.textAlign = 'left';
    ctx.fillText('review threshold 72%', padL + 4, yOf(.72) - 5);

    /* curve */
    const grad = ctx.createLinearGradient(padL, 0, w - padR, 0);
    grad.addColorStop(0, '#ffc154');
    grad.addColorStop(.6, '#ff9e63');
    grad.addColorStop(1, '#ff4d6d');
    ctx.beginPath();
    for (let i = 0; i <= gw; i += 2) {
      const t = i / gw * maxT;
      const r = Math.exp(-(node.daysSince + t) / stab);
      const x = padL + i, y = yOf(r);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = grad; ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255,154,80,.6)'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;

    /* now marker */
    const nowX = xOf(0);
    ctx.beginPath(); ctx.arc(nowX, yOf(R0), 4, 0, 7);
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#ffc154'; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '600 10px "Segoe UI"'; ctx.textAlign = 'left';
    ctx.fillText(Math.round(R0 * 100) + '% now', nowX + 8, yOf(R0) - 8);

    /* due marker */
    const due = AX.hoursUntilReview(node) / 24;
    if (due > 0 && due < maxT) {
      ctx.strokeStyle = 'rgba(255,193,84,.5)'; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(xOf(due), padT); ctx.lineTo(xOf(due), padT + gh); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,193,84,.8)'; ctx.textAlign = 'center'; ctx.font = '8.5px "Segoe UI"';
      ctx.fillText('window opens', xOf(due), padT + 9);
    }
  }

  /* ── calibration bars ─────────────────────────────────── */
  function calibration() {
    const box = document.getElementById('calib');
    if (!box) return;
    const c = AX.calibration();
    const labels = ['0–20', '20–40', '40–60', '60–80', '80–100'];
    box.innerHTML = labels.map((l, i) => {
      const v = c.buckets[i] || 0;
      const height = Math.max(4, v * 100);
      return '<div class="calib-col" title="' + (c.counts ? c.counts[i] : 0) + ' attempts"><i style="height:' + height + '%"></i><small>' + l + '</small></div>';
    }).join('');
    const n = document.getElementById('calib-n');
    if (n) n.textContent = c.n || '0';
    const b = document.getElementById('calib-brier');
    if (b) b.textContent = c.n ? c.brier.toFixed(3) : '—';
  }

  /* ── bugs ─────────────────────────────────────────────── */
  function bugBars() {
    const box = document.getElementById('bug-bars');
    if (!box) return;
    const bugs = AX.state.profile.bugs;
    const rows = BUG_TAXONOMY.map(b => ({ ...b, n: bugs[b.key] || 0 })).sort((a, b) => b.n - a.n).slice(0, 6);
    const max = Math.max(1, ...rows.map(r => r.n));
    box.innerHTML = rows.map(r =>
      '<div class="bbar-row"><span>' + r.label + '</span><div class="bar"><i style="width:' + (r.n / max * 100) + '%;background:' + r.color + '"></i></div><b>' + r.n + '</b></div>'
    ).join('');
  }

  /* ── review windows ───────────────────────────────────── */
  function reviewTable() {
    const box = document.getElementById('review-table');
    if (!box) return;
    const q = AX.reviewQueue().slice(0, 12);
    box.innerHTML = '<div class="rt-row head"><span>concept</span><span>retention</span><span>stability</span><span>window</span><span></span></div>' +
      q.map(({ node, hours, retention }) => {
        const due = hours <= 0;
        const label = due ? 'due now' : hours < 24 ? Math.round(hours) + ' h' : Math.round(hours / 24) + ' d';
        return '<div class="rt-row ' + (due ? 'overdue' : '') + '"><span>' + node.label + '</span>' +
          '<span>' + Math.round(retention * 100) + '%</span>' +
          '<span>' + Math.round(AX.stability(node)) + 'd</span>' +
          '<span>' + label + '</span>' +
          '<span><button class="mini-btn" data-review="' + node.id + '">review</button></span></div>';
      }).join('');
    box.querySelectorAll('[data-review]').forEach(b => b.onclick = () => {
      AX.logReview(b.dataset.review);
      AX.toast('Review logged', 'Stability extended for ' + (AX.getNode(b.dataset.review) || {}).label + '.', 'good');
      render();
    });
  }

  /* ── synthetic deficit preview ────────────────────────── */
  function renderSynth() {
    const box = document.getElementById('synth-preview');
    if (!box) return;
    const q = AX.synthesizeQuestion();
    box.innerHTML =
      '<div class="synth-pair"><b>' + q._targets[0] + '</b><i>∩</i><b>' + q._targets[1] + '</b></div>' +
      '<div class="synth-meta">' + q.steps.length + ' steps · difficulty ' + q.difficulty.toFixed(2) + ' · live parameters</div>' +
      '<p class="panel-note" style="padding:0">New numbers are generated from your current vulnerability profile, so the drill cannot be memorised.</p>';
    return q;
  }

  /* ── trace log ────────────────────────────────────────── */
  function traceLog() {
    const box = document.getElementById('trace-log');
    if (!box) return;
    const t = AX.state.profile.traces;
    if (!t.length) { box.innerHTML = '<p class="empty-note">Run the arena to generate ancestry traces.</p>'; return; }
    box.innerHTML = t.slice(0, 8).map(x =>
      '<div class="trace"><span class="t-step">' + x.tag + '</span><b style="color:var(--txt-2);font-weight:500">' + x.q + '</b><span class="t-arrow">→</span>' +
      x.chain.map((c, i) => '<span class="t-step ' + (i === 0 ? 'weak' : '') + '">' + c + '</span>').join('<span class="t-arrow">›</span>') +
      '</div>'
    ).join('');
  }

  function render() {
    radar(); decay(); calibration(); bugBars(); reviewTable(); traceLog(); renderSynth();
  }

  function init() {
    document.getElementById('diag-export').onclick = () => {
      const payload = {
        learner: 'Aarav Raghavan',
        generated: new Date().toISOString(),
        mastery: AX.meanMastery(),
        retention: AX.meanRetention(),
        profile: AX.state.profile,
        concepts: AX.state.nodes.map(n => ({ id: n.id, label: n.label, mastery: n.mastery, retention: AX.retentionOf(n), stability: AX.stability(n) }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'axiom-profile.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      AX.toast('Profile exported', 'Local JSON — nothing left the device.', 'good');
    };
    document.getElementById('synth-run').onclick = () => {
      const q = AX.synthesizeQuestion();
      AX.toast('Synthetic drill generated', 'Targeting ' + q._targets.join(' ∩ ') + ' · ' + q.steps.length + ' adversarial steps.', 'info');
      AX.startArena(q);
    };
    document.getElementById('diag-review-all').onclick = () => {
      const due = AX.reviewQueue().filter(q => q.hours <= 0);
      due.forEach(q => AX.logReview(q.node.id, .8));
      AX.toast('Review batch complete', due.length + ' due concepts refreshed.', 'good');
      render();
    };
    window.addEventListener('resize', () => { if (AX.state.view === 'diag') render(); });
    AX.on('refresh', () => { if (AX.state.view === 'diag') render(); });
    render();
  }

  AX.Diag = { init, render, setNode: id => { decayNodeId = id; decay(); } };
})();
