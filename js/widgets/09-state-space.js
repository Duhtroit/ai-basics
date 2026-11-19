/* Unit 9 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  /* ---------- state builder ---------- */
  AIM.register('state-builder', {
    mount: function (host, cfg) {
      var fields = [
        ['position', true, 'Required to know which moves are legal.'],
        ['fuel', true, 'Required to know whether a move is affordable.'],
        ['parcels', true, 'Required by the goal test.'],
        ['steps', false, 'Not used by any decision.'],
        ['weather', false, 'Not used by any decision.']
      ];
      var st = K.store('w:statebuilder', { on: [true, true, true, false, false] });
      var cv = K.canvas(host, 2.4, draw);
      var row = el('div', { class: 'lab-ui', style: { gap: '6px' } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      host.appendChild(row); host.appendChild(note);
      var buttons = fields.map(function (f, i) {
        return K.button(f[0], function () {
          var on = st.get().on.slice(); on[i] = !on[i]; st.set({ on: on }); draw();
        }, { cls: 'btn-dark' });
      });
      buttons.forEach(function (b) { row.appendChild(b); });

      function draw() {
        var on = st.get().on;
        buttons.forEach(function (b, i) { b.classList.toggle('on', on[i]); b.textContent = fields[i][0] + (on[i] ? ' on' : ' off'); });
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, N = 6, cell = Math.min(w, h * 1.4) / N, ox = (w - cell * N) / 2, oy = 10;
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          ctx.fillStyle = (r + c) % 2 ? 'rgba(237,232,221,.05)' : 'rgba(237,232,221,.09)';
          ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
        }
        var parcels = [[4, 1], [2, 4], [5, 4], [4, 5]];
        parcels.forEach(function (p) {
          ctx.fillStyle = on[2] ? 'oklch(.75 .12 60)' : 'rgba(145,141,132,.35)';
          ctx.beginPath(); ctx.arc(ox + (p[0] + .5) * cell, oy + (p[1] + .5) * cell, cell * 0.2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = 'oklch(.75 .12 250)';
        ctx.beginPath(); ctx.arc(ox + 1.5 * cell, oy + 1.5 * cell, cell * 0.24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0E1116'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('R', ox + 1.5 * cell, oy + 1.5 * cell + 4);
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.textAlign = 'left';
        ctx.fillText('fuel ' + (on[1] ? '3' : '?') + '   parcels ' + (on[2] ? '0 of 4' : '?'), 10, oy + cell * N + 18);
        var missing = fields.filter(function (f, i) { return f[1] && !on[i]; });
        note.textContent = missing.length
          ? 'The state is missing ' + missing.map(function (f) { return f[0]; }).join(' and ') + '. The agent cannot finish the task.'
          : 'Sufficient. Position, fuel and parcel flags cover every decision and the goal test. The extra fields would only enlarge the state space.';
        note.style.color = missing.length ? '#D9988C' : 'rgba(145,141,132,.95)';
      }
      draw();
    }
  });

  /* ---------- graph explore ---------- */
  AIM.register('graph-explore', {
    mount: function (host) {
      var N = 7, walls = { '2,1': 1, '2,2': 1, '2,3': 1, '4,3': 1, '5,3': 1, '3,5': 1 };
      var start = [0, 0], goal = [6, 6];
      var order = [], seen = {}, q = [start], parent = {};
      seen[start.join(',')] = 1;
      while (q.length) {
        var cur = q.shift(); order.push(cur);
        if (cur[0] === goal[0] && cur[1] === goal[1]) break;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var nx = cur[0] + d[0], ny = cur[1] + d[1], k = nx + ',' + ny;
          if (nx < 0 || ny < 0 || nx >= N || ny >= N || walls[k] || seen[k]) return;
          seen[k] = 1; parent[k] = cur; q.push([nx, ny]);
        });
      }
      var cv = K.canvas(host, 1.6, draw);
      var frame = 0;
      var tr = K.transport({ length: order.length, label: 'Expansion', interval: 260, onFrame: function (i) { frame = i; draw(); } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '36px' } });
      host.appendChild(tr.el); host.appendChild(note);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, cell = Math.min(w, h) / N, ox = (w - cell * N) / 2, oy = (h - cell * N) / 2;
        var idx = frame, visited = order.slice(0, idx + 1);
        var vset = {}; visited.forEach(function (p) { vset[p.join(',')] = 1; });
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var k = c + ',' + r;
          ctx.fillStyle = walls[k] ? 'rgba(0,0,0,.45)' : vset[k] ? 'oklch(.6 .1 285 / .35)' : 'rgba(237,232,221,.06)';
          ctx.fillRect(ox + c * cell + 1, oy + r * cell + 1, cell - 2, cell - 2);
        }
        visited.forEach(function (p) {
          var par = parent[p.join(',')];
          if (par) {
            ctx.strokeStyle = 'rgba(237,232,221,.25)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ox + (p[0] + .5) * cell, oy + (p[1] + .5) * cell); ctx.lineTo(ox + (par[0] + .5) * cell, oy + (par[1] + .5) * cell); ctx.stroke();
          }
        });
        var cur = order[Math.min(idx, order.length - 1)];
        ctx.fillStyle = 'oklch(.8 .14 60)';
        ctx.beginPath(); ctx.arc(ox + (cur[0] + .5) * cell, oy + (cur[1] + .5) * cell, cell * 0.24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'oklch(.75 .12 120)';
        ctx.beginPath(); ctx.arc(ox + (goal[0] + .5) * cell, oy + (goal[1] + .5) * cell, cell * 0.18, 0, Math.PI * 2); ctx.fill();
        note.textContent = 'Expanded ' + (idx + 1) + ' of ' + order.length + ' reachable cells. Circles are states; lines are transitions generated from the grid.';
      }
      draw();
    }
  });

  /* ---------- framework step ---------- */
  AIM.register('framework-step', {
    mount: function (host, cfg) {
      var nodes = { A: { x: 40, y: 60 }, B: { x: 140, y: 30 }, C: { x: 140, y: 110 }, D: { x: 240, y: 60 }, E: { x: 240, y: 150 }, F: { x: 330, y: 100 } };
      var edges = [['A', 'B', 1], ['A', 'C', 4], ['B', 'C', 1], ['B', 'D', 5], ['C', 'E', 2], ['D', 'F', 2], ['E', 'F', 1]];
      var st = K.store('w:framework', { policy: 'fifo' });
      var stage = el('div', {});
      var frontierBox = el('div', { class: 'lab-note', style: { 'min-height': '34px' } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '38px' } });
      var seg = K.segmented({ label: 'Policy', value: st.get().policy, options: [{ v: 'lifo', label: 'Stack' }, { v: 'fifo', label: 'Queue' }, { v: 'cost', label: 'Cost' }], onChange: function (v) { st.set({ policy: v }); seg.set(v); reset(); } });
      var step = K.button('Step', function () { stepOnce(); });
      var resetB = K.button('Reset', reset, { cls: 'btn-dark' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '10px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, seg.el, step, resetB));
      host.appendChild(stage); host.appendChild(frontierBox); host.appendChild(note);

      var frontier, visited, order, log;
      function reset() {
        frontier = [{ n: 'A', path: ['A'], cost: 0 }]; visited = {}; order = []; log = [];
        draw();
      }
      function stepOnce() {
        if (!frontier.length) return;
        var i = 0;
        if (st.get().policy === 'fifo') i = 0;
        else if (st.get().policy === 'lifo') i = frontier.length - 1;
        else i = frontier.reduce(function (best, f, k) { return f.cost < frontier[best].cost ? k : best; }, 0);
        var node = frontier.splice(i, 1)[0];
        if (visited[node.n]) { stepOnce(); return; }
        visited[node.n] = true; order.push(node.n);
        edges.forEach(function (e) {
          var next = e[0] === node.n ? e[1] : e[1] === node.n ? e[0] : null;
          if (next && !visited[next]) frontier.push({ n: next, path: node.path.concat(next), cost: node.cost + e[2] });
        });
        draw();
      }
      function draw() {
        var root = K.svg('svg', { viewBox: '0 0 380 200', role: 'img', 'aria-label': 'Small graph with frontier' });
        edges.forEach(function (e) {
          var a = nodes[e[0]], b = nodes[e[1]];
          root.appendChild(K.svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'rgba(237,232,221,.22)', 'stroke-width': '1.4' }));
          root.appendChild(K.svg('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 4, fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', 'text-anchor': 'middle' }, String(e[2])));
        });
        Object.keys(nodes).forEach(function (k) {
          var n = nodes[k];
          var inF = frontier.some(function (f) { return f.n === k; });
          root.appendChild(K.svg('circle', { cx: n.x, cy: n.y, r: 18, fill: visited[k] ? 'oklch(.6 .1 285 / .4)' : inF ? 'oklch(.7 .12 60 / .35)' : '#151A21', stroke: visited[k] ? 'oklch(.75 .1 285)' : 'rgba(237,232,221,.35)' }));
          root.appendChild(K.svg('text', { x: n.x, y: n.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11' }, k));
        });
        K.clear(stage).appendChild(root);
        frontierBox.textContent = 'FRONTIER: ' + (frontier.length ? frontier.map(function (f) { return f.n + '(' + f.cost + ')'; }).join('  ') : 'empty');
        note.textContent = order.length ? 'Expanded ' + order.join(' then ') + '. The policy chose each next node from the frontier.' : 'The frontier starts with A. Choose a policy and step.';
      }
      reset();
    }
  });
})();
