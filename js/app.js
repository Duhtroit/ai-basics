/* AI Basics, application: routing, rendering, quizzes, progress, review, exam. */
(function () {
  'use strict';

  var A = window.AIM, K = A.kit, el = K.el;
  var main = document.getElementById('main');
  var railNav = document.getElementById('railNav');
  var rail = document.getElementById('rail');
  var railToggle = document.getElementById('railToggle');

  var STEPS = [1, 3, 7, 16];
  var store = K.store('aim.progress.v1', { checks: {}, tests: {}, review: {}, visited: {}, exam: null });
  var progress = store.get();
  if (!progress.checks) progress.checks = {};
  if (!progress.tests) progress.tests = {};
  if (!progress.review) progress.review = {};
  if (!progress.visited) progress.visited = {};

  function save() { store.set(progress); }
  function metas() { return (A.manifest || []).slice().sort(function (a, b) { return a.n - b.n; }); }
  function meta(n) { return metas().filter(function (u) { return u.n === n; })[0]; }
  function units() { return A.units.slice().sort(function (a, b) { return a.n - b.n; }); }
  function unit(n) { return units().filter(function (u) { return u.n === n; })[0]; }
  function concepts() { return units().reduce(function (acc, u) { return acc.concat(u.concepts.map(function (c) { return { u: u, c: c }; })); }, []); }
  function conceptById(id) {
    var full = concepts().filter(function (x) { return x.c.id === id; })[0];
    if (full) return full;
    var ms = metas();
    for (var i = 0; i < ms.length; i++) {
      for (var j = 0; j < ms[i].concepts.length; j++) {
        if (ms[i].concepts[j].id === id) return { u: ms[i], c: ms[i].concepts[j] };
      }
    }
  }
  function checkCount(c) { return c.check ? c.check.length : (c.checks || 2); }

  function unitDone(u) {
    return u.concepts.every(function (c) {
      var s = progress.checks[c.id];
      return s && s.a && s.a.length === checkCount(c) && s.a.every(function (v) { return v === true; });
    });
  }
  function completion() {
    var all = [];
    metas().forEach(function (u) { u.concepts.forEach(function (c) { all.push({ u: u, c: c }); }); });
    var done = all.filter(function (x) {
      var s = progress.checks[x.c.id];
      return s && s.a && s.a.length === checkCount(x.c) && s.a.every(Boolean);
    });
    return { done: done.length, total: all.length, pct: all.length ? done.length / all.length : 0 };
  }
  function maxVisited() {
    var m = 0;
    Object.keys(progress.visited).forEach(function (n) { m = Math.max(m, parseInt(n, 10) || 0); });
    return m;
  }
  function dueReview() {
    var top = maxVisited();
    return Object.keys(progress.review).map(function (k) {
      var r = progress.review[k];
      var wait = STEPS[Math.min(r.box, STEPS.length - 1)];
      r.key = k;
      r.due = top - r.unit >= wait || r.box >= STEPS.length;
      return r;
    }).filter(function (r) { return r.due; });
  }

  function updateChrome() {
    var c = completion();
    var bar = document.getElementById('railMeterBar');
    var meterLabel = document.getElementById('railMeterLabel');
    var top = document.getElementById('topbarProgress');
    if (bar) bar.style.width = (c.pct * 100).toFixed(1) + '%';
    if (meterLabel) meterLabel.textContent = Math.round(c.pct * 100) + '% complete';
    if (top) top.textContent = c.done + ' of ' + c.total + ' concepts';
    var count = document.getElementById('reviewCount');
    if (count) count.textContent = String(dueReview().length);
    railNav.querySelectorAll('.rail-item').forEach(function (a) {
      var u = meta(parseInt(a.dataset.unit, 10));
      a.classList.toggle('done', u && unitDone(u));
    });
  }

  function buildRail() {
    K.clear(railNav);
    metas().forEach(function (u) {
      railNav.appendChild(el('a', {
        class: 'rail-item', href: '#/unit/' + u.n, dataset: { unit: u.n },
        style: { '--h': u.hue }
      },
        el('span', { class: 'num', text: String(u.n).padStart(2, '0') }),
        el('span', { class: 'name', text: u.short || u.title }),
        el('span', { class: 'tick', 'aria-hidden': 'true' })
      ));
    });
    updateChrome();
  }

  /* Lesson files load on demand. Only the current unit's prose, widgets and
     scenes are fetched, so a unit page stays well under its size budget. */
  var scriptCache = {};
  function loadScript(src) {
    if (!scriptCache[src]) {
      scriptCache[src] = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error('Could not load ' + src)); };
        document.head.appendChild(s);
      });
    }
    return scriptCache[src];
  }
  function ensureUnit(n) {
    var m = meta(n);
    if (!m) return Promise.reject(new Error('Unknown unit ' + n));
    return Promise.all(['js/scenes.js', 'js/widgets/connections.js', m.file, m.widget].concat(m.extraWidgets || []).map(loadScript));
  }
  function ensureAllContent() {
    return Promise.all(metas().map(function (m) { return loadScript(m.file); }));
  }
  function ensureHome() {
    var m = meta(1);
    return m ? loadScript(m.widget) : Promise.resolve();
  }

  var routeToken = 0;
  async function setRoute() {
    var token = ++routeToken;
    rail.classList.remove('open');
    railToggle.setAttribute('aria-expanded', 'false');
    var parts = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    var focus = null;
    main.className = '';
    K.clear(main);
    try {
      if (parts[0] === 'unit' && parts[1]) {
        var n = parseInt(parts[1], 10);
        if (parts[2] === 'c' && parts[3]) focus = parts[3];
        await ensureUnit(n);
        if (token !== routeToken) return;
        renderUnit(n, focus);
      } else if (parts[0] === 'review') {
        await ensureAllContent();
        if (token !== routeToken) return;
        renderReview();
      } else if (parts[0] === 'exam') {
        await ensureAllContent();
        if (token !== routeToken) return;
        renderExam();
      } else {
        await ensureHome();
        if (token !== routeToken) return;
        renderHome();
      }
    } catch (e) {
      if (token !== routeToken) return;
      K.clear(main).appendChild(el('div', { class: 'page' },
        el('p', { class: 'lab-note', text: 'This page could not load its lesson files. Reload to try again.' })));
      if (window.console) console.error(e);
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    updateChrome();
  }

  /* ---------- shared blocks ---------- */
  function block(n, label, content, extra) {
    return el('div', { class: 'block ' + (extra || '') },
      el('div', { class: 'eyebrow' },
        el('span', { class: 'n', text: String(n).padStart(2, '0') }),
        el('span', { class: 'l', text: label })),
      content);
  }

  function sceneBlock(c, scene) {
    var fig = el('figure', { class: 'scene-figure', dataset: { concept: c.id } });
    var host = el('div', { class: 'scene-host' });
    host.dataset.widget = 'metaphor-scene';
    host.dataset.mode = 'scene';
    host.__lab = { scene: c.id, mode: 'scene', sceneId: c.id };
    fig.appendChild(host);
    fig.appendChild(el('div', { class: 'scene-caption' },
      el('p', {}, el('b', { text: 'Try this' }), scene.tryText || ('Drag the ' + (scene.actorName || 'marker') + ' through the scene.')),
      el('p', {}, el('b', { text: 'What to notice' }), scene.notice || 'The same situation looks different at each stop.')));
    return fig;
  }

  function lab(spec, kind) {
    var fig = el('figure', { class: 'lab' });
    fig.appendChild(el('div', { class: 'lab-head' },
      el('div', {},
        el('div', { class: 'lab-kicker', text: kind || 'Interaction' }),
        el('h3', { text: spec.title || '' })),
      el('span', { class: 'lab-mode', text: spec.modeLabel || (spec.mode === 'rung3' ? 'Sandbox' : spec.mode === 'rung2' ? 'Mechanism' : 'Metaphor') })));
    var stage = el('div', { class: 'lab-stage' });
    var host = el('div', { class: 'lab-widget' });
    host.dataset.widget = spec.widget;
    host.dataset.mode = spec.mode || 'rung1';
    host.__lab = spec;
    stage.appendChild(host);
    fig.appendChild(stage);
    fig.appendChild(el('div', { class: 'lab-caption' },
      el('p', {}, el('b', { text: 'Try this' }), spec.tryText || ''),
      el('p', {}, el('b', { text: 'What to notice' }), spec.notice || '')));
    return fig;
  }

  var observer = null;
  function mountWidgets(root) {
    var hosts = root.querySelectorAll('[data-widget]:not([data-mounted])');
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          mountOne(en.target);
          observer.unobserve(en.target);
        });
      }, { rootMargin: '500px 0px' });
    }
    hosts.forEach(function (h) { observer.observe(h); });
  }

  function mountOne(host) {
    if (host.dataset.mounted) return;
    host.dataset.mounted = '1';
    var def = A.widgets[host.dataset.widget];
    if (!def) {
      host.appendChild(el('p', { class: 'lab-note', text: 'Interaction unavailable: ' + host.dataset.widget }));
      return;
    }
    try {
      var inst = def.mount(host, host.__lab || { mode: host.dataset.mode });
      host.__instance = inst;
    } catch (e) {
      host.appendChild(el('p', { class: 'lab-note', text: 'This interaction could not start.' }));
      if (window.console) console.error(e);
    }
  }

  function checkBlock(c) {
    var wrap = el('div', { class: 'check', dataset: { check: c.id } });
    var score = el('span', { class: 'score' });
    wrap.appendChild(el('div', { class: 'check-head' },
      el('span', { class: 'k', text: 'Knowledge check' }), score));
    var list = el('ol', { class: 'qlist' });
    var saved = progress.checks[c.id] || { a: [] };

    function refresh() {
      var answered = saved.a.filter(function (v) { return v != null; }).length;
      var right = saved.a.filter(Boolean).length;
      score.textContent = answered + ' of ' + c.check.length + ' answered, ' + right + ' correct';
    }

    c.check.forEach(function (q, qi) {
      var item = el('li', { class: 'q', dataset: { q: qi } });
      item.appendChild(el('p', { class: 'q-text' }, el('span', { class: 'qnum', text: String(qi + 1).padStart(2, '0') }), q.q));
      var opts = el('div', { class: 'opts', role: 'group', 'aria-label': 'Answer options' });
      var fb = el('div', { class: 'q-feedback', 'aria-live': 'polite' });
      var buttons = [];
      var done = saved.a[qi] != null;

      q.options.forEach(function (text, oi) {
        var b = el('button', {
          type: 'button', class: 'opt', dataset: { o: oi },
          onclick: function () { answer(oi); }
        },
          el('span', { class: 'letter', text: 'ABCD'[oi] }),
          el('span', { text: text }));
        buttons.push(b); opts.appendChild(b);
      });

      function paint(chosen) {
        buttons.forEach(function (b, i) {
          b.disabled = true;
          b.classList.toggle('sel', i === chosen);
          if (i === q.answer) b.classList.add('correct');
          if (i === chosen && chosen !== q.answer) b.classList.add('wrong');
        });
        var ok = chosen === q.answer;
        fb.className = 'q-feedback show ' + (ok ? 'ok' : 'no');
        K.clear(fb);
        fb.appendChild(el('span', { class: 'verdict', text: ok ? 'Correct' : 'Not quite' }));
        fb.appendChild(el('span', { html: (ok ? '' : '<b>Answer: ' + 'ABCD'[q.answer] + '.</b> ') + q.explain }));
        refresh();
      }

      function answer(oi) {
        if (saved.a[qi] != null) return;
        saved.a[qi] = oi === q.answer;
        progress.checks[c.id] = saved;
        if (oi !== q.answer) {
          var key = c.id + ':' + qi;
          progress.review[key] = { box: 0, unit: c.unit, concept: c.id, q: qi, at: Date.now() };
        }
        save(); paint(oi); updateChrome();
        K.announce(oi === q.answer ? 'Correct' : 'Incorrect. The answer is ' + 'ABCD'[q.answer]);
      }

      if (done) {
        // Rehydrate: show the correct answer and whether the stored attempt was right.
        buttons.forEach(function (b, i) { b.disabled = true; if (i === q.answer) b.classList.add('correct'); });
        var was = saved.a[qi];
        fb.className = 'q-feedback show ' + (was ? 'ok' : 'no');
        fb.appendChild(el('span', { class: 'verdict', text: was ? 'Correct' : 'Not quite' }));
        fb.appendChild(el('span', { html: (was ? '' : '<b>Answer: ' + 'ABCD'[q.answer] + '.</b> ') + q.explain }));
      }

      item.appendChild(opts); item.appendChild(fb);
      list.appendChild(item);
    });

    wrap.appendChild(list);
    refresh();
    return wrap;
  }

  function connectionCard(cx) {
    var choices = cx.options;
    var wrap = el('div', { class: 'bridge' });
    wrap.appendChild(el('div', { class: 'k', text: cx.kicker || 'Build the bridge' }));
    wrap.appendChild(el('p', { class: 'prose', style: { fontSize: '15px' }, text: cx.prompt }));
    wrap.appendChild(el('div', { class: 'pair' },
      el('div', { class: 'node', text: cx.a }),
      el('div', { class: 'join', text: 'to' }),
      el('div', { class: 'node late', text: cx.b })));
    var opts = el('div', { class: 'opts' });
    var fb = el('div', { class: 'fb', 'aria-live': 'polite' });
    choices.forEach(function (o, i) {
      opts.appendChild(el('button', {
        class: 'opt', type: 'button', onclick: function () {
          if (wrap.dataset.done) return;
          wrap.dataset.done = '1';
          opts.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
          this.classList.add(o.ok ? 'correct' : 'wrong');
          if (!o.ok) {
            var good = opts.querySelector('[data-good="1"]');
            if (good) good.classList.add('correct');
          }
          fb.className = 'fb show';
          fb.innerHTML = (o.ok ? '<b>Yes.</b> ' : '<b>Not this one.</b> ') + cx.explain;
          K.announce(o.ok ? 'Correct' : 'Incorrect');
        },
        dataset: o.ok ? { good: '1' } : {}
      }, el('span', { class: 'letter', text: 'ABCD'[i] }), el('span', { text: o.label })));
    });
    wrap.appendChild(opts); wrap.appendChild(fb);
    return wrap;
  }

  function pairCard(p) {
    var wrap = el('div', { class: 'bridge paircheck' });
    wrap.appendChild(el('div', { class: 'k', text: 'Same or different' }));
    wrap.appendChild(el('div', { class: 'pair' },
      el('div', { class: 'node', text: p.a }),
      el('div', { class: 'join', text: 'and' }),
      el('div', { class: 'node late', text: p.b })));
    wrap.appendChild(el('p', { class: 'pair-claim', text: p.claim }));
    var opts = el('div', { class: 'opts' });
    var fb = el('div', { class: 'fb', 'aria-live': 'polite' });
    [{ label: 'Same', same: true }, { label: 'Different', same: false }].forEach(function (choice) {
      opts.appendChild(el('button', {
        class: 'opt', type: 'button', dataset: { same: String(choice.same) },
        onclick: function () {
          if (wrap.dataset.done) return;
          wrap.dataset.done = '1';
          var ok = choice.same === p.same;
          opts.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
          this.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) {
            var good = opts.querySelector('[data-same="' + p.same + '"]');
            if (good) good.classList.add('correct');
          }
          fb.className = 'fb show';
          fb.innerHTML = (ok ? '<b>Yes.</b> ' : '<b>Not quite.</b> ') + p.explain;
          K.announce(ok ? 'Correct' : 'Incorrect');
        }
      }, el('span', { class: 'letter', text: choice.label.charAt(0) }), el('span', { text: choice.label })));
    });
    wrap.appendChild(opts); wrap.appendChild(fb);
    return wrap;
  }

  function conceptSection(u, c, idx) {
    var scene = A.scenes && A.scenes[c.id];
    var sec = el('section', { class: 'concept', id: 'c-' + c.id, dataset: { concept: c.id }, style: { '--h': u.hue } });
    if (scene) {
      var hue = scene.hue == null ? u.hue : scene.hue;
      sec.classList.add('scene-themed');
      sec.style.setProperty('--accent', 'oklch(.54 .13 ' + hue + ')');
      sec.style.setProperty('--accent-ink', 'oklch(.42 .12 ' + hue + ')');
      sec.style.setProperty('--accent-soft', 'oklch(.54 .13 ' + hue + ' / .13)');
      sec.style.setProperty('--scene-bg', 'oklch(.955 .035 ' + hue + ')');
      sec.style.setProperty('--scene-ink', 'oklch(.31 .04 ' + hue + ')');
    }
    c.unit = u.n;
    sec.appendChild(el('div', { class: 'concept-head' },
      el('div', { class: 'kicker' },
        el('span', { class: 'dot', 'aria-hidden': 'true' }),
        el('span', { text: 'Concept ' + (idx + 1) + ' of ' + u.concepts.length }),
        el('span', { text: 'Lecture ' + c.lecture.ref })),
      el('h2', { text: c.title }),
      c.prereqs && c.prereqs.length ? el('p', { class: 'prereq', html: 'Before this: ' + c.prereqs.map(function (p) {
        var found = conceptById(p);
        return found ? '<a href="#/unit/' + found.u.n + '/c/' + p + '">' + found.c.title + '</a>' : p;
      }).join(', ') }) : null));

    // 1 use case
    sec.appendChild(block(1, 'Use case', el('div', { class: 'usecase' },
      el('p', { class: 'scene', text: c.usecase })), 'usecase-block'));

    // 2 the metaphor, playable, then its mapping and rung 1
    if (scene) sec.appendChild(sceneBlock(c, scene));
    var mapRows = c.metaphor.mapping.map(function (r) {
      return el('tr', {}, r.map(function (cell) { return el('td', { text: cell }); }));
    });
    var metaphor = el('div', { class: 'metaphor' },
      el('div', { class: 'name', text: c.metaphor.name }),
      el('p', { class: 'claim', text: c.metaphor.claim }),
      el('table', { class: 'map-table' },
        el('thead', {}, el('tr', {}, el('th', { text: 'In the metaphor' }), el('th', { text: 'In the model' }), el('th', { text: 'You do' }))),
        el('tbody', {}, mapRows)));
    sec.appendChild(block(2, 'Metaphor and mapping', metaphor));
    // The scene is rung 1. Where a scene exists it replaces the generic first lab.
    if (!scene) sec.appendChild(lab(Object.assign({ widget: c.metaphor.widget, mode: 'rung1', modeLabel: 'Metaphor' }, c.metaphor.lab), 'Rung 1, the metaphor'));

    // 3 idea
    sec.appendChild(block(3, 'The idea', el('div', { class: 'prose', html: c.idea })));

    // 4 lecture
    sec.appendChild(block(4, 'From the lecture', el('div', { class: 'lecture' },
      el('div', { class: 'ref' },
        el('span', { class: 'tag', text: 'Lecture ' + c.lecture.ref }),
        el('span', { class: 'src', text: c.lecture.source })),
      el('p', { class: 'quote', html: c.lecture.text }))));

    // 5 mechanics
    var symbols = el('table', { class: 'symbols' },
      el('thead', {}, el('tr', {}, el('th', { text: 'Symbol' }), el('th', { text: 'Means' }))),
      el('tbody', {}, c.mechanics.symbols.map(function (s) {
        return el('tr', {}, el('td', { html: s[0] }), el('td', { html: s[1] }));
      })));
    sec.appendChild(block(5, 'Mechanics', el('div', { class: 'mechanics' },
      el('div', { class: 'formula', html: c.mechanics.formula }),
      symbols,
      el('div', { class: 'worked', html: c.mechanics.worked }))));

    // 6 rung 2
    if (c.mechanism) sec.appendChild(lab(Object.assign({ widget: c.mechanism.widget, mode: 'rung2', modeLabel: 'Mechanism' }, c.mechanism.lab), 'Rung 2, the mechanism'));

    // 7 rung 3
    if (c.sandbox) sec.appendChild(lab(Object.assign({ widget: c.sandbox.widget, mode: 'rung3', modeLabel: 'Sandbox' }, c.sandbox.lab), 'Rung 3, no metaphor'));

    // 8 breaks
    sec.appendChild(block(c.sandbox ? 8 : 7, 'Where it breaks', el('div', { class: 'breaks' },
      el('p', { text: c.breaks }))));

    // 9 check
    sec.appendChild(block(c.sandbox ? 9 : 8, 'Knowledge check', checkBlock(c)));

    // 10 connection
    sec.appendChild(block(c.sandbox ? 10 : 9, 'Connection', connectionCard(c.connection)));

    // 11 recap
    sec.appendChild(block(c.sandbox ? 11 : 10, 'Recap', el('div', {},
      el('div', { class: 'recap' }, c.recap.map(function (r, i) {
        return el('div', {}, el('span', { class: 'n', text: String(i + 1).padStart(2, '0') }), el('p', { text: r }));
      })),
      el('p', { class: 'note', text: c.now }))));

    return sec;
  }

  /* ---------- unit ---------- */
  function renderUnit(n, focus) {
    var u = unit(n);
    if (!u) { renderHome(); return; }
    progress.visited[n] = Date.now(); save();
    main.style.setProperty('--h', u.hue);
    document.title = u.title + ' | AI Basics';

    var page = el('div', { class: 'page', style: { '--h': u.hue } });
    page.appendChild(el('header', { class: 'unit-head' },
      el('div', { class: 'kicker' }, el('span', { text: 'Unit ' + String(u.n).padStart(2, '0') }), el('span', { text: u.weeks })),
      el('h1', { text: u.title }),
      el('p', { class: 'promise', text: u.promise }),
      el('div', { class: 'unit-meta' },
        el('span', { text: u.concepts.length + ' concepts' }),
        el('span', { text: u.minutes + ' min read' }),
        el('span', { text: u.lectures.length + ' lectures' }),
        el('span', { text: u.concepts.reduce(function (a, c) { return a + (c.mechanism ? 1 : 0) + (c.sandbox ? 1 : 0) + 1 + (A.scenes && A.scenes[c.id] ? 1 : 0); }, 0) + ' interactions' }))));

    var contents = el('nav', { class: 'unit-contents', 'aria-label': 'Unit contents' });
    u.concepts.forEach(function (c, i) {
      contents.appendChild(el('a', { href: '#/unit/' + u.n + '/c/' + c.id },
        el('span', { class: 'n', text: String(i + 1).padStart(2, '0') }),
        el('span', { class: 't', text: c.title })));
    });
    page.appendChild(contents);

    u.concepts.forEach(function (c, i) { page.appendChild(conceptSection(u, c, i)); });

    // unit test
    page.appendChild(unitTest(u));

    // connections and map
    page.appendChild(el('section', { class: 'concept', id: 'connections', style: { '--h': u.hue } },
      el('div', { class: 'concept-head' },
        el('div', { class: 'kicker' }, el('span', { class: 'dot' }), el('span', { text: 'Connections' })),
        el('h2', { text: 'Link what you know' })),
      u.connections.map(connectionCard),
      u.pairs && u.pairs.length ? el('div', { class: 'pair-set' },
        el('h3', { class: 'pair-head', text: 'Same or different' }),
        el('p', { class: 'note', text: 'A claim about two ideas. Decide whether it holds for both.' }),
        u.pairs.map(pairCard)) : null,
      u.map ? lab({
        widget: 'concept-map', mode: 'rung3', modeLabel: 'Map',
        title: 'Draw the unit map',
        map: u.map,
        tryText: 'Drag the cards, then click one card and another to draw an edge. Check your map against the reference.',
        notice: 'A correct map means you can name the relation, not only the two ideas.'
      }, 'Connection exercise') : null));

    // prev / next
    var prev = meta(u.n - 1), next = meta(u.n + 1);
    page.appendChild(el('nav', { class: 'unit-nav', 'aria-label': 'Unit navigation' },
      prev ? el('a', { href: '#/unit/' + prev.n }, el('span', { class: 'k', text: 'Previous unit' }), el('span', { class: 't', text: prev.title })) : el('span'),
      next ? el('a', { class: 'next', href: '#/unit/' + next.n }, el('span', { class: 'k', text: 'Next unit' }), el('span', { class: 't', text: next.title })) : el('a', { class: 'next', href: '#/exam' }, el('span', { class: 'k', text: 'Finish' }), el('span', { class: 't', text: 'Final exam' }))));

    K.clear(main).appendChild(page);
    mountWidgets(page);
    if (focus) {
      var target = document.getElementById('c-' + focus);
      if (target) requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
    }
  }

  function unitTest(u) {
    var items = u.test || [];
    var wrap = el('section', { class: 'test', id: 'test', style: { '--h': u.hue } });
    var head = el('div', { class: 'test-head' },
      el('div', {}, el('p', { class: 'k', text: 'Unit test' }), el('h2', { text: u.title + ', closed book' })),
      el('span', { class: 'k', text: items.length + ' questions, four formats' }));
    var body = el('div', { class: 'test-body' });
    var foot = el('div', { class: 'test-foot' });
    var score = el('span', { class: 'test-score', text: 'Not started' });
    var start = el('button', { class: 'btn', type: 'button', text: 'Start test' });
    foot.appendChild(score); foot.appendChild(start);
    wrap.appendChild(head); wrap.appendChild(body); wrap.appendChild(foot);

    var answers = {};

    start.onclick = function () {
      K.clear(body); answers = {};
      function count() {
        var n = items.reduce(function (a, q, i) {
          var v = answers[i];
          return a + (v == null || v === '' ? 0 : 1);
        }, 0);
        score.textContent = n + ' of ' + items.length + ' answered';
      }
      function mark(value, qi) {
        answers[qi] = value;
        count();
      }

      items.forEach(function (q, qi) {
        var item = el('div', { class: 'q' });
        item.appendChild(el('p', { class: 'q-text' }, el('span', { class: 'qnum', text: String(qi + 1).padStart(2, '0') }), q.q));
        var fb = el('div', { class: 'q-feedback' });
        item.__q = q; item.__fb = fb;

        if (q.type === 'numeric') {
          item.__typed = true;
          item.appendChild(el('p', { class: 'q-type', text: 'Numeric answer' }));
          var input = el('input', { class: 'q-input', type: 'number', step: 'any', inputmode: 'decimal', 'aria-label': 'Your numeric answer' });
          input.addEventListener('input', function () {
            mark(input.value === '' ? null : Number(input.value), qi);
          });
          item.__input = input;
          item.appendChild(el('label', { class: 'q-field' },
            el('span', { text: 'Answer' }), input,
            q.unit ? el('span', { class: 'q-unit', text: q.unit }) : null));
        } else if (q.type === 'ordering') {
          item.__typed = true;
          item.appendChild(el('p', { class: 'q-type', text: 'Put these in order' }));
          var order = q.items.map(function (_, i) { return q.items[(i + 1) % q.items.length]; });
          item.__order = order.slice();
          var list = el('ol', { class: 'q-order' });
          var paint = function () {
            K.clear(list);
            order.forEach(function (text, i) {
              list.appendChild(el('li', { class: 'q-order-row' },
                el('span', { class: 'q-order-n', text: String(i + 1).padStart(2, '0') }),
                el('span', { class: 'q-order-t', text: text }),
                el('span', { class: 'q-order-b' },
                  el('button', { class: 'q-move', type: 'button', text: 'Up', disabled: i === 0,
                    'aria-label': 'Move ' + text + ' up', onclick: function () { swap(i, i - 1); } }),
                  el('button', { class: 'q-move', type: 'button', text: 'Down', disabled: i === order.length - 1,
                    'aria-label': 'Move ' + text + ' down', onclick: function () { swap(i, i + 1); } }))));
            });
          };
          var swap = function (a, b) {
            var t = order[a]; order[a] = order[b]; order[b] = t;
            item.__order = order.slice();
            mark(true, qi);
            paint();
          };
          paint();
          item.appendChild(list);
        } else if (q.type === 'short') {
          item.__typed = true;
          item.appendChild(el('p', { class: 'q-type', text: 'Short answer' }));
          var ta = el('textarea', { class: 'q-input q-textarea', rows: '4', 'aria-label': 'Your answer' });
          ta.addEventListener('input', function () { mark(ta.value.trim() ? ta.value : null, qi); });
          item.__text = ta;
          item.appendChild(ta);
          item.appendChild(el('p', { class: 'q-rubric-h', text: 'Tick each point your answer makes' }));
          var boxes = [];
          var rubric = el('div', { class: 'q-rubric' });
          q.rubric.forEach(function (r) {
            var cb = el('input', { type: 'checkbox' });
            boxes.push(cb);
            rubric.appendChild(el('label', { class: 'q-rubric-row' }, cb, el('span', { text: r })));
          });
          item.__rubric = boxes;
          item.appendChild(rubric);
        } else {
          if (q.type === 'error') item.appendChild(el('p', { class: 'q-type', text: 'Spot the error' }));
          var options = q.type === 'error' ? q.steps : q.options;
          var opts = el('div', { class: 'opts' });
          options.forEach(function (text, oi) {
            var b = el('button', { class: 'opt', type: 'button', onclick: function () {
              if (item.dataset.graded) return;
              mark(oi, qi);
              opts.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('sel'); });
              b.classList.add('sel');
            } }, el('span', { class: 'letter', text: 'ABCD'[oi] }), el('span', { text: text }));
            opts.appendChild(b);
          });
          item.__opts = opts;
          item.appendChild(opts);
        }
        item.appendChild(fb);
        body.appendChild(item);
      });

      start.textContent = 'Submit test';
      start.onclick = function () {
        var right = 0;
        body.querySelectorAll('.q').forEach(function (item, qi) {
          var q = item.__q;
          item.dataset.graded = '1';
          var ok = false, answerShown = '', prefix = '';

          if (q.type === 'numeric') {
            var given = answers[qi];
            var tol = q.tolerance == null ? 0.001 : q.tolerance;
            ok = given != null && isFinite(given) && Math.abs(Number(given) - q.answer) <= tol;
            item.__input.disabled = true;
            item.__input.classList.add(ok ? 'ok' : 'no');
            answerShown = String(q.answer) + (q.unit ? ' ' + q.unit : '');
          } else if (q.type === 'ordering') {
            ok = !!item.__order && item.__order.join('|') === q.items.join('|');
            item.querySelectorAll('.q-move').forEach(function (b) { b.disabled = true; });
            item.querySelectorAll('.q-order-row').forEach(function (row, i) {
              row.classList.add(item.__order[i] === q.items[i] ? 'ok' : 'no');
            });
            answerShown = q.items.join(' then ');
          } else if (q.type === 'short') {
            var text = (answers[qi] || '').trim();
            var ticks = item.__rubric.filter(function (b) { return b.checked; }).length;
            ok = text.length >= 20 && ticks === item.__rubric.length;
            item.__text.readOnly = true;
            item.__text.classList.add(ok ? 'ok' : 'no');
            item.__rubric.forEach(function (b) { b.disabled = true; });
            prefix = '<b>Model answer.</b> ' + q.model + ' ';
          } else {
            var chosen = answers[qi];
            var opts = q.type === 'error' ? q.steps : q.options;
            item.__opts.querySelectorAll('.opt').forEach(function (b, i) {
              b.disabled = true;
              if (i === q.answer) b.classList.add('correct');
              if (i === chosen && chosen !== q.answer) b.classList.add('wrong');
            });
            ok = chosen === q.answer;
            answerShown = opts[q.answer];
          }

          if (ok) right++;
          else {
            var entry = { box: 0, unit: u.n, concept: 'test', q: qi, at: Date.now(), text: q.q };
            if (q.type === 'numeric' || q.type === 'ordering' || q.type === 'short') {
              entry.kind = 'text';
              entry.answerText = q.type === 'short' ? q.model : answerShown;
              entry.explain = q.explain || (q.rubric ? q.rubric.join(' ') : '');
            } else {
              entry.options = q.type === 'error' ? q.steps : q.options;
              entry.answer = q.answer;
              entry.explain = q.explain;
            }
            progress.review['test:' + u.n + ':' + qi] = entry;
          }

          item.__fb.className = 'q-feedback show ' + (ok ? 'ok' : 'no');
          item.__fb.innerHTML = '<span class="verdict">' + (ok ? 'Correct' : 'Not quite') + '</span>' +
            (ok ? '' : prefix + (q.type === 'short' ? '' : '<b>Answer: ' + answerShown.replace(/\.$/, '') + '.</b> ')) +
            (q.explain || '');
        });
        progress.tests[u.n] = { right: right, total: items.length, at: Date.now() };
        save();
        score.textContent = right + ' of ' + items.length + ' correct, ' + Math.round((right / items.length) * 100) + '%';
        start.textContent = 'Retake';
        start.onclick = function () { location.reload(); };
        updateChrome();
      };
      body.scrollIntoView({ block: 'start', behavior: K.reduced() ? 'auto' : 'smooth' });
    };

    return wrap;
  }

  /* ---------- home ---------- */
  function renderHome() {
    document.title = 'AI Basics | Interactive course';
    var c = completion();
    var nWidgets = metas().reduce(function (a, u) { return a + (u.interactions || 0); }, 0);
    var nextU = metas().filter(function (u) { return !unitDone(u); })[0] || metas()[0];

    var page = el('div', { class: 'page cover' });
    page.appendChild(el('div', { class: 'cover-meta' },
      el('span', { class: 'kicker', text: 'AI Basics' }),
      el('span', { class: 'kicker', text: '11 units, 21 hours of lectures' })));
    page.appendChild(el('h1', {},
      el('span', { text: 'The whole course,' }),
      el('span', { class: 'thin', text: 'something you can operate.' })));
    page.appendChild(el('p', { class: 'cover-lede', text: 'Every concept opens with a situation where you need it, then a metaphor you can play with. The machinery arrives after you have a feel for it. Checks, unit tests, a final exam and a review queue track what you actually know.' }));

    page.appendChild(el('div', { class: 'cover-actions' },
      el('a', { class: 'btn', href: '#/unit/' + nextU.n }, c.done ? 'Continue' : 'Start unit 01'),
      el('a', { class: 'btn ghost', href: '#/review' }, 'Review queue (' + dueReview().length + ')')));

    // hero interaction
    var hero = lab({
      widget: 'spectrum', mode: 'rung1', modeLabel: 'Try it',
      title: 'Four ways to answer a question',
      tryText: 'Drag the marker from left to right. The same chess position gets a different question at each stop.',
      notice: 'The question changes what counts as an answer. That is the whole map of the course.'
    }, 'Start here');
    hero.classList.add('cover-lab');
    page.appendChild(hero);

    page.appendChild(el('div', { class: 'stats' },
      [['11', 'units'], ['49', 'recordings'], ['21', 'hours'], [String(nWidgets), 'interactions']].map(function (s) {
        return el('div', { class: 'stat' }, el('b', { text: s[0] }), el('span', { text: s[1] }));
      })));

    var table = el('table', { class: 'index-table' });
    table.appendChild(el('caption', { class: 'kicker', text: 'Unit index' }));
    var tbody = el('tbody');
    metas().forEach(function (u) {
      var done = unitDone(u);
      tbody.appendChild(el('tr', { style: { '--h': u.hue } },
        el('td', {}, el('a', { href: '#/unit/' + u.n },
          el('span', { class: 'idx-num', text: String(u.n).padStart(2, '0') }),
          el('span', { class: 'idx-name', text: u.title }),
          el('span', { class: 'idx-count', text: done ? 'Complete' : u.concepts.length + ' concepts' }),
          el('span', { class: 'idx-dot', 'aria-hidden': 'true' })))));
    });
    table.appendChild(tbody);
    page.appendChild(table);
    page.appendChild(el('p', { class: 'note', text: 'Progress is ' + Math.round(c.pct * 100) + '% complete, stored in this browser only.' }));

    var fileInput = el('input', { type: 'file', accept: 'application/json', style: { display: 'none' }, 'aria-hidden': 'true' });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var incoming = JSON.parse(String(reader.result));
          if (!incoming || typeof incoming !== 'object' || !incoming.checks) throw new Error('shape');
          progress.checks = incoming.checks || progress.checks;
          progress.tests = incoming.tests || progress.tests;
          progress.review = incoming.review || progress.review;
          progress.visited = incoming.visited || progress.visited;
          progress.exam = incoming.exam || progress.exam;
          save(); updateChrome(); location.reload();
        } catch (e) {
          K.announce('That file is not a saved progress file.');
        }
      };
      reader.readAsText(file);
    });
    page.appendChild(el('div', { class: 'cover-actions', style: { 'margin-top': '18px' } },
      el('button', { class: 'btn ghost', type: 'button', text: 'Export progress', onclick: function () {
        var blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = el('a', { href: url, download: 'aim-progress.json' });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } }),
      el('button', { class: 'btn ghost', type: 'button', text: 'Import progress', onclick: function () { fileInput.click(); } })));
    page.appendChild(fileInput);

    K.clear(main).appendChild(page);
    mountWidgets(page);
  }

  /* ---------- review ---------- */
  function renderReview() {
    document.title = 'Review queue | AI Basics';
    var items = dueReview();
    var page = el('div', { class: 'page' });
    page.appendChild(el('header', { class: 'review-head' },
      el('h1', { text: 'Review queue' }),
      el('p', { text: 'Questions you missed come back after 1, 3, 7 and 16 units. Answer one correctly and it moves back. Answer wrong and it returns to the front.' })));

    if (!items.length) {
      page.appendChild(el('p', { class: 'review-empty', text: 'Nothing is due. Missed questions appear here as you work through the units, and again after the spacing interval.' }));
    }

    items.slice(0, 30).forEach(function (r) {
      var item = el('div', { class: 'review-item' });
      var u = meta(r.unit);
      var q = r.text ? r : null;
      if (!q) {
        var found = conceptById(r.concept);
        if (found) { q = found.c.check[r.q]; q = { q: q.q, options: q.options, answer: q.answer, explain: q.explain }; }
      } else {
        q = { q: r.text, options: r.options, answer: r.answer, explain: r.explain, kind: r.kind, answerText: r.answerText };
      }
      if (!q) return;
      var body = el('div', {},
        el('p', { class: 'meta', text: (u ? 'Unit ' + u.n : 'Exam') + (r.concept === 'test' ? ' test' : '') }),
        el('p', { class: 'q-text', text: q.q }));
      var fb = el('div', { class: 'q-feedback' });
      if (q.kind === 'text') {
        var reveal = el('button', { class: 'btn ghost', type: 'button', text: 'Show answer' });
        reveal.addEventListener('click', function () {
          reveal.disabled = true;
          fb.className = 'q-feedback show';
          fb.innerHTML = '<b>Answer.</b> ' + q.answerText + '<br>' + (q.explain || '');
          var rec = progress.review[r.key];
          if (rec) { rec.box = (rec.box || 0) + 1; rec.at = Date.now(); }
          save(); updateChrome();
        });
        body.appendChild(reveal);
      } else {
        var opts = el('div', { class: 'opts', style: { marginTop: '10px' } });
        q.options.forEach(function (text, oi) {
          opts.appendChild(el('button', { class: 'opt', type: 'button', onclick: function () {
            opts.querySelectorAll('.opt').forEach(function (b, i) {
              b.disabled = true;
              if (i === q.answer) b.classList.add('correct');
            });
            this.classList.add(oi === q.answer ? 'correct' : 'wrong');
            fb.className = 'q-feedback show ' + (oi === q.answer ? 'ok' : 'no');
            fb.innerHTML = '<span class="verdict">' + (oi === q.answer ? 'Correct' : 'Not quite') + '</span>' + (oi === q.answer ? '' : '<b>Answer: ' + 'ABCD'[q.answer] + '.</b> ') + q.explain;
            if (oi === q.answer) {
              var rec = progress.review[r.key];
              if (rec) { rec.box = (rec.box || 0) + 1; rec.at = Date.now(); }
              save(); updateChrome();
            }
          } }, el('span', { class: 'letter', text: 'ABCD'[oi] }), el('span', { text: text })));
        });
        body.appendChild(opts);
      }
      body.appendChild(fb);
      item.appendChild(body);
      page.appendChild(item);
    });

    page.appendChild(el('div', { class: 'unit-nav' },
      el('a', { href: '#/' }, el('span', { class: 'k', text: 'Back' }), el('span', { class: 't', text: 'Course home' })),
      el('a', { class: 'next', href: '#/exam' }, el('span', { class: 'k', text: 'Next' }), el('span', { class: 't', text: 'Final exam' }))));

    K.clear(main).appendChild(page);
    updateChrome();
  }

  /* ---------- exam ---------- */
  function buildExam(seed) {
    var rnd = K.seeded(seed || Date.now());
    var pool = [];
    units().forEach(function (u) {
      var want = u.n <= 7 ? 4 : 3;
      var items = (u.test || []).filter(function (q) { return !q.type || q.type === 'choice'; });
      for (var i = items.length - 1; i > 0; i--) {
        var j = Math.floor(rnd() * (i + 1));
        var t = items[i]; items[i] = items[j]; items[j] = t;
      }
      items.slice(0, want).forEach(function (q) {
        pool.push({ u: u, q: q });
      });
    });
    var bridges = [];
    units().forEach(function (u) { (u.connections || []).forEach(function (c) { bridges.push({ u: u, c: c }); }); });
    for (var i = bridges.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = bridges[i]; bridges[i] = bridges[j]; bridges[j] = t;
    }
    return { items: pool, bridges: bridges.slice(0, 3) };
  }

  function renderExam() {
    document.title = 'Final exam | AI Basics';
    var page = el('div', { class: 'page' });
    page.appendChild(el('header', { class: 'review-head' },
      el('h1', { text: 'Final exam' }),
      el('p', { text: 'Forty questions sampled across the eleven units, plus three connection tasks. Closed book. Your score is stored in this browser.' })));

    var shell = el('div', { class: 'exam-shell' });
    var exam = buildExam();
    var answers = {};
    var graded = false;

    page.appendChild(shell);
    shell.appendChild(el('div', { class: 'cover-actions' },
      el('button', { class: 'btn', type: 'button', text: 'Begin exam', onclick: begin })));

    function begin() {
      K.clear(shell); graded = false; answers = {};
      exam.items.forEach(function (it, i) {
        var q = it.q;
        var item = el('div', { class: 'q', dataset: { i: i } });
        item.appendChild(el('p', { class: 'meta kicker', text: 'Unit ' + it.u.n + ', ' + it.u.short }));
        item.appendChild(el('p', { class: 'q-text' }, el('span', { class: 'qnum', text: String(i + 1).padStart(2, '0') }), q.q));
        var opts = el('div', { class: 'opts' });
        var fb = el('div', { class: 'q-feedback' });
        q.options.forEach(function (text, oi) {
          opts.appendChild(el('button', { class: 'opt', type: 'button', onclick: function () {
            if (graded) return;
            answers[i] = oi;
            opts.querySelectorAll('.opt').forEach(function (b) { b.classList.remove('sel'); });
            this.classList.add('sel');
            nav.querySelectorAll('a')[i].classList.add('answered');
          } }, el('span', { class: 'letter', text: 'ABCD'[oi] }), el('span', { text: text })));
        });
        item.appendChild(opts); item.appendChild(fb);
        item.__q = q; item.__fb = fb; item.__opts = opts;
        shell.appendChild(item);
      });

      if (exam.bridges.length) {
        shell.appendChild(el('h3', { style: { 'font-family': 'var(--serif)', 'font-size': '1.6rem', 'margin-top': '32px' }, text: 'Connection tasks' }));
        exam.bridges.forEach(function (b) {
          shell.appendChild(el('p', { class: 'meta kicker', style: { 'margin-top': '18px' }, text: 'Unit ' + b.u.n + ', ' + b.u.short }));
          shell.appendChild(connectionCard(b.c));
        });
      }

      var nav = el('div', { class: 'exam-nav', 'aria-label': 'Question status' });
      exam.items.forEach(function (_, i) { nav.appendChild(el('a', { href: '#', text: String(i + 1), onclick: function (e) { e.preventDefault(); shell.querySelectorAll('.q')[i].scrollIntoView({ block: 'center' }); } })); });
      shell.appendChild(nav);

      shell.appendChild(el('div', { class: 'cover-actions' },
        el('button', { class: 'btn', type: 'button', text: 'Submit exam', onclick: submit })));

      function submit() {
        if (graded) return;
        graded = true;
        var right = 0;
        shell.querySelectorAll('.q').forEach(function (item, i) {
          var q = item.__q, chosen = answers[i];
          item.__opts.querySelectorAll('.opt').forEach(function (b, oi) {
            b.disabled = true;
            if (oi === q.answer) b.classList.add('correct');
            if (oi === chosen && chosen !== q.answer) b.classList.add('wrong');
          });
          if (chosen === q.answer) right++;
          item.__fb.className = 'q-feedback show ' + (chosen === q.answer ? 'ok' : 'no');
          item.__fb.innerHTML = '<span class="verdict">' + (chosen === q.answer ? 'Correct' : 'Not quite') + '</span>' +
            (chosen === q.answer ? '' : '<b>Answer: ' + 'ABCD'[q.answer] + '.</b> ') + q.explain;
        });
        progress.exam = { right: right, total: exam.items.length, at: Date.now() };
        save();
        var pct = Math.round((right / exam.items.length) * 100);
        shell.insertBefore(el('div', { class: 'test-head', style: { border: '1px solid var(--ink)', marginBottom: '20px' } },
          el('div', {}, el('p', { class: 'k', text: 'Result' }), el('h2', { text: right + ' of ' + exam.items.length + ', ' + pct + '%' })),
          el('span', { class: 'k', text: pct >= 80 ? 'Solid' : pct >= 60 ? 'Passing' : 'Review the units you missed' })), shell.firstChild);
        shell.scrollIntoView({ block: 'start', behavior: K.reduced() ? 'auto' : 'smooth' });
      }
    }

    K.clear(main).appendChild(page);
    updateChrome();
  }

  /* ---------- wiring ---------- */
  railToggle.addEventListener('click', function () {
    var open = rail.classList.toggle('open');
    railToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (!rail.contains(e.target) && e.target !== railToggle && !railToggle.contains(e.target)) {
      rail.classList.remove('open');
      railToggle.setAttribute('aria-expanded', 'false');
    }
  });
  window.addEventListener('hashchange', setRoute);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { rail.classList.remove('open'); railToggle.setAttribute('aria-expanded', 'false'); }
  });

  function boot() {
    buildRail();
    setRoute();
    updateChrome();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
