/* Unit 2 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  /* ---------- perspective flow ---------- */
  AIM.register('perspective-flow', {
    mount: function (host, cfg) {
      var st = K.store('w:perspective', { step: 0 });
      var labels = cfg.mode === 'rung1'
        ? ['Recipe', 'Bake', 'Sell']
        : ['Model', 'Learn', 'Infer'];
      var cv = K.canvas(host, 2.2, draw);
      var tr = K.transport({ length: 4, label: 'Stage', interval: 1100, onFrame: function (i) { st.set({ step: i }); draw(); } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      host.appendChild(tr.el); host.appendChild(note);
      var pts = [{ x: 1, y: 300 }, { x: 6, y: 800 }, { x: 2, y: 400 }, { x: 5, y: 700 }, { x: 3, y: 500 }, { x: 4, y: 600 }, { x: 7, y: 900 }];
      var t = 0;

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 34, r: 18, t: 18, b: 28 };
        var xs = K.scale(0, 8, pad.l, w - pad.r), ys = K.scale(0, 1000, h - pad.b, pad.t);
        ctx.strokeStyle = 'rgba(237,232,221,.14)';
        ctx.beginPath(); ctx.moveTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.stroke();
        pts.forEach(function (p) {
          ctx.fillStyle = 'rgba(237,232,221,.55)';
          ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), 3.5, 0, Math.PI * 2); ctx.fill();
        });
        var step = st.get().step;
        var wv = step === 0 ? 0 : step === 1 ? 100 : 100;
        var bv = step === 0 ? 0 : step === 1 ? 200 : 200;
        if (step >= 1) {
          ctx.strokeStyle = 'oklch(.7 .13 60)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(xs(0), ys(bv)); ctx.lineTo(xs(8), ys(wv * 8 + bv)); ctx.stroke();
        }
        if (step === 3) {
          var nx = 4.5, ny = 100 * nx + 200;
          ctx.strokeStyle = 'oklch(.7 .13 120)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(xs(nx), ys(ny)); ctx.lineTo(xs(nx), h - pad.b); ctx.stroke();
          ctx.fillStyle = '#EDE8DD';
          ctx.beginPath(); ctx.arc(xs(nx), ys(ny), 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = 'rgba(145,141,132,.95)';
        ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        labels.forEach(function (l, i) {
          ctx.fillStyle = i === Math.min(step, 2) ? 'oklch(.78 .13 60)' : 'rgba(145,141,132,.7)';
          ctx.fillText(String(i + 1) + ' ' + l.toUpperCase(), pad.l + i * 92, 14);
        });
        note.textContent = [
          'Choose the shape: y = wx + b. The parameters are unknown.',
          'Learning fits w and b to the training pairs. The line moves.',
          'The fitted model is fixed. v = 100, b = 200 in this example.',
          'Inference predicts a new case inside the same problem domain.'
        ][step];
      }
    }
  });

  /* ---------- split conveyor ---------- */
  AIM.register('split-conveyor', {
    mount: function (host) {
      var st = K.store('w:split', { train: 60, leak: false });
      var cv = K.canvas(host, 2.6, draw);
      var train = K.slider({ label: 'Training share', min: 40, max: 80, step: 5, value: st.get().train, format: function (v) { return v + '%'; }, onInput: function (v) { st.set({ train: v, leak: st.get().leak }); draw(); } });
      var leak = K.button('Leakage off', function () {
        var v = !st.get().leak; st.set({ train: st.get().train, leak: v });
        leak.textContent = 'Leakage ' + (v ? 'on' : 'off');
        leak.classList.toggle('on', v);
        draw();
      }, { cls: 'btn-dark' });
      var score = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      host.appendChild(el('div', { style: { display: 'flex', gap: '16px', 'flex-wrap': 'wrap' } }, train.el, leak));
      host.appendChild(score);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h;
        var n = 40, tr = Math.round(n * st.get().train / 100), va = Math.round((n - tr) * 0.5);
        var lanes = [['TRAIN', tr, 'oklch(.66 .12 60)'], ['VALIDATION', va, 'oklch(.66 .12 250)'], ['TEST', n - tr - va, 'oklch(.66 .12 120)']];
        var y = h * 0.16, gap = h * 0.24;
        lanes.forEach(function (lane, li) {
          ctx.fillStyle = 'rgba(145,141,132,.9)';
          ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
          ctx.fillText(lane[0] + '  ' + lane[1], 10, y + li * gap - 8);
          for (var i = 0; i < lane[1]; i++) {
            var x = 20 + (i % 20) * ((w - 40) / 20);
            var yy = y + li * gap + Math.floor(i / 20) * 12;
            ctx.fillStyle = lane[2];
            if (st.get().leak && li > 0 && i % 3 === 0) ctx.fillStyle = 'oklch(.66 .14 20)';
            ctx.beginPath(); ctx.arc(x + 4, yy + 4, 3.2, 0, Math.PI * 2); ctx.fill();
          }
        });
        var base = 0.72 + (st.get().train - 40) * 0.002;
        var reported = st.get().leak ? Math.min(0.99, base + 0.2) : base;
        score.textContent = st.get().leak
          ? 'Reported score ' + Math.round(reported * 100) + '%. Test rows were touched during preparation, so the number is optimistic.'
          : 'Reported score ' + Math.round(reported * 100) + '%. The test lane stayed sealed.';
        score.style.color = st.get().leak ? '#D9988C' : 'rgba(145,141,132,.95)';
      }
    }
  });

  /* ---------- k-fold ---------- */
  AIM.register('kfold', {
    mount: function (host) {
      var st = K.store('w:kfold', { k: 5, round: 0 });
      var cv = K.canvas(host, 2.8, draw);
      var next = K.button('Next fold', function () { var s = st.get(); st.set({ k: s.k, round: (s.round + 1) % s.k }); draw(); });
      var seg = K.segmented({ label: 'Folds', value: st.get().k, options: [{ v: 3, label: 'k = 3' }, { v: 5, label: 'k = 5' }, { v: 10, label: 'k = 10' }], onChange: function (v) { st.set({ k: v, round: 0 }); seg.set(v); draw(); } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      host.appendChild(el('div', { style: { display: 'flex', gap: '16px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, seg.el, next));
      host.appendChild(note);

      var scores = [0.74, 0.81, 0.78, 0.76, 0.79, 0.77, 0.8, 0.75, 0.78, 0.79];
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, k = st.get().k, round = st.get().round % k;
        var cw = (w - 40) / k, ch = h * 0.6;
        ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
        for (var i = 0; i < k; i++) {
          for (var j = 0; j < k; j++) {
            var x = 20 + i * cw, y = 40 + j * (ch / k);
            ctx.fillStyle = i === round ? 'oklch(.5 .05 60)' : 'oklch(.66 .1 60)';
            if (j === round) ctx.fillStyle = i === round ? 'rgba(237,232,221,.2)' : 'oklch(.5 .14 20)';
            ctx.fillRect(x + 2, y + 2, cw - 4, ch / k - 4);
            ctx.fillStyle = 'rgba(237,232,221,.75)';
            ctx.fillText(i === round && j === round ? 'TEST' : '', x + cw / 2, y + ch / k / 2 + 3);
          }
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(237,232,221,.8)';
        ctx.fillText('Round ' + (round + 1) + ' of ' + k + ': fold ' + (round + 1) + ' is held out', 20, 24);
        var mean = scores.slice(0, k).reduce(function (a, b) { return a + b; }, 0) / k;
        note.textContent = 'Round ' + (round + 1) + ' of ' + k + '. Mean held-out score ' + mean.toFixed(3) + '. Every case is tested exactly once.';
      }
    }
  });

  /* ---------- confusion ---------- */
  AIM.register('confusion', {
    mount: function (host) {
      var st = K.store('w:confusion', { t: 0.5 });
      var cv = K.canvas(host, 2.4, draw);
      var sl = K.slider({ label: 'Threshold', min: 0.05, max: 0.95, step: 0.01, value: st.get().t, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ t: v }); draw(); } });
      var matrix = el('div', { style: { display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '1px', background: 'rgba(237,232,221,.16)', width: '100%' } });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(sl.el); host.appendChild(matrix); host.appendChild(note);

      var neg = [], pos = [], rnd = K.seeded(11);
      for (var i = 0; i < 200; i++) neg.push(Math.min(0.95, Math.max(0.02, 0.3 + (rnd() + rnd() + rnd() - 1.5) * 0.16)));
      for (i = 0; i < 40; i++) pos.push(Math.min(0.98, Math.max(0.05, 0.68 + (rnd() + rnd() + rnd() - 1.5) * 0.15)));

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, t = st.get().t;
        var pad = { l: 26, r: 14, t: 10, b: 24 };
        var bins = 30, bw = (w - pad.l - pad.r) / bins;
        var countsN = new Array(bins).fill(0), countsP = new Array(bins).fill(0);
        neg.forEach(function (v) { countsN[Math.min(bins - 1, Math.floor(v * bins))]++; });
        pos.forEach(function (v) { countsP[Math.min(bins - 1, Math.floor(v * bins))]++; });
        var max = Math.max.apply(null, countsN.concat(countsP));
        for (var b = 0; b < bins; b++) {
          var x = pad.l + b * bw;
          var hn = countsN[b] / max * (h - pad.t - pad.b);
          var hp = countsP[b] / max * (h - pad.t - pad.b);
          ctx.fillStyle = 'rgba(145,141,132,.55)';
          ctx.fillRect(x + 1, h - pad.b - hn, bw - 2, hn);
          ctx.fillStyle = 'oklch(.7 .13 60)';
          ctx.fillRect(x + 1, h - pad.b - hn - hp, bw - 2, hp);
        }
        var tx = pad.l + t * (w - pad.l - pad.r);
        ctx.strokeStyle = '#EDE8DD'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tx, pad.t); ctx.lineTo(tx, h - pad.b); ctx.stroke();
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'left'; ctx.fillText('negative', pad.l, h - 8);
        ctx.textAlign = 'right'; ctx.fillText('positive', w - pad.r, h - 8);

        var tp = pos.filter(function (v) { return v >= t; }).length;
        var fn = pos.length - tp;
        var fp = neg.filter(function (v) { return v >= t; }).length;
        var tn = neg.length - fp;
        var prec = tp / (tp + fp || 1), rec = tp / (tp + fn || 1);
        var cells = [['TRUE POS', tp], ['FALSE POS', fp], ['FALSE NEG', fn], ['TRUE NEG', tn]];
        matrix.textContent = '';
        cells.forEach(function (c) {
          matrix.appendChild(el('div', { style: { background: '#151A21', padding: '10px 12px' } },
            el('div', { class: 'lab-note', text: c[0] }),
            el('div', { style: { color: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '18px' }, text: String(c[1]) })));
        });
        note.textContent = 'Precision ' + prec.toFixed(2) + '  Recall ' + rec.toFixed(2) + '  Accuracy ' + ((tp + tn) / 240).toFixed(3) + '. The same model, a different operating point.';
      }
    }
  });

  /* ---------- loss curve ---------- */
  AIM.register('loss-curve', {
    mount: function (host, cfg) {
      var st = K.store('w:loss', { kind: 'mse', e: 0.4 });
      var cv = K.canvas(host, 2.2, draw);
      var seg = K.segmented({ label: 'Penalty', value: st.get().kind, options: [{ v: 'mse', label: 'Squared' }, { v: 'mae', label: 'Absolute' }, { v: 'log', label: 'Log' }], onChange: function (v) { st.set({ kind: v, e: st.get().e }); seg.set(v); draw(); } });
      var sl = K.slider({ label: cfg.mode === 'rung2' || cfg.mode === 'rung3' ? 'Predicted probability for a true case' : 'Size of the error', min: 0.01, max: 0.99, step: 0.01, value: st.get().e, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ kind: st.get().kind, e: v }); draw(); } });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '16px', 'flex-wrap': 'wrap' } }, seg.el, sl.el));
      host.appendChild(note);

      function loss(kind, x) {
        if (kind === 'mse') return x * x;
        if (kind === 'mae') return Math.abs(x);
        return -Math.log(Math.max(0.02, x));
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 34, r: 16, t: 16, b: 28 };
        var kind = st.get().kind, e = st.get().e;
        var maxY = kind === 'log' ? 4 : 1;
        var x0 = kind === 'log' ? 0.02 : -1;
        var xs = K.scale(x0, 1, pad.l, w - pad.r), ys = K.scale(0, maxY, h - pad.b, pad.t);
        ctx.strokeStyle = 'rgba(237,232,221,.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.stroke();
        ctx.strokeStyle = 'oklch(.7 .13 60)'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i <= 100; i++) {
          var xv = x0 + (1 - x0) * i / 100;
          var yv = Math.min(maxY, loss(kind, kind === 'log' ? xv : xv));
          if (kind === 'log' && xv <= 0) continue;
          var px = kind === 'log' ? xs(xv) : xs(xv * 2 - 1), py = ys(yv);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        var ex = kind === 'log' ? e : e * 2 - 1;
        var ey = Math.min(maxY, loss(kind, kind === 'log' ? e : ex));
        ctx.fillStyle = '#EDE8DD';
        ctx.beginPath(); ctx.arc(xs(ex), ys(ey), 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText(kind === 'log' ? 'predicted probability for a true case' : 'residual', pad.l + 4, 12);
        note.textContent = 'Loss at this point: ' + ey.toFixed(2) + '. ' + (kind === 'mse' ? 'Squaring makes large errors dominate.' : kind === 'mae' ? 'Absolute error counts every unit equally.' : 'A confident wrong probability costs the most.');
      }
    }
  });

  /* ---------- overfitting ---------- */
  AIM.register('overfit', {
    mount: function (host) {
      var st = K.store('w:overfit', { degree: 1, noise: 0.25, seed: 3 });
      var cv = K.canvas(host, 2.2, draw);
      var d = K.slider({ label: 'Polynomial degree', min: 1, max: 9, step: 1, value: st.get().degree, format: function (v) { return String(v); }, onInput: function (v) { st.set({ degree: v, noise: st.get().noise, seed: st.get().seed }); draw(); } });
      var n = K.slider({ label: 'Noise', min: 0, max: 0.6, step: 0.02, value: st.get().noise, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ degree: st.get().degree, noise: v, seed: st.get().seed }); draw(); } });
      var again = K.button('Resample', function () { st.set({ degree: st.get().degree, noise: st.get().noise, seed: st.get().seed + 1 }); draw(); });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '16px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, d.el, n.el, again));
      host.appendChild(note);

      var train = [], test = [];
      function sample() {
        var rnd = K.seeded(100 + st.get().seed);
        train = []; test = [];
        for (var i = 0; i < 16; i++) {
          var x = -1 + i / 15 * 2;
          var y = Math.sin(x * 2.4) * 0.7 + (rnd() - 0.5) * st.get().noise * 2;
          var p = { x: x, y: y };
          if (i % 2 === 0) train.push(p); else test.push(p);
        }
      }

      function solve(A, b) {
        var n = b.length, M = A.map(function (row, i) { return row.concat([b[i]]); });
        for (var c = 0; c < n; c++) {
          var piv = c;
          for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
          var tmp = M[c]; M[c] = M[piv]; M[piv] = tmp;
          if (Math.abs(M[c][c]) < 1e-9) continue;
          for (r = 0; r < n; r++) {
            if (r === c) continue;
            var f = M[r][c] / M[c][c];
            for (var k = c; k <= n; k++) M[r][k] -= f * M[c][k];
          }
        }
        return M.map(function (row, i) { return Math.abs(row[i]) < 1e-9 ? 0 : row[n] / row[i]; });
      }

      function fit(points, deg) {
        var A = [], b = [];
        for (var r = 0; r <= deg; r++) {
          A.push([]);
          for (var c = 0; c <= deg; c++) {
            var s = 0;
            points.forEach(function (p) { s += Math.pow(p.x, r + c); });
            A[r].push(s);
          }
          var t = 0;
          points.forEach(function (p) { t += p.y * Math.pow(p.x, r); });
          b.push(t);
        }
        return solve(A, b);
      }
      function predict(coef, x) { var y = 0; coef.forEach(function (c, i) { y += c * Math.pow(x, i); }); return y; }
      function mse(coef, pts) { var s = 0; pts.forEach(function (p) { var d = predict(coef, p.x) - p.y; s += d * d; }); return s / pts.length; }

      function draw() {
        sample();
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 30, r: 14, t: 14, b: 24 };
        var xs = K.scale(-1.1, 1.1, pad.l, w - pad.r), ys = K.scale(-1.3, 1.3, h - pad.b, pad.t);
        ctx.strokeStyle = 'rgba(237,232,221,.12)';
        ctx.beginPath(); ctx.moveTo(pad.l, h / 2); ctx.lineTo(w - pad.r, h / 2); ctx.stroke();
        var coef = fit(train, st.get().degree);
        ctx.strokeStyle = 'oklch(.7 .13 60)'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i <= 120; i++) {
          var x = -1 + i / 120 * 2, y = Math.max(-1.3, Math.min(1.3, predict(coef, x)));
          i === 0 ? ctx.moveTo(xs(x), ys(y)) : ctx.lineTo(xs(x), ys(y));
        }
        ctx.stroke();
        train.forEach(function (p) { ctx.fillStyle = '#EDE8DD'; ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), 3.2, 0, Math.PI * 2); ctx.fill(); });
        test.forEach(function (p) { ctx.strokeStyle = 'oklch(.7 .13 250)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), 3.4, 0, Math.PI * 2); ctx.stroke(); });
        var tr = mse(coef, train), te = mse(coef, test);
        note.textContent = 'Train error ' + tr.toFixed(3) + '   Test error ' + te.toFixed(3) + '. Hollow points are held out.';
      }
    }
  });

  /* ---------- bias variance ---------- */
  AIM.register('bias-variance', {
    mount: function (host) {
      var st = K.store('w:biasvar', { bias: 0.35, spread: 0.3, seed: 1 });
      var cv = K.canvas(host, 2.1, draw);
      var b = K.slider({ label: 'Aim error (bias)', min: 0, max: 0.9, step: 0.02, value: st.get().bias, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ bias: v, spread: st.get().spread, seed: st.get().seed }); draw(); } });
      var s = K.slider({ label: 'Scatter (variance)', min: 0.05, max: 0.6, step: 0.01, value: st.get().spread, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ bias: st.get().bias, spread: v, seed: st.get().seed }); draw(); } });
      var again = K.button('New sample', function () { st.set({ bias: st.get().bias, spread: st.get().spread, seed: st.get().seed + 1 }); draw(); });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, b.el, s.el, again));
      host.appendChild(note);

      function draw() {
        var s0 = cv.size(); if (!s0.w) return;
        var ctx = cv.ctx, w = s0.w, h = s0.h;
        var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
        [1, 0.66, 0.33].forEach(function (f, i) {
          ctx.strokeStyle = i === 2 ? 'oklch(.7 .13 60)' : 'rgba(237,232,221,.16)';
          ctx.lineWidth = i === 2 ? 1.5 : 1;
          ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke();
        });
        var rnd = K.seeded(200 + st.get().seed);
        var bx = st.get().bias * R, by = -st.get().bias * R * 0.5;
        for (var i = 0; i < 34; i++) {
          var a = rnd() * Math.PI * 2, r = Math.abs(rnd() + rnd() - 1) * st.get().spread * R * 1.5;
          ctx.fillStyle = 'oklch(.72 .1 250)';
          ctx.beginPath(); ctx.arc(cx + bx + Math.cos(a) * r, cy + by + Math.sin(a) * r, 2.6, 0, Math.PI * 2); ctx.fill();
        }
        var bias2 = st.get().bias * st.get().bias, variance = st.get().spread * st.get().spread;
        note.textContent = 'Bias² ' + bias2.toFixed(2) + '   Variance ' + variance.toFixed(2) + '   Total ' + (bias2 + variance).toFixed(2) + '. Lower bias can raise variance.';
      }
    }
  });
})();
