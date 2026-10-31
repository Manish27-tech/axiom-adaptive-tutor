/* ═══════════════════════════════════════════════════════════
   AXIOM · testing arena
   Step grading · root-cause tracing · fatigue adaptation
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  let tick = null;

  const A = () => AX.state.arena;

  function el(id) { return document.getElementById(id); }

  function startArena(questionId, opts = {}) {
    const q = typeof questionId === 'object' && questionId
      ? questionId
      : QUESTIONS.find(x => x.id === questionId) || QUESTIONS[0];
    const predicted = AX.predictSuccess(q, 0);
    q._predicted = predicted;
    AX.state.arena = {
      q, step: 0, done: [], errors: {}, attempts: 0,
      hints: 0, difficulty: q.difficulty, startedAt: Date.now(),
      predicted, mode: opts.mode || 'practice', limit: opts.limit || 0,
      strain: 0.12, keys: [], backspaces: 0, typed: 0, stepped: false,
      finished: false, loading: true
    };
    AX.route('arena');
    renderArena();
    setTimeout(() => {
      if (!AX.state.arena || AX.state.arena.q.id !== q.id) return;
      AX.state.arena.loading = false;
      renderArena();
      const inp = document.querySelector('.step.is-active input');
      if (inp) inp.focus();
    }, 620);
    clearInterval(tick);
    tick = setInterval(paintClock, 1000);
  }

  /* ── clock + fatigue ticker ───────────────────────────── */
  function paintClock() {
    const a = A(); if (!a) return;
    const secs = Math.floor((Date.now() - a.startedAt) / 1000);
    const clock = el('arena-clock');
    if (clock) {
      if (a.mode === 'exam' && a.limit) {
        const left = Math.max(0, a.limit * 60 - secs);
        clock.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
        if (left === 0) finishArena(true);
      } else {
        clock.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
      }
    }
    updateStrain();
  }

  /* ── fatigue model ────────────────────────────────────── */
  function noteKey(e) {
    const a = A(); if (!a || a.finished) return;
    const now = Date.now();
    a.keys.push({ t: now, bs: e.key === 'Backspace' });
    a.keys = a.keys.filter(k => now - k.t < 30000);
    if (e.key === 'Backspace') { a.backspaces++; }
    a.typed++;
    updateStrain();
  }

  function updateStrain() {
    const a = A(); if (!a) return;
    const now = Date.now();
    const recent = a.keys.filter(k => now - k.t < 15000);
    const cpm = recent.length * 4;
    const bsRatio = a.typed ? a.backspaces / Math.max(1, a.typed) : 0;
    /* longest silence in the last 45s */
    const marks = [a.startedAt, ...a.keys.map(k => k.t), now];
    let longest = 0;
    for (let i = 1; i < marks.length; i++) longest = Math.max(longest, marks[i] - marks[i - 1]);
    const pause = AX.clamp((longest - 6000) / 22000, 0, 1);
    const speed = AX.clamp(cpm / 260, 0, 1);
    a.strain = AX.clamp(0.1 + pause * .55 + bsRatio * .35 + speed * .18, 0, 1);

    const fill = el('strain-fill'), label = el('strain-label');
    if (fill) fill.style.width = Math.round(a.strain * 100) + '%';
    if (label) {
      label.textContent = a.strain > .72 ? 'strain critical' : a.strain > .55 ? 'strained' : a.strain > .35 ? 'focused' : 'calm';
      label.style.color = a.strain > .72 ? 'var(--red)' : a.strain > .55 ? 'var(--amber)' : 'var(--green)';
    }
    el('strain-cpm').textContent = cpm + ' keys/min';
    el('strain-pause').textContent = pause > .05 ? 'long pause detected' : 'no long pauses';
    el('strain-bs').textContent = Math.round(bsRatio * 100) + '% backspace';

    if (a.strain > .7 && !a.stepped && !a.loading && !a.finished) {
      a.stepped = true;
      a.difficulty = Math.max(.2, a.difficulty - .08);
      const chip = el('adaptive-chip');
      if (chip) { chip.classList.add('stepped'); chip.innerHTML = '<span class="dot"></span>complexity stepped down'; }
      el('diff-label').textContent = a.difficulty.toFixed(2);
      AX.toast('Fatigue detected', 'Input cadence suggests strain — complexity stepped down and hints widened.', 'warn');
    }
  }

  /* ── rendering ────────────────────────────────────────── */
  function renderArena() {
    const a = A(); if (!a) return;
    const q = a.q;

    el('arena-title').textContent = q.title;
    el('arena-sub').textContent = a.mode === 'exam'
      ? 'Exam simulation · original timing · semantic grading'
      : 'Semantic grading · step-level diagnostics · fatigue-aware difficulty';
    el('arena-tag').textContent = q.tag + (a.mode === 'exam' ? ' · exam mode' : ' · adaptive');

    /* prediction */
    el('pred').textContent = Math.round(a.predicted * 100) + '%';
    el('pred-fill').style.width = (a.predicted * 100) + '%';
    el('pred-fill').style.background = a.predicted > .65 ? 'linear-gradient(90deg,#37f0a5,#3ce8ff)' : a.predicted > .45 ? 'linear-gradient(90deg,#ffc154,#3ce8ff)' : 'linear-gradient(90deg,#ff4d6d,#ffc154)';
    el('step-count').textContent = (Math.min(a.done.length + 1, q.steps.length)) + ' / ' + q.steps.length;
    el('diff-label').textContent = a.difficulty.toFixed(2);

    /* prompt */
    el('prompt-body').innerHTML = '<h2>' + esc(q.title) + '</h2><p>' + esc(q.prompt) + '</p>' +
      '<div class="given">' + (q.given || []).map(g => '<span class="given-pill">' + esc(g) + '</span>').join('') + '</div>';

    /* hint slider */
    const hr = el('hint-range');
    hr.max = q.steps.reduce((m, s) => Math.max(m, s.hints.length), 0);
    hr.value = a.hints;
    el('hint-level').textContent = a.hints + '/' + hr.max;
    hr.style.setProperty('--fill', (a.hints / hr.max * 100) + '%');
    renderHints();

    /* steps */
    const list = el('steps-list');
    if (a.loading) {
      list.innerHTML = '<div class="step is-active" style="text-align:center;padding:28px 12px;color:var(--txt-3);border-style:dashed">' +
        '<div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:10px">synthesising adaptive path</div>' +
        '<div style="font-size:26px;font-weight:600;color:var(--txt)">' + Math.round(a.predicted * 100) + '% <span style="font-size:11px;color:var(--txt-3);font-weight:400">predicted success</span></div>' +
        '<div class="bar" style="margin:12px auto 0;max-width:220px"><i style="width:' + (a.predicted * 100) + '%;background:linear-gradient(90deg,#3ce8ff,#9b6bff);animation:pulse 1s infinite"></i></div>' +
        '<p style="margin-top:12px;font-size:10.5px">Root-cause ancestry loaded · difficulty ' + a.difficulty.toFixed(2) + '</p></div>';
      el('pad').placeholder = '// pre-flight: question path is being generated…';
      return;
    }

    list.innerHTML = q.steps.map((s, i) => {
      const done = a.done.includes(i);
      const active = !done && a.step === i;
      const locked = !done && i > a.step;
      const err = a.errors[i];
      let body = '';
      if (done) {
        const ans = a._answers && a._answers[i];
        body = '<div class="step-answer"><svg class="ic" style="width:12px;height:12px;vertical-align:-2px"><use href="#i-check"/></svg> ' + esc(ans != null ? String(ans) : 'verified') + '</div>';
      } else if (active) {
        if (s.kind === 'code') {
          body = '<div class="step-answer" style="color:var(--txt-2);margin-bottom:6px">Write the solution in the scratchpad, then run it here.</div>' +
            '<div class="step-input"><button class="btn primary" style="flex:1;justify-content:center;font-size:11px" id="run-code"><svg class="ic"><use href="#i-play"/></svg>Run scratchpad against tests</button></div>';
        } else {
          body = '<div class="step-input"><input id="step-input" placeholder="' + (s.kind === 'num' ? 'numeric answer' + (s.unit ? ' (' + s.unit + ')' : '') : 'expression, e.g. Math.max(a, b)') + '" />' +
            '<button class="go" id="step-go" title="Check step"><svg class="ic"><use href="#i-arrow"/></svg></button></div>';
        }
      }
      if (err) {
        body += '<div class="err-panel"><div class="err-head"><svg class="ic"><use href="#i-x"/></svg>' + esc(err.head || 'Check failed') + '</div>' +
          esc(err.reason) +
          (err.root ? '<div class="root">root cause traced → <button class="root-chip" data-root="' + err.root.id + '">' + esc(err.root.label) + ' · ' + Math.round(err.root.mastery * 100) + '%</button>' +
            '<span style="opacity:.65">' + err.chain.length + '-node ancestry</span></div>' : '') + '</div>';
      }
      return '<div class="step ' + (done ? 'is-done' : active ? 'is-active' : 'is-locked') + '" data-i="' + i + '">' +
        '<div class="step-top"><span class="step-no">' + (done ? '✓' : i + 1) + '</span>' +
        '<span class="step-q">' + esc(s.prompt) + (s.unit ? '<em>' + esc(s.unit) + '</em>' : '') + '</span>' +
        (s.kind === 'code' ? '<span class="ttag">code</span>' : s.kind === 'expr' ? '<span class="ttag">expr</span>' : '<span class="ttag">numeric</span>') +
        '</div>' + body + '</div>';
    }).join('');

    /* wire step events */
    const inp = el('step-input');
    const go = el('step-go');
    if (inp && go) {
      const submit = () => grade(inp.value);
      go.onclick = submit;
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      inp.addEventListener('input', noteKey);
    }
    const rc = el('run-code');
    if (rc) rc.onclick = () => gradeCodeFromPad();

    list.querySelectorAll('.root-chip').forEach(b => b.onclick = () => {
      const id = b.dataset.root;
      AX.route('graph');
      AX.selectNode(id);
      if (AX.graph) AX.graph.flash(id, 2200);
      AX.toast('Root cause located', 'Ancestral weakness highlighted in the knowledge graph.', 'warn');
    });

    /* finish button state */
    const fin = el('arena-finish');
    fin.innerHTML = a.finished ? 'Next question <svg class="ic"><use href="#i-arrow"/></svg>' : 'Finish attempt <svg class="ic"><use href="#i-arrow"/></svg>';
    fin.onclick = () => {
      if (a.finished) {
        const idx = QUESTIONS.indexOf(q);
        startArena(QUESTIONS[(idx + 1) % QUESTIONS.length].id, { mode: a.mode, limit: a.limit });
      } else finishArena();
    };

    renderBugTags();
    renderDiagnostics();
    paintClock();
  }

  function renderHints() {
    const a = A(); if (!a) return;
    const out = el('hint-out');
    out.innerHTML = '';
    for (let i = 0; i < a.hints; i++) {
      const hint = a.q.steps[Math.min(a.step, a.q.steps.length - 1)].hints[i];
      if (!hint) continue;
      const card = document.createElement('div');
      card.className = 'hint-card';
      const labels = ['structural nudge', 'direction', 'next step', 'worked fragment', 'full proof'];
      card.innerHTML = '<small>hint ' + (i + 1) + ' · ' + labels[i] + '</small>' + esc(hint);
      out.appendChild(card);
    }
  }

  function renderBugTags() {
    const a = A();
    const bugs = AX.state.profile.bugs;
    const keys = Object.keys(bugs).sort((x, y) => bugs[y] - bugs[x]).slice(0, 8);
    const list = el('bug-tag-list');
    el('bug-count').textContent = Object.values(bugs).reduce((s, v) => s + v, 0);
    if (!keys.length) { list.innerHTML = '<p class="empty-note">No logic gaps stamped yet. Mistakes will be classified, not just counted.</p>'; return; }
    list.innerHTML = keys.map(k => {
      const b = BUG_TAXONOMY.find(x => x.key === k);
      return '<span class="bug-chip" title="' + esc(b.note) + '">' + esc(b.label) + '<b>' + bugs[k] + '</b></span>';
    }).join('');
  }

  /* ── grading ──────────────────────────────────────────── */
  function grade(given) {
    const a = A(); if (!a || a.loading || a.finished) return;
    const s = a.q.steps[a.step];
    let result;
    if (s.kind === 'num') result = AX.checkNumeric(given === undefined || given === '' ? '' : given, s.answer, s.tol || .01);
    else result = AX.checkExpr(String(given || ''), s.answer, s.vars || {});
    handleResult(s, result, String(given || ''));
  }

  function gradeCodeFromPad() {
    const a = A(); if (!a) return;
    const s = a.q.steps[a.step];
    const code = el('pad').value;
    if (!code.trim()) { AX.toast('Scratchpad empty', 'Write your function first.', 'warn'); return; }
    const result = AX.checkCode(code, s.tests || []);
    handleResult(s, result, code);
  }

  function handleResult(s, result, given) {
    const a = A(); if (!a) return;
    a._answers = a._answers || {};

    if (result.ok) {
      a.done.push(a.step);
      a._answers[a.step] = given;
      delete a.errors[a.step];
      AX.awardStep(a.q.node, .025);
      a.difficulty = AX.clamp(a.difficulty + .012, .2, .95);
      const chip = el('adaptive-chip');
      if (chip) { chip.classList.remove('stepped'); chip.innerHTML = '<span class="dot"></span>difficulty auto-scaling'; }
      const inp = el('step-input'); if (inp) inp.disabled = true;

      if (a.done.length === a.q.steps.length) {
        completeArena();
      } else {
        a.step = Math.max(a.step + 1, 0);
        a.hints = 0;
        AX.emit('refresh');
        renderArena();
        const next = document.querySelector('.step.is-active input');
        if (next) next.focus();
        AX.toast('Step verified', 'Symbolic check passed · next sub-goal unlocked.', 'good');
      }
      return;
    }

    /* failure path */
    a.attempts++;
    const bug = AX.classifyBug(s, result, given);
    AX.stampBug(bug);
    const trace = AX.traceRoots(a.q.node);
    const chain = trace.path || [];
    const root = trace.root;
    a.errors[a.step] = {
      head: bug.label,
      reason: result.reason || 'That does not satisfy the required relation.',
      bug, root, chain
    };
    if (root) {
      AX.state.profile.traces.unshift({
        q: a.q.title, node: a.q.node, root: root.id, chain: chain.map(c => c.label), ts: Date.now(), tag: bug.label
      });
      AX.state.profile.traces = AX.state.profile.traces.slice(0, 24);
    }

    if (a.attempts >= 2) {
      a.difficulty = Math.max(.2, a.difficulty - .05);
      const chip = el('adaptive-chip');
      if (chip) { chip.classList.add('stepped'); chip.innerHTML = '<span class="dot"></span>complexity stepped down'; }
    }

    AX.flashNode(a.q.node);
    AX.persist();
    renderArena();
    if (root) AX.toast('Root bottleneck traced', 'Weak ancestry: ' + root.label + ' (' + Math.round(root.mastery * 100) + '%). Tagged as ' + bug.label + '.', 'bad');
  }

  function completeArena() {
    const a = A(); if (!a) return;
    a.finished = true;
    const accuracy = a.done.length / a.q.steps.length;
    AX.completeQuestion(a.q, accuracy);
    if (a.predicted) AX.state.profile.predictions.push({ p: a.predicted, y: accuracy >= .75 ? 1 : 0 });
    AX.persist();
    AX.toast('Attempt complete', Math.round(accuracy * 100) + '% of steps verified · mastery updated · prediction logged.', 'good');
    renderArena();
  }

  function finishArena(timeUp) {
    const a = A(); if (!a) return;
    if (!a.finished) {
      const accuracy = a.done.length / a.q.steps.length;
      a.finished = true;
      AX.completeQuestion(a.q, Math.max(accuracy, .15));
      AX.toast(timeUp ? 'Time expired' : 'Attempt closed', Math.round(accuracy * 100) + '% steps verified · model updated.', timeUp ? 'warn' : 'info');
    }
    renderArena();
  }

  /* ── scratchpad ───────────────────────────────────────── */
  function initPad() {
    const pad = el('pad');
    const gutter = el('gutter');
    const diag = el('diag-bar');

    function sync() {
      const lines = pad.value.split('\n');
      gutter.innerHTML = lines.map((_, i) => i + 1).join('<br>');
      gutter.scrollTop = pad.scrollTop;
      document.querySelector('.diag-dim').textContent = lines.length + ' lines · ' + pad.value.length + ' chars';
      diagnostics(pad.value);
    }
    pad.addEventListener('scroll', () => { gutter.scrollTop = pad.scrollTop; });
    pad.addEventListener('input', () => { sync(); noteKey({ key: 'x' }); });
    pad.addEventListener('keydown', e => {
      noteKey(e);
      if (e.key === 'Tab') { e.preventDefault(); const s = pad.selectionStart; pad.setRangeText('  ', s, pad.selectionEnd, 'end'); sync(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); gradeCodeFromPad(); }
    });

    el('pad-clear').onclick = () => { pad.value = ''; sync(); el('inline-errors').innerHTML = ''; };
    el('pad-send').onclick = () => {
      const a = A(); if (!a || a.loading) return;
      const s = a.q.steps[a.step];
      const val = pad.value.trim();
      if (!val) return;
      if (s.kind === 'code') gradeCodeFromPad();
      else {
        const oneLine = val.split('\n').map(x => x.trim()).filter(x => x && !x.startsWith('//')).pop();
        const inp = el('step-input');
        if (inp) { inp.value = oneLine; grade(oneLine); }
      }
    };
    document.querySelectorAll('.pad-tools [data-lang]').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.pad-tools [data-lang]').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
      };
    });
    sync();
    AX._syncPad = sync;
  }

  function diagnostics(code) {
    const errs = [];
    const lines = code.split('\n');
    /* banned tokens */
    const banned = /\b(window|document|fetch|localStorage|eval|Function|require|process)\b/;
    lines.forEach((ln, i) => {
      if (banned.test(ln)) errs.push({ line: i + 1, msg: 'Restricted token used', fix: 'The sandbox permits pure computation only — remove references to host objects.', code: ln.trim() });
    });
    /* bracket balance */
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    lines.forEach((ln, i) => {
      for (const ch of ln) {
        if ('([{'.includes(ch)) stack.push({ ch, line: i + 1 });
        else if (pairs[ch]) {
          const top = stack.pop();
          if (!top || top.ch !== pairs[ch]) errs.push({ line: i + 1, msg: 'Unbalanced ' + ch, fix: 'Close the bracket opened at line ' + (top ? top.line : '?') + '.', code: ln.trim() });
        }
      }
    });
    if (stack.length) errs.push({ line: stack[stack.length - 1].line, msg: 'Unclosed ' + stack[stack.length - 1].ch, fix: 'Add the matching closing bracket.', code: lines[stack[stack.length - 1].line - 1].trim() });

    const box = el('inline-errors');
    if (box) {
      box.innerHTML = errs.slice(0, 6).map(e =>
        '<div class="inline-err"><b>line ' + e.line + '</b> · ' + esc(e.msg) +
        '<code>' + esc(e.code || '') + '</code><span class="fix">' + esc(e.fix) + '</span></div>'
      ).join('');
    }
    const status = el('diag-bar').querySelector('.diag-ok');
    if (status) {
      status.innerHTML = errs.length
        ? '<svg class="ic"><use href="#i-x"/></svg> ' + errs.length + ' diagnostic' + (errs.length > 1 ? 's' : '')
        : '<svg class="ic"><use href="#i-check"/></svg> syntax clean';
      status.classList.toggle('bad', errs.length > 0);
      status.classList.toggle('diag-ok', errs.length === 0);
    }
  }

  function renderDiagnostics() {
    const a = A(); if (!a) return;
    const pad = el('pad');
    if (a.loading) { pad.placeholder = '// pre-flight: question path is being generated…'; return; }
    const s = a.q.steps[a.step];
    if (s && s.kind === 'code' && !a.done.includes(a.step)) {
      if (!pad.value.trim()) {
        pad.value = '// implement the function required by the active step\n// it is executed directly against the hidden tests\n(args) => {\n  \n}\n';
        if (AX._syncPad) AX._syncPad();
      }
      pad.placeholder = '// write your function here';
    } else {
      pad.placeholder = '// scratchpad — write your working here\n// step answers can be typed here, then sent left';
    }
  }

  /* ── misc ─────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  AX.startArena = startArena;
  AX.Arena = {
    init() {
      initPad();
      el('hint-range').addEventListener('input', e => {
        const a = A(); if (!a) return;
        a.hints = parseInt(e.target.value, 10);
        el('hint-level').textContent = a.hints + '/' + e.target.max;
        e.target.style.setProperty('--fill', (a.hints / e.target.max * 100) + '%');
        renderHints();
      });
      el('arena-skip').onclick = () => {
        const a = A(); if (!a) return;
        const q = QUESTIONS[(QUESTIONS.indexOf(a.q) + 1) % QUESTIONS.length];
        startArena(q.id, { mode: a.mode, limit: a.limit });
      };
      el('arena-synth').onclick = () => {
        const q = AX.synthesizeQuestion();
        AX.toast('Synthetic drill generated', 'Adversarial intersection: ' + q._targets.join(' ∩ '), 'info');
        startArena(q);
      };
      window.addEventListener('keydown', e => {
        if (AX.state.view === 'arena' && e.key === 'Escape') {
          const sheet = el('profile-sheet'); if (sheet && !sheet.hidden) return;
        }
      });
    },
    render: renderArena
  };
})();
