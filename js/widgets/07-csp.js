/* Unit 7 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el, svg = K.svg;

  var REGIONS = [
    { id: 0, pts: '0,0 48,0 48,38 0,38', label: 'A' },
    { id: 1, pts: '48,0 100,0 100,38 48,38', label: 'B' },
    { id: 2, pts: '0,38 34,38 34,70 0,70', label: 'C' },
    { id: 3, pts: '34,38 66,38 66,70 34,70', label: 'D' },
    { id: 4, pts: '66,38 100,38 100,70 66,70', label: 'E' },
    { id: 5, pts: '0,70 100,70 100,100 0,100', label: 'F' }
  ];
  var EDGES = [[0, 1], [0, 2], [0, 3], [1, 3], [1, 4], [2, 3], [2, 5], [3, 4], [3, 5], [4, 5]];
  var COLOURS = ['oklch(.62 .12 35)', 'oklch(.62 .12 150)', 'oklch(.62 .12 250)', 'oklch(.62 .12 320)'];

  function neighbours(i) { return EDGES.filter(function (e) { return e[0] === i || e[1] === i; }).map(function (e) { return e[0] === i ? e[1] : e[0]; }); }

  /* ---------- map colour ---------- */
  AIM.register('map-colour', {
    mount: function (host, cfg) {
      var st = K.store('w:map', { assign: [-1, -1, -1, -1, -1, -1], colour: 0 });
      var stage = el('div', {});
      var palette = el('div', { class: 'lab-ui', style: { gap: '6px' } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '36px' } });
      var propagateBtn = K.button('Propagate', function () { propagate(); }, { cls: 'btn-dark' });
      var reset = K.button('Reset', function () { st.set({ assign: [-1, -1, -1, -1, -1, -1], colour: 0 }); draw(); });
      host.appendChild(stage);
      host.appendChild(palette);
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px', 'flex-wrap': 'wrap' } }, propagateBtn, reset));
      host.appendChild(note);

      var chips = COLOURS.map(function (c, i) {
        return K.button('', function () { st.set({ assign: st.get().assign, colour: i }); draw(); }, { cls: 'btn-dark', aria: 'Colour ' + (i + 1) });
      });
      chips.forEach(function (b, i) {
        b.style.background = COLOURS[i]; b.style.width = '44px'; b.style.height = '44px'; b.setAttribute('aria-label', 'Pick colour ' + (i + 1));
        palette.appendChild(b);
      });

      function conflicts(a) {
        return EDGES.filter(function (e) { return a[e[0]] >= 0 && a[e[0]] === a[e[1]]; });
      }
      function propagate() {
        var a = st.get().assign.slice();
        var changed = true;
        while (changed) {
          changed = false;
          REGIONS.forEach(function (r) {
            if (a[r.id] >= 0) return;
            var allowed = [0, 1, 2, 3].filter(function (c) {
              return neighbours(r.id).every(function (n) { return a[n] !== c; });
            });
            if (allowed.length === 1) { a[r.id] = allowed[0]; changed = true; }
          });
        }
        st.set({ assign: a, colour: st.get().colour }); draw();
      }
      function draw() {
        var a = st.get().assign;
        var bad = conflicts(a);
        var root = svg('svg', { viewBox: '0 0 100 100', role: 'img', 'aria-label': 'Map with six regions' });
        REGIONS.forEach(function (r) {
          var fill = a[r.id] >= 0 ? COLOURS[a[r.id]] : 'rgba(237,232,221,.06)';
          var poly = svg('polygon', { points: r.pts, fill: fill, stroke: '#151A21', 'stroke-width': '1', style: 'cursor:pointer' });
          poly.addEventListener('click', function () {
            var next = a.slice(); next[r.id] = st.get().colour;
            st.set({ assign: next, colour: st.get().colour }); draw();
          });
          root.appendChild(poly);
          root.appendChild(svg('text', { x: 8 + (r.id === 1 || r.id === 4 ? 42 : r.id === 3 ? 18 : 8), y: 22 + (r.id >= 2 ? 4 : 0), fill: a[r.id] >= 0 ? '#0E1116' : 'rgba(237,232,221,.7)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, r.label));
        });
        bad.forEach(function (e) {
          var a1 = REGIONS[e[0]], a2 = REGIONS[e[1]];
          var p1 = a1.pts.split(' ')[2].split(','), p2 = a2.pts.split(' ')[0].split(',');
          root.appendChild(svg('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: '#D9988C', 'stroke-width': '1.4' }));
        });
        K.clear(stage).appendChild(root);
        var filled = a.filter(function (v) { return v >= 0; }).length;
        note.textContent = bad.length ? bad.length + ' conflict' + (bad.length > 1 ? 's' : '') + '. Neighbours share a colour.' : filled === 6 ? 'Complete. Every neighbour differs.' : filled + ' of 6 assigned. Use four colours for this map.';
        note.style.color = bad.length ? '#D9988C' : 'rgba(145,141,132,.95)';
      }
      draw();
    }
  });

  /* ---------- sudoku stepper ---------- */
  AIM.register('sudoku-step', {
    mount: function (host) {
      var puzzle = [
        [1, 0, 0, 0],
        [0, 0, 3, 0],
        [0, 3, 0, 0],
        [0, 0, 0, 4]
      ];
      var steps = [];
      function solve(g) {
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
          if (g[r][c] === 0) {
            for (var v = 1; v <= 4; v++) {
              if (ok(g, r, c, v)) {
                g[r][c] = v; steps.push({ t: 'set', r: r, c: c, v: v, ok: true });
                if (solve(g)) return true;
                steps.push({ t: 'undo', r: r, c: c, v: v });
                g[r][c] = 0;
              } else {
                steps.push({ t: 'try', r: r, c: c, v: v, ok: false });
              }
            }
            return false;
          }
        }
        return true;
      }
      function ok(g, r, c, v) {
        for (var i = 0; i < 4; i++) if (g[r][i] === v || g[i][c] === v) return false;
        var br = Math.floor(r / 2) * 2, bc = Math.floor(c / 2) * 2;
        for (var i2 = 0; i2 < 2; i2++) for (var j = 0; j < 2; j++) if (g[br + i2][bc + j] === v) return false;
        return true;
      }
      solve(puzzle.map(function (r) { return r.slice(); }));
      if (!steps.length) steps.push({ t: 'done' });
      var grid = puzzle.map(function (r) { return r.slice(); });
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '36px' } });
      var current = 0;
      var tr = K.transport({ length: steps.length, label: 'Step', interval: 380, onFrame: function (i) { current = i; apply(i); } });
      host.appendChild(stage); host.appendChild(tr.el); host.appendChild(note);

      function apply(n) {
        grid = puzzle.map(function (r) { return r.slice(); });
        var last = null;
        for (var i = 0; i <= n; i++) {
          var s = steps[i];
          if (s.t === 'set' || s.t === 'undo') grid[s.r][s.c] = 0;
          if (s.t === 'set') grid[s.r][s.c] = s.v;
          if (s.t === 'try' || s.t === 'set') last = s;
        }
        draw(last);
      }
      function draw(last) {
        var root = svg('svg', { viewBox: '0 0 260 260', role: 'img', 'aria-label': 'Four by four Sudoku grid' });
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
          var v = grid[r][c];
          var given = puzzle[r][c] !== 0;
          var active = last && last.r === r && last.c === c;
          root.appendChild(svg('rect', { x: 10 + c * 60, y: 10 + r * 60, width: 58, height: 58, fill: given ? 'rgba(237,232,221,.1)' : 'rgba(237,232,221,.02)', stroke: (r % 2 === 1 ? 'rgba(237,232,221,.35)' : 'rgba(237,232,221,.16)'), 'stroke-width': r % 2 === 1 || c % 2 === 1 ? '1.4' : '1' }));
          if (active) root.appendChild(svg('rect', { x: 10 + c * 60, y: 10 + r * 60, width: 58, height: 58, fill: last.ok === false ? 'rgba(217,152,140,.16)' : 'rgba(237,232,221,.1)', stroke: last.ok === false ? '#D9988C' : '#EDE8DD' }));
          if (v) root.appendChild(svg('text', { x: 39 + c * 60, y: 46 + r * 60, 'text-anchor': 'middle', fill: given ? '#EDE8DD' : 'oklch(.8 .1 60)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '20' }, String(v)));
        }
        K.clear(stage).appendChild(root);
        var s = steps[Math.min(current, steps.length - 1)];
        note.textContent = s.t === 'undo' ? 'Dead end: ' + s.v + ' at row ' + (s.r + 1) + ', column ' + (s.c + 1) + ' is undone.' : s.t === 'set' ? 'Assign ' + s.v + ' at row ' + (s.r + 1) + ', column ' + (s.c + 1) + '.' : s.t === 'try' ? 'Try ' + s.v + ': it conflicts, so the solver moves on.' : 'Solved.';
      }
      apply(0);
    }
  });

  /* ---------- queens ---------- */
  AIM.register('queens', {
    mount: function (host) {
      var N = 8;
      var st = K.store('w:queens', { rows: initial() });
      var cv = K.canvas(host, 1.35, draw);
      var step = K.button('Min-conflicts move', function () { move(); });
      var shuffle = K.button('Shuffle', function () { st.set({ rows: initial() }); draw(); }, { cls: 'btn-dark' });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '36px' } });
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px', 'flex-wrap': 'wrap' } }, step, shuffle));
      host.appendChild(note);

      function initial() {
        var rnd = K.seeded(5), a = [];
        for (var i = 0; i < N; i++) a.push(Math.floor(rnd() * N));
        return a;
      }
      function count(a) {
        var n = 0;
        for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
          if (a[i] === a[j] || Math.abs(a[i] - a[j]) === j - i) n++;
        }
        return n;
      }
      function move() {
        var a = st.get().rows.slice();
        var conflicted = [];
        for (var i = 0; i < N; i++) {
          var bad = false;
          for (var j = 0; j < N; j++) if (j !== i && (a[i] === a[j] || Math.abs(a[i] - a[j]) === Math.abs(j - i))) bad = true;
          if (bad) conflicted.push(i);
        }
        if (!conflicted.length) return;
        var col = conflicted[Math.floor(Math.random() * conflicted.length)];
        var best = a[col], bestCount = Infinity;
        for (var r = 0; r < N; r++) {
          var copy = a.slice(); copy[col] = r;
          var c = count(copy);
          if (c < bestCount) { bestCount = c; best = r; }
        }
        a[col] = best;
        st.set({ rows: a }); draw();
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, size = Math.min(w, h) - 20, ox = (w - size) / 2, oy = (h - size) / 2, cell = size / N;
        var a = st.get().rows;
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          ctx.fillStyle = (r + c) % 2 ? 'rgba(237,232,221,.06)' : 'rgba(237,232,221,.12)';
          ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
        }
        for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
          if (a[i] === a[j] || Math.abs(a[i] - a[j]) === j - i) {
            ctx.strokeStyle = 'rgba(217,152,140,.7)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ox + (i + .5) * cell, oy + (a[i] + .5) * cell); ctx.lineTo(ox + (j + .5) * cell, oy + (a[j] + .5) * cell); ctx.stroke();
          }
        }
        for (i = 0; i < N; i++) {
          ctx.fillStyle = 'oklch(.8 .12 60)';
          ctx.beginPath(); ctx.arc(ox + (i + .5) * cell, oy + (a[i] + .5) * cell, cell * 0.28, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '11px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        note.textContent = count(a) + ' attacking pairs. One queen per column; the move changes a row.';
      }
    }
  });
})();
