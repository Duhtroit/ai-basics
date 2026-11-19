/* Unit 5 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el, svg = K.svg;

  function act(kind, z) {
    if (kind === 'relu') return Math.max(0, z);
    if (kind === 'tanh') return Math.tanh(z);
    return 1 / (1 + Math.exp(-z));
  }

  /* ---------- forward pass ---------- */
  AIM.register('forward-pass', {
    mount: function (host, cfg) {
      var single = cfg.mode === 'rung1';
      var st = K.store('w:forward:' + (single ? 'one' : 'deep'), { x: [0.9, 0.3, 0.6], kind: 'sigmoid', layer: 1 });
      var wrap = el('div', { style: { display: 'grid', gap: '12px' } });
      var stage = el('div', {});
      var panel = el('p', { class: 'lab-note', style: { 'min-height': '40px' } });
      host.appendChild(wrap); wrap.appendChild(stage); wrap.appendChild(panel);

      var W1 = [[0.9, -0.4, 0.2], [-0.6, 0.8, 0.5], [0.3, 0.5, -0.7]];
      var b1 = [0.1, -0.2, 0.05];
      var W2 = [1.1, -0.8, 0.6];
      var b2 = -0.1;

      var seg = K.segmented({ label: 'Activation', value: st.get().kind, options: [{ v: 'sigmoid', label: 'Sigmoid' }, { v: 'relu', label: 'ReLU' }, { v: 'tanh', label: 'Tanh' }], onChange: function (v) { st.set({ x: st.get().x, kind: v, layer: st.get().layer }); seg.set(v); draw(); } });
      var sliders = st.get().x.map(function (v, i) {
        return K.slider({ label: 'Input ' + (i + 1), min: -1, max: 1, step: 0.05, value: v, format: function (n) { return n.toFixed(2); }, onInput: function (n) { var x = st.get().x.slice(); x[i] = n; st.set({ x: x, kind: st.get().kind, layer: st.get().layer }); draw(); } });
      });
      wrap.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap' } }, sliders.map(function (s) { return s.el; })));
      wrap.appendChild(seg.el);

      function draw() {
        var s = st.get(), x = s.x, kind = s.kind;
        var hz = [0, 1, 2].map(function (j) { return b1[j] + W1[j].reduce(function (a, w, i) { return a + w * x[i]; }, 0); });
        var ha = hz.map(function (z) { return act(kind, z); });
        var oz = b2 + W2.reduce(function (a, w, j) { return a + w * ha[j]; }, 0);
        var oa = act(kind, oz);

        var width = 560, height = single ? 220 : 320;
        var root = svg('svg', { viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': 'Network diagram with current activations' });
        var xs = [70, 280, 490];
        var pos = [];
        function layerPos(li, count, i) {
          var top = 60, bottom = height - 40;
          return { x: xs[li], y: count === 1 ? (top + bottom) / 2 : top + i * (bottom - top) / (count - 1) };
        }
        for (var j = 0; j < 3; j++) pos.push({ x: xs[0], y: height === 220 ? 110 : 70 + j * 80 });
        var hiddenPos = [0, 1, 2].map(function (i) { return { x: xs[1], y: 50 + i * 55 }; });
        var outPos = { x: xs[2], y: height / 2 };

        for (j = 0; j < 3; j++) {
          for (var i = 0; i < 3; i++) {
            var wv = W1[j][i];
            root.appendChild(svg('line', { x1: pos[i].x, y1: pos[i].y, x2: hiddenPos[j].x, y2: hiddenPos[j].y, stroke: wv >= 0 ? 'oklch(.72 .12 155)' : 'rgba(200,120,110,.7)', 'stroke-width': Math.max(1, Math.abs(wv) * 3), opacity: '.55' }));
          }
          var w2 = W2[j];
          root.appendChild(svg('line', { x1: hiddenPos[j].x, y1: hiddenPos[j].y, x2: outPos.x, y2: outPos.y, stroke: w2 >= 0 ? 'oklch(.72 .12 155)' : 'rgba(200,120,110,.7)', 'stroke-width': Math.max(1, Math.abs(w2) * 2.4), opacity: '.55' }));
        }
        pos.forEach(function (p, i) {
          root.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 20, fill: '#151A21', stroke: 'rgba(237,232,221,.4)' }));
          root.appendChild(svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '10' }, x[i].toFixed(2)));
          root.appendChild(svg('text', { x: p.x, y: p.y - 28, 'text-anchor': 'middle', fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9' }, 'IN ' + (i + 1)));
        });
        hiddenPos.forEach(function (p, j) {
          root.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 22, fill: 'oklch(.55 .1 155 / .25)', stroke: 'oklch(.7 .12 155)' }));
          root.appendChild(svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '10' }, ha[j].toFixed(2)));
          root.appendChild(svg('text', { x: p.x, y: p.y - 30, 'text-anchor': 'middle', fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9' }, 'SUM ' + hz[j].toFixed(2)));
        });
        root.appendChild(svg('circle', { cx: outPos.x, cy: outPos.y, r: 26, fill: 'oklch(.55 .12 155 / .3)', stroke: 'oklch(.75 .12 155)', 'stroke-width': '1.5' }));
        root.appendChild(svg('text', { x: outPos.x, y: outPos.y + 5, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11' }, oa.toFixed(2)));
        root.appendChild(svg('text', { x: outPos.x, y: outPos.y - 36, 'text-anchor': 'middle', fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9' }, 'OUTPUT'));

        K.clear(stage).appendChild(root);
        panel.textContent = 'Output ' + oa.toFixed(3) + '. ' + (single ? 'One unit is a weighted vote. The activation decides the shape of the answer.' : 'Each hidden value is a weighted sum of the inputs plus a bias. The output reads the hidden layer, not the raw inputs.');
      }
    }
  });

  /* ---------- blame flow ---------- */
  AIM.register('blame-flow', {
    mount: function (host) {
      var st = K.store('w:blame', { step: 0 });
      var saved = st.get();
      var stage = el('div', {});
      var panel = el('p', { class: 'lab-note', style: { 'min-height': '40px' } });
      var W1 = [[0.8, -0.5], [0.3, 0.9]], b1 = [0.1, -0.1];
      var W2 = [1.2, -0.7], b2 = 0.05;
      var x = [1, 0.5], y = 1;
      var tr = K.transport({ length: 4, start: saved.step || 0, label: 'Pass', interval: 1100, onFrame: function (i) { st.set({ step: i }); draw(); } });
      var reset = K.button('Reset', function () { tr.stop(); st.set({ step: 0 }); tr.set(0); draw(); }, { cls: 'btn-dark' });
      host.appendChild(tr.el); host.appendChild(el('div', { class: 'lab-ui' }, reset));
      host.appendChild(stage); host.appendChild(panel);
      tr.set(st.get().step || 0);

      function draw() {
        var step = st.get().step;
        var hz = [0, 1].map(function (j) { return b1[j] + W1[j][0] * x[0] + W1[j][1] * x[1]; });
        var ha = hz.map(function (z) { return Math.tanh(z); });
        var oz = b2 + W2[0] * ha[0] + W2[1] * ha[1];
        var out = Math.tanh(oz);
        var err = out - y;
        var dOut = err * (1 - out * out);
        var dH = [0, 1].map(function (j) { return dOut * W2[j] * (1 - ha[j] * ha[j]); });
        var dW2 = [0, 1].map(function (j) { return dOut * ha[j]; });

        var width = 560, height = 300;
        var root = svg('svg', { viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': 'Backpropagation diagram' });
        var xs = [70, 270, 470];
        var inp = [{ x: xs[0], y: 100 }, { x: xs[0], y: 200 }];
        var hid = [{ x: xs[1], y: 80 }, { x: xs[1], y: 220 }];
        var op = { x: xs[2], y: 150 };

        for (var j = 0; j < 2; j++) {
          for (var i = 0; i < 2; i++) {
            var g = step >= 3 ? dH[j] * x[i] : 0;
            root.appendChild(svg('line', { x1: inp[i].x, y1: inp[i].y, x2: hid[j].x, y2: hid[j].y, stroke: step >= 3 ? 'oklch(.72 .14 35)' : 'rgba(237,232,221,.25)', 'stroke-width': step >= 3 ? Math.max(1, Math.abs(g) * 8) : 1.5 }));
            if (step >= 3) root.appendChild(svg('text', { x: (inp[i].x + hid[j].x) / 2, y: (inp[i].y + hid[j].y) / 2 - 6, fill: 'oklch(.8 .1 35)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9', 'text-anchor': 'middle' }, g.toFixed(2)));
          }
          var g2 = step >= 3 ? dW2[j] : 0;
          root.appendChild(svg('line', { x1: hid[j].x, y1: hid[j].y, x2: op.x, y2: op.y, stroke: step >= 3 ? 'oklch(.72 .14 35)' : 'rgba(237,232,221,.25)', 'stroke-width': step >= 3 ? Math.max(1, Math.abs(g2) * 8) : 1.5 }));
          if (step >= 3) root.appendChild(svg('text', { x: (hid[j].x + op.x) / 2, y: (hid[j].y + op.y) / 2 - 6, fill: 'oklch(.8 .1 35)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9', 'text-anchor': 'middle' }, g2.toFixed(2)));
        }
        inp.forEach(function (p, i) {
          root.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 24, fill: '#151A21', stroke: 'rgba(237,232,221,.4)' }));
          root.appendChild(svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11' }, x[i].toFixed(1)));
        });
        hid.forEach(function (p, j) {
          root.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 26, fill: 'oklch(.55 .1 155 / .22)', stroke: 'oklch(.7 .12 155)' }));
          root.appendChild(svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11' }, step >= 1 ? ha[j].toFixed(2) : '?'));
          if (step >= 3) root.appendChild(svg('text', { x: p.x, y: p.y + 44, 'text-anchor': 'middle', fill: 'oklch(.8 .1 35)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9' }, 'd ' + dH[j].toFixed(2)));
        });
        root.appendChild(svg('circle', { cx: op.x, cy: op.y, r: 30, fill: 'oklch(.55 .12 155 / .3)', stroke: 'oklch(.75 .12 155)', 'stroke-width': '1.5' }));
        root.appendChild(svg('text', { x: op.x, y: op.y + 4, 'text-anchor': 'middle', fill: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12' }, step >= 2 ? out.toFixed(2) : '?'));
        root.appendChild(svg('text', { x: op.x, y: op.y + 48, 'text-anchor': 'middle', fill: 'rgba(145,141,132,.9)', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '9' }, 'TARGET ' + y));

        K.clear(stage).appendChild(root);
        panel.textContent = [
          'Forward pass: inputs enter the first layer.',
          'Hidden units compute their weighted sums and activations.',
          'The output is compared with the target. The error is ' + err.toFixed(2) + '.',
          'Backward pass: each weight receives a share of the blame, scaled by how much it contributed.'
        ][step];
      }
    }
  });

  /* ---------- tiny trainer ---------- */
  AIM.register('tiny-trainer', {
    mount: function (host) {
      var st = K.store('w:tinytrain', { lr: 0.25, hidden: 8, seed: 4, epochs: 0 });
      var cv = K.canvas(host, 2.0, draw);
      var lr = K.slider({ label: 'Learning rate', min: 0.02, max: 0.8, step: 0.02, value: st.get().lr, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ lr: v, hidden: st.get().hidden, seed: st.get().seed, epochs: st.get().epochs }); reset(); } });
      var hid = K.slider({ label: 'Hidden units', min: 2, max: 12, step: 1, value: st.get().hidden, format: function (v) { return String(v); }, onInput: function (v) { st.set({ lr: st.get().lr, hidden: v, seed: st.get().seed, epochs: 0 }); reset(); } });
      var run = K.button('Train 200 epochs', function () { train(200); });
      var again = K.button('Reset', function () { reset(); }, { cls: 'btn-dark' });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '40px' } });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, lr.el, hid.el, run, again));
      host.appendChild(note);

      var data = [], net = null, loss = 1;

      function makeData() {
        var rnd = K.seeded(77);
        data = [];
        for (var i = 0; i < 70; i++) {
          var a = rnd() * Math.PI * 2, r = rnd() * 0.35;
          data.push({ x: Math.cos(a) * r + 0.15, y: Math.sin(a) * r, c: 1 });
        }
        for (i = 0; i < 70; i++) {
          a = rnd() * Math.PI * 2; r = 0.7 + rnd() * 0.22;
          data.push({ x: Math.cos(a) * r + 0.15, y: Math.sin(a) * r, c: 0 });
        }
      }
      function reset() {
        var rnd = K.seeded(st.get().seed + st.get().hidden);
        var H = st.get().hidden;
        net = { H: H, W1: [], b1: [], W2: [], b2: 0 };
        for (var j = 0; j < H; j++) {
          net.W1.push([(rnd() - 0.5) * 2, (rnd() - 0.5) * 2]);
          net.b1.push((rnd() - 0.5) * 0.6);
          net.W2.push((rnd() - 0.5) * 2);
        }
        makeData(); loss = 1; draw();
      }
      function forward(p) {
        var h = [], z = [];
        for (var j = 0; j < net.H; j++) {
          z[j] = net.b1[j] + net.W1[j][0] * p.x + net.W1[j][1] * p.y;
          h[j] = Math.tanh(z[j]);
        }
        var o = net.b2;
        for (j = 0; j < net.H; j++) o += net.W2[j] * h[j];
        return { h: h, z: z, out: 1 / (1 + Math.exp(-o)), o: o };
      }
      function train(n) {
        var lr0 = st.get().lr, total = 0;
        for (var e = 0; e < n; e++) {
          total = 0;
          data.forEach(function (p) {
            var f = forward(p), y = p.c;
            var dOut = (f.out - y);
            total += -y * Math.log(Math.max(1e-6, f.out)) - (1 - y) * Math.log(Math.max(1e-6, 1 - f.out));
            for (var j = 0; j < net.H; j++) {
              var dh = dOut * net.W2[j] * (1 - f.h[j] * f.h[j]);
              net.W2[j] -= lr0 * dOut * f.h[j];
              net.W1[j][0] -= lr0 * dh * p.x;
              net.W1[j][1] -= lr0 * dh * p.y;
              net.b1[j] -= lr0 * dh;
            }
            net.b2 -= lr0 * dOut;
          });
        }
        loss = total / data.length;
        st.set({ lr: st.get().lr, hidden: st.get().hidden, seed: st.get().seed, epochs: st.get().epochs + n });
        draw();
      }
      function draw() {
        if (!net) return;
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 24, r: 16, t: 16, b: 24 };
        var xs = K.scale(-1.2, 1.2, pad.l, w - pad.r), ys = K.scale(-1.2, 1.2, h - pad.b, pad.t);
        var G = 26;
        for (var i = 0; i < G; i++) {
          for (var j = 0; j < G; j++) {
            var px = -1.1 + i / (G - 1) * 2.2, py = -1.1 + j / (G - 1) * 2.2;
            var out = forward({ x: px, y: py }).out;
            ctx.fillStyle = out > 0.5 ? 'oklch(.55 .1 155 / .22)' : 'rgba(237,232,221,.04)';
            ctx.fillRect(xs(px), ys(py), (w - pad.l - pad.r) / G + 1, (h - pad.t - pad.b) / G + 1);
          }
        }
        ctx.strokeStyle = 'rgba(237,232,221,.2)'; ctx.lineWidth = 1;
        for (i = 0; i <= 20; i++) {
          var t = -1.1 + i / 20 * 2.2;
          for (j = 0; j < 40; j++) {
            var a = -1.1 + j / 40 * 2.2, b = a + 2.2 / 40;
            var v1 = forward({ x: t, y: a }).out, v2 = forward({ x: t, y: b }).out;
            if ((v1 - 0.5) * (v2 - 0.5) < 0) {
              ctx.beginPath(); ctx.moveTo(xs(t), ys(a)); ctx.lineTo(xs(t), ys(b)); ctx.stroke();
            }
            var u1 = forward({ x: a, y: t }).out, u2 = forward({ x: b, y: t }).out;
            if ((u1 - 0.5) * (u2 - 0.5) < 0) {
              ctx.beginPath(); ctx.moveTo(xs(a), ys(t)); ctx.lineTo(xs(b), ys(t)); ctx.stroke();
            }
          }
        }
        data.forEach(function (p) {
          ctx.fillStyle = p.c === 1 ? 'oklch(.8 .1 90)' : 'rgba(237,232,221,.7)';
          ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), 2.6, 0, Math.PI * 2); ctx.fill();
        });
        note.textContent = 'Epochs ' + st.get().epochs + '   Loss ' + loss.toFixed(3) + '. The shaded region is the positive class at threshold 0.5.';
      }
      reset();
    }
  });
})();
