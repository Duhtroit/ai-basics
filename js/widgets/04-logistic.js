/* Unit 4 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  /* ---------- sigmoid ---------- */
  AIM.register('sigmoid', {
    mount: function (host) {
      var st = K.store('w:sigmoid', { z: 0, w: 1, b: 0 });
      var cv = K.canvas(host, 2.4, draw);
      var z = K.slider({ label: 'Score z', min: -6, max: 6, step: 0.1, value: st.get().z, format: function (v) { return v.toFixed(1); }, onInput: function (v) { st.set({ z: v, w: st.get().w, b: st.get().b }); draw(); } });
      var wS = K.slider({ label: 'Weight w', min: -3, max: 3, step: 0.1, value: st.get().w, format: function (v) { return v.toFixed(1); }, onInput: function (v) { st.set({ z: st.get().z, w: v, b: st.get().b }); draw(); } });
      var bS = K.slider({ label: 'Offset b', min: -4, max: 4, step: 0.1, value: st.get().b, format: function (v) { return v.toFixed(1); }, onInput: function (v) { st.set({ z: st.get().z, w: st.get().w, b: v }); draw(); } });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } }, z.el, wS.el, bS.el));
      host.appendChild(note);

      function sig(v) { return 1 / (1 + Math.exp(-v)); }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 34, r: 16, t: 16, b: 28 };
        var xs = K.scale(-6, 6, pad.l, w - pad.r), ys = K.scale(0, 1, h - pad.b, pad.t);
        ctx.strokeStyle = 'rgba(237,232,221,.16)';
        ctx.beginPath(); ctx.moveTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.stroke();
        var p = st.get();
        ctx.strokeStyle = 'rgba(237,232,221,.25)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (var i = 0; i <= 120; i++) {
          var zz = -6 + i / 120 * 12;
          i === 0 ? ctx.moveTo(xs(zz), ys(sig(zz))) : ctx.lineTo(xs(zz), ys(sig(zz)));
        }
        ctx.stroke();
        ctx.strokeStyle = 'oklch(.7 .13 120)'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (i = 0; i <= 120; i++) {
          zz = -6 + i / 120 * 12;
          var v = sig(p.w * zz + p.b);
          i === 0 ? ctx.moveTo(xs(zz), ys(v)) : ctx.lineTo(xs(zz), ys(v));
        }
        ctx.stroke();
        var pz = p.w * p.z + p.b, pv = sig(pz);
        ctx.fillStyle = 'oklch(.75 .14 120)';
        ctx.beginPath(); ctx.arc(xs(p.z), ys(pv), 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(237,232,221,.3)';
        ctx.beginPath(); ctx.moveTo(xs(p.z), ys(0)); ctx.lineTo(xs(p.z), ys(pv)); ctx.stroke();
        ctx.fillStyle = 'rgba(145,141,221,.95)';
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('z', w - pad.r - 8, h - 8);
        note.textContent = 'Score ' + pz.toFixed(2) + ' gives probability ' + pv.toFixed(3) + '. The 0.5 crossing sits at z = 0, which depends on w and b.';
      }
    }
  });

  /* ---------- boundary ---------- */
  AIM.register('boundary', {
    mount: function (host) {
      var st = K.store('w:boundary', { angle: 35, offset: 0 });
      var cv = K.canvas(host, 2.15, draw);
      var a = K.slider({ label: 'Angle', min: 0, max: 180, step: 1, value: st.get().angle, format: function (v) { return v + ' deg'; }, onInput: function (v) { st.set({ angle: v, offset: st.get().offset }); draw(); } });
      var o = K.slider({ label: 'Offset', min: -1.2, max: 1.2, step: 0.02, value: st.get().offset, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ angle: st.get().angle, offset: v }); draw(); } });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } }, a.el, o.el));
      host.appendChild(note);

      var pts = [], rnd = K.seeded(21);
      for (var i = 0; i < 22; i++) pts.push({ x: -1.4 + rnd() * 1.6, y: -1.2 + rnd() * 2.2, c: 0 });
      for (i = 0; i < 22; i++) pts.push({ x: 0.1 + rnd() * 1.6, y: -1.2 + rnd() * 2.2, c: 1 });

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 24, r: 16, t: 16, b: 24 };
        var xs = K.scale(-2, 2, pad.l, w - pad.r), ys = K.scale(-2, 2, h - pad.b, pad.t);
        ctx.strokeStyle = 'rgba(237,232,221,.12)';
        ctx.beginPath(); ctx.moveTo(w / 2, pad.t); ctx.lineTo(w / 2, h - pad.b); ctx.moveTo(pad.l, h / 2); ctx.lineTo(w - pad.r, h / 2); ctx.stroke();
        var th = st.get().angle * Math.PI / 180, off = st.get().offset;
        var nx = Math.cos(th), ny = Math.sin(th), c = -off;
        var correct = 0;
        pts.forEach(function (p) {
          var side = nx * p.x + ny * p.y + c > 0 ? 1 : 0;
          if (side === p.c) correct++;
          ctx.fillStyle = p.c === 1 ? '#EDE8DD' : 'rgba(145,141,132,.85)';
          ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), 3.4, 0, Math.PI * 2); ctx.fill();
        });
        var x0 = -2, x1 = 2;
        var y0 = (-c - nx * x0) / (ny || 1e-6), y1 = (-c - nx * x1) / (ny || 1e-6);
        ctx.strokeStyle = 'oklch(.7 .13 120)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xs(x0), ys(y0)); ctx.lineTo(xs(x1), ys(y1)); ctx.stroke();
        note.textContent = 'Accuracy ' + Math.round(correct / pts.length * 100) + '%. The line is w·x + b = 0. The angle sets the normal, the offset moves it.';
      }
    }
  });

  /* ---------- threshold trade ---------- */
  AIM.register('threshold-trade', {
    mount: function (host) {
      var st = K.store('w:threshold', { t: 0.5, cost: 5 });
      var cv = K.canvas(host, 2.5, draw);
      var tS = K.slider({ label: 'Threshold', min: 0.05, max: 0.95, step: 0.01, value: st.get().t, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ t: v, cost: st.get().cost }); draw(); } });
      var cS = K.slider({ label: 'Cost of a miss', min: 1, max: 20, step: 1, value: st.get().cost, format: function (v) { return v + 'x'; }, onInput: function (v) { st.set({ t: st.get().t, cost: v }); draw(); } });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } }, tS.el, cS.el));
      host.appendChild(note);

      var neg = [], pos = [], rnd = K.seeded(33);
      for (var i = 0; i < 180; i++) neg.push(0.32 + (rnd() + rnd() + rnd() - 1.5) * 0.14);
      for (i = 0; i < 30; i++) pos.push(0.64 + (rnd() + rnd() + rnd() - 1.5) * 0.13);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 24, r: 16, t: 14, b: 30 };
        var t = st.get().t;
        var bins = 28, bw = (w - pad.l - pad.r) / bins;
        var cn = new Array(bins).fill(0), cp = new Array(bins).fill(0);
        neg.forEach(function (v) { cn[Math.min(bins - 1, Math.max(0, Math.floor(v * bins)))]++; });
        pos.forEach(function (v) { cp[Math.min(bins - 1, Math.max(0, Math.floor(v * bins)))]++; });
        var max = Math.max.apply(null, cn.concat(cp));
        for (var b = 0; b < bins; b++) {
          var x = pad.l + b * bw;
          var hn = cn[b] / max * (h - pad.t - pad.b), hp = cp[b] / max * (h - pad.t - pad.b);
          ctx.fillStyle = 'rgba(145,141,132,.5)'; ctx.fillRect(x + 1, h - pad.b - hn, bw - 2, hn);
          ctx.fillStyle = 'oklch(.7 .13 120)'; ctx.fillRect(x + 1, h - pad.b - hn - hp, bw - 2, hp);
        }
        var tx = pad.l + t * (w - pad.l - pad.r);
        ctx.strokeStyle = '#EDE8DD'; ctx.beginPath(); ctx.moveTo(tx, pad.t); ctx.lineTo(tx, h - pad.b); ctx.stroke();
        var tp = pos.filter(function (v) { return v >= t; }).length;
        var fn = pos.length - tp;
        var fp = neg.filter(function (v) { return v >= t; }).length;
        var prec = tp / (tp + fp || 1), rec = tp / (tp + fn || 1);
        var totalCost = fn * st.get().cost + fp;
        var best = 0.05, bestCost = Infinity;
        for (var tt = 0.05; tt <= 0.95; tt += 0.01) {
          var a = pos.filter(function (v) { return v >= tt; }).length;
          var c = neg.filter(function (v) { return v >= tt; }).length;
          var cost = (pos.length - a) * st.get().cost + c;
          if (cost < bestCost) { bestCost = cost; best = tt; }
        }
        note.textContent = 'Precision ' + prec.toFixed(2) + '   Recall ' + rec.toFixed(2) + '   Cost ' + totalCost + '. The cheapest threshold for this cost ratio is ' + best.toFixed(2) + '.';
      }
    }
  });
})();
