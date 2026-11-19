/* Unit 6 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  var DATA = [
    { outlook: 'sun', temp: 'hot', humidity: 'high', wind: 'weak', play: 0 },
    { outlook: 'sun', temp: 'hot', humidity: 'high', wind: 'strong', play: 0 },
    { outlook: 'over', temp: 'hot', humidity: 'high', wind: 'weak', play: 1 },
    { outlook: 'rain', temp: 'mild', humidity: 'high', wind: 'weak', play: 1 },
    { outlook: 'rain', temp: 'cool', humidity: 'normal', wind: 'weak', play: 1 },
    { outlook: 'rain', temp: 'cool', humidity: 'normal', wind: 'strong', play: 0 },
    { outlook: 'over', temp: 'cool', humidity: 'normal', wind: 'strong', play: 1 },
    { outlook: 'sun', temp: 'mild', humidity: 'high', wind: 'weak', play: 0 },
    { outlook: 'sun', temp: 'cool', humidity: 'normal', wind: 'weak', play: 1 },
    { outlook: 'rain', temp: 'mild', humidity: 'normal', wind: 'weak', play: 1 },
    { outlook: 'sun', temp: 'mild', humidity: 'normal', wind: 'strong', play: 1 },
    { outlook: 'over', temp: 'mild', humidity: 'high', wind: 'strong', play: 1 },
    { outlook: 'over', temp: 'hot', humidity: 'normal', wind: 'weak', play: 1 },
    { outlook: 'rain', temp: 'mild', humidity: 'high', wind: 'strong', play: 0 }
  ];
  var FEATURES = ['outlook', 'temp', 'humidity', 'wind'];

  function entropy(rows) {
    if (!rows.length) return 0;
    var p = rows.filter(function (r) { return r.play === 1; }).length / rows.length;
    if (p === 0 || p === 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }
  function splitInfo(rows, f) {
    var vals = {};
    rows.forEach(function (r) { vals[r[f]] = (vals[r[f]] || 0) + 1; });
    return Object.keys(vals).reduce(function (a, k) {
      var p = vals[k] / rows.length;
      return a - p * Math.log2(p);
    }, 0);
  }
  function gain(rows, f) {
    var base = entropy(rows), vals = {};
    rows.forEach(function (r) { (vals[r[f]] = vals[r[f]] || []).push(r); });
    return base - Object.keys(vals).reduce(function (a, k) {
      return a + vals[k].length / rows.length * entropy(vals[k]);
    }, 0);
  }
  function gini(rows) {
    if (!rows.length) return 0;
    var p = rows.filter(function (r) { return r.play === 1; }).length / rows.length;
    return 1 - p * p - (1 - p) * (1 - p);
  }

  /* ---------- twenty questions ---------- */
  AIM.register('twenty-questions', {
    mount: function (host) {
      var items = [
        ['dog', 1, 1, 0, 1], ['cat', 1, 0, 0, 1], ['eagle', 0, 1, 1, 0], ['penguin', 0, 1, 1, 0],
        ['salmon', 0, 0, 1, 0], ['snake', 0, 0, 1, 0], ['bat', 1, 1, 1, 0], ['whale', 1, 0, 1, 0]
      ];
      var qs = [
        ['Does it have fur?', 1], ['Can it fly?', 2], ['Does it live in water?', 3], ['Is it a mammal?', 4]
      ];
      var pool = items.slice(), asked = [];
      var list = el('div', { class: 'lab-ui', style: { gap: '8px' } });
      var status = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      var btns = qs.map(function (q) {
        return K.button(q[0], function () {
          if (asked.indexOf(q[0]) >= 0) return;
          asked.push(q[0]);
          pool = pool.filter(function (it) { return it[q[1]] === 1; });
          render();
        }, { cls: 'btn-dark' });
      });
      btns.forEach(function (b) { list.appendChild(b); });
      host.appendChild(list); host.appendChild(status);
      var reset = K.button('Reset', function () { pool = items.slice(); asked = []; render(); });
      host.appendChild(reset);

      function render() {
        status.textContent = pool.length + ' candidates left: ' + (pool.length ? pool.map(function (p) { return p[0]; }).join(', ') : 'none');
        btns.forEach(function (b, i) { b.disabled = asked.indexOf(qs[i][0]) >= 0; });
        if (pool.length <= 1) reset.classList.add('on'); else reset.classList.remove('on');
      }
      render();
    }
  });

  /* ---------- id3 builder ---------- */
  AIM.register('id3-builder', {
    mount: function (host) {
      var chosen = [];
      var stage = el('div', { style: { display: 'grid', gap: '10px' } });
      var info = el('p', { class: 'lab-note', style: { 'min-height': '40px' } });
      var features = el('div', { class: 'lab-ui', style: { gap: '8px' } });
      host.appendChild(features); host.appendChild(stage); host.appendChild(info);

      var buttons = FEATURES.map(function (f) {
        return K.button(f, function () { if (chosen.indexOf(f) < 0) { chosen.push(f); render(); } }, { cls: 'btn-dark' });
      });
      buttons.forEach(function (b) { features.appendChild(b); });

      function render() {
        var rows = DATA.slice();
        stage.textContent = '';
        var base = entropy(rows);
        stage.appendChild(el('p', { class: 'lab-note', text: 'ROOT: ' + rows.length + ' cases, entropy ' + base.toFixed(3) + ' bits, Gini ' + gini(rows).toFixed(3) }));
        chosen.forEach(function (f) {
          var groups = {};
          rows.forEach(function (r) { (groups[r[f]] = groups[r[f]] || []).push(r); });
          var branch = el('div', { style: { display: 'flex', gap: '8px', 'flex-wrap': 'wrap' } });
          Object.keys(groups).forEach(function (k) {
            var g = groups[k];
            var pos = g.filter(function (r) { return r.play === 1; }).length;
            branch.appendChild(el('div', { style: { border: '1px solid rgba(237,232,221,.18)', padding: '8px 10px', 'min-width': '110px' } },
              el('div', { class: 'lab-note', text: f + ' = ' + k }),
              el('div', { style: { color: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12px' }, text: pos + ' yes / ' + (g.length - pos) + ' no' }),
              el('div', { class: 'lab-note', text: 'entropy ' + entropy(g).toFixed(2) })));
          });
          stage.appendChild(branch);
        });
        var best = null, bestGain = -1;
        FEATURES.forEach(function (f) { if (chosen.indexOf(f) < 0) { var g = gain(rows, f); if (g > bestGain) { bestGain = g; best = f; } } });
        info.textContent = chosen.length ? 'Split on ' + chosen.join(', then ') + '. Next best: ' + best + ' with gain ' + bestGain.toFixed(3) + '.' : 'Pick the feature with the highest information gain.';
      }
      render();
    }
  });

  /* ---------- gini / gain comparison ---------- */
  AIM.register('gini-gain', {
    mount: function (host) {
      var st = K.store('w:split-score', { score: 'gain' });
      var table = el('div', { style: { display: 'grid', gap: '1px', background: 'rgba(237,232,221,.14)' } });
      var seg = K.segmented({ label: 'Score', value: st.get().score, options: [{ v: 'gain', label: 'Gain' }, { v: 'ratio', label: 'Gain ratio' }, { v: 'gini', label: 'Gini' }], onChange: function (v) { st.set({ score: v }); seg.set(v); render(); } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      host.appendChild(seg.el); host.appendChild(table); host.appendChild(note);

      function render() {
        var rows = DATA.slice();
        var extra = [{ name: 'customer id', values: rows.map(function (r, i) { return 'id' + i; }) }];
        var results = FEATURES.map(function (f) { return { f: f, gain: gain(rows, f), split: splitInfo(rows, f), gini: gini(rows) }; });
        var scores = results.map(function (r) { return { f: r.f, v: st.get().score === 'gain' ? r.gain : st.get().score === 'ratio' ? r.gain / (r.split || 1) : r.gini }; });
        var idScore = st.get().score === 'gain' ? 1 : st.get().score === 'ratio' ? 1 / Math.log2(rows.length) : 0;
        scores.push({ f: 'customer id', v: idScore });
        scores.sort(function (a, b) { return b.v - a.v; });
        table.textContent = '';
        scores.forEach(function (s, i) {
          table.appendChild(el('div', { style: { background: '#151A21', padding: '10px 12px', display: 'flex', 'justify-content': 'space-between', gap: '12px' } },
            el('span', { style: { color: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12px' }, text: (i + 1) + '. ' + s.f }),
            el('span', { class: 'lab-note', text: s.v.toFixed(3) })));
        });
        note.textContent = (st.get().score === 'gain' ? 'Raw gain rewards the unique ID.' : st.get().score === 'ratio' ? 'The ratio penalises many branches, so the ID falls.' : 'Gini measures label mixing, not branch count.') + ' The winner is highlighted at the top.';
      }
      render();
    }
  });

  /* ---------- forest vote ---------- */
  AIM.register('forest-vote', {
    mount: function (host) {
      var st = K.store('w:forest', { trees: 9, seed: 2, show: false });
      var cv = K.canvas(host, 2.0, draw);
      var sl = K.slider({ label: 'Trees', min: 1, max: 21, step: 2, value: st.get().trees, format: function (v) { return String(v); }, onInput: function (v) { st.set({ trees: v, seed: st.get().seed, show: st.get().show }); build(); } });
      var show = K.button('Show trees', function () { st.set({ trees: st.get().trees, seed: st.get().seed, show: !st.get().show }); show.classList.toggle('on', st.get().show); draw(); });
      var again = K.button('Resample', function () { st.set({ trees: st.get().trees, seed: st.get().seed + 1, show: st.get().show }); build(); });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, sl.el, show, again));
      host.appendChild(note);

      var pts = [], trees = [];
      function make() {
        var rnd = K.seeded(31);
        pts = [];
        for (var i = 0; i < 40; i++) pts.push({ x: rnd() * 2 - 1, y: rnd() * 2 - 1, c: (rnd() > 0.5 ? 1 : 0) });
      }
      function stump(sample) {
        var best = null;
        for (var f = 0; f < 2; f++) {
          for (var t = -0.8; t <= 0.8; t += 0.2) {
            var left = sample.filter(function (p) { return (f === 0 ? p.x : p.y) <= t; });
            var right = sample.filter(function (p) { return (f === 0 ? p.x : p.y) > t; });
            if (!left.length || !right.length) continue;
            var lp = left.filter(function (p) { return p.c === 1; }).length / left.length > 0.5 ? 1 : 0;
            var rp = right.filter(function (p) { return p.c === 1; }).length / right.length > 0.5 ? 1 : 0;
            var err = left.filter(function (p) { return p.c !== lp; }).length + right.filter(function (p) { return p.c !== rp; }).length;
            if (!best || err < best.err) best = { f: f, t: t, l: lp, r: rp, err: err };
          }
        }
        return best;
      }
      function build() {
        make();
        var rnd = K.seeded(500 + st.get().seed);
        trees = [];
        for (var i = 0; i < st.get().trees; i++) {
          var sample = pts.map(function () { return pts[Math.floor(rnd() * pts.length)]; });
          trees.push(stump(sample));
        }
        draw();
      }
      function vote(x, y) {
        var v = 0;
        trees.forEach(function (t) {
          if (!t) return;
          v += ((t.f === 0 ? x : y) <= t.t ? t.l : t.r) ? 1 : -1;
        });
        return v >= 0 ? 1 : 0;
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 22, r: 14, t: 14, b: 22 };
        var xs = K.scale(-1.1, 1.1, pad.l, w - pad.r), ys = K.scale(-1.1, 1.1, h - pad.b, pad.t);
        var G = 32;
        for (var i = 0; i < G; i++) for (var j = 0; j < G; j++) {
          var px = -1 + i / (G - 1) * 2, py = -1 + j / (G - 1) * 2;
          ctx.fillStyle = vote(px, py) ? 'oklch(.55 .1 190 / .2)' : 'rgba(237,232,221,.04)';
          ctx.fillRect(xs(px), ys(py), (w - pad.l - pad.r) / G + 1, (h - pad.t - pad.b) / G + 1);
        }
        if (st.get().show) {
          trees.forEach(function (t, i) {
            if (!t) return;
            ctx.strokeStyle = 'rgba(237,232,221,' + (0.08 + (i % 3) * 0.05) + ')'; ctx.lineWidth = 1;
            ctx.beginPath();
            if (t.f === 0) { ctx.moveTo(xs(t.t), pad.t); ctx.lineTo(xs(t.t), h - pad.b); }
            else { ctx.moveTo(pad.l, ys(t.t)); ctx.lineTo(w - pad.r, ys(t.t)); }
            ctx.stroke();
          });
        }
        pts.forEach(function (p) {
          ctx.fillStyle = p.c ? '#EDE8DD' : 'rgba(145,141,132,.9)';
          ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), 3, 0, Math.PI * 2); ctx.fill();
        });
        note.textContent = st.get().trees + ' trees, each on a bootstrap sample. The vote smooths the jagged edges of a single tree.';
      }
      build();
    }
  });

  /* ---------- boosting focus ---------- */
  AIM.register('boost-focus', {
    mount: function (host) {
      var st = K.store('w:boost', { rounds: 5, seed: 6 });
      var cv = K.canvas(host, 2.0, draw);
      var sl = K.slider({ label: 'Rounds', min: 1, max: 8, step: 1, value: st.get().rounds, format: function (v) { return String(v); }, onInput: function (v) { st.set({ rounds: v, seed: st.get().seed }); build(); } });
      var again = K.button('Resample', function () { st.set({ rounds: st.get().rounds, seed: st.get().seed + 1 }); build(); });
      var note = el('p', { class: 'lab-note' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, sl.el, again));
      host.appendChild(note);

      var pts = [], models = [], weights = [];
      function build() {
        var rnd = K.seeded(90 + st.get().seed);
        pts = [];
        for (var i = 0; i < 44; i++) {
          var x = rnd() * 2 - 1, y = rnd() * 2 - 1;
          pts.push({ x: x, y: y, c: (x * x + y * y < 0.42 ? 1 : 0) ^ (rnd() < 0.08 ? 1 : 0) });
        }
        weights = pts.map(function () { return 1 / pts.length; });
        models = [];
        for (var r = 0; r < st.get().rounds; r++) {
          var best = null;
          for (var f = 0; f < 2; f++) {
            for (var t = -0.8; t <= 0.8; t += 0.2) {
              var lp = 0, lw = 0, rp = 0, rw = 0;
              pts.forEach(function (p, k) {
                var v = f === 0 ? p.x : p.y;
                if (v <= t) { lw += weights[k]; if (p.c === 1) lp += weights[k]; }
                else { rw += weights[k]; if (p.c === 1) rp += weights[k]; }
              });
              if (!lw || !rw) continue;
              var l = lp / lw > 0.5 ? 1 : 0, rr = rp / rw > 0.5 ? 1 : 0;
              var err = 0;
              pts.forEach(function (p, k) {
                var pred = ((f === 0 ? p.x : p.y) <= t ? l : rr);
                if (pred !== p.c) err += weights[k];
              });
              if (!best || err < best.err) best = { f: f, t: t, l: l, r: rr, err: err };
            }
          }
          if (!best) break;
          var alpha = 0.5 * Math.log((1 - Math.max(1e-4, best.err)) / Math.max(1e-4, best.err));
          best.alpha = Math.max(0.05, alpha);
          models.push(best);
          var z = 0;
          pts.forEach(function (p, k) {
            var pred = ((best.f === 0 ? p.x : p.y) <= best.t ? best.l : best.r);
            weights[k] = weights[k] * Math.exp(pred === p.c ? -best.alpha : best.alpha);
            z += weights[k];
          });
          weights = weights.map(function (v) { return v / z; });
        }
        draw();
      }
      function score(x, y) {
        var s = 0;
        models.forEach(function (m) {
          var pred = ((m.f === 0 ? x : y) <= m.t ? m.l : m.r) ? 1 : -1;
          s += m.alpha * pred;
        });
        return s >= 0 ? 1 : 0;
      }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h, pad = { l: 22, r: 14, t: 14, b: 22 };
        var xs = K.scale(-1.1, 1.1, pad.l, w - pad.r), ys = K.scale(-1.1, 1.1, h - pad.b, pad.t);
        var G = 30;
        for (var i = 0; i < G; i++) for (var j = 0; j < G; j++) {
          var px = -1 + i / (G - 1) * 2, py = -1 + j / (G - 1) * 2;
          ctx.fillStyle = score(px, py) ? 'oklch(.55 .1 190 / .18)' : 'rgba(237,232,221,.03)';
          ctx.fillRect(xs(px), ys(py), (w - pad.l - pad.r) / G + 1, (h - pad.t - pad.b) / G + 1);
        }
        var maxW = Math.max.apply(null, weights);
        pts.forEach(function (p, k) {
          var r = 2.2 + weights[k] / maxW * 5;
          ctx.fillStyle = p.c ? '#EDE8DD' : 'rgba(145,141,132,.9)';
          ctx.beginPath(); ctx.arc(xs(p.x), ys(p.y), r, 0, Math.PI * 2); ctx.fill();
        });
        note.textContent = st.get().rounds + ' rounds. Point size is the weight it carries after the last round. Hard cases grow.';
      }
      build();
    }
  });
})();
