/* Unit 8 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el, svg = K.svg;

  /* ---------- probability grid ---------- */
  AIM.register('prob-grid', {
    mount: function (host, cfg) {
      var st = K.store('w:probgrid', { a: 0.5, b: 0.4, ab: 0.2 });
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '38px' } });
      var sliders = [
        K.slider({ label: 'P(A)', min: 0, max: 1, step: 0.01, value: st.get().a, format: function (v) { return v.toFixed(2); }, onInput: function (v) { var s = st.get(); st.set({ a: v, b: s.b, ab: Math.min(v, s.ab) }); sync(); } }),
        K.slider({ label: 'P(B)', min: 0, max: 1, step: 0.01, value: st.get().b, format: function (v) { return v.toFixed(2); }, onInput: function (v) { var s = st.get(); st.set({ a: s.a, b: v, ab: Math.min(v, s.ab) }); sync(); } }),
        K.slider({ label: 'P(A and B)', min: 0, max: 1, step: 0.01, value: st.get().ab, format: function (v) { return v.toFixed(2); }, onInput: function (v) { var s = st.get(); st.set({ a: s.a, b: s.b, ab: Math.min(v, s.a, s.b) }); sync(); } })
      ];
      host.appendChild(stage);
      host.appendChild(el('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } }, sliders.map(function (s) { return s.el; })));
      host.appendChild(note);

      function sync() {
        var s = st.get();
        sliders[0].set(s.a); sliders[1].set(s.b); sliders[2].set(s.ab);
        draw();
      }
      function draw() {
        var s = st.get(), a = s.a, b = s.b, ab = s.ab;
        var W = 260, H = 200, x0 = 10, y0 = 10, w = 240, h = 150;
        var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Probability area diagram' });
        root.appendChild(svg('rect', { x: x0, y: y0, width: w, height: h, fill: 'rgba(237,232,221,.04)', stroke: 'rgba(237,232,221,.2)' }));
        root.appendChild(svg('rect', { x: x0, y: y0, width: w * a, height: h, fill: 'oklch(.62 .1 250 / .35)', stroke: 'oklch(.7 .1 250)' }));
        root.appendChild(svg('rect', { x: x0, y: y0, width: w, height: h * b, fill: 'oklch(.62 .1 120 / .25)', stroke: 'oklch(.7 .1 120)' }));
        root.appendChild(svg('rect', { x: x0, y: y0, width: w * a, height: h * b, fill: 'oklch(.66 .1 60 / .35)' }));
        if (ab > 0) {
          root.appendChild(svg('rect', { x: x0, y: y0, width: w * Math.min(1, ab / Math.max(b, 0.01)), height: h * b, fill: 'oklch(.7 .14 35 / .55)' }));
        }
        root.appendChild(svg('text', { x: x0 + 4, y: y0 - 2, fill: 'rgba(237,232,221,.8)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, 'A'));
        root.appendChild(svg('text', { x: x0 - 8, y: y0 + 10, fill: 'rgba(237,232,221,.8)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, 'B'));
        K.clear(stage).appendChild(root);
        if (cfg.mode === 'rung3') {
          var pa = a, pnot = 1 - a;
          note.textContent = 'P(A) ' + pa.toFixed(2) + '   P(not A) ' + pnot.toFixed(2) + '. Conditional P(A|B) = ' + (ab / (b || 1)).toFixed(2) + ', which is not P(B|A) = ' + (ab / (a || 1)).toFixed(2) + '.';
        } else {
          note.textContent = 'The overlap ' + ab.toFixed(2) + ' sits inside both events. P(A or B) is ' + (a + b - ab).toFixed(2) + '.';
        }
      }
      draw();
    }
  });

  /* ---------- Bayes rule ---------- */
  AIM.register('bayes-rule', {
    mount: function (host) {
      var st = K.store('w:bayesrule', { prev: 0.001, sens: 0.99, spec: 0.95 });
      var cv = K.canvas(host, 2.1, draw);
      var p = K.slider({ label: 'Prevalence', min: 0.001, max: 0.3, step: 0.001, value: st.get().prev, format: function (v) { return (v * 100).toFixed(1) + '%'; }, onInput: function (v) { st.set({ prev: v, sens: st.get().sens, spec: st.get().spec }); draw(); } });
      var se = K.slider({ label: 'Sensitivity', min: 0.5, max: 0.99, step: 0.01, value: st.get().sens, format: function (v) { return (v * 100).toFixed(0) + '%'; }, onInput: function (v) { st.set({ prev: st.get().prev, sens: v, spec: st.get().spec }); draw(); } });
      var sp = K.slider({ label: 'Specificity', min: 0.5, max: 0.99, step: 0.01, value: st.get().spec, format: function (v) { return (v * 100).toFixed(0) + '%'; }, onInput: function (v) { st.set({ prev: st.get().prev, sens: st.get().sens, spec: v }); draw(); } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap' } }, p.el, se.el, sp.el));
      host.appendChild(note);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 30, r: 16, t: 16, b: 26 };
        var N = 100000, sick = N * st.get().prev, well = N - sick;
        var tp = sick * st.get().sens, fn = sick - tp;
        var fp = well * (1 - st.get().spec), tn = well - fp;
        var post = tp / (tp + fp || 1);
        var xs = K.scale(0, N, pad.l, w - pad.r);
        ctx.fillStyle = 'rgba(145,141,132,.9)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('100,000 people', pad.l, 12);
        var y = 34, total = tp + fp + fn + tn;
        var segs = [['true positive', tp, 'oklch(.7 .14 120)'], ['false positive', fp, 'oklch(.7 .14 20)'], ['false negative', fn, 'oklch(.5 .08 120)'], ['true negative', tn, 'rgba(237,232,221,.16)']];
        var x = pad.l;
        segs.forEach(function (sg) {
          var sw = (sg[1] / total) * (w - pad.l - pad.r);
          if (sw < 1) sw = 1;
          ctx.fillStyle = sg[2];
          ctx.fillRect(x, y, sw, 34);
          x += sw;
        });
        ctx.fillStyle = '#EDE8DD'; ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillText('P(disease | positive) = ' + post.toFixed(3), pad.l, y + 64);
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillText('true positives ' + Math.round(tp) + '   false positives ' + Math.round(fp), pad.l, y + 82);
        note.textContent = 'The prior is ' + (st.get().prev * 100).toFixed(2) + '%. A positive result moves it to ' + (post * 100).toFixed(1) + '%. Sensitivity and specificity did not change.';
      }
    }
  });

  /* ---------- Bayes net builder ---------- */
  AIM.register('bayes-builder', {
    mount: function (host) {
      var observed = {};
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      var reset = K.button('Clear evidence', function () { observed = {}; draw(); }, { cls: 'btn-dark' });
      host.appendChild(stage); host.appendChild(el('div', { style: { display: 'flex', gap: '8px' } }, reset)); host.appendChild(note);

      var nodes = {
        B: { x: 60, y: 60, label: 'Burglary' },
        E: { x: 220, y: 60, label: 'Earthquake' },
        A: { x: 140, y: 150, label: 'Alarm' },
        J: { x: 70, y: 240, label: 'John calls' },
        M: { x: 210, y: 240, label: 'Mary calls' }
      };
      var edges = [['B', 'A'], ['E', 'A'], ['A', 'J'], ['A', 'M']];

      function parents(n) { return edges.filter(function (e) { return e[1] === n; }).map(function (e) { return e[0]; }); }
      function children(n) { return edges.filter(function (e) { return e[0] === n; }).map(function (e) { return e[1]; }); }
      function descendants(n) {
        var out = [], stack = children(n);
        while (stack.length) {
          var c = stack.pop();
          if (out.indexOf(c) >= 0) continue;
          out.push(c); stack = stack.concat(children(c));
        }
        return out;
      }
      function pathOpen(from, to) {
        // path B-A-E is blocked when A observed; B-A-J is blocked when A observed.
        var mid = 'A';
        if ((from === 'B' && to === 'E') || (from === 'E' && to === 'B')) return !observed[mid];
        if ((from === 'B' && to === 'J') || (from === 'J' && to === 'B')) return !observed[mid] && !observed.J;
        if ((from === 'E' && to === 'M') || (from === 'M' && to === 'E')) return !observed[mid] && !observed.M;
        return false;
      }
      function draw() {
        var root = svg('svg', { viewBox: '0 0 280 290', role: 'img', 'aria-label': 'Bayes net with five nodes' });
        edges.forEach(function (e) {
          var a = nodes[e[0]], b = nodes[e[1]];
          root.appendChild(svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'rgba(237,232,221,.3)', 'stroke-width': '1.2' }));
        });
        Object.keys(nodes).forEach(function (k) {
          var n = nodes[k], on = observed[k];
          root.appendChild(svg('circle', { cx: n.x, cy: n.y, r: 26, fill: on ? 'oklch(.55 .12 60 / .5)' : '#151A21', stroke: on ? '#EDE8DD' : 'rgba(237,232,221,.35)' }));
          root.appendChild(svg('text', { x: n.x, y: n.y + 32, 'text-anchor': 'middle', fill: 'rgba(237,232,221,.85)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8' }, n.label));
          var t = svg('text', { x: n.x, y: n.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '10' }, k);
          root.appendChild(t);
          var hit = svg('circle', { cx: n.x, cy: n.y, r: 26, fill: 'transparent', style: 'cursor:pointer' });
          hit.addEventListener('click', function () { observed[k] = !observed[k]; draw(); });
          root.appendChild(hit);
        });
        K.clear(stage).appendChild(root);
        var open = pathOpen('B', 'E');
        note.textContent = 'Click a node to observe it. Burglary and earthquake are ' + (open ? 'dependent' : 'independent') + ' given the current evidence. Observing the alarm blocks the chain and opens nothing.';
      }
      draw();
    }
  });

  /* ---------- alarm inference ---------- */
  AIM.register('alarm-infer', {
    mount: function (host) {
      var st = K.store('w:alarm', { j: true, m: true });
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      var bJ = K.button('John calls', function () { st.set({ j: !st.get().j, m: st.get().m }); draw(); }, { cls: 'btn-dark' });
      var bM = K.button('Mary calls', function () { st.set({ j: st.get().j, m: !st.get().m }); draw(); }, { cls: 'btn-dark' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px' } }, bJ, bM));
      host.appendChild(stage); host.appendChild(note);

      var P = { b: 0.001, e: 0.002 };
      var A = { '1,1': 0.95, '1,0': 0.94, '0,1': 0.29, '0,0': 0.001 };
      var J = { 1: 0.9, 0: 0.05 }, M = { 1: 0.7, 0: 0.01 };

      function draw() {
        var j = st.get().j, m = st.get().m;
        bJ.classList.toggle('on', j); bM.classList.toggle('on', m);
        bJ.textContent = 'John ' + (j ? 'calls' : 'silent');
        bM.textContent = 'Mary ' + (m ? 'calls' : 'silent');
        var rows = [], z = 0;
        [0, 1].forEach(function (b) {
          [0, 1].forEach(function (e) {
            var pa = A[b + ',' + e];
            [0, 1].forEach(function (a) {
              var pj = J[j ? 1 : 0], pm = M[m ? 1 : 0];
              var p = (b ? P.b : 1 - P.b) * (e ? P.e : 1 - P.e) * (a ? pa : 1 - pa) * (j ? (a ? pj : 1 - pj) : 1) * (m ? (a ? pm : 1 - pm) : 1);
              rows.push({ b: b, e: e, a: a, p: p });
              z += p;
            });
          });
        });
        var post = rows.filter(function (r) { return r.b; }).reduce(function (a, r) { return a + r.p; }, 0) / z;
        stage.textContent = '';
        var table = el('div', { style: { display: 'grid', 'grid-template-columns': 'repeat(4,1fr)', gap: '1px', background: 'rgba(237,232,221,.14)' } });
        ['B', 'E', 'A', 'P'].forEach(function (h) { table.appendChild(el('div', { class: 'lab-note', style: { background: '#151A21', padding: '6px 8px' }, text: h })); });
        rows.forEach(function (r) {
          [r.b, r.e, r.a].forEach(function (v) {
            table.appendChild(el('div', { style: { background: '#151A21', padding: '6px 8px', color: v ? '#EDE8DD' : 'rgba(145,141,132,.8)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11px' }, text: v ? 'T' : 'F' }));
          });
          table.appendChild(el('div', { style: { background: '#151A21', padding: '6px 8px', color: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11px' }, text: (r.p * 100).toFixed(3) + '%' }));
        });
        stage.appendChild(table);
        note.textContent = 'Posterior for burglary ' + (post * 100).toFixed(1) + '%. The prior was 0.1%. Each row is one complete assignment; the posterior sums the rows where burglary is true.';
      }
      draw();
    }
  });

  /* ---------- explaining away ---------- */
  AIM.register('explaining-away', {
    mount: function (host) {
      var st = K.store('w:away', { alarm: true, quake: false, pb: 0.001, pe: 0.002 });
      var cv = K.canvas(host, 2.4, draw);
      var bA = K.button('Alarm observed', function () { st.set({ alarm: !st.get().alarm, quake: st.get().quake, pb: st.get().pb, pe: st.get().pe }); draw(); }, { cls: 'btn-dark' });
      var bE = K.button('Earthquake observed', function () { st.set({ alarm: st.get().alarm, quake: !st.get().quake, pb: st.get().pb, pe: st.get().pe }); draw(); }, { cls: 'btn-dark' });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px' } }, bA, bE));
      host.appendChild(note);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, s0 = st.get();
        bA.classList.toggle('on', s0.alarm); bE.classList.toggle('on', s0.quake);
        bA.textContent = 'Alarm ' + (s0.alarm ? 'observed' : 'hidden');
        bE.textContent = 'Earthquake ' + (s0.quake ? 'observed' : 'hidden');
        var post = s0.alarm ? (s0.quake ? 0.003 : 0.37) : 0.001;
        var bw = w * 0.7, x = w * 0.15;
        ctx.fillStyle = 'rgba(237,232,221,.1)'; ctx.fillRect(x, 50, bw, 26);
        ctx.fillStyle = 'oklch(.7 .13 250)'; ctx.fillRect(x, 50, bw * Math.min(1, post * 2.4), 26);
        ctx.fillStyle = '#EDE8DD'; ctx.font = '13px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('P(burglary | evidence) = ' + (post * 100).toFixed(1) + '%', x, 36);
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillText('prior 0.1%', x, 96);
        note.textContent = s0.quake && s0.alarm ? 'The earthquake explains the alarm, so burglary becomes far less likely. The two causes compete.' : s0.alarm ? 'The alarm raises burglary. Add the earthquake and watch the belief fall.' : 'No evidence yet. Turn on the alarm, then the earthquake.';
      }
      draw();
    }
  });
})();
