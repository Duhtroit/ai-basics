/* Unit 3 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  function points() {
    var rnd = K.seeded(9), out = [];
    for (var i = 0; i < 18; i++) {
      var x = 0.7 + i * 0.42;
      out.push({ x: x, y: 100 * x + 200 + (rnd() - 0.5) * 90 });
    }
    return out;
  }

  function axes(ctx, w, h, pad) {
    ctx.strokeStyle = 'rgba(237,232,221,.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
  }

  /* ---------- fit line ---------- */
  AIM.register('fit-line', {
    mount: function (host) {
      var st = K.store('w:fitline', { w: 60, b: 300 });
      var pts = points();
      var cv = K.canvas(host, 2.15, draw);
      var wS = K.slider({ label: 'Slope w', min: 0, max: 160, step: 1, value: st.get().w, onInput: function (v) { st.set({ w: v, b: st.get().b }); draw(); } });
      var bS = K.slider({ label: 'Offset b', min: 0, max: 500, step: 1, value: st.get().b, onInput: function (v) { st.set({ w: st.get().w, b: v }); draw(); } });
      var solve = K.button('Least squares', function () {
        var mx = 0, my = 0;
        pts.forEach(function (p) { mx += p.x; my += p.y; });
        mx /= pts.length; my /= pts.length;
        var num = 0, den = 0;
        pts.forEach(function (p) { num += (p.x - mx) * (p.y - my); den += (p.x - mx) * (p.x - mx); });
        var w = num / den, b = my - w * mx;
        st.set({ w: w, b: b }); wS.set(w); bS.set(b); draw();
      });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } }, wS.el, bS.el, solve));
      host.appendChild(note);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 42, r: 16, t: 16, b: 28 };
        var xs = K.scale(0, 9, pad.l, w - pad.r), ys = K.scale(0, 1100, h - pad.b, pad.t);
        axes(ctx, w, h, pad);
        var p = st.get(), sse = 0;
        ctx.strokeStyle = 'rgba(237,232,221,.2)'; ctx.lineWidth = 1;
        pts.forEach(function (pt) {
          var pred = p.w * pt.x + p.b;
          sse += Math.pow(pred - pt.y, 2);
          ctx.beginPath(); ctx.moveTo(xs(pt.x), ys(pt.y)); ctx.lineTo(xs(pt.x), ys(pred)); ctx.stroke();
          ctx.fillStyle = '#EDE8DD';
          ctx.beginPath(); ctx.arc(xs(pt.x), ys(pt.y), 3.2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = 'oklch(.7 .13 90)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xs(0), ys(p.b)); ctx.lineTo(xs(9), ys(p.w * 9 + p.b)); ctx.stroke();
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('hours', w - pad.r - 34, h - 8);
        ctx.fillText('income', 6, pad.t + 4);
        note.textContent = 'Sum of squared errors ' + Math.round(sse).toLocaleString() + '. Adjust the two numbers and watch the total.';
      }
    }
  });

  /* ---------- residuals ---------- */
  AIM.register('residuals', {
    mount: function (host) {
      var pts = points();
      var cv = K.canvas(host, 2.15, draw);
      var frame = 0;
      var tr = K.transport({ length: pts.length, label: 'Residual', interval: 650, onFrame: function (i) { frame = i; draw(); } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      host.appendChild(tr.el); host.appendChild(note);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 42, r: 16, t: 16, b: 28 };
        var xs = K.scale(0, 9, pad.l, w - pad.r), ys = K.scale(0, 1100, h - pad.b, pad.t);
        axes(ctx, w, h, pad);
        var idx = frame;
        ctx.strokeStyle = 'oklch(.7 .13 90)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xs(0), ys(200)); ctx.lineTo(xs(9), ys(1100)); ctx.stroke();
        pts.forEach(function (pt, i) {
          var pred = 100 * pt.x + 200, r = pt.y - pred;
          var active = i <= idx;
          if (active) {
            var side = r >= 0 ? 1 : -1;
            ctx.fillStyle = 'rgba(237,232,221,.12)';
            ctx.fillRect(xs(pt.x) - 2.5, Math.min(ys(pred), ys(pt.y)), 5, Math.abs(ys(pt.y) - ys(pred)));
          }
          ctx.fillStyle = active ? '#EDE8DD' : 'rgba(145,141,132,.5)';
          ctx.beginPath(); ctx.arc(xs(pt.x), ys(pt.y), active ? 3.6 : 2.6, 0, Math.PI * 2); ctx.fill();
        });
        var p = pts[idx], r = p.y - (100 * p.x + 200);
        note.textContent = 'Residual ' + r.toFixed(0) + '. Squaring turns it into ' + Math.round(r * r).toLocaleString() + ', which is what least squares minimises.';
      }
    }
  });

  /* ---------- normal equation ---------- */
  AIM.register('normal-eq', {
    mount: function (host, cfg) {
      var st = K.store('w:normaleq', { w: 80, b: 250, scaled: false });
      var pts = points();
      var cv = K.canvas(host, 2.15, draw);
      var wS = K.slider({ label: 'w', min: 0, max: 200, step: 1, value: st.get().w, onInput: function (v) { st.set({ w: v, b: st.get().b, scaled: st.get().scaled }); draw(); } });
      var bS = K.slider({ label: 'b', min: 0, max: 500, step: 1, value: st.get().b, onInput: function (v) { st.set({ w: st.get().w, b: v, scaled: st.get().scaled }); draw(); } });
      var solve = K.button('Solve exactly', function () {
        var mx = 0, my = 0;
        pts.forEach(function (p) { mx += p.x; my += p.y; });
        mx /= pts.length; my /= pts.length;
        var num = 0, den = 0;
        pts.forEach(function (p) { num += (p.x - mx) * (p.y - my); den += Math.pow(p.x - mx, 2); });
        var w = num / den, b = my - w * mx;
        st.set({ w: w, b: b, scaled: st.get().scaled }); wS.set(w); bS.set(b); draw();
      });
      var scale = K.button('Scale x by 10', function () {
        st.set({ w: st.get().w, b: st.get().b, scaled: !st.get().scaled });
        scale.classList.toggle('on', st.get().scaled);
        draw();
      }, { cls: 'btn-dark' });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } }, wS.el, bS.el, solve, scale));
      host.appendChild(note);

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 42, r: 16, t: 16, b: 28 };
        var factor = st.get().scaled ? 10 : 1;
        var xs = K.scale(0, 9 * factor, pad.l, w - pad.r), ys = K.scale(0, 1100, h - pad.b, pad.t);
        axes(ctx, w, h, pad);
        var p = st.get(), sse = 0;
        pts.forEach(function (pt) {
          var pred = p.w * pt.x + p.b;
          sse += Math.pow(pred - pt.y, 2);
          ctx.fillStyle = 'rgba(237,232,221,.8)';
          ctx.beginPath(); ctx.arc(xs(pt.x), ys(pt.y), 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(237,232,221,.16)';
          ctx.beginPath(); ctx.moveTo(xs(pt.x), ys(pt.y)); ctx.lineTo(xs(pt.x), ys(pred)); ctx.stroke();
        });
        ctx.strokeStyle = 'oklch(.7 .13 90)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xs(0), ys(p.b)); ctx.lineTo(xs(9 * factor), ys(p.w * 9 * factor + p.b)); ctx.stroke();
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText(st.get().scaled ? 'x scaled by 10' : 'x in original units', pad.l + 4, pad.t + 4);
        note.textContent = 'SSE ' + Math.round(sse).toLocaleString() + '. The exact solution sets the derivative to zero in one step.';
      }
    }
  });

  /* ---------- descent hill ---------- */
  AIM.register('descent-hill', {
    mount: function (host) {
      var st = K.store('w:hill', { pos: 0.4, stride: 0.35 });
      var cv = K.canvas(host, 2.3, draw);
      var stride = K.slider({ label: 'Stride', min: 0.05, max: 1.3, step: 0.05, value: st.get().stride, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ pos: st.get().pos, stride: v }); draw(); } });
      var step = K.button('Step downhill', function () { stepOnce(); });
      var reset = K.button('Reset', function () { st.set({ pos: 0.4, stride: st.get().stride }); draw(); });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap' } }, stride.el, step, reset));
      host.appendChild(note);

      function f(x) { return Math.pow(x - 3.2, 2) + 0.4; }
      function grad(x) { return 2 * (x - 3.2); }
      function stepOnce() {
        var p = st.get();
        st.set({ pos: p.pos - p.stride * grad(p.pos), stride: p.stride });
        draw();
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 32, r: 20, t: 16, b: 26 };
        var xs = K.scale(0, 6.5, pad.l, w - pad.r), ys = K.scale(0, 6, h - pad.b, pad.t);
        axes(ctx, w, h, pad);
        ctx.strokeStyle = 'rgba(237,232,221,.35)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var i = 0; i <= 120; i++) {
          var x = i / 120 * 6.5;
          i === 0 ? ctx.moveTo(xs(x), ys(f(x))) : ctx.lineTo(xs(x), ys(f(x)));
        }
        ctx.stroke();
        var p = st.get().pos;
        ctx.fillStyle = 'oklch(.72 .14 90)';
        ctx.beginPath(); ctx.arc(xs(p), ys(f(p)), 6, 0, Math.PI * 2); ctx.fill();
        var slope = grad(p);
        ctx.strokeStyle = '#EDE8DD'; ctx.lineWidth = 1;
        var dx = 0.9, x2 = p + dx * (slope < 0 ? 1 : -1);
        ctx.beginPath(); ctx.moveTo(xs(p), ys(f(p))); ctx.lineTo(xs(x2), ys(f(x2))); ctx.stroke();
        note.textContent = 'Position ' + p.toFixed(2) + '. Slope ' + slope.toFixed(2) + '. The step moves against the slope, scaled by the stride.';
      }
    }
  });

  /* ---------- descent contour ---------- */
  AIM.register('descent-contour', {
    mount: function (host, cfg) {
      var st = K.store('w:contour', { w: 0.2, b: 3.2, lr: 0.18, running: false });
      var cv = K.canvas(host, 2.1, draw);
      var lr = K.slider({ label: 'Learning rate', min: 0.01, max: 0.95, step: 0.01, value: st.get().lr, format: function (v) { return v.toFixed(2); }, onInput: function (v) { st.set({ w: st.get().w, b: st.get().b, lr: v, running: false }); draw(); } });
      var play = K.button('Run', function () { toggle(); });
      var step = K.button('Step', function () { stop(); stepOnce(); });
      var reset = K.button('Reset', function () { stop(); st.set({ w: 0.2, b: 3.2, lr: st.get().lr, running: false }); draw(); });
      var note = el('p', { class: 'lab-note' });
      var trail = [], timer = 0;

      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap' } }, lr.el, play, step, reset));
      host.appendChild(note);
      trail.push([st.get().w, st.get().b]);

      function f(w, b) { return Math.pow(w - 2, 2) + 4 * Math.pow(b - 1, 2); }
      function grad(w, b) { return [2 * (w - 2), 8 * (b - 1)]; }
      function stepOnce() {
        var p = st.get(), g = grad(p.w, p.b);
        var w = p.w - p.lr * g[0], b = p.b - p.lr * g[1];
        st.set({ w: w, b: b, lr: p.lr, running: false });
        trail.push([w, b]); if (trail.length > 60) trail.shift();
        draw();
      }
      function stop() { clearInterval(timer); timer = 0; play.textContent = 'Run'; play.classList.remove('on'); }
      function toggle() {
        if (timer) return stop();
        if (K.reduced()) {
          for (var i = 0; i < 80; i++) {
            var p = st.get();
            if (Math.abs(p.w - 2) < 0.01 && Math.abs(p.b - 1) < 0.01) break;
            stepOnce();
          }
          return;
        }
        play.textContent = 'Pause'; play.classList.add('on');
        timer = setInterval(function () {
          var p = st.get();
          if (Math.abs(p.w - 2) < 0.01 && Math.abs(p.b - 1) < 0.01) return stop();
          stepOnce();
        }, 420);
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 34, r: 16, t: 16, b: 28 };
        var xs = K.scale(-0.5, 4.5, pad.l, w - pad.r), ys = K.scale(-1.5, 4.5, h - pad.b, pad.t);
        axes(ctx, w, h, pad);
        for (var L = 0.2; L <= 8; L += 0.6) {
          ctx.strokeStyle = 'rgba(237,232,221,.12)'; ctx.lineWidth = 1;
          ctx.beginPath();
          for (var t = 0; t <= 64; t++) {
            var a = t / 64 * Math.PI * 2;
            var px = 2 + Math.sqrt(L) * Math.cos(a), py = 1 + Math.sqrt(L) / 2 * Math.sin(a);
            t === 0 ? ctx.moveTo(xs(px), ys(py)) : ctx.lineTo(xs(px), ys(py));
          }
          ctx.stroke();
        }
        ctx.strokeStyle = 'oklch(.7 .13 90 / .6)'; ctx.lineWidth = 1;
        ctx.beginPath();
        trail.forEach(function (p, i) { i === 0 ? ctx.moveTo(xs(p[0]), ys(p[1])) : ctx.lineTo(xs(p[0]), ys(p[1])); });
        ctx.stroke();
        var p = st.get();
        ctx.fillStyle = 'oklch(.72 .14 90)';
        ctx.beginPath(); ctx.arc(xs(p.w), ys(p.b), 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(145,141,132,.95)'; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('w', w - pad.r - 10, h - 8);
        ctx.fillText('b', 10, pad.t + 2);
        note.textContent = 'w ' + p.w.toFixed(2) + '   b ' + p.b.toFixed(2) + '   loss ' + f(p.w, p.b).toFixed(2) + (cfg.mode === 'rung3' ? '   target below 0.05' : '');
      }
    }
  });
})();
