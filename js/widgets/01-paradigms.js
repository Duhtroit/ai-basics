/* Unit 1 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  /* ---------- spectrum ---------- */
  AIM.register('spectrum', {
    mount: function (host, cfg) {
      var st = K.store('w:spectrum', { p: 0 });
      var names = ['Reflex', 'State', 'Variable', 'Logic'];
      var questions = ['What is this?', 'What do I do next?', 'Does the plan fit?', 'What is true?'];
      var answers = ['A label', 'A path', 'An assignment', 'A proof'];
      var p = st.get().p || 0;

      var ctl = K.slider({
        label: 'Stop on the spectrum', min: 0, max: 3, step: 0.01, value: p, wide: true,
        format: function (v) { return names[Math.round(v)]; },
        onInput: function (v) { p = v; st.set({ p: v }); draw(); }
      });
      var note = el('p', { class: 'lab-note' });

      var cv = K.canvas(host, 2.5, draw);
      host.appendChild(ctl.el);
      host.appendChild(note);
      K.onKey(cv.cv, { ArrowLeft: function () { p = Math.max(0, Math.round(p) - 1); sync(); }, ArrowRight: function () { p = Math.min(3, Math.round(p) + 1); sync(); } });

      function sync() { ctl.set(p); st.set({ p: p }); draw(); }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h;
        var pad = Math.max(26, w * 0.06), y = h * 0.58;
        var xAt = function (i) { return pad + i * (w - pad * 2) / 3; };

        ctx.strokeStyle = 'rgba(237,232,221,.26)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();

        for (var i = 0; i < 4; i++) {
          var x = xAt(i);
          ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6);
          ctx.strokeStyle = i === Math.round(p) ? 'oklch(.72 .13 ' + (35 + i * 70) + ')' : 'rgba(237,232,221,.3)';
          ctx.stroke();
          ctx.fillStyle = i === Math.round(p) ? '#EDE8DD' : 'rgba(145,141,132,.9)';
          ctx.font = '11px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(names[i].toUpperCase(), x, y + 24);
        }

        var mx = pad + (p / 3) * (w - pad * 2);
        ctx.fillStyle = 'oklch(.72 .14 ' + (35 + p * 70) + ')';
        ctx.beginPath(); ctx.arc(mx, y, 6, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#EDE8DD';
        ctx.font = '600 ' + Math.min(26, Math.max(16, w * 0.033)) + 'px Fraunces, Georgia, serif';
        ctx.textAlign = 'center';
        var q = questions[Math.round(p)];
        ctx.fillText(q, w / 2, h * 0.24);
        ctx.fillStyle = 'rgba(145,141,132,.95)';
        ctx.font = '12px "IBM Plex Mono", monospace';
        ctx.fillText('OUTPUT: ' + answers[Math.round(p)].toUpperCase(), w / 2, h * 0.34);

        if (cfg.mode === 'rung2') {
          var lx = xAt(0), ly = y - 34;
          ctx.strokeStyle = 'rgba(237,232,221,.45)';
          ctx.beginPath(); ctx.moveTo(lx, ly + 8); ctx.lineTo(lx, y - 10); ctx.stroke();
          ctx.fillStyle = '#EDE8DD';
          ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
          ctx.font = '10px "IBM Plex Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(237,232,221,.8)';
          ctx.fillText('LANGUAGE MODEL (STRUCTURE)', lx + 10, ly + 3);
        }
      }
    }
  });

  /* ---------- question sorter ---------- */
  AIM.register('q-sorter', {
    mount: function (host) {
      var items = [
        ['Is this email spam?', 'Reflex', 'One message in, one label out.'],
        ['Which route reaches the depot with the least fuel?', 'State', 'A sequence of moves with a goal.'],
        ['Can these 12 exams fit into 4 rooms without clashes?', 'Variable', 'A complete assignment under constraints.'],
        ['Does this payment violate the sanctions rules?', 'Logic', 'A conclusion derived from facts and rules.'],
        ['What digit is in this image?', 'Reflex', 'Pattern in, label out.'],
        ['Which moves solve this sliding puzzle?', 'State', 'A path of actions to a goal.'],
        ['Assign 30 nurses to shifts with rest rules.', 'Variable', 'Values for all nurses that satisfy constraints.'],
        ['Prove that this contract clause is entailed.', 'Logic', 'A derivation from stated sentences.']
      ];
      var order = K.seeded(7)().toString();
      var i = 0, right = 0, locked = false;
      var score = el('span', { class: 'lab-note' });
      var q = el('p', { style: { 'font-family': 'Fraunces, Georgia, serif', 'font-size': '20px', 'line-height': '1.4', color: '#EDE8DD', 'min-height': '56px' } });
      var opts = el('div', { class: 'lab-ui', style: { gap: '8px' } });
      var fb = el('p', { class: 'lab-note', style: { 'min-height': '34px' } });
      var next = K.button('Next', function () { i = (i + 1) % items.length; if (i === 0) { right = 0; } render(); }, { cls: 'btn-dark' });
      next.style.display = 'none';

      ['Reflex', 'State', 'Variable', 'Logic'].forEach(function (name) {
        opts.appendChild(K.button(name, function () { answer(name); }, { cls: 'btn-dark' }));
      });

      host.appendChild(el('div', { class: 'lab-ui', style: { 'justify-content': 'space-between' } }, score, next));
      host.appendChild(q);
      host.appendChild(opts);
      host.appendChild(fb);
      render();

      function render() {
        locked = false;
        q.textContent = items[i][0];
        score.textContent = 'CASE ' + (i + 1) + ' OF ' + items.length + '  ·  ' + right + ' CORRECT';
        fb.textContent = 'Which family answers this question?';
        fb.style.color = 'rgba(145,141,132,.95)';
        next.style.display = 'none';
        host.querySelectorAll('.seg, .lab-ui .btn-dark').forEach(function (b) { b.disabled = false; });
      }
      function answer(name) {
        if (locked) return;
        locked = true;
        var ok = name === items[i][1];
        if (ok) right++;
        fb.textContent = (ok ? 'Correct. ' : 'Not this one. ') + items[i][1] + '. ' + items[i][2];
        fb.style.color = ok ? '#9CCFAC' : '#D9988C';
        score.textContent = 'CASE ' + (i + 1) + ' OF ' + items.length + '  ·  ' + right + ' CORRECT';
        next.style.display = '';
        K.announce(ok ? 'Correct' : 'Incorrect');
      }
    }
  });

  /* ---------- llm debate ---------- */
  AIM.register('llm-debate', {
    mount: function (host) {
      var wrap = el('div', { style: { display: 'grid', gap: '12px' } });
      var claim = el('p', { style: { 'font-family': 'Fraunces, Georgia, serif', 'font-size': '19px', color: '#EDE8DD', 'line-height': '1.5' }, text: 'A language model plans a four-day trip, checks opening hours and keeps the budget. Where does it belong on the spectrum?' });
      var opts = el('div', { class: 'lab-ui', style: { gap: '8px' } });
      var result = el('div', { style: { display: 'none', gap: '16px', 'grid-template-columns': '1fr 1fr' } });
      var sideA = el('div', { style: { border: '1px solid rgba(237,232,221,.16)', padding: '14px' } });
      var sideB = el('div', { style: { border: '1px solid oklch(.6 .13 35)', padding: '14px' } });
      sideA.appendChild(el('p', { class: 'lab-note', text: 'STRUCTURE' }));
      sideA.appendChild(el('p', { style: { color: '#EDE8DD', 'font-size': '13.5px', 'line-height': '1.55' }, text: 'A fixed computation maps the context to the next token. No memory of the plan and no search over alternatives.' }));
      sideB.appendChild(el('p', { class: 'lab-note', text: 'BEHAVIOUR' }));
      sideB.appendChild(el('p', { style: { color: '#EDE8DD', 'font-size': '13.5px', 'line-height': '1.55' }, text: 'At scale, the output looks like planning, assignment and inference. The task shapes what the model appears to do.' }));

      var a = K.button('Structurally reflex', function () { show(false); }, { cls: 'btn-dark' });
      var b = K.button('A new paradigm', function () { show(true); }, { cls: 'btn-dark' });
      opts.appendChild(a); opts.appendChild(b);
      result.appendChild(sideA); result.appendChild(sideB);
      wrap.appendChild(claim); wrap.appendChild(opts); wrap.appendChild(result);
      host.appendChild(wrap);

      function show(behaviour) {
        a.disabled = b.disabled = true;
        result.style.display = 'grid';
        result.appendChild(el('p', { class: 'lab-note', style: { 'grid-column': '1 / -1', color: '#EDE8DD' }, text: behaviour ? 'Both readings are true. The course keeps the structural label and treats the behaviour as emergent.' : 'Both readings are true. The mechanism is reflex; the behaviour resembles the other families.' }));
        K.announce('Vote recorded');
      }
    }
  });

  /* ---------- function lab ---------- */
  AIM.register('func-lab', {
    mount: function (host, cfg) {
      var thermal = cfg.mode === 'rung1';
      var st = K.store('w:func-lab:' + (thermal ? 't' : 'l'), thermal ? { t: 21 } : { w: 1, b: 0 });
      var cv = K.canvas(host, 2.1, draw);
      var field;
      if (thermal) {
        field = K.slider({ label: 'Room temperature', min: 12, max: 30, step: 0.5, value: st.get().t, format: function (v) { return v + ' C'; }, onInput: function (v) { st.set({ t: v }); draw(); } });
      } else {
        var wS = K.slider({ label: 'Slope w', min: -3, max: 3, step: 0.1, value: st.get().w, format: function (v) { return v.toFixed(1); }, onInput: function (v) { st.set({ w: v, b: st.get().b }); draw(); } });
        var bS = K.slider({ label: 'Offset b', min: -3, max: 3, step: 0.1, value: st.get().b, format: function (v) { return v.toFixed(1); }, onInput: function (v) { st.set({ w: st.get().w, b: v }); draw(); } });
        field = el('div', { style: { display: 'flex', gap: '16px', width: '100%' } }, wS.el, bS.el);
      }
      var read = el('p', { class: 'lab-note' });
      host.appendChild(field.el || field); host.appendChild(read);

      var pts = [];
      var rnd = K.seeded(42);
      for (var i = 0; i < 28; i++) {
        var x = -2.4 + rnd() * 4.8;
        var upper = x + 1.2 + (rnd() - 0.5) * 0.9;
        pts.push({ x: x, y: upper, c: 1 });
        pts.push({ x: x, y: x - 1.2 + (rnd() - 0.5) * 0.9, c: 0 });
      }

      function draw() {
        var s = cv.size(); if (!s.w) return;
        var ctx = cv.ctx, w = s.w, h = s.h;
        var pad = { l: 30, r: 16, t: 16, b: 26 };
        var xs = K.scale(-3, 3, pad.l, w - pad.r), ys = K.scale(-3, 3, h - pad.b, pad.t);
        ctx.strokeStyle = 'rgba(237,232,221,.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.moveTo(w / 2, pad.t); ctx.lineTo(w / 2, h - pad.b); ctx.stroke();

        if (thermal) {
          var t = st.get().t;
          ctx.fillStyle = 'rgba(237,232,221,.9)';
          ctx.font = '12px "IBM Plex Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SET POINT 21 C', w / 2, 18);
          ctx.fillStyle = t < 21 ? 'oklch(.7 .13 35)' : 'rgba(145,141,132,.8)';
          ctx.fillRect(w * 0.18, h * 0.42, w * 0.64, 10);
          var x = K.scale(12, 30, w * 0.18, w * 0.82)(t);
          ctx.fillStyle = '#EDE8DD';
          ctx.beginPath(); ctx.arc(x, h * 0.47, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(145,141,132,.95)';
          ctx.font = '11px "IBM Plex Mono", monospace';
          ctx.fillText('12', w * 0.18, h * 0.6); ctx.fillText('30', w * 0.82, h * 0.6);
          read.textContent = t < 21 ? 'Heater ON. Input below the set point, output 1.' : 'Heater OFF. Input at or above the set point, output 0.';
          return;
        }

        var p = st.get();
        ctx.strokeStyle = 'oklch(.72 .13 120)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xs(-3), ys(p.w * -3 + p.b)); ctx.lineTo(xs(3), ys(p.w * 3 + p.b)); ctx.stroke();
        var correct = 0;
        pts.forEach(function (pt) {
          var pred = p.w * pt.x + p.b > 0 ? 1 : 0;
          if (pred === pt.c) correct++;
          ctx.fillStyle = pt.c === 1 ? '#EDE8DD' : 'rgba(145,141,132,.85)';
          ctx.beginPath(); ctx.arc(xs(pt.x), ys(pt.y), 3.2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = 'rgba(237,232,221,.7)';
        ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('y = ' + p.w.toFixed(1) + 'x + ' + p.b.toFixed(1), pad.l + 4, pad.t + 4);
        read.textContent = 'Accuracy ' + Math.round(correct / pts.length * 100) + '%. A straight line can only separate what its slope allows.';
      }
    }
  });

  /* ---------- maze step ---------- */
  AIM.register('maze-step', {
    mount: function (host, cfg) {
      var st = K.store('w:maze', { x: 0, y: 0, trail: [[0, 0]], costs: false });
      var N = 6, walls = { '1,1': 1, '1,2': 1, '2,4': 1, '3,1': 1, '3,2': 1, '3,3': 1, '4,4': 1 };
      var goal = [5, 5];
      var cv = K.canvas(host, 1.5, draw);
      var note = el('p', { class: 'lab-note', style: { 'min-height': '38px' } });
      var pad = el('div', { class: 'lab-ui', style: { gap: '6px', 'justify-content': 'center' } });
      var costBtn = null;

      function move(dx, dy) {
        var s = st.get();
        var nx = s.x + dx, ny = s.y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || walls[nx + ',' + ny]) return;
        var trail = s.trail.concat([[nx, ny]]);
        st.set({ x: nx, y: ny, trail: trail, costs: s.costs });
        draw();
      }
      var dirs = [['Up', 0, -1], ['Left', -1, 0], ['Down', 0, 1], ['Right', 1, 0]];
      dirs.forEach(function (d) {
        pad.appendChild(K.button(d[0], function () { move(d[1], d[2]); }, { cls: 'btn-dark' }));
      });
      var reset = K.button('Reset', function () { st.set({ x: 0, y: 0, trail: [[0, 0]], costs: st.get().costs }); draw(); }, { cls: 'btn-dark' });
      pad.appendChild(reset);
      if (cfg.mode !== 'rung1') {
        costBtn = K.button('Edge costs', function () { st.set({ x: st.get().x, y: st.get().y, trail: st.get().trail, costs: !st.get().costs }); costBtn.classList.toggle('on', st.get().costs); draw(); });
        pad.appendChild(costBtn);
      }
      host.appendChild(pad); host.appendChild(note);
      K.onKey(cv.cv, {
        ArrowUp: function () { move(0, -1); }, ArrowDown: function () { move(0, 1); },
        ArrowLeft: function () { move(-1, 0); }, ArrowRight: function () { move(1, 0); }
      });

      function costOf(c) { return 1 + (c[0] + c[1]) % 3; }
      function draw() {
        var s = cv.size(); if (!s.w) return;
        var stt = st.get();
        var ctx = cv.ctx, w = s.w, h = s.h, cell = Math.min(w, h) / N, ox = (w - cell * N) / 2, oy = (h - cell * N) / 2;
        ctx.clearRect(0, 0, w, h);
        for (var x = 0; x < N; x++) for (var y = 0; y < N; y++) {
          var k = x + ',' + y;
          ctx.fillStyle = walls[k] ? 'rgba(0,0,0,.5)' : 'rgba(237,232,221,.06)';
          ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
          if (stt.costs && !walls[k]) {
            ctx.fillStyle = 'rgba(145,141,132,.9)'; ctx.font = '9px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
            ctx.fillText(String(costOf([x, y])), ox + (x + .5) * cell, oy + (y + .5) * cell + 3);
          }
        }
        ctx.strokeStyle = 'oklch(.7 .13 35)'; ctx.lineWidth = 2;
        ctx.beginPath();
        stt.trail.forEach(function (p, i) {
          var px = ox + (p[0] + .5) * cell, py = oy + (p[1] + .5) * cell;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.fillStyle = 'oklch(.75 .12 120)';
        ctx.beginPath(); ctx.arc(ox + (goal[0] + .5) * cell, oy + (goal[1] + .5) * cell, cell * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#EDE8DD';
        ctx.beginPath(); ctx.arc(ox + (stt.x + .5) * cell, oy + (stt.y + .5) * cell, cell * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0E1116'; ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('R', ox + (stt.x + .5) * cell, oy + (stt.y + .5) * cell + 4);
        var steps = stt.trail.length - 1;
        var total = stt.trail.slice(1).reduce(function (a, p) { return a + costOf(p); }, 0);
        if (stt.x === goal[0] && stt.y === goal[1]) {
          note.textContent = 'Goal reached in ' + steps + ' moves' + (stt.costs ? ', total cost ' + total : '') + '. The trail is one path through the state graph.';
          note.style.color = 'oklch(.8 .12 150)';
        } else {
          note.textContent = 'Position (' + stt.x + ', ' + stt.y + '), ' + steps + ' moves' + (stt.costs ? ', cost ' + total : '') + '. Arrow keys also move the counter.';
          note.style.color = 'rgba(145,141,132,.95)';
        }
      }
      draw();
    }
  });

  /* ---------- python trace ---------- */
  AIM.register('py-trace', {
    mount: function (host) {
      var code = ['total = 0', 'for i in range(4):', '    total = total + i', 'print(total)'];
      var steps = [
        { line: 0, vars: { total: 0 }, note: 'The variable total starts at zero.' },
        { line: 1, vars: { total: 0, i: 0 }, note: 'The loop starts. i takes the first value.' },
        { line: 2, vars: { total: 0, i: 0 }, note: 'total becomes 0 + 0.' },
        { line: 2, vars: { total: 0, i: 1 }, note: 'Next iteration. i is 1.' },
        { line: 2, vars: { total: 1, i: 1 }, note: 'total becomes 1 + 1.' },
        { line: 2, vars: { total: 2, i: 2 }, note: 'i is 2. Add it.' },
        { line: 2, vars: { total: 5, i: 2 }, note: 'total is now 5.' },
        { line: 2, vars: { total: 5, i: 3 }, note: 'Last iteration. i is 3.' },
        { line: 2, vars: { total: 8, i: 3 }, note: 'total becomes 8.' },
        { line: 3, vars: { total: 8, i: 3 }, note: 'The loop ends and the result prints.' }
      ];
      var index = 0;
      var pre = el('pre', { style: { margin: '0', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '13px', 'line-height': '1.85', background: '#0A0D11', border: '1px solid rgba(237,232,221,.14)', padding: '14px', overflow: 'auto' } });
      var varsBox = el('div', { class: 'lab-ui', style: { gap: '8px', 'min-height': '40px' } });
      var note = el('p', { class: 'lab-note', style: { 'min-height': '32px' } });
      var tr = K.transport({ length: steps.length, label: 'Trace', interval: 900, onFrame: function (i) { index = i; paint(); } });
      host.appendChild(pre); host.appendChild(tr.el); host.appendChild(varsBox); host.appendChild(note);

      function paint() {
        var st = steps[index];
        pre.textContent = '';
        code.forEach(function (line, i) {
          var span = el('span', { style: { display: 'block', padding: '0 6px', background: i === st.line ? 'rgba(237,232,221,.1)' : 'transparent', color: i === st.line ? '#EDE8DD' : 'rgba(145,141,132,.9)' } });
          span.textContent = String(i + 1).padStart(2, ' ') + '  ' + line;
          pre.appendChild(span);
        });
        varsBox.textContent = '';
        Object.keys(st.vars).forEach(function (k) {
          varsBox.appendChild(el('span', { style: { border: '1px solid rgba(237,232,221,.18)', padding: '5px 9px', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '11px', color: '#EDE8DD' }, text: k + ' = ' + st.vars[k] }));
        });
        note.textContent = st.note;
      }
      paint();
    }
  });
})();
