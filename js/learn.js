/* ═══════════════════════════════════════════════════════════
   AXIOM · Study Anything — free-form, levelled roadmaps
   ═══════════════════════════════════════════════════════════ */
(function () {
  const AX = window.AX;
  const KEY_STORAGE = 'axiom.learn.key';
  const STATE_STORAGE = 'axiom.learn.state';

  AX.state.learn = AX.state.learn || {
    topic: '', level: 'beginner', key: '', roadmap: null, progress: {}
  };

  try {
    const raw = localStorage.getItem(STATE_STORAGE);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.topic) AX.state.learn.topic = s.topic;
      if (s.level) AX.state.learn.level = s.level;
      if (s.roadmap) AX.state.learn.roadmap = s.roadmap;
      if (s.progress) AX.state.learn.progress = s.progress;
    }
    const k = localStorage.getItem(KEY_STORAGE);
    if (k) AX.state.learn.key = k;
  } catch (e) {}

  AX.persistLearn = function () {
    try {
      localStorage.setItem(STATE_STORAGE, JSON.stringify({
        topic: AX.state.learn.topic,
        level: AX.state.learn.level,
        roadmap: AX.state.learn.roadmap,
        progress: AX.state.learn.progress
      }));
      if (AX.state.learn.key) localStorage.setItem(KEY_STORAGE, AX.state.learn.key);
      else localStorage.removeItem(KEY_STORAGE);
    } catch (e) {}
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function normalizeTopic(t) { return t.trim().toLowerCase().replace(/\s+/g, '-'); }

  async function generateWithLLM(topic, level, key) {
    const prompt = 'You are a patient, expert tutor. Create a study roadmap for the topic "' + topic + '" at ' + level + ' level. ' +
      'Return ONLY valid JSON (no markdown) with this exact shape: ' +
      '{"title":string,"overview":string,"level":string,"roadmap":[{"id":string,"title":string,"why":string,"how":string,"explain":[{"line":string,"detail":string}],"references":[{"title":string,"url":string}]}]}. ' +
      'Include 4 to 6 topics. Each topic: "why" (1-2 sentences why it is needed), "how" (1-2 sentences how it works), ' +
      '"explain" with 4 to 6 lines where "line" is a short code snippet or concept phrase and "detail" explains it, ' +
      '"references" with 2 to 3 real, working URLs (MDN, official docs, Wikipedia, Khan Academy, etc.). ' +
      'Be accurate and concrete. No invented URLs. Pure JSON only.';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.35
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('API ' + res.status + ': ' + txt.slice(0, 220));
    }
    const data = await res.json();
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) throw new Error('Empty response from API');
    return JSON.parse(content);
  }

  function renderRoadmap(roadmap) {
    const body = document.getElementById('learn-body');
    if (!body || !roadmap) return;
    const learn = AX.state.learn;
    const done = learn.progress || {};
    const total = roadmap.roadmap.length;
    const doneCount = roadmap.roadmap.filter(t => done[t.id]).length;
    body.innerHTML =
      '<div class="learn-roadmap">' +
      '<div class="learn-head"><h2>' + esc(roadmap.title) + '</h2><span class="learn-level">' + esc(roadmap.level || learn.level) + '</span></div>' +
      '<p class="learn-overview">' + esc(roadmap.overview) + '</p>' +
      '<div class="learn-progress">Progress: ' + doneCount + ' / ' + total + ' topics complete</div>' +
      '<ol class="learn-list">' +
      roadmap.roadmap.map((t, i) =>
        '<li class="learn-topic ' + (done[t.id] ? 'is-done' : '') + '" data-id="' + esc(t.id) + '">' +
        '<div class="learn-topic-head"><span class="learn-num">' + (i + 1) + '</span><h3>' + esc(t.title) + '</h3>' +
        '<label class="learn-check"><input type="checkbox" data-id="' + esc(t.id) + '" ' + (done[t.id] ? 'checked' : '') + ' /> done</label></div>' +
        '<div class="learn-why"><b>Why needed.</b> ' + esc(t.why) + '</div>' +
        '<div class="learn-how"><b>How it works.</b> ' + esc(t.how) + '</div>' +
        '<details class="learn-explain"><summary>Line-by-line explanation</summary><ul>' +
        (t.explain || []).map(e => '<li><code>' + esc(e.line) + '</code><span>' + esc(e.detail) + '</span></li>').join('') +
        '</ul></details>' +
        '<div class="learn-refs"><b>References.</b> ' +
        (t.references || []).map(r => '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.title) + '</a>').join(' · ') +
        '</div></li>'
      ).join('') +
      '</ol></div>';

    body.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.onchange = () => {
        if (cb.checked) AX.state.learn.progress[cb.dataset.id] = true;
        else delete AX.state.learn.progress[cb.dataset.id];
        AX.persistLearn();
        renderRoadmap(roadmap);
      };
    });
  }

  function setStatus(msg, kind) {
    const el = document.getElementById('learn-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'learn-status ' + (kind || '');
  }

  function renderSuggestions() {
    const box = document.getElementById('learn-suggest');
    if (!box) return;
    const keys = Object.keys(window.PACKS || {});
    box.innerHTML = keys.map(k => '<button class="fchip" data-topic="' + k + '">' + (window.PACKS[k].title) + '</button>').join('');
    box.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => {
      document.getElementById('learn-topic').value = b.dataset.topic.replace(/-/g, ' ');
    });
  }

  async function generate() {
    const topic = document.getElementById('learn-topic').value.trim();
    if (!topic) { setStatus('Type a topic first.', 'bad'); return; }
    const level = AX.state.learn.level;
    const key = (document.getElementById('learn-key').value || '').trim();
    AX.state.learn.topic = topic;
    AX.state.learn.key = key;
    AX.persistLearn();

    const btn = document.getElementById('learn-generate');
    btn.disabled = true;
    setStatus('Generating roadmap…', 'info');

    const normalized = normalizeTopic(topic);
    try {
      let roadmap;
      if (key) {
        roadmap = await generateWithLLM(topic, level, key);
      } else if (window.PACKS && window.PACKS[normalized]) {
        roadmap = { title: window.PACKS[normalized].title, overview: window.PACKS[normalized].overview, level: level, roadmap: window.PACKS[normalized].levels[level].roadmap };
      } else {
        // try partial match
        const match = Object.keys(window.PACKS || {}).find(k => k.includes(normalized) || normalized.includes(k));
        if (match) {
          roadmap = { title: window.PACKS[match].title, overview: window.PACKS[match].overview, level: level, roadmap: window.PACKS[match].levels[level].roadmap };
        } else {
          throw new Error('No curated pack for "' + topic + '". Add an API key to study any topic, or pick a curated topic below.');
        }
      }
      // normalize roadmap shape
      if (!roadmap.roadmap) throw new Error('Roadmap missing topics');
      AX.state.learn.roadmap = roadmap;
      AX.state.learn.progress = {};
      AX.logDailyActivity();
      AX.persistLearn();
      renderRoadmap(roadmap);
      setStatus('Roadmap ready · ' + roadmap.roadmap.length + ' topics · ' + (key ? 'generated live' : 'curated offline'), 'good');
    } catch (e) {
      setStatus(e.message, 'bad');
    } finally {
      btn.disabled = false;
    }
  }

  function render() {
    const learn = AX.state.learn;
    const topicEl = document.getElementById('learn-topic');
    const keyEl = document.getElementById('learn-key');
    if (topicEl) topicEl.value = learn.topic || '';
    if (keyEl) keyEl.value = learn.key || '';
    // level seg state
    document.querySelectorAll('#level-seg button').forEach(b => b.classList.toggle('is-active', b.dataset.level === learn.level));
    renderSuggestions();
    if (learn.roadmap) renderRoadmap(learn.roadmap);
  }

  AX.Learn = {
    init() {
      document.querySelectorAll('#level-seg button').forEach(b => {
        b.onclick = () => {
          document.querySelectorAll('#level-seg button').forEach(x => x.classList.remove('is-active'));
          b.classList.add('is-active');
          AX.state.learn.level = b.dataset.level;
          AX.persistLearn();
        };
      });
      document.getElementById('learn-generate').onclick = generate;
      document.getElementById('learn-topic').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); generate(); }
      });
      render();
    },
    render
  };
})();