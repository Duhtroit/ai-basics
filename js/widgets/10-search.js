/* Unit 10 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  var GRID = 8;
  var WALLS = { '2,2': 1, '2,3': 1, '3,3': 1, '5,1': 1, '5,2': 1, '5,3': 1, '6,5': 1, '1,5': 1, '1,6': 1 };
  var START = [0, 0], GOAL = [7, 7];

  function neighbours(c) {
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(function (d) { return [c[0] + d[0], c[1] + d[1]]; })
      .filter(function (n) { return n[0] >= 0 && n[1] >= 0 && n[0] < GRID && n[1] < GRID && !WALLS[n.join(',')]; });
  }
  function bfsOrder() {
    var q = [START], seen = { '0,0': 1 }, order = [], parent = {};
    while (q.length) {
      var c = q.shift(); order.push(c);
      if (c[0] === GOAL[0] && c[1] === GOAL[1]) break;
      neighbours(c).forEach(function (n) {
        var k = n.join(',');
        if (seen[k]) return;
        seen[k] = 1; parent[k] = c; q.push(n);
      });
    }
    return { order: order, parent: parent };
  }

  /* ---------- BFS wave ---------- */
  AIM.register('bfs-wave', {
    mount: function (host) {
      var res = bfsOrder();
      var st = K.store('w:bfs', { frame: 0, costs: false });
      var saved = st.get();
      var cv = K.canvas(host, 1.4, draw);
      var frame = Math.max(0, Math.min(res.order.length - 1, saved.frame || 0));
      var costsOn = !!saved.costs;
      function save() { st.set({ frame: frame, costs: costsOn }); }
      var costBtn = K.button('Edge costs', function () { costsOn = !costsOn; costBtn.classList.toggle('on', costsOn); save(); draw(); });
      if (costsOn) costBtn.classList.add('on');
      var tr = K.transport({ length: res.order.length, start: frame, label: 'Expansion', interval: 220, onFrame: function (i) { frame = i; save(); draw(); } });
      var reset = K.button('Reset', function () {
        tr.stop(); costsOn = false; costBtn.classList.remove('on');
        st.set({ frame: 0, costs: false }); tr.set(0); draw();
      }, { cls: 'btn-dark' });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '36px' } });
      host.appendChild(el('div', { class: 'lab-ui' }, costBtn, reset));
      host.appendChild(tr.el); host.appendChild(note);

      function costOf(c) { return 1 + (c[0] + c[1]) % 3; }
      function bfsPathCost() {
        var cur = GOAL, total = 0;
        while (res.parent[cur.join(',')]) { total += costOf(cur); cur = res.parent[cur.join(',')]; }
        return total;
      }
      function cheapest() {
        var dist = {}, seen = {};
        dist[START.join(',')] = 0;
        for (var step = 0; step < GRID * GRID; step++) {
          var pick = null, best = Infinity;
          Object.keys(dist).forEach(function (k) {
            if (!seen[k] && dist[k] < best) { best = dist[k]; pick = k; }
          });
          if (!pick) break;
          seen[pick] = 1;
          var c = pick.split(',').map(Number);
          neighbours(c).forEach(function (n) {
            var k = n.join(','), d = best + costOf(n);
            if (dist[k] === undefined || d < dist[k]) dist[k] = d;
          });
        }
        return dist[GOAL.join(',')] || 0;
      }

      function depth(c) {
        var d = 0, cur = c, p = res.parent;
        while (p[cur.join(',')]) { cur = p[cur.join(',')]; d++; }
        return d;
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, cell = Math.min(w, h) / GRID, ox = (w - cell * GRID) / 2, oy = (h - cell * GRID) / 2;
        var idx = frame, shown = res.order.slice(0, idx + 1);
        var set = {}; shown.forEach(function (c) { set[c.join(',')] = 1; });
        for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
          var k = c + ',' + r;
          var dep = set[k] ? depth([c, r]) : -1;
          ctx.fillStyle = WALLS[k] ? 'rgba(0,0,0,.5)' : dep < 0 ? 'rgba(237,232,221,.05)' : 'oklch(.62 .12 315 / ' + Math.min(0.55, 0.12 + dep * 0.08) + ')';
          ctx.fillRect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2);
        }
        if (costsOn) {
          ctx.fillStyle = 'rgba(237,232,221,.75)'; ctx.font = '9px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
          for (r = 0; r < GRID; r++) for (c = 0; c < GRID; c++) if (!WALLS[c + ',' + r]) ctx.fillText(String(costOf([c, r])), ox + (c + .5) * cell, oy + (r + .5) * cell + 3);
        }
        var cur = res.order[Math.min(idx, res.order.length - 1)];
        ctx.fillStyle = 'oklch(.82 .14 45)';
        ctx.beginPath(); ctx.arc(ox + (cur[0] + .5) * cell, oy + (cur[1] + .5) * cell, cell * 0.26, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'oklch(.78 .14 120)'; ctx.lineWidth = 2;
        ctx.strokeRect(ox + GOAL[0] * cell + 2, oy + GOAL[1] * cell + 2, cell - 4, cell - 4);
        if (costsOn) {
          var bc = bfsPathCost(), cc = cheapest();
          note.textContent = 'Layer ' + depth(cur) + '. BFS still expands by layer. Its path costs ' + bc + '; the cheapest path costs ' + cc + '. ' + (bc === cc ? 'Here they coincide; with other weights a longer path can cost less.' : 'They differ, so the fewest-step path is not the cheapest.');
        } else {
          note.textContent = 'Layer ' + depth(cur) + '. Every cell at distance ' + depth(cur) + ' is expanded before any cell at distance ' + (depth(cur) + 1) + '.';
        }
      }
      draw();
    }
  });

  /* ---------- UCS queue ---------- */
  AIM.register('ucs-queue', {
    mount: function (host) {
      var nodes = { S: { x: 40, y: 100 }, A: { x: 130, y: 40 }, B: { x: 130, y: 160 }, C: { x: 240, y: 60 }, G: { x: 330, y: 120 } };
      var edges = [['S', 'A', 1], ['S', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['C', 'G', 3], ['B', 'G', 6]];
      var stage = el('div', {});
      var queueBox = el('div', { style: { display: 'grid', gap: '1px', background: 'rgba(237,232,221,.14)' } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '38px' } });
      var step = K.button('Step', function () { advance(); });
      var resetB = K.button('Reset', reset, { cls: 'btn-dark' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px' } }, step, resetB));
      host.appendChild(stage); host.appendChild(queueBox); host.appendChild(note);

      var frontier, visited, order, done;
      function reset() {
        frontier = [{ n: 'S', cost: 0, path: ['S'] }]; visited = {}; order = []; done = false; draw();
      }
      function advance() {
        if (!frontier.length || done) return;
        frontier.sort(function (a, b) { return a.cost - b.cost; });
        var node = frontier.shift();
        if (visited[node.n]) { advance(); return; }
        visited[node.n] = node.cost; order.push(node.n);
        if (node.n === 'G') { done = true; draw(); return; }
        edges.forEach(function (e) {
          var next = e[0] === node.n ? e[1] : e[1] === node.n ? e[0] : null;
          if (next && visited[next] === undefined) frontier.push({ n: next, cost: node.cost + e[2], path: node.path.concat(next) });
        });
        draw();
      }
      function draw() {
        var root = K.svg('svg', { viewBox: '0 0 380 210', role: 'img', 'aria-label': 'Weighted graph' });
        edges.forEach(function (e) {
          var a = nodes[e[0]], b = nodes[e[1]];
          root.appendChild(K.svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'rgba(237,232,221,.22)', 'stroke-width': '1.5' }));
          root.appendChild(K.svg('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 4, fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', 'text-anchor': 'middle' }, String(e[2])));
        });
        Object.keys(nodes).forEach(function (k) {
          var n = nodes[k];
          root.appendChild(K.svg('circle', { cx: n.x, cy: n.y, r: 19, fill: visited[k] !== undefined ? 'oklch(.62 .12 315 / .4)' : '#151A21', stroke: visited[k] !== undefined ? 'oklch(.78 .12 315)' : 'rgba(237,232,221,.35)' }));
          root.appendChild(K.svg('text', { x: n.x, y: n.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11' }, k));
          if (visited[k] !== undefined) root.appendChild(K.svg('text', { x: n.x, y: n.y + 34, 'text-anchor': 'middle', fill: 'rgba(145,141,132,.95)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, 'g ' + visited[k]));
        });
        K.clear(stage).appendChild(root);
        queueBox.textContent = '';
        if (!frontier.length) queueBox.appendChild(el('div', { class: 'lab-note', style: { background: '#151A21', padding: '8px' }, text: 'Frontier empty' }));
        frontier.slice().sort(function (a, b) { return a.cost - b.cost; }).forEach(function (f) {
          queueBox.appendChild(el('div', { style: { background: '#151A21', padding: '7px 10px', display: 'flex', 'justify-content': 'space-between' } },
            el('span', { style: { color: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11px' }, text: f.path.join(' to ') }),
            el('span', { class: 'lab-note', text: 'g = ' + f.cost })));
        });
        note.textContent = done ? 'Goal popped at cost ' + visited.G + '. No cheaper path can remain, because every frontier entry costs at least as much.' : 'The cheapest frontier entry is expanded next. A goal is settled only when it is popped.';
      }
      reset();
    }
  });

  /* ---------- A star map ---------- */
  AIM.register('astar-map', {
    mount: function (host, cfg) {
      var towns = {
        S: { x: 40, y: 120, h: 7 }, A: { x: 130, y: 60, h: 5 }, B: { x: 140, y: 170, h: 5 },
        C: { x: 240, y: 100, h: 3 }, G: { x: 340, y: 140, h: 0 }
      };
      var edges = [['S', 'A', 2], ['S', 'B', 3], ['A', 'C', 2], ['B', 'C', 2], ['C', 'G', 3], ['B', 'G', 7]];
      var st = K.store('w:astar', { bias: 1, labels: false });
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      var bias = K.slider({ label: 'Rumour honesty', min: 0, max: 2.2, step: 0.1, value: st.get().bias, format: function (v) { return v.toFixed(1) + 'x true distance'; }, onInput: function (v) { st.set({ bias: v, labels: st.get().labels }); run(); } });
      var labels = K.button('Show g, h, f', function () { st.set({ bias: st.get().bias, labels: !st.get().labels }); labels.classList.toggle('on', st.get().labels); draw(); });
      var again = K.button('Run', function () { run(); });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, bias.el, labels, again));
      host.appendChild(stage); host.appendChild(note);

      var result = null, ucs = null;
      function heuristic(n, scale) { return towns[n].h * scale; }
      function search(scale) {
        var frontier = [{ n: 'S', g: 0, path: ['S'] }], visited = {}, order = [], best = {};
        while (frontier.length) {
          frontier.sort(function (a, b) { return (a.g + heuristic(a.n, scale)) - (b.g + heuristic(b.n, scale)); });
          var node = frontier.shift();
          if (visited[node.n]) continue;
          visited[node.n] = node.g; order.push(node.n);
          if (node.n === 'G') break;
          edges.forEach(function (e) {
            var next = e[0] === node.n ? e[1] : e[1] === node.n ? e[0] : null;
            if (!next) return;
            var g = node.g + e[2];
            if (best[next] === undefined || g < best[next]) { best[next] = g; frontier.push({ n: next, g: g, path: node.path.concat(next) }); }
          });
        }
        return { order: order, cost: visited.G || 0, path: order, g: visited };
      }
      function run() {
        result = search(st.get().bias);
        ucs = search(0);
        draw();
      }
      function draw() {
        var root = K.svg('svg', { viewBox: '0 0 390 220', role: 'img', 'aria-label': 'Towns and rumoured distances' });
        edges.forEach(function (e) {
          var a = towns[e[0]], b = towns[e[1]];
          root.appendChild(K.svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'rgba(237,232,221,.24)', 'stroke-width': '1.5' }));
          root.appendChild(K.svg('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 4, fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', 'text-anchor': 'middle' }, String(e[2])));
        });
        Object.keys(towns).forEach(function (k) {
          var n = towns[k], done = result && result.order.indexOf(k) >= 0;
          root.appendChild(K.svg('circle', { cx: n.x, cy: n.y, r: 21, fill: done ? 'oklch(.62 .12 315 / .4)' : '#151A21', stroke: done ? 'oklch(.78 .12 315)' : 'rgba(237,232,221,.35)' }));
          root.appendChild(K.svg('text', { x: n.x, y: n.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11' }, k));
          root.appendChild(K.svg('text', { x: n.x, y: n.y + 35, 'text-anchor': 'middle', fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, 'h ' + (n.h * st.get().bias).toFixed(1)));
          if (st.get().labels && done) root.appendChild(K.svg('text', { x: n.x, y: n.y - 28, 'text-anchor': 'middle', fill: 'oklch(.8 .1 315)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, 'f ' + ((result.g[k] || 0) + n.h * st.get().bias).toFixed(0)));
        });
        K.clear(stage).appendChild(root);
        var admissible = st.get().bias <= 1;
        note.textContent = 'Expanded ' + result.order.join(', ') + '. Cost ' + result.cost + '. UCS expands ' + ucs.order.length + '. ' + (admissible ? 'The rumour never overestimates, so the path is cheapest.' : 'The rumour overestimates, so the path may not be cheapest.');
        note.style.color = admissible ? 'rgba(145,141,132,.95)' : '#D9988C';
      }
      run();
    }
  });

  /* ---------- race ---------- */
  AIM.register('race', {
    mount: function (host) {
      var cv = K.canvas(host, 2.3, draw);
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      var runB = K.button('Run all three', function () { draw(); });
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px' } }, runB));
      host.appendChild(note);

      function search(kind) {
        var q = [{ n: START, g: 0 }], seen = {}, expanded = 0;
        while (q.length) {
          var i = 0;
          if (kind === 'bfs') i = 0;
          else if (kind === 'ucs') i = q.reduce(function (b, x, k) { return x.g < q[b].g ? k : b; }, 0);
          else i = q.reduce(function (b, x, k) {
            var fx = x.g + Math.abs(x.n[0] - GOAL[0]) + Math.abs(x.n[1] - GOAL[1]);
            var fb = q[b].g + Math.abs(q[b].n[0] - GOAL[0]) + Math.abs(q[b].n[1] - GOAL[1]);
            return fx < fb ? k : b;
          }, 0);
          var node = q.splice(i, 1)[0];
          if (seen[node.n.join(',')]) continue;
          seen[node.n.join(',')] = 1; expanded++;
          if (node.n[0] === GOAL[0] && node.n[1] === GOAL[1]) return { expanded: expanded, cost: node.g };
          neighbours(node.n).forEach(function (n) {
            if (!seen[n.join(',')]) q.push({ n: n, g: node.g + 1 + ((n[0] + n[1]) % 3 === 0 ? 2 : 0) });
          });
        }
        return { expanded: expanded, cost: 0 };
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h;
        var results = [['BFS', search('bfs'), 'oklch(.7 .12 315)'], ['UCS', search('ucs'), 'oklch(.7 .12 60)'], ['A star', search('astar'), 'oklch(.7 .12 120)']];
        ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        var max = Math.max.apply(null, results.map(function (r) { return r[1].expanded; }));
        results.forEach(function (r, i) {
          var y = 30 + i * 54;
          ctx.fillStyle = 'rgba(237,232,221,.85)';
          ctx.fillText(r[0], 10, y);
          ctx.fillStyle = r[2];
          ctx.fillRect(70, y - 10, (r[1].expanded / max) * (w - 160), 14);
          ctx.fillStyle = 'rgba(145,141,132,.95)';
          ctx.fillText(r[1].expanded + ' expanded', w - 84, y);
        });
        note.textContent = 'BFS counts steps, UCS and A star minimise a weighted cost. The cheapest path is the same, the work is not.';
      }
      draw();
    }
  });
})();
