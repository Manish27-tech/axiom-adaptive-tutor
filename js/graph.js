/* ═══════════════════════════════════════════════════════════
   AXIOM · 3D knowledge graph
   Hand-rolled perspective engine: orbit, zoom, bloom, raycast.
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  const DEG = Math.PI / 180;

  const SECTORS = {
    Physics: -105,
    Mathematics: 20,
    'Computer Science': 140
  };

  class Graph3D {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.cam = { yaw: -0.42, pitch: 0.26, dist: 6.9, target: null };
      this.target = { yaw: -0.42, pitch: 0.26, dist: 6.9 };
      this.pointer = { down: false, x: 0, y: 0, moved: 0, id: null };
      this.hover = null;
      this.screen = new Map();
      this.flashes = new Map();
      this.lastInteract = 0;
      this.hidden = false;
      this.build();
      this.bind();
      this.resize();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      this.draw(performance.now());
    }

    build() {
      const bySubject = {};
      AX.state.nodes.forEach(n => (bySubject[n.subject] = bySubject[n.subject] || []).push(n));

      Object.entries(bySubject).forEach(([subj, list]) => {
        list.sort((a, b) => a.tier - b.tier || a.id.localeCompare(b.id));
        const base = (SECTORS[subj] ?? 0) * DEG;
        list.forEach((n, i) => {
          const spread = (i - (list.length - 1) / 2) * 0.34;
          const ring = 2.45 + (i % 3) * 0.22 + (n.tier % 2) * 0.28;
          const ang = base + spread;
          n.pos = {
            x: Math.cos(ang) * ring,
            y: (n.tier - 3) * 0.92,
            z: Math.sin(ang) * ring
          };
          n.r = 0.13 + n.mastery * 0.055;
        });
      });
    }

    bind() {
      const c = this.canvas;
      c.addEventListener('pointerdown', e => {
        this.pointer.down = true;
        this.pointer.x = e.clientX; this.pointer.y = e.clientY;
        this.pointer.moved = 0;
        c.setPointerCapture(e.pointerId);
        this.lastInteract = performance.now();
      });
      c.addEventListener('pointermove', e => {
        const rect = c.getBoundingClientRect();
        this.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        if (this.pointer.down) {
          const dx = e.clientX - this.pointer.x;
          const dy = e.clientY - this.pointer.y;
          this.pointer.x = e.clientX; this.pointer.y = e.clientY;
          this.pointer.moved += Math.abs(dx) + Math.abs(dy);
          this.target.yaw += dx * 0.006;
          this.target.pitch = AX.clamp(this.target.pitch + dy * 0.005, -1.15, 1.15);
          this.snap = true;
          this.lastInteract = performance.now();
        } else {
          this.pick();
        }
      });
      const end = () => {
        if (!this.pointer.down) return;
        this.pointer.down = false;
        this.lastInteract = performance.now();
        if (this.pointer.moved < 6 && this.hover) AX.selectNode(this.hover);
      };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', () => { this.pointer.down = false; });
      c.addEventListener('pointerleave', () => { this.hover = null; this.hideTip(); });
      c.addEventListener('wheel', e => {
        e.preventDefault();
        this.target.dist = AX.clamp(this.target.dist + e.deltaY * 0.0022, 4.1, 11.5);
        this.snap = true;
        this.lastInteract = performance.now();
      }, { passive: false });

      /* double-click recentres */
      c.addEventListener('dblclick', () => { this.target.yaw = -0.42; this.target.pitch = 0.26; this.target.dist = 6.9; this.snap = true; });
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.w = Math.max(1, rect.width);
      this.h = Math.max(1, rect.height);
      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.fov = Math.min(this.w, this.h) * 1.55;
    }

    project(p) {
      const cy = Math.cos(this.cam.yaw), sy = Math.sin(this.cam.yaw);
      const cp = Math.cos(this.cam.pitch), sp = Math.sin(this.cam.pitch);
      let x = p.x * cy - p.z * sy;
      let z = p.x * sy + p.z * cy;
      let y = p.y * cp - z * sp;
      z = p.y * sp + z * cp;
      const zc = z + this.cam.dist;
      const s = this.fov / Math.max(0.45, zc);
      return { x: this.w / 2 + x * s, y: this.h / 2 - y * s, s, z: zc };
    }

    pick() {
      if (!this.mouse) return;
      let best = null, bd = 26;
      AX.state.nodes.forEach(n => {
        const pr = this.screen.get(n.id);
        if (!pr) return;
        const d = Math.hypot(pr.x - this.mouse.x, pr.y - this.mouse.y);
        if (d < Math.max(16, pr.r * 1.5) && d < bd) { bd = d; best = n.id; }
      });
      if (best !== this.hover) {
        this.hover = best;
        this.canvas.style.cursor = this.pointer.down ? 'grabbing' : best ? 'pointer' : 'grab';
        if (best) this.showTip(best); else this.hideTip();
      }
      if (best) this.positionTip(best);
    }

    showTip(id) {
      const n = AX.getNode(id); if (!n) return;
      const tip = document.getElementById('graph-tip');
      const st = AX.nodeState(n);
      const m = Math.round(n.mastery * 100), r = Math.round(AX.retentionOf(n) * 100);
      tip.innerHTML = '<b>' + n.label + '</b><small>' + n.subject + ' · tier ' + n.tier + '</small>' +
        '<div class="tt-bars"><div class="tt-bar"><i style="width:' + m + '%;background:#37f0a5"></i></div>' +
        '<div class="tt-bar"><i style="width:' + r + '%;background:#3ce8ff"></i></div></div>' +
        '<span class="tt-state" style="color:' + AX.STATE_HEX[st] + ';border-color:' + AX.STATE_HEX[st] + '55">' +
        AX.STATE_LABEL[st] + ' · ' + m + '% / ' + r + '%</span>';
      tip.classList.add('show');
    }

    positionTip(id) {
      const pr = this.screen.get(id); if (!pr) return;
      const tip = document.getElementById('graph-tip');
      tip.style.left = pr.x + 'px';
      tip.style.top = (pr.y - pr.r - 6) + 'px';
    }

    hideTip() {
      const tip = document.getElementById('graph-tip');
      if (tip) tip.classList.remove('show');
    }

    flash(id, ms = 1500) { this.flashes.set(id, performance.now() + ms); }

    focusNode(id) {
      const n = AX.getNode(id); if (!n) return;
      /* orbit so the node faces the camera */
      const ang = Math.atan2(n.pos.z, n.pos.x);
      this.target.yaw = -ang + Math.PI / 2 - Math.PI / 2;
      this.target.yaw = -ang;
      this.target.pitch = 0.18;
      this.target.dist = Math.min(this.target.dist, 6.4);
      this.snap = true;
      this.flash(id, 1200);
    }

    loop(t) {
      const now = t || performance.now();
      if (!this.w) this.resize();

      /* auto orbit */
      if (AX.state.graph.autoRotate && !this.pointer.down && now - this.lastInteract > 2400) {
        this.target.yaw += 0.0016;
      }
      const k = this.snap ? 0.35 : 0.085;
      this.cam.yaw += (this.target.yaw - this.cam.yaw) * k;
      this.cam.pitch += (this.target.pitch - this.cam.pitch) * k;
      this.cam.dist += (this.target.dist - this.cam.dist) * k;
      this.snap = false;

      this.draw(now);
      requestAnimationFrame(this.loop);
    }

    draw(now) {
      const ctx = this.ctx;
      const w = this.w, h = this.h;
      ctx.clearRect(0, 0, w, h);

      /* ── projection cache ── */
      const proj = new Map();
      AX.state.nodes.forEach(n => {
        const p = this.project(n.pos);
        p.r = n.r * p.s;
        p.node = n;
        proj.set(n.id, p);
      });
      this.screen = proj;

      const sel = AX.state.selected;
      const selAnc = sel ? AX.ancestorsOf(sel) : new Set();
      const selDesc = new Set();
      if (sel) AX.state.nodes.forEach(n => { if (n.deps.includes(sel)) selDesc.add(n.id); });

      /* ── depth grid floor ── */
      ctx.save();
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const a = this.project({ x: i * 1.2, y: -2.9, z: -4.2 });
        const b = this.project({ x: i * 1.2, y: -2.9, z: 4.2 });
        const c = this.project({ x: -4.2, y: -2.9, z: i * 1.2 });
        const d = this.project({ x: 4.2, y: -2.9, z: i * 1.2 });
        ctx.strokeStyle = 'rgba(90,150,200,' + (0.045 + Math.max(0, 0.05 - Math.abs(i) * .008)) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      }
      /* tier rings */
      for (let tier = 1; tier <= 5; tier++) {
        const y = (tier - 3) * 0.92;
        const pts = [];
        for (let a = 0; a <= 64; a++) pts.push(this.project({ x: Math.cos(a / 64 * Math.PI * 2) * 3.25, y, z: Math.sin(a / 64 * Math.PI * 2) * 3.25 }));
        ctx.beginPath();
        pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.strokeStyle = 'rgba(120,180,230,.055)';
        ctx.stroke();
      }
      ctx.restore();

      /* ── edges ── */
      const edges = [];
      AX.state.nodes.forEach(n => n.deps.forEach(depId => {
        const a = proj.get(depId), b = proj.get(n.id);
        if (a && b) edges.push({ a, b, from: depId, to: n.id, z: (a.z + b.z) / 2 });
      }));
      edges.sort((x, y) => y.z - x.z);

      edges.forEach(e => {
        if (!isFinite(e.a.x) || !isFinite(e.a.y) || !isFinite(e.b.x) || !isFinite(e.b.y)) return;
        const linked = sel && (e.from === sel || e.to === sel || (selAnc.has(e.to) && selAnc.has(e.from)));
        const isPath = linked && sel && (e.to === sel || e.from === sel);
        const depthFade = AX.clamp(1.25 - e.z / 12, .25, 1);
        const baseAlpha = isPath ? .55 : linked ? .3 : .14;
        ctx.save();
        ctx.lineWidth = isPath ? 1.4 : .8;
        const grad = ctx.createLinearGradient(e.a.x, e.a.y, e.b.x, e.b.y);
        const cA = AX.STATE_HEX[AX.nodeState(e.a.node)];
        const cB = AX.STATE_HEX[AX.nodeState(e.b.node)];
        grad.addColorStop(0, hexA(cA, baseAlpha * depthFade * .7));
        grad.addColorStop(1, hexA(cB, baseAlpha * depthFade));
        ctx.strokeStyle = grad;
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();

        /* animated pulse on selected edges */
        if (isPath) {
          const t = (now / 1400) % 1;
          const px = e.a.x + (e.b.x - e.a.x) * t;
          const py = e.a.y + (e.b.y - e.a.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 1.9, 0, 7);
          ctx.fillStyle = 'rgba(160,240,255,.9)';
          ctx.shadowColor = '#3ce8ff'; ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.restore();
      });

      /* ── nodes far → near ── */
      const ordered = [...proj.values()].sort((a, b) => b.z - a.z);
      ordered.forEach(p => this.drawNode(p, now, sel, selAnc, selDesc));

      /* ── selection reticle ── */
      if (sel && proj.has(sel)) {
        const p = proj.get(sel);
        const t = (now % 2400) / 2400;
        ctx.save();
        ctx.strokeStyle = 'rgba(60,232,255,' + (0.55 - t * .45) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 10 + t * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    drawNode(p, now, sel, selAnc, selDesc) {
      const ctx = this.ctx;
      const n = p.node;
      const st = AX.nodeState(n);
      const base = AX.STATE_HEX[st];
      const rgb = AX.STATE_RGB[st];
      const active = this.hover === n.id || sel === n.id;
      const related = sel && (selAnc.has(n.id) || selDesc.has(n.id));
      const dim = sel && !active && !related && n.id !== sel;
      const depth = AX.clamp(1.4 - p.z / 9, .35, 1);
      const alpha = (dim ? .3 : 1) * depth;
      const r = Math.max(2.6, p.r * (active ? 1.25 : 1));
      const isCrit = st === 'critical';

      /* halo */
      const halo = ctx.createRadialGradient(p.x, p.y, r * .2, p.x, p.y, r * (active ? 4.6 : 3.2));
      halo.addColorStop(0, hexA(base, .38 * alpha));
      halo.addColorStop(.45, hexA(base, .13 * alpha));
      halo.addColorStop(1, hexA(base, 0));
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * (active ? 4.6 : 3.2), 0, Math.PI * 2); ctx.fill();

      /* critical pulse rings */
      if (isCrit) {
        const t = ((now / 1500) + (n.id.length * .13)) % 1;
        ctx.strokeStyle = hexA('#ff4d6d', (1 - t) * .45 * alpha);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + t * 22, 0, 7); ctx.stroke();
      }

      /* flash burst */
      const flashAt = this.flashes.get(n.id);
      if (flashAt && flashAt > now) {
        const t = 1 - (flashAt - now) / 1500;
        ctx.strokeStyle = hexA('#ff4d6d', (1 - t) * .8);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, r + 6 + t * 34, 0, 7); ctx.stroke();
      }

      /* sphere body */
      const g = ctx.createRadialGradient(p.x - r * .35, p.y - r * .4, r * .1, p.x, p.y, r * 1.05);
      g.addColorStop(0, hexA('#ffffff', .92 * alpha));
      g.addColorStop(.22, hexA(base, .95 * alpha));
      g.addColorStop(.72, hexA(base, .88 * alpha));
      g.addColorStop(1, hexA(base, .35 * alpha));
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7);
      ctx.fillStyle = g; ctx.fill();

      /* rim light */
      ctx.strokeStyle = hexA(base, .5 * alpha);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, r + .6, 0, 7); ctx.stroke();

      /* subject ring (outer arc) */
      const subj = (typeof SUBJECTS !== 'undefined' ? SUBJECTS[n.subject] : null);
      if (subj && p.s > 70) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 3.4, -Math.PI * .75, Math.PI * .55);
        ctx.strokeStyle = hexA(subj.color, .55 * alpha);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      /* selected crosshair */
      if (active) {
        const arm = r + 7;
        ctx.strokeStyle = hexA('#c8f8ff', .75);
        ctx.lineWidth = 1;
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(p.x + dx * arm, p.y + dy * arm);
          ctx.lineTo(p.x + dx * (arm + 4), p.y + dy * (arm + 4));
          ctx.stroke();
        });
      }

      /* label */
      if ((active || (p.s > 70 && p.z < 7.9)) && !dim) {
        const fs = AX.clamp(Math.round(p.s * 0.098), 9, 12);
        ctx.font = '500 ' + fs + 'px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        const label = n.label;
        const tw = ctx.measureText(label).width;
        const ly = p.y + r + fs + 7;
        ctx.fillStyle = 'rgba(5,9,16,' + (0.45 * alpha) + ')';
        roundRect(ctx, p.x - tw / 2 - 4, ly - fs, tw + 8, fs + 5, 4);
        ctx.fill();
        ctx.fillStyle = active ? 'rgba(235,252,255,' + alpha + ')' : 'rgba(206,222,246,' + (0.72 * alpha) + ')';
        ctx.fillText(label, p.x, ly - 1);
      }
    }
  }

  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(v, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a.toFixed(3) + ')';
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  AX.Graph3D = Graph3D;
  AX.roundRect = roundRect;
  AX.hexA = hexA;
})();
