/* Connection exercise: draw and check a concept map */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  AIM.register('concept-map', {
    mount: function (host, cfg) {
      var map = cfg.map || { nodes: [], edges: [] };
      var key = 'w:conceptmap:' + map.nodes.map(function (n) { return n.id; }).join('-');
      var saved = K.store(key, { pos: {}, edges: [] }).get();
      var pos = {}, edges = saved.edges.map(function (e) { return e.slice(); });
      map.nodes.forEach(function (n) {
        pos[n.id] = saved.pos[n.id] || { x: n.x, y: n.y };
      });

      var cv = K.canvas(host, 1.5, draw);
      var note = el('p', { class: 'lab-note', style: { 'min-height': '48px' } });
      var check = K.button('Check map', function () { verify(); });
      var clear = K.button('Clear edges', function () { edges = []; save(); draw(); note.textContent = 'Edges cleared. Click one card, then another, to draw a relation.'; }, { cls: 'btn-dark' });
      host.appendChild(el('div', { class: 'lab-ui', style: { gap: '8px' } }, check, clear));
      host.appendChild(note);

      var selected = null, drag = null, moved = false;

      function save() {
        K.store(key, { pos: pos, edges: edges }).set({ pos: pos, edges: edges });
      }
      function edgeKey(a, b) { return [a, b].sort().join('|'); }
      function has(a, b) { return edges.some(function (e) { return edgeKey(e[0], e[1]) === edgeKey(a, b); }); }
      function hit(px, py) {
        var s = cv.size();
        var found = null;
        Object.keys(pos).forEach(function (id) {
          var x = pos[id].x / 100 * s.w, y = pos[id].y / 100 * s.h;
          if (Math.hypot(px - x, py - y) < 34) found = id;
        });
        return found;
      }
      cv.cv.addEventListener('pointerdown', function (e) {
        var r = cv.cv.getBoundingClientRect();
        var id = hit(e.clientX - r.left, e.clientY - r.top);
        if (!id) return;
        cv.cv.setPointerCapture(e.pointerId);
        drag = id; moved = false;
      });
      cv.cv.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var r = cv.cv.getBoundingClientRect();
        moved = true;
        pos[drag] = { x: Math.max(6, Math.min(94, (e.clientX - r.left) / r.width * 100)), y: Math.max(8, Math.min(92, (e.clientY - r.top) / r.height * 100)) };
        draw();
      });
      cv.cv.addEventListener('pointerup', function (e) {
        if (!drag) return;
        var was = drag; drag = null;
        if (!moved) {
          if (selected && selected !== was) {
            if (!has(selected, was)) { edges.push([selected, was]); save(); }
            note.textContent = 'Edge drawn. ' + edges.length + ' of ' + map.edges.length + ' reference relations present.';
            selected = null;
          } else {
            selected = selected === was ? null : was;
          }
        }
        save(); draw();
      });
      cv.cv.addEventListener('pointercancel', function () { drag = null; });

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h;
        ctx.clearRect(0, 0, w, h);
        edges.forEach(function (e) {
          var a = pos[e[0]], b = pos[e[1]];
          if (!a || !b) return;
          ctx.strokeStyle = 'rgba(237,232,221,.4)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(a.x / 100 * w, a.y / 100 * h); ctx.lineTo(b.x / 100 * w, b.y / 100 * h); ctx.stroke();
        });
        map.nodes.forEach(function (n) {
          var p = pos[n.id], x = p.x / 100 * w, y = p.y / 100 * h;
          var on = selected === n.id;
          ctx.fillStyle = on ? 'oklch(.55 .12 60 / .35)' : 'rgba(237,232,221,.06)';
          ctx.strokeStyle = on ? '#EDE8DD' : 'rgba(237,232,221,.4)';
          ctx.lineWidth = 1.4;
          roundRect(ctx, x - 40, y - 20, 80, 40, 6);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#EDE8DD';
          ctx.font = '600 11px Inter, sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          wrapText(ctx, n.label, x, y, 72, 13);
        });
      }
      function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      }
      function wrapText(ctx, text, x, y, max, lh) {
        var words = text.split(' '), lines = [], line = '';
        words.forEach(function (word) {
          if ((line + ' ' + word).trim().length > 13 && line) { lines.push(line); line = word; }
          else line = (line + ' ' + word).trim();
        });
        if (line) lines.push(line);
        lines.forEach(function (l, i) { ctx.fillText(l, x, y + (i - (lines.length - 1) / 2) * lh); });
      }
      function verify() {
        var ref = map.edges.map(function (e) { return edgeKey(e[0], e[1]); });
        var mine = edges.map(function (e) { return edgeKey(e[0], e[1]); });
        var correct = mine.filter(function (k) { return ref.indexOf(k) >= 0; });
        var extra = mine.filter(function (k) { return ref.indexOf(k) < 0; });
        var missing = map.edges.filter(function (e) { return mine.indexOf(edgeKey(e[0], e[1])) < 0; });
        var label = map.nodes.reduce(function (a, n) { a[n.id] = n.label; return a; }, {});
        var msg = correct.length + ' of ' + ref.length + ' relations correct.';
        if (missing.length) msg += ' Missing: ' + missing.map(function (e) { return label[e[0]] + ' to ' + label[e[1]]; }).join('; ') + '.';
        if (extra.length) msg += ' Extra: ' + extra.length + '.';
        if (!missing.length && !extra.length) msg = 'Complete. Every reference relation is present and nothing extra was drawn.';
        note.textContent = msg;
        note.style.color = !missing.length && !extra.length ? 'oklch(.8 .12 150)' : 'rgba(145,141,132,.95)';
      }
      draw();
      note.textContent = 'Click a card, then another, to draw a relation. Drag cards to arrange them.';
    }
  });
})();
