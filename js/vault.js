/* ═══════════════════════════════════════════════════════════
   AXIOM · exam archive vault
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;

  const ALL_TOPICS = [...new Set(EXAMS.flatMap(e => e.topics))].sort((a, b) => a.localeCompare(b));

  // sort state
  let sortKey = 'year', sortDir = 'desc';

  function sortExams(rows) {
    return rows.sort((a, b) => {
      let va, vb;
      if (sortKey === 'year') { va = a.year; vb = b.year; }
      else if (sortKey === 'difficulty') { va = a.difficulty; vb = b.difficulty; }
      else if (sortKey === 'duration') { va = a.duration; vb = b.duration; }
      else if (sortKey === 'exam') { va = a.exam; vb = b.exam; }
      else { va = a.year; vb = b.year; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function diffInfo(d) {
    if (d >= .8) return { label: 'Elite', color: '#ff4d6d' };
    if (d >= .62) return { label: 'Competitive', color: '#ffc154' };
    return { label: 'Foundational', color: '#37f0a5' };
  }

  function matches(e) {
    const f = AX.state.vault;
    if (f.year !== 'all') {
      const [lo, hi] = f.year.split('-').map(Number);
      if (e.year < lo || e.year > hi) return false;
    }
    if (f.stream !== 'all' && e.stream !== f.stream) return false;
    if (f.diff !== 'all') {
      const d = diffInfo(e.difficulty).label.toLowerCase();
      if (f.diff === 'easy' && d !== 'foundational') return false;
      if (f.diff === 'mid' && d !== 'competitive') return false;
      if (f.diff === 'hard' && d !== 'elite') return false;
    }
    if (f.topics.length && !f.topics.every(t => e.topics.includes(t))) return false;
    if (f.q) {
      const hay = (e.exam + ' ' + e.year + ' ' + e.paper + ' ' + e.stream + ' ' + e.topics.join(' ')).toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  }

  function badgeClass(exam) {
    if (exam.startsWith('JEE Adv')) return 'jee';
    if (exam.startsWith('JEE Main')) return 'main';
    if (exam.startsWith('NEET')) return 'neet';
    return 'olympiad';
  }
  function badgeText(exam) {
    if (exam.startsWith('JEE Adv')) return 'ADV';
    if (exam.startsWith('JEE Main')) return 'MAIN';
    if (exam.startsWith('NEET')) return 'NEET';
    if (exam.startsWith('INPhO')) return 'INPhO';
    if (exam.startsWith('IOQM')) return 'IOQM';
    return exam.slice(0, 4).toUpperCase();
  }

  function renderChips() {
    const box = document.getElementById('topic-chips');
    if (!box) return;
    box.innerHTML = ALL_TOPICS.map(t => {
      const on = AX.state.vault.topics.includes(t);
      return '<button class="fchip' + (on ? ' is-active' : '') + '" data-topic="' + t + '">' + t + '</button>';
    }).join('');
    box.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => {
      const t = b.dataset.topic;
      const arr = AX.state.vault.topics;
      const i = arr.indexOf(t);
      i >= 0 ? arr.splice(i, 1) : arr.push(t);
      renderChips(); renderTable();
    });
  }

  function renderTable() {
    const body = document.getElementById('vault-body');
    if (!body) return;
    const rows = sortExams(EXAMS.filter(matches));
    document.getElementById('vault-count').textContent = rows.length;
    const avg = rows.length ? rows.reduce((s, e) => s + e.difficulty, 0) / rows.length : 0;
    document.getElementById('vault-avg').textContent = rows.length ? avg.toFixed(2) : '—';
    document.getElementById('vault-cov').textContent = rows.length
      ? Math.round(rows.reduce((s, e) => s + e.topics.length, 0) / rows.length) + ' topics / paper'
      : '—';
    document.getElementById('vault-empty').classList.toggle('show', !rows.length);

    body.innerHTML = rows.map(e => {
      const open = AX.state.vault.open === e.id;
      const di = diffInfo(e.difficulty);
      const main = '<tr data-id="' + e.id + '" class="' + (open ? 'is-open' : '') + '">' +
        '<td><div class="exam-name"><span class="exam-badge ' + badgeClass(e.exam) + '">' + badgeText(e.exam) + '</span>' + e.exam + '</div></td>' +
        '<td>' + e.year + '</td>' +
        '<td>' + e.paper + '</td>' +
        '<td>' + e.stream + '</td>' +
        '<td><div class="topic-tags">' + e.topics.slice(0, 3).map(t => '<span class="ttag">' + t + '</span>').join('') +
        (e.topics.length > 3 ? '<span class="ttag">+' + (e.topics.length - 3) + '</span>' : '') + '</div></td>' +
        '<td>' + e.duration + ' min</td>' +
        '<td><div class="diff-cell"><div class="bar"><i style="width:' + (e.difficulty * 100) + '%;background:linear-gradient(90deg,' + di.color + '88,' + di.color + ')"></i></div><span class="diff-no">' + e.difficulty.toFixed(2) + '</span></div></td>' +
        '<td><svg class="ic row-arrow"><use href="#i-chev"/></svg></td></tr>';

      if (!open) return main;
      const detail = '<tr class="vault-detail-row"><td colspan="8"><div class="vault-detail">' +
        '<div><div class="bp-title">Topic blueprint · weight</div>' +
        e.blueprint.map(([t, w]) => '<div class="bp-row"><span>' + t + '</span><div class="bar"><i style="width:' + w + '%;background:linear-gradient(90deg,rgba(60,232,255,.5),#3ce8ff)"></i></div><b>' + w + '%</b></div>').join('') +
        '</div><div><div class="detail-meta">' +
        '<span class="dm">questions <b>' + e.questions + '</b></span>' +
        '<span class="dm">marks <b>' + e.marks + '</b></span>' +
        '<span class="dm">duration <b>' + e.duration + ' min</b></span>' +
        '<span class="dm">difficulty <b>' + di.label + '</b></span>' +
        '<span class="dm">source <b>' + e.source + '</b></span></div>' +
        '<p class="panel-note" style="padding:0">Simulation clock is compressed to 8:00 for the prototype; the original constraint (' + e.duration + ' min) is preserved in the exam record.</p>' +
        '<div class="detail-actions">' +
        '<button class="btn primary" data-launch="' + e.id + '"><svg class="ic"><use href="#i-play"/></svg>Launch simulated exam</button>' +
        '<button class="btn ghost" data-schedule="' + e.id + '"><svg class="ic"><use href="#i-clock"/></svg>Schedule blueprint review</button>' +
        '</div></div></div></td></tr>';
      return main + detail;
    }).join('');

    body.querySelectorAll('tr[data-id]').forEach(tr => tr.onclick = () => {
      AX.state.vault.open = AX.state.vault.open === tr.dataset.id ? null : tr.dataset.id;
      renderTable();
    });
    body.querySelectorAll('[data-launch]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      launch(b.dataset.launch);
    });
    body.querySelectorAll('[data-schedule]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      schedule(b.dataset.schedule);
    });
  }

  function launch(id) {
    const e = EXAMS.find(x => x.id === id); if (!e) return;
    /* choose the question whose ancestry overlaps most with this paper */
    let best = QUESTIONS[0], score = -1;
    QUESTIONS.forEach(q => {
      const s = q.chain.filter(c => e.chain.includes(c)).length;
      if (s > score) { score = s; best = q; }
    });
    AX.toast('Simulation armed', e.exam + ' ' + e.year + ' · ' + e.paper + ' · 8:00 clock (was ' + e.duration + ' min).', 'info');
    AX.startArena(best.id, { mode: 'exam', limit: 8 });
  }

  function schedule(id) {
    const e = EXAMS.find(x => x.id === id); if (!e) return;
    const ids = [...new Set(e.topics.flatMap(t => {
      const n = AX.state.nodes.find(x => x.label === t);
      return n ? [n.id, ...n.deps] : [];
    }))];
    ids.forEach(nid => {
      const n = AX.getNode(nid);
      if (n && !AX.state.profile.reviews.some(r => r.node === nid && Date.now() - r.ts < 3600e3)) {
        AX.state.profile.reviews.unshift({ node: nid, ts: Date.now(), type: 'blueprint' });
      }
    });
    AX.persist();
    AX.emit('refresh');
    AX.toast('Blueprint scheduled', ids.length + ' concepts queued into decay-based review windows.', 'good');
  }

  function init() {
    const f = AX.state.vault;
    renderChips();

    document.getElementById('vault-search').addEventListener('input', e => { f.q = e.target.value; renderTable(); });
    document.querySelectorAll('#year-seg button').forEach(b => b.onclick = () => {
      document.querySelectorAll('#year-seg button').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      f.year = b.dataset.year;
      renderTable();
    });
    document.getElementById('stream-select').onchange = e => { f.stream = e.target.value; renderTable(); };
    document.getElementById('diff-select').onchange = e => { f.diff = e.target.value; renderTable(); };
    document.getElementById('sort-select').onchange = e => {
      const [key, dir] = e.target.value.split('-');
      sortKey = key; sortDir = dir;
      renderTable();
    };
    document.getElementById('vault-reset').onclick = () => {
      Object.assign(f, { q: '', year: 'all', stream: 'all', diff: 'all', topics: [], open: null });
      document.getElementById('vault-search').value = '';
      document.getElementById('stream-select').value = 'all';
      document.getElementById('diff-select').value = 'all';
      document.querySelectorAll('#year-seg button').forEach(x => x.classList.toggle('is-active', x.dataset.year === 'all'));
      renderChips(); renderTable();
    };
    document.getElementById('vault-random').onclick = () => {
      const pool = EXAMS.filter(matches);
      const e = (pool.length ? pool : EXAMS)[Math.floor(Math.random() * (pool.length || EXAMS.length))];
      f.open = e.id;
      renderTable();
      document.querySelector('.vault-table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
      AX.toast('Random paper drawn', e.exam + ' ' + e.year + ' · ' + e.paper, 'info');
    };
    renderTable();
  }

  AX.Vault = { init, render: renderTable };
})();
