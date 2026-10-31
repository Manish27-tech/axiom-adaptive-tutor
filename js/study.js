/* ═══════════════════════════════════════════════════════════
   AXIOM · study deck — live parameterised simulations
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  const C = { cyan: '#3ce8ff', violet: '#9b6bff', green: '#37f0a5', amber: '#ffc154', red: '#ff4d6d', ink: 'rgba(4,8,15,.0)' };
  let raf = null, lastPaint = 0;

  const simCanvas = () => document.getElementById('sim-canvas');

  /* seeded rng */
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function grid(ctx, w, h, cell = 34, alpha = .045) {
    ctx.save(); ctx.strokeStyle = 'rgba(120,180,230,' + alpha + ')'; ctx.lineWidth = 1;
    for (let x = w / 2 % cell; x < w; x += cell) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = h / 2 % cell; y < h; y += cell) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();
  }

  function glowLine(ctx, x1, y1, x2, y2, color, width = 2) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.shadowColor = color; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function text(ctx, str, x, y, { color = 'rgba(220,235,255,.8)', size = 11, align = 'left', mono = true } = {}) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = (mono ? '11px "Cascadia Code", ui-monospace, monospace' : '500 12px "Segoe UI", system-ui').replace('11', String(size));
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  /* ══════════════ simulators ══════════════ */
  const SIM = {
    oscillator(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const A = p.A || 1, om = p.w || 2, d = p.d || 0;
      const cx = w * .34, top = h * .14, eq = h * .58;
      const scale = Math.min(h * .13, 62) * A / 1.6;
      const phase = t * om;
      const disp = A * Math.exp(-d * phase) * Math.cos(phase) * (Math.min(h * .16, 78) / 1.6);
      const bobY = eq + disp;
      const wdt = Math.min(58, w * .12);

      /* spring */
      ctx.save();
      ctx.strokeStyle = 'rgba(120,200,230,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(cx, top);
      const coils = 12, len = bobY - top - 26;
      for (let i = 0; i <= coils * 2; i++) {
        const x = cx + (i % 2 ? 1 : -1) * 13;
        ctx.lineTo(x, top + (i / (coils * 2)) * len);
      }
      ctx.lineTo(cx, bobY - 26); ctx.stroke();
      /* support */
      ctx.fillStyle = 'rgba(160,210,230,.25)'; ctx.fillRect(cx - 30, top - 5, 60, 4);
      ctx.restore();

      /* mass */
      const g = ctx.createLinearGradient(cx - wdt / 2, bobY, cx + wdt / 2, bobY + 26);
      g.addColorStop(0, 'rgba(60,232,255,.95)'); g.addColorStop(1, 'rgba(120,90,255,.9)');
      ctx.save(); ctx.shadowColor = 'rgba(60,232,255,.8)'; ctx.shadowBlur = 26;
      AX.roundRect(ctx, cx - wdt / 2, bobY, wdt, 26, 7); ctx.fillStyle = g; ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
      AX.roundRect(ctx, cx - wdt / 2, bobY, wdt, 26, 7); ctx.stroke();

      /* equilibrium line */
      ctx.save(); ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.beginPath(); ctx.moveTo(cx - 95, eq + 13); ctx.lineTo(cx + 95, eq + 13); ctx.stroke(); ctx.restore();
      text(ctx, 'equilibrium', cx + 100, eq + 17, { size: 9, color: 'rgba(255,255,255,.28)' });

      /* waveform */
      const gx = w * .56, gw = w * .38, gy = h * .30, gh = h * .30;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
      for (let i = 0; i <= gw; i += 2) {
        const ph = t * om - i / gw * 8;
        const y = gy + gh / 2 - Math.exp(-d * (t * om - i / gw * 8)) * Math.sin(ph) * gh * .42 * Math.min(1, A / 1.2);
        if (i === 0) ctx.beginPath(), ctx.moveTo(gx + i, y); else ctx.lineTo(gx + i, y);
      }
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.6; ctx.shadowColor = C.cyan; ctx.shadowBlur = 10; ctx.stroke();
      ctx.restore();
      text(ctx, 'x(t) = A·e^(−ζωt)·cos(ωt)', gx, gy - 14, { size: 9.5, color: 'rgba(200,225,255,.45)' });
      text(ctx, 'amplitude ' + A.toFixed(2) + ' · ω ' + om.toFixed(2) + ' rad/s', gx, gy + gh + 20, { size: 9.5, color: 'rgba(200,225,255,.4)' });
    },

    projectile(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const v0 = p.v0 || 20, ang = (p.angle || 60) * Math.PI / 180, ch = p.h || 45, g = 9.8;
      const vx = v0 * Math.cos(ang), vy = v0 * Math.sin(ang);
      const tf = (vy + Math.sqrt(vy * vy + 2 * g * ch)) / g;
      const range = vx * tf;
      const padL = w * .12, padR = w * .1, floorY = h * .82;
      const sx = (w - padL - padR) / Math.max(range, 1);
      const sy = (floorY - h * .16) / Math.max(ch + vy * vy / (2 * g), 1);
      const s = Math.min(sx, sy * 2.2);
      const ox = padL, oy = floorY - ch * s;

      /* ground + cliff */
      ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0, floorY, w, h - floorY);
      ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.fillRect(ox - 46, oy, 46, ch * s);
      ctx.strokeStyle = 'rgba(120,200,230,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ox - 46, oy); ctx.lineTo(ox, oy); ctx.stroke();
      text(ctx, 'h = ' + ch + ' m', ox - 44, oy + ch * s / 2, { size: 9, color: 'rgba(255,255,255,.4)' });

      /* trajectory */
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const tt = tf * i / 100;
        const x = ox + vx * tt * s, y = oy - (vy * tt - .5 * g * tt * tt) * s;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = 'rgba(60,232,255,.4)'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);

      /* animated ball */
      const cycle = tf * 1.45;
      const tt = (t % cycle);
      if (tt <= tf) {
        const x = ox + vx * tt * s, y = oy - (vy * tt - .5 * g * tt * tt) * s;
        /* trail */
        ctx.save();
        for (let i = 0; i < 16; i++) {
          const ta = Math.max(0, tt - i * .08);
          const tx = ox + vx * ta * s, ty = oy - (vy * ta - .5 * g * ta * ta) * s;
          ctx.beginPath(); ctx.arc(tx, ty, 2.4 - i * .12, 0, 7);
          ctx.fillStyle = 'rgba(60,232,255,' + (.5 - i * .03) + ')'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, 6, 0, 7);
        ctx.fillStyle = '#dffcff'; ctx.shadowColor = C.cyan; ctx.shadowBlur = 22; ctx.fill();
        ctx.restore();
        /* velocity vector */
        const vX = vx, vY = vy - g * tt;
        glowLine(ctx, x, y, x + vX * 2.4, y - vY * 2.4, 'rgba(55,240,165,.85)', 1.2);
        text(ctx, 'v', x + vX * 2.4 + 4, y - vY * 2.4, { size: 9, color: C.green });
      }
      text(ctx, 'v₀ ' + v0 + ' m/s · θ ' + p.angle + '°', w * .04, h * .12, { size: 9.5, color: 'rgba(220,235,255,.5)' });
      text(ctx, 'range ' + range.toFixed(1) + ' m', w * .04, h * .12 + 16, { size: 9.5, color: C.cyan });
    },

    wave(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const A = p.A || 1, f = p.f || 1, k = p.k || 2;
      const y1 = h * .34, y2 = h * .58, y3 = h * .82;
      const mid = w / 2;
      const drawWave = (y, phase, color, amp = 26 * A) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const xx = x - w / 2;
          const env = Math.exp(-Math.pow(xx / (w * .55), 2));
          const yy = y + Math.sin(k * xx / 40 - 2 * Math.PI * f * t + phase) * amp * env;
          x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
        }
        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.shadowColor = color; ctx.shadowBlur = 12; ctx.stroke();
      };
      drawWave(y1, 0, 'rgba(60,232,255,.75)');
      drawWave(y2, Math.PI, 'rgba(155,107,255,.75)');
      /* resultant */
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const xx = x - w / 2;
        const env = Math.exp(-Math.pow(xx / (w * .55), 2));
        const a = Math.sin(k * xx / 40 - 2 * Math.PI * f * t) * 26 * A * env;
        const b = Math.sin(k * xx / 40 - 2 * Math.PI * f * t + Math.PI) * 26 * A * env;
        const yy = y3 + a + b;
        x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.strokeStyle = 'rgba(55,240,165,.9)'; ctx.lineWidth = 2; ctx.shadowColor = C.green; ctx.shadowBlur = 16; ctx.stroke();
      ctx.restore();
      text(ctx, 'source A', 12, y1 - 32, { size: 9, color: 'rgba(60,232,255,.6)' });
      text(ctx, 'source B', 12, y2 - 32, { size: 9, color: 'rgba(155,107,255,.7)' });
      text(ctx, 'superposition', 12, y3 - 34, { size: 9, color: 'rgba(55,240,165,.7)' });
      text(ctx, 'λ = 2π/k ≈ ' + (2 * Math.PI / k).toFixed(2) + ' m', w - 12, h - 14, { size: 9, align: 'right', color: 'rgba(255,255,255,.4)' });
    },

    gas(ctx, w, h, t, p) {
      const T = p.T || 300, n = p.n || 60;
      const pad = 22, bw = w - pad * 2, bh = h - pad * 2;
      ctx.strokeStyle = 'rgba(120,200,230,.28)'; ctx.lineWidth = 1; ctx.strokeRect(pad, pad, bw, bh);
      const r = rng(9);
      const speed = Math.sqrt(T / 300);
      for (let i = 0; i < n; i++) {
        const vx = (r() - .5) * 160 * speed, vy = (r() - .5) * 160 * speed;
        const x = pad + ((r() * bw) + vx * t * .35) % bw;
        const y = pad + ((r() * bh) + vy * t * .35) % bh;
        const px = pad + ((x - pad) % bw + bw) % bw, py = pad + ((y - pad) % bh + bh) % bh;
        const heat = AX.clamp((T - 150) / 700, 0, 1);
        ctx.beginPath(); ctx.arc(px, py, 1.9, 0, 7);
        ctx.fillStyle = 'rgba(' + Math.round(60 + heat * 195) + ',' + Math.round(232 - heat * 120) + ',' + Math.round(255 - heat * 180) + ',.75)';
        ctx.fill();
      }
      text(ctx, 'T = ' + T + ' K', pad + 8, pad + 20, { size: 10, color: 'rgba(255,200,120,.85)' });
      text(ctx, 'v_rms ∝ √T', w - pad - 8, pad + 20, { size: 9.5, align: 'right', color: 'rgba(255,255,255,.45)' });
    },

    field(ctx, w, h, t, p) {
      const q1 = p.q1 || 1.5, q2 = p.q2 || -1.2;
      const a = { x: w * .34, y: h * .52 }, b = { x: w * .66, y: h * .52 };
      const strength = Math.min(w, h) * .13;
      const fieldAt = (x, y) => {
        let ex = 0, ey = 0;
        [[a, q1], [b, q2]].forEach(([c, q]) => {
          const dx = x - c.x, dy = y - c.y;
          const d2 = Math.max(90, dx * dx + dy * dy);
          const f = q * strength / Math.pow(d2 / 420, 1.35);
          ex += f * dx / Math.sqrt(d2); ey += f * dy / Math.sqrt(d2);
        });
        return [ex, ey];
      };
      /* field lines */
      const lineCount = 18;
      for (let i = 0; i < lineCount; i++) {
        let px = a.x + Math.cos(i / lineCount * 7) * 16, py = a.y + Math.sin(i / lineCount * 7) * 16;
        ctx.beginPath(); ctx.moveTo(px, py);
        for (let s = 0; s < 90; s++) {
          const [ex, ey] = fieldAt(px, py);
          const m = Math.hypot(ex, ey) || 1;
          px += ex / m * 3.2; py += ey / m * 3.2;
          if (px < 4 || px > w - 4 || py < 4 || py > h - 4) break;
          if (Math.hypot(px - b.x, py - b.y) < 18) { ctx.lineTo(px, py); break; }
          ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(60,232,255,.20)'; ctx.lineWidth = .9; ctx.stroke();
      }
      [[a, q1, C.cyan], [b, q2, C.violet]].forEach(([c, q, col]) => {
        const r = 13 + Math.abs(q) * 6;
        const g = ctx.createRadialGradient(c.x - 4, c.y - 4, 2, c.x, c.y, r);
        g.addColorStop(0, '#fff'); g.addColorStop(.4, col); g.addColorStop(1, 'rgba(0,0,0,.2)');
        ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 7); ctx.fillStyle = g;
        ctx.shadowColor = col; ctx.shadowBlur = 26; ctx.fill(); ctx.shadowBlur = 0;
        text(ctx, q > 0 ? '+' : '−', c.x, c.y + 5, { size: 15, align: 'center', color: '#04070d', mono: false });
      });
      text(ctx, 'Coulomb  F ∝ q₁q₂ / r²', 14, 22, { size: 9.5, color: 'rgba(220,235,255,.45)' });
    },

    circuit(ctx, w, h, t, p) {
      const V = p.V || 9, R = p.R || 220, Cf = p.C || 47;
      const tau = R * Cf * 1e-6;
      const y = h * .38, left = w * .16, right = w * .84;
      const chg = 1 - Math.exp(-(t % (tau * 6)) / tau);
      /* wires */
      ctx.strokeStyle = 'rgba(120,200,230,.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.lineTo(right, y + 90); ctx.lineTo(left, y + 90); ctx.lineTo(left, y); ctx.stroke();
      /* battery */
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(left - 10, y - 14); ctx.lineTo(left - 10, y + 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left + 10, y - 8); ctx.lineTo(left + 10, y + 8); ctx.stroke();
      /* resistor */
      ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 1.6; ctx.beginPath();
      const rx = w * .38;
      for (let i = 0; i <= 12; i++) i ? ctx.lineTo(rx + i * 4, y + (i % 2 ? -7 : 7)) : ctx.moveTo(rx, y);
      ctx.stroke(); ctx.restore();
      /* capacitor */
      const cx = w * .62;
      ctx.strokeStyle = C.violet; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, y - 16); ctx.lineTo(cx, y + 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 12, y - 16); ctx.lineTo(cx + 12, y + 16); ctx.stroke();
      /* charge fill on plates */
      ctx.fillStyle = 'rgba(155,107,255,' + (.2 + chg * .6) + ')';
      ctx.fillRect(cx - 4, y - 16, 3, 32); ctx.fillRect(cx + 13, y - 16, 3, 32);
      /* charge curve */
      const gx = w * .16, gy = h * .52, gw = w * .68, gh = h * .28;
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= gw; i += 2) {
        const tt = i / gw * tau * 6;
        const vv = 1 - Math.exp(-tt / tau);
        const yy = gy + gh - vv * gh * .92;
        i ? ctx.lineTo(gx + i, yy) : ctx.moveTo(gx + i, yy);
      }
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.8; ctx.shadowColor = C.cyan; ctx.shadowBlur = 10; ctx.stroke();
      /* marker */
      const tt = (t % (tau * 6));
      const mx = gx + (tt / (tau * 6)) * gw, my = gy + gh - (1 - Math.exp(-tt / tau)) * gh * .92;
      ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
      text(ctx, 'V_C = ' + (V * chg).toFixed(2) + ' V', mx + 8, my - 8, { size: 9, color: C.cyan });
      text(ctx, 'τ = RC = ' + (tau * 1000).toFixed(1) + ' ms', gx, gy + gh + 15, { size: 9, color: 'rgba(255,255,255,.45)' });
    },

    rays(ctx, w, h, t, p) {
      const f = p.f || 1.2, oh = p.h || .6;
      const axisY = h * .52, lensX = w * .52;
      const scale = Math.min(w * .18, h * .55);
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(w, axisY); ctx.stroke();
      /* lens */
      ctx.save();
      const lg = ctx.createLinearGradient(lensX - 14, 0, lensX + 14, 0);
      lg.addColorStop(0, 'rgba(60,232,255,.15)'); lg.addColorStop(.5, 'rgba(60,232,255,.5)'); lg.addColorStop(1, 'rgba(60,232,255,.15)');
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.ellipse(lensX, axisY, 13, h * .24, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(60,232,255,.6)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      /* foci */
      [-f, f].forEach(d => {
        const x = lensX + d * scale;
        ctx.beginPath(); ctx.arc(x, axisY, 2.5, 0, 7); ctx.fillStyle = 'rgba(255,193,84,.8)'; ctx.fill();
        text(ctx, d > 0 ? 'F′' : 'F', x - 5, axisY + 16, { size: 9, color: 'rgba(255,193,84,.7)' });
      });
      const objX = lensX - 1.75 * scale, objH = oh * 52;
      /* object */
      ctx.strokeStyle = C.green; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(objX, axisY); ctx.lineTo(objX, axisY - objH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(objX, axisY - objH); ctx.lineTo(objX, axisY - objH + 8); ctx.lineTo(objX + 5, axisY - objH + 4); ctx.closePath(); ctx.fillStyle = C.green; ctx.fill();
      /* rays: parallel then through focus */
      const imgDist = 1 / (1 / f - 1 / 1.75);
      const imgX = lensX + imgDist * scale;
      const imgH = -objH * (imgDist / 1.75);
      glowLine(ctx, objX, axisY - objH, lensX, axisY - objH, 'rgba(60,232,255,.7)', 1.2);
      glowLine(ctx, lensX, axisY - objH, w - 14, axisY + (axisY - (axisY - objH)) , 'rgba(60,232,255,.0)', 0); // noop guard
      /* bend through far focus */
      const slope = (axisY - (axisY - objH)) / (w - 14 - lensX);
      glowLine(ctx, lensX, axisY - objH, w - 14, axisY - objH + slope * 0, 'rgba(60,232,255,0)', 0);
      /* second principal ray through optical centre */
      glowLine(ctx, objX, axisY - objH, lensX, axisY - objH, 'rgba(60,232,255,0)', 0);
      /* draw proper refracted rays */
      ctx.save();
      ctx.strokeStyle = 'rgba(60,232,255,.75)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(objX, axisY - objH); ctx.lineTo(lensX, axisY - objH); ctx.lineTo(imgX, axisY - imgH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(objX, axisY - objH); ctx.lineTo(lensX, axisY); ctx.lineTo(imgX, axisY - imgH); ctx.stroke();
      ctx.restore();
      if (imgX < w - 10) {
        ctx.strokeStyle = C.violet; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(imgX, axisY); ctx.lineTo(imgX, axisY - imgH); ctx.stroke();
        const dir = imgH > 0 ? -1 : 1;
        ctx.beginPath(); ctx.moveTo(imgX, axisY - imgH); ctx.lineTo(imgX, axisY - imgH + 8 * dir); ctx.lineTo(imgX + 5, axisY - imgH + 4 * dir); ctx.closePath(); ctx.fillStyle = C.violet; ctx.fill();
        text(ctx, 'image', imgX + 7, axisY - imgH / 2, { size: 9, color: 'rgba(180,150,255,.8)' });
      }
      text(ctx, '1/f = 1/v − 1/u   ·   f = ' + f + ' m', 14, 22, { size: 9.5, color: 'rgba(220,235,255,.45)' });
    },

    decay(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const hl = p.hl || 5, n0 = p.n0 || 1000;
      const lam = Math.LN2 / hl;
      const gx = w * .1, gy = h * .16, gw = w * .8, gh = h * .62;
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= gw; i += 2) {
        const days = i / gw * hl * 5;
        const y = gy + gh - Math.exp(-lam * days) * gh;
        i ? ctx.lineTo(gx + i, y) : ctx.moveTo(gx + i, y);
      }
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.8; ctx.shadowColor = C.amber; ctx.shadowBlur = 12; ctx.stroke();
      ctx.lineTo(gx + gw, gy + gh); ctx.lineTo(gx, gy + gh); ctx.closePath();
      ctx.fillStyle = 'rgba(255,193,84,.08)'; ctx.fill();
      /* half-life markers */
      for (let k = 1; k <= 4; k++) {
        const x = gx + (k * hl) / (hl * 5) * gw;
        ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(255,255,255,.16)';
        ctx.beginPath(); ctx.moveTo(x, gy + gh); ctx.lineTo(x, gy + gh * (1 - Math.pow(.5, k))); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, 'T½×' + k, x - 10, gy + gh + 15, { size: 8.5, color: 'rgba(255,255,255,.35)' });
      }
      const tNow = (t * .35) % (hl * 5);
      const yNow = gy + gh - Math.exp(-lam * tNow) * gh;
      const xNow = gx + tNow / (hl * 5) * gw;
      ctx.beginPath(); ctx.arc(xNow, yNow, 4, 0, 7); ctx.fillStyle = '#fff'; ctx.shadowColor = C.amber; ctx.shadowBlur = 16; ctx.fill();
      ctx.shadowBlur = 0;
      text(ctx, 'N = ' + Math.round(n0 * Math.exp(-lam * tNow)) + ' / ' + n0, xNow + 8, yNow - 9, { size: 9.5, color: C.amber });
      text(ctx, 'N(t) = N₀ e^(−λt)', w - 14, 22, { size: 9.5, align: 'right', color: 'rgba(220,235,255,.45)' });
    },

    graphfn(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const a = p.a ?? 1, b = p.b ?? 0, c = p.c ?? 0;
      const ox = w / 2, oy = h / 2, sc = Math.min(w, h) * .1;
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, h); ctx.stroke();
      const f = x => a * x * x + b * x + c;
      ctx.beginPath();
      for (let i = 0; i <= w; i += 2) {
        const x = (i - ox) / sc;
        const y = oy - f(x) * sc;
        i ? ctx.lineTo(i, y) : ctx.moveTo(i, y);
      }
      ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.shadowColor = C.violet; ctx.shadowBlur = 14; ctx.stroke();
      /* tangent */
      const x0 = Math.sin(t * .8) * 1.8;
      const y0 = f(x0), slope = 2 * a * x0 + b;
      const px = ox + x0 * sc, py = oy - y0 * sc;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
      const dx = 2.4;
      glowLine(ctx, ox + (x0 - dx) * sc, oy - (y0 - slope * dx) * sc, ox + (x0 + dx) * sc, oy - (y0 + slope * dx) * sc, 'rgba(60,232,255,.8)', 1.2);
      text(ctx, 'f(x) = ' + a.toFixed(1) + 'x² ' + (b >= 0 ? '+ ' : '− ') + Math.abs(b).toFixed(1) + 'x ' + (c >= 0 ? '+ ' : '− ') + Math.abs(c).toFixed(1), 14, 22, { size: 9.5, color: 'rgba(220,235,255,.5)' });
      text(ctx, "f′(" + x0.toFixed(2) + ') = ' + slope.toFixed(2), 14, 38, { size: 9.5, color: C.cyan });
    },

    area(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const k = p.k || 1, x0 = Math.min(p.x0, p.x1 - .2), x1 = p.x1;
      const ox = w * .1, oy = h * .84, sx = w * .8 / 4.2, sy = h * .64 / 4.4;
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(w - 10, oy); ctx.moveTo(ox, oy); ctx.lineTo(ox, h * .1); ctx.stroke();
      const f = x => k * x * x;
      /* riemann */
      const n = 10 + Math.floor((Math.sin(t * .5) + 1) * 6);
      ctx.fillStyle = 'rgba(60,232,255,.15)';
      for (let i = 0; i < n; i++) {
        const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
        const hh = f((xa + xb) / 2) * sy;
        ctx.fillRect(ox + xa * sx, oy - hh, (xb - xa) * sx - 1, hh);
      }
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const x = x0 + (x1 - x0) * i / 200;
        const px = ox + x * sx, py = oy - f(x) * sy;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.shadowColor = C.cyan; ctx.shadowBlur = 12; ctx.stroke();
      const val = k * (Math.pow(x1, 3) - Math.pow(x0, 3)) / 3;
      text(ctx, 'f(x) = ' + k.toFixed(2) + 'x²', 14, 22, { size: 9.5, color: 'rgba(220,235,255,.5)' });
      text(ctx, '∫ = ' + val.toFixed(3), 14, 38, { size: 10, color: C.cyan });
      text(ctx, 'n = ' + n + ' slices', w - 14, h - 12, { size: 9, align: 'right', color: 'rgba(255,255,255,.35)' });
    },

    vector(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const A = p.A || 3, th = (p.theta || 40) * Math.PI / 180;
      const ox = w / 2, oy = h / 2;
      const sc = Math.min(w, h) * .07;
      const x = Math.cos(th) * A * sc, y = -Math.sin(th) * A * sc;
      /* components */
      ctx.save(); ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + x, oy); ctx.lineTo(ox + x, oy + y); ctx.stroke();
      ctx.strokeStyle = 'rgba(155,107,255,.5)';
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + y); ctx.lineTo(ox + x, oy + y); ctx.stroke();
      ctx.restore();
      /* angle arc */
      ctx.beginPath(); ctx.arc(ox, oy, 32, -th, 0); ctx.strokeStyle = 'rgba(60,232,255,.6)'; ctx.lineWidth = 1; ctx.stroke();
      text(ctx, (p.theta | 0) + '°', ox + 40, oy - 10, { size: 9, color: C.cyan });
      /* arrow */
      const ang = Math.atan2(y, x);
      glowLine(ctx, ox, oy, ox + x, oy + y, 'rgba(60,232,255,.95)', 2.2);
      ctx.beginPath();
      ctx.moveTo(ox + x, oy + y);
      ctx.lineTo(ox + x - 12 * Math.cos(ang - .35), oy + y - 12 * Math.sin(ang - .35));
      ctx.lineTo(ox + x - 12 * Math.cos(ang + .35), oy + y - 12 * Math.sin(ang + .35));
      ctx.closePath(); ctx.fillStyle = C.cyan; ctx.shadowColor = C.cyan; ctx.shadowBlur = 14; ctx.fill();
      text(ctx, '|v| = ' + A.toFixed(1), ox + x + 10, oy + y - 8, { size: 10, color: '#fff' });
      text(ctx, 'vₓ = ' + (A * Math.cos(th)).toFixed(2), ox + x / 2, oy + 16, { size: 9, color: 'rgba(60,232,255,.75)', align: 'center' });
      text(ctx, 'v_y = ' + (A * Math.sin(th)).toFixed(2), ox - 6, oy + y / 2, { size: 9, color: 'rgba(155,107,255,.8)' });
    },

    distribution(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const mu = p.mu || 0, sg = p.sigma || 1;
      const ox = w / 2, oy = h * .82, sx = w / 7, sy = h * .62;
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(w, oy); ctx.stroke();
      const pdf = x => Math.exp(-Math.pow(x - mu, 2) / (2 * sg * sg)) / (sg * Math.sqrt(2 * Math.PI));
      ctx.beginPath();
      for (let i = 0; i <= w; i += 2) {
        const x = (i - ox) / sx;
        i ? ctx.lineTo(i, oy - pdf(x) * sy * 1.6) : ctx.moveTo(i, oy - pdf(x) * sy * 1.6);
      }
      ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.shadowColor = C.violet; ctx.shadowBlur = 14; ctx.stroke();
      /* shade ±sigma */
      ctx.beginPath();
      for (let i = 0; i <= w; i += 2) {
        const x = (i - ox) / sx;
        const y = oy - pdf(x) * sy * 1.6;
        if (x >= mu - sg && x <= mu + sg) { i && ctx.lineTo(i, y); } else if (x < mu - sg) { ctx.moveTo(i, y); }
      }
      const xEnd = ox + (mu + sg) * sx;
      ctx.lineTo(xEnd, oy); ctx.lineTo(ox + (mu - sg) * sx, oy); ctx.closePath();
      ctx.fillStyle = 'rgba(60,232,255,.14)'; ctx.fill();
      /* ticks */
      [-2, -1, 0, 1, 2].forEach(k => {
        const x = ox + (mu + k * sg) * sx;
        ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + 5); ctx.stroke();
        text(ctx, 'μ' + (k ? (k > 0 ? '+' + k : k) + 'σ' : ''), x, oy + 17, { size: 8.5, align: 'center', color: 'rgba(255,255,255,.35)' });
      });
      text(ctx, 'P(μ−σ < X < μ+σ) ≈ 68.2%', 14, 22, { size: 9.5, color: 'rgba(220,235,255,.5)' });
    },

    grid(ctx2, w, h, t, p) {
      grid(ctx2, w, h);
      const sx = p.sx || 1, sy = p.sy || 1, sh = p.sh || 0;
      const ox = w / 2, oy = h / 2, cell = Math.min(w, h) / 11;
      const map = (x, y) => ({ x: ox + (sx * x + sh * y) * cell, y: oy - (sy * y) * cell });
      /* original grid */
      ctx2.strokeStyle = 'rgba(255,255,255,.08)';
      for (let i = -4; i <= 4; i++) {
        ctx2.beginPath(); ctx2.moveTo(ox + i * cell, oy - 4 * cell); ctx2.lineTo(ox + i * cell, oy + 4 * cell); ctx2.stroke();
        ctx2.beginPath(); ctx2.moveTo(ox - 4 * cell, oy + i * cell); ctx2.lineTo(ox + 4 * cell, oy + i * cell); ctx2.stroke();
      }
      /* transformed basis + grid */
      ctx2.save();
      ctx2.strokeStyle = 'rgba(60,232,255,.28)'; ctx2.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const a1 = map(i, -4), b1 = map(i, 4);
        ctx2.beginPath(); ctx2.moveTo(a1.x, a1.y); ctx2.lineTo(b1.x, b1.y); ctx2.stroke();
        const a2 = map(-4, i), b2 = map(4, i);
        ctx2.beginPath(); ctx2.moveTo(a2.x, a2.y); ctx2.lineTo(b2.x, b2.y); ctx2.stroke();
      }
      const o = map(0, 0), ex = map(1, 0), ey = map(0, 1);
      glowLine(ctx2, o.x, o.y, ex.x, ex.y, 'rgba(55,240,165,.95)', 2.2);
      glowLine(ctx2, o.x, o.y, ey.x, ey.y, 'rgba(155,107,255,.95)', 2.2);
      ctx2.restore();
      text(ctx2, 'e₁ → (' + sx.toFixed(2) + ', 0)', 14, 22, { size: 9, color: 'rgba(55,240,165,.8)' });
      text(ctx2, 'e₂ → (' + sh.toFixed(2) + ', ' + sy.toFixed(2) + ')', 14, 37, { size: 9, color: 'rgba(155,107,255,.85)' });
      text(ctx2, 'det = ' + (sx * sy).toFixed(2), w - 14, 22, { size: 10, align: 'right', color: C.cyan });
    },

    bars(ctx, w, h, t, p) {
      grid(ctx, w, h);
      const n = Math.min(40, p.n || 16);
      const r = rng(42);
      let arr = Array.from({ length: n }, () => Math.floor(r() * 90) + 8);
      const bubble = (arr, steps) => {
        const a = arr.slice(); let done = 0;
        outer: for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length - i - 1; j++) {
          if (done++ >= steps) break outer;
          if (a[j] > a[j + 1]) { const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp; }
        }
        return { a, active: done % Math.max(1, a.length) };
      };
      const step = Math.floor((t * 14) % (n * n / 2));
      const { a, active } = bubble(arr, step);
      const bw = (w - 60) / n, base = h - 42;
      a.forEach((v, i) => {
        const bh = (v / 100) * (h - 110);
        const x = 30 + i * bw;
        const isA = i === active % n;
        const g = ctx.createLinearGradient(0, base - bh, 0, base);
        if (isA) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, C.cyan); }
        else { g.addColorStop(0, 'rgba(60,232,255,.75)'); g.addColorStop(1, 'rgba(155,107,255,.35)'); }
        ctx.fillStyle = g;
        AX.roundRect(ctx, x + 1.5, base - bh, Math.max(2, bw - 3), bh, 2); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(24, base); ctx.lineTo(w - 20, base); ctx.stroke();
      text(ctx, 'n = ' + n + ' · comparisons ≈ ' + step, 14, 22, { size: 9.5, color: 'rgba(220,235,255,.45)' });
      text(ctx, 'O(n²) worst · O(n log n) average', w - 14, 22, { size: 9, align: 'right', color: 'rgba(255,255,255,.3)' });
    },

    graphnet(ctx, w, h, t, p) {
      const n = Math.min(12, p.n || 8);
      const r = rng(p.seed || 4);
      const cx = w / 2, cy = h / 2, rad = Math.min(w, h) * .33;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + i / n * Math.PI * 2;
        pts.push({ x: cx + Math.cos(ang) * rad * (0.82 + r() * .28), y: cy + Math.sin(ang) * rad * (0.82 + r() * .28) });
      }
      const edges = [];
      for (let i = 0; i < n; i++) {
        edges.push([i, (i + 1) % n]);
        if (r() > .55) edges.push([i, (i + 2 + Math.floor(r() * 2)) % n]);
      }
      edges.forEach(([a, b]) => {
        const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
        const active = Math.abs((t * 1.4) % 6 - d / 60) < .6;
        ctx.strokeStyle = active ? 'rgba(60,232,255,.8)' : 'rgba(120,180,230,.14)';
        ctx.lineWidth = active ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
      });
      pts.forEach((pt, i) => {
        const wave = Math.sin(t * 2 - i * .7) * .5 + .5;
        const visited = (t * .5) % n;
        const on = i <= visited;
        const rr = 5.5 + (i === Math.floor(visited) ? 2.5 : 0);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, rr, 0, 7);
        ctx.fillStyle = on ? 'rgba(60,232,255,' + (.55 + wave * .45) + ')' : 'rgba(155,107,255,.55)';
        ctx.shadowColor = on ? C.cyan : C.violet; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
        text(ctx, String(i), pt.x - 3, pt.y + 3.5, { size: 8, color: '#04070d' });
      });
      text(ctx, 'V = ' + n + ' · E = ' + edges.length + ' · BFS wavefront', 14, 20, { size: 9.5, color: 'rgba(220,235,255,.45)' });
    },

    orbit(ctx, w, h, t, p) {
      const cx = w / 2, cy = h / 2, speed = p.speed || 1;
      const a = Math.min(w, h) * .30 * (p.r || 2.4) / 2.4;
      const e = p.e ?? .38, b = a * Math.sqrt(1 - e * e);
      const ox = -a * e;
      ctx.strokeStyle = 'rgba(120,180,230,.18)'; ctx.setLineDash([3, 6]);
      ctx.beginPath(); ctx.ellipse(cx + ox, cy, a, b, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      /* star */
      const sg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 30);
      sg.addColorStop(0, '#fff'); sg.addColorStop(.35, C.amber); sg.addColorStop(1, 'rgba(255,122,60,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fillStyle = sg; ctx.fill();
      text(ctx, 'M', cx - 4, cy + 4, { size: 11, color: '#1a1204' });
      /* planet */
      const ang = t * .9 * speed;
      const px = cx + ox + Math.cos(ang) * a, py = cy + Math.sin(ang) * b;
      /* trail */
      for (let i = 0; i < 22; i++) {
        const aa = ang - i * .055;
        const tx = cx + ox + Math.cos(aa) * a, ty = cy + Math.sin(aa) * b;
        ctx.beginPath(); ctx.arc(tx, ty, 2.6 - i * .09, 0, 7);
        ctx.fillStyle = 'rgba(60,232,255,' + (.42 - i * .017) + ')'; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(px, py, 7, 0, 7);
      ctx.fillStyle = '#dffcff'; ctx.shadowColor = C.cyan; ctx.shadowBlur = 24; ctx.fill(); ctx.shadowBlur = 0;
      /* velocity */
      const vx = -Math.sin(ang) * a, vy = Math.cos(ang) * b;
      const vm = Math.hypot(vx, vy);
      glowLine(ctx, px, py, px + vx / vm * 34, py + vy / vm * 34, 'rgba(55,240,165,.8)', 1.4);
      text(ctx, 'v', px + vx / vm * 40, py + vy / vm * 40, { size: 9, color: C.green });
      text(ctx, 'Kepler: T² ∝ r³', 14, 20, { size: 9.5, color: 'rgba(220,235,255,.45)' });
    }
  };

  /* ══════════════ equation builders ══════════════ */
  function eqsFor(type, p) {
    const f = (v, d = 2) => (isFinite(v) ? v.toFixed(d) : '—');
    switch (type) {
      case 'oscillator':
        return [['ω = √(k/m)', f(p.w) + ' rad/s'], ['T = 2π/ω', f(2 * Math.PI / p.w) + ' s'], ['v_max = ωA', f(p.w * p.A) + ' m/s']];
      case 'projectile': {
        const a = (p.angle || 0) * Math.PI / 180;
        const vx = p.v0 * Math.cos(a), vy = p.v0 * Math.sin(a);
        const tf = (vy + Math.sqrt(vy * vy + 2 * 9.8 * p.h)) / 9.8;
        return [['vₓ = v₀cosθ', f(vx) + ' m/s'], ['v_y = v₀sinθ', f(vy) + ' m/s'], ['t_flight', f(tf) + ' s'], ['range = vₓ·t', f(vx * tf) + ' m']];
      }
      case 'wave':
        return [['λ = 2π/k', f(2 * Math.PI / p.k) + ' m'], ['v = fλ', f(p.f * 2 * Math.PI / p.k) + ' m/s'], ['T = 1/f', f(1 / p.f) + ' s']];
      case 'gas':
        return [['v_rms ∝ √T', f(Math.sqrt(p.T), 0) + ' K^½'], ['P ∝ nT', f(p.n * p.T / 1000) + ' kPa·eq'], ['E_k ∝ T', f(1.5 * 1.38e-23 * p.T * 1e3, 1) + ' zJ']];
      case 'field':
        return [['F ∝ q₁q₂/r²', f(p.q1 * p.q2) + ' k·e²'], ['field lines', p.q1 * p.q2 < 0 ? 'converging' : 'diverging', '']];
      case 'circuit': {
        const tau = p.R * p.C * 1e-6;
        return [['τ = RC', f(tau * 1000, 1) + ' ms'], ['V_C(τ)', f(p.V * .632) + ' V'], ['I₀ = V/R', f(p.V / p.R * 1000, 2) + ' mA']];
      }
      case 'rays': {
        const img = 1 / (1 / p.f - 1 / 1.75);
        return [['1/f = 1/v − 1/u', 'f = ' + f(p.f) + ' m'], ['v (image dist)', f(img) + ' m'], ['m = −v/u', f(-img / 1.75) + '×']];
      }
      case 'decay': {
        const lam = Math.LN2 / p.hl;
        return [['λ = ln2 / T½', f(lam, 3) + ' /d'], ['N(2T½)', Math.round(p.n0 / 4) + ' left'], ['activity ∝ N', f(lam * p.n0, 1) + ' Bq·eq']];
      }
      case 'graphfn':
        return [["f′(x) = 2ax + b", 'slope live →'], ['vertex x = −b/2a', f(-p.b / (2 * p.a || 1e-9))], ['Δ = b² − 4ac', f(p.b * p.b - 4 * p.a * p.c)]];
      case 'area': {
        const val = p.k * (Math.pow(p.x1, 3) - Math.pow(p.x0, 3)) / 3;
        return [['∫ kx² dx', f(val, 3)], ['interval', '[' + p.x0.toFixed(1) + ', ' + p.x1.toFixed(1) + ']'], ['slices', '→ ∞']];
      }
      case 'vector':
        return [['vₓ = |v|cosθ', f(p.A * Math.cos(p.theta * Math.PI / 180))], ['v_y = |v|sinθ', f(p.A * Math.sin(p.theta * Math.PI / 180))], ['tanθ = v_y/vₓ', 'θ = ' + p.theta + '°']];
      case 'distribution':
        return [['P(|X−μ| < σ)', '68.27%'], ['P(|X−μ| < 2σ)', '95.45%'], ['density peak', f(1 / (p.sigma * Math.sqrt(2 * Math.PI)), 3)]];
      case 'grid':
        return [['det(M) = sx·sy', f(p.sx * p.sy)], ['area scale', '×' + f(p.sx * p.sy)], ['invertible', p.sx * p.sy !== 0 ? 'yes' : 'no — collapsed']];
      case 'bars': {
        const n = p.n;
        return [['best case', 'n log₂n ≈ ' + Math.round(n * Math.log2(n))], ['worst case', 'n² / 2 = ' + Math.round(n * n / 2)], ['space', 'O(1) in-place']];
      }
      case 'graphnet':
        return [['vertices', String(p.n)], ['edges ≈', String(Math.round(p.n * 1.6))], ['BFS visits', 'O(V + E)']];
      case 'orbit': {
        const r = p.r;
        return [['v = √(GM/r)', f(Math.sqrt(1 / r), 3) + ' (GM=1)'], ['T = 2π√(r³/GM)', f(2 * Math.PI * Math.sqrt(Math.pow(r, 3)), 2)], ['E = −GM/2r', f(-1 / (2 * r), 3)]];
      }
      default: return [];
    }
  }

  /* ══════════════ deck rendering ══════════════ */
  function nodeById(id) { return AX.getNode(id); }

  function renderStrip() {
    const strip = document.getElementById('concept-strip');
    if (!strip) return;
    strip.innerHTML = '';
    AX.state.nodes.forEach(n => {
      const st = AX.nodeState(n);
      const b = document.createElement('button');
      b.className = 'cpill' + (n.id === AX.state.studyNode ? ' is-active' : '');
      b.innerHTML = '<i style="background:' + AX.STATE_HEX[st] + ';box-shadow:0 0 8px ' + AX.STATE_HEX[st] + '"></i>' +
        n.label + '<small>' + Math.round(n.mastery * 100) + '%</small>';
      b.onclick = () => { AX.state.studyNode = n.id; AX.persist(); renderDeck(); };
      strip.appendChild(b);
    });
  }

  function renderDeck() {
    const node = nodeById(AX.state.studyNode) || AX.state.nodes[0];
    if (!node) return;
    AX.state.studyNode = node.id;
    const meta = SIM_META[node.sim.type] || { params: {} };
    const st = AX.nodeState(node);
    const r = AX.retentionOf(node);

    document.getElementById('deck-kicker').textContent = node.subject + ' · tier ' + node.tier;
    document.getElementById('deck-title').textContent = node.label;
    document.getElementById('deck-mastery').textContent = Math.round(node.mastery * 100) + '%';
    document.getElementById('deck-retention').textContent = Math.round(r * 100) + '%';
    document.getElementById('deck-hl').textContent = Math.round(node.hl) + 'd';
    const chip = document.getElementById('deck-node-chip');
    chip.innerHTML = '<i style="background:' + AX.STATE_HEX[st] + ';box-shadow:0 0 16px ' + AX.STATE_HEX[st] + '"></i>';

    /* parameters */
    const list = document.getElementById('param-list');
    list.innerHTML = '';
    let shown = 0;
    Object.entries(meta.params).forEach(([key, def]) => {
      if (def.hidden) return;
      shown++;
      const val = node.sim.params[key] ?? def.min;
      const wrap = document.createElement('div');
      wrap.className = 'param';
      wrap.innerHTML = '<div class="param-top"><span>' + def.label + '</span><b id="pv-' + key + '">' + fmt(val, def) + '</b></div>' +
        '<input type="range" min="' + def.min + '" max="' + def.max + '" step="' + def.step + '" value="' + val + '" />';
      const input = wrap.querySelector('input');
      input.style.setProperty('--fill', ((val - def.min) / (def.max - def.min) * 100) + '%');
      input.oninput = () => {
        const v = parseFloat(input.value);
        node.sim.params[key] = v;
        document.getElementById('pv-' + key).textContent = fmt(v, def);
        input.style.setProperty('--fill', ((v - def.min) / (def.max - def.min) * 100) + '%');
        renderEqs(node);
        renderReadout(node);
      };
      list.appendChild(wrap);
    });
    document.getElementById('param-count').textContent = shown + ' DOF';

    /* copy */
    const isAnalogy = AX.state.mode === 'analogy';
    const explain = document.getElementById('explain-body');
    explain.innerHTML = isAnalogy
      ? '<b>Structural analogy.</b> ' + node.analogy
      : node.blurb + ' <span class="hl">' + (node.sim.insight || '') + '</span>';
    document.getElementById('explain-label').textContent = isAnalogy ? 'Analogy' : 'Concept';
    document.getElementById('mode-tag').textContent = AX.state.mode;

    renderEqs(node);
    renderReadout(node);
    renderStrip();

    const q = QUESTIONS.find(q => q.node === node.id);
    const testBtn = document.getElementById('deck-arena');
    testBtn.disabled = false;
    testBtn.innerHTML = '<svg class="ic"><use href="#i-terminal"/></svg>' + (q ? 'Test this concept' : 'Open arena');
    testBtn.onclick = () => {
      if (q) AX.startArena(q.id);
      else AX.toast('No banked question yet', 'Arena will synthesise one from your weakest ancestor.', 'info'), AX.startArena(QUESTIONS[0].id);
    };

    paintSim(node, performance.now());
  }

  function fmt(v, def) {
    const dec = def.step < .1 ? 2 : def.step < 1 ? 1 : 0;
    return Number(v).toFixed(dec) + (def.unit ? ' ' + def.unit : '');
  }

  function renderEqs(node) {
    const stack = document.getElementById('eq-stack');
    if (!stack) return;
    const rows = eqsFor(node.sim.type, node.sim.params);
    stack.innerHTML = rows.map(([l, v]) => '<div class="eq"><span>' + l + '</span><b>' + v + '</b></div>').join('');
  }

  function renderReadout(node) {
    const el = document.getElementById('sim-readout');
    if (!el) return;
    const p = node.sim.params;
    const pairs = eqsFor(node.sim.type, p).slice(0, 2);
    el.innerHTML = pairs.map(([l, v]) => l + ' <b>' + v + '</b>').join('<br>');
  }

  /* ══════════════ canvas loop ══════════════ */
  function sizeCanvas(cv) {
    const rect = cv.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    if (cv.width !== Math.floor(w * dpr) || cv.height !== Math.floor(h * dpr)) {
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    return { w, h };
  }

  function paintSim(node, t) {
    const cv = simCanvas(); if (!cv) return;
    const { w, h } = sizeCanvas(cv);
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const fn = SIM[node.sim.type];
    if (fn) {
      try { fn(ctx, w, h, t / 1000, node.sim.params, node); }
      catch (e) { console.warn('sim error', e); }
    }
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (AX.state.view !== 'study') return;
    if (t - lastPaint < 28) return;
    lastPaint = t;
    const node = nodeById(AX.state.studyNode);
    if (node) paintSim(node, t);
  }

  /* ══════════════ scheduler panel ══════════════ */
  function renderSchedule() {
    const queue = AX.reviewQueue();
    const due = queue.filter(q => q.hours <= 0);
    const nextEl = document.getElementById('sched-next');
    const ringTxt = document.getElementById('sched-ring-txt');
    const ring = document.getElementById('sched-ring');
    if (nextEl) {
      const next = queue[0];
      if (next) {
        nextEl.textContent = next.hours <= 0 ? 'window open now' : 'next window in ' + (next.hours < 24 ? Math.round(next.hours) + 'h' : Math.round(next.hours / 24) + 'd');
        ringTxt.textContent = String(due.length || queue.filter(q => q.hours < 48).length);
        if (ring) {
          const pct = AX.clamp(due.length / Math.max(1, queue.length) * 100, 6, 100);
          ring.style.background = 'conic-gradient(var(--red) 0 ' + pct + '%, rgba(255,255,255,.08) ' + pct + '% 100%)';
        }
      }
    }
    const list = document.getElementById('review-list');
    if (!list) return;
    list.innerHTML = queue.slice(0, 6).map(q => {
      const n = q.node;
      const label = q.hours <= 0 ? 'due now' : q.hours < 24 ? Math.round(q.hours) + 'h' : Math.round(q.hours / 24) + 'd';
      return '<div class="review-item" data-node="' + n.id + '"><i style="background:' + (q.hours <= 0 ? 'var(--red)' : 'var(--amber)') + '"></i>' +
        n.label + '<b>' + label + '</b></div>';
    }).join('');
    list.querySelectorAll('.review-item').forEach(el => el.onclick = () => {
      AX.state.studyNode = el.dataset.node;
      renderDeck();
    });
  }

  /* ══════════════ public ══════════════ */
  AX.Study = {
    init() {
      renderDeck();
      renderSchedule();
      if (!raf) raf = requestAnimationFrame(loop);

      document.querySelectorAll('#mode-seg button').forEach(b => {
        b.onclick = () => {
          document.querySelectorAll('#mode-seg button').forEach(x => x.classList.remove('is-active'));
          b.classList.add('is-active');
          AX.state.mode = b.dataset.mode;
          renderDeck();
        };
      });
      document.getElementById('deck-review').onclick = () => {
        AX.logReview(AX.state.studyNode);
        AX.toast('Review logged', 'Memory stability extended · next window pushed forward.', 'good');
        renderDeck(); renderSchedule();
      };
      document.getElementById('deck-arena').onclick = () => {
        const q = QUESTIONS.find(q => q.node === AX.state.studyNode);
        AX.startArena(q ? q.id : QUESTIONS[0].id);
      };
      AX.on('refresh', () => { renderStrip(); renderSchedule(); });
    },
    renderDeck, renderSchedule
  };
})();
