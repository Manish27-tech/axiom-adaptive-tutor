# AXIOM · Adaptive Exam Lab

A self-contained, offline-first prototype of an AI-driven adaptive exam-prep tutor.
Single HTML file + modular vanilla JS — no build step, no CDN, no backend.

## Run

Open `index.html` in any modern browser, or serve the folder:

```bash
python -m http.server 8099
```

## Feature map (matches the technical brief)

**Four product pillars**
- `Knowledge Graph` — interactive 3D concept web (Three-less, hand-rolled perspective engine). Nodes colour by mastery / decay / bottleneck; time-machine slider forecasts retention.
- `Study Deck` — parameterised simulations (16 sim types) with live equations and an intuition ⇄ structural-analogy toggle.
- `Testing Arena` — split-screen semantic grading, step-level diagnostics, inline error panels, incremental hint slider, fatigue-aware adaptive difficulty, predicted-success pre-flight.
- `Study Anything` — type any topic, pick beginner/medium/master, get an in-depth line-by-line roadmap with references. Curated offline packs for 9 topics (Python, Data Structures, ML, Web Dev, SQL, Physics, JavaScript, Git, Docker); with an OpenAI-compatible API key, any topic is generated live.
- `Exam Vault` — 37 verified papers (JEE, NEET, GATE, IOI, ICPC, UGC NET, ISRO, BARC, NPTEL) with multi-filter (year block, stream, topic, difficulty) and simulated exam routines. Topics include ML, DL, AI, Cybersecurity, Blockchain, IT, and more.

**System intelligence**
- Root bottleneck tracing (ancestry walk to the weakest ancestor)
- Smart performance prediction (logistic model on mastery/retention/difficulty/fatigue)
- Cognitive bug tagging (9-tag classifier)
- Step-by-step logic grading (numeric, expression-equivalence, sandboxed code)
- Frustration & fatigue detection (cadence, pauses, backspace ratio)
- Custom review windows (decay-model scheduling, not a calendar)

**Elite enhancements**
- Concept time-machine slider
- Inline error highlighting
- Incremental hint peel slider
- Zero-knowledge peer mesh (BroadcastChannel, SHA-256 hashed aggregates, no server)
- Neuro-symbolic diagnostics (pattern + symbolic equivalence, hallucination guard)
- Generative synthetic deficit testing (adversarial drills from your weakest intersection)

## Architecture

```
index.html          shell, views, icon sprite
css/styles.css      design system + responsive breakpoints
js/packs.js          curated offline topic packs (6 topics × 3 levels)
js/learn.js          Study Anything view + LLM roadmap generation
js/core.js          state, persistence, memory model, grading, prediction, tracing, synth generator
js/graph.js         3D perspective engine (orbit, zoom, bloom, raycast)
js/study.js         study deck + 16 live simulations
js/arena.js         adaptive arena, scratchpad, fatigue, hints
js/vault.js         archive filters, blueprints, launch
js/diag.js          radar, decay curve, calibration, review windows, trace log
js/mesh.js          zero-knowledge peer mesh
js/main.js          routing, palette, inspector, ambience
```

## Notes

- All data is local (`localStorage`). Nothing leaves the device.
- Open a second browser tab to see two genuine mesh nodes negotiate.
- Press `1`–`6` to switch views, `⌘K` for the command palette.