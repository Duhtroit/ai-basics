/* Unit 11 widgets */
(function () {
  'use strict';
  var K = AIM.kit, el = K.el;

  /* ---------- tiny formula parser ---------- */
  function tokenize(src) {
    var out = [], re = /\s*(->|and|or|not|\(|\)|[A-Za-z][A-Za-z0-9]*)/g, m;
    while ((m = re.exec(src))) out.push(m[1]);
    return out;
  }
  function parse(src) {
    var toks = tokenize(src), i = 0;
    function peek() { return toks[i]; }
    function eat(t) { if (toks[i] === t) { i++; return true; } return false; }
    function atom() {
      if (eat('(')) { var e = implies(); if (!eat(')')) throw new Error('missing )'); return e; }
      if (eat('not')) return { op: 'not', a: atom() };
      var t = toks[i++];
      if (!t || !/^[A-Za-z]/.test(t)) throw new Error('expected a proposition');
      return { op: 'atom', name: t };
    }
    function and() {
      var a = atom();
      while (eat('and')) a = { op: 'and', a: a, b: atom() };
      return a;
    }
    function or() {
      var a = and();
      while (eat('or')) a = { op: 'or', a: a, b: and() };
      return a;
    }
    function implies() {
      var a = or();
      if (eat('->')) return { op: 'implies', a: a, b: implies() };
      return a;
    }
    var ast = implies();
    if (i < toks.length) throw new Error('unexpected ' + toks[i]);
    // map "implies" keyword too
    return ast;
  }
  function atoms(ast, acc) {
    acc = acc || [];
    if (ast.op === 'atom' && acc.indexOf(ast.name) < 0) acc.push(ast.name);
    if (ast.a) atoms(ast.a, acc);
    if (ast.b) atoms(ast.b, acc);
    return acc;
  }
  function evalAst(ast, env) {
    if (ast.op === 'atom') return !!env[ast.name];
    if (ast.op === 'not') return !evalAst(ast.a, env);
    if (ast.op === 'and') return evalAst(ast.a, env) && evalAst(ast.b, env);
    if (ast.op === 'or') return evalAst(ast.a, env) || evalAst(ast.b, env);
    return !evalAst(ast.a, env) || evalAst(ast.b, env);
  }
  function show(ast) {
    if (ast.op === 'atom') return ast.name;
    if (ast.op === 'not') return 'not ' + (ast.a.op === 'atom' ? ast.a.name : '(' + show(ast.a) + ')');
    var sym = ast.op === 'and' ? ' and ' : ast.op === 'or' ? ' or ' : ' -> ';
    return '(' + show(ast.a) + sym + show(ast.b) + ')';
  }

  /* ---------- truth table ---------- */
  AIM.register('truth-table', {
    mount: function (host) {
      var st = K.store('w:truth', { src: 'P and (Q or not R)' });
      var input = el('input', { class: 'lab-input', type: 'text', value: st.get().src, 'aria-label': 'Formula', spellcheck: 'false' });
      var apply = K.button('Evaluate', function () { st.set({ src: input.value }); draw(); });
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '40px' } });
      var presets = el('div', { class: 'lab-ui', style: { gap: '6px' } });
      ['P and Q', 'P -> Q', '(P or Q) and not P', 'P and (Q or not R)'].forEach(function (p) {
        presets.appendChild(K.button(p, function () { input.value = p; st.set({ src: p }); draw(); }, { cls: 'btn-dark' }));
      });
      host.appendChild(el('div', { class: 'lab-ui', style: { gap: '8px' } }, input, apply));
      host.appendChild(presets);
      host.appendChild(stage); host.appendChild(note);

      function draw() {
        K.clear(stage);
        var ast;
        try { ast = parse(st.get().src); } catch (e) {
          note.textContent = 'Not a well-formed formula: ' + e.message + '. The grammar needs a proposition, a connective, or brackets in the right places.';
          note.style.color = '#D9988C';
          return;
        }
        note.style.color = 'rgba(145,141,132,.95)';
        var vars = atoms(ast);
        var rows = Math.pow(2, vars.length);
        var table = el('table', { class: 'lab-table', style: { width: '100%', 'border-collapse': 'collapse', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12px' } });
        var head = el('tr');
        vars.forEach(function (v) { head.appendChild(el('th', { text: v, style: { padding: '6px 8px', 'text-align': 'left', color: '#EDE8DD', 'border-bottom': '1px solid rgba(237,232,221,.25)' } })); });
        head.appendChild(el('th', { text: show(ast), style: { padding: '6px 8px', 'text-align': 'left', color: '#EDE8DD', 'border-bottom': '1px solid rgba(237,232,221,.25)' } }));
        table.appendChild(head);
        var valid = true, sat = false;
        for (var r = 0; r < rows; r++) {
          var env = {};
          vars.forEach(function (v, i) { env[v] = !!(r & (1 << (vars.length - 1 - i))); });
          var val = evalAst(ast, env);
          if (!val) valid = false; else sat = true;
          var tr = el('tr', { style: { background: val ? 'rgba(120,180,140,.08)' : 'rgba(217,152,140,.1)' } });
          vars.forEach(function (v) { tr.appendChild(el('td', { text: env[v] ? 'T' : 'F', style: { padding: '5px 8px', color: 'rgba(237,232,221,.85)' } })); });
          tr.appendChild(el('td', { text: val ? 'T' : 'F', style: { padding: '5px 8px', color: val ? 'oklch(.8 .12 150)' : '#D9988C' } }));
          table.appendChild(tr);
        }
        stage.appendChild(table);
        note.textContent = vars.length + ' propositions, ' + rows + ' rows. ' + (valid ? 'Valid: true in every row.' : sat ? 'Satisfiable but not valid: at least one row is false.' : 'Unsatisfiable: false in every row.') + ' The formula is ' + show(ast) + '.';
      }
      draw();
    }
  });

  /* ---------- resolution ---------- */
  AIM.register('resolution', {
    mount: function (host) {
      var base = [['Rain', 'Snow'], ['-Rain', 'Wet'], ['-Snow', 'Slippery'], ['-Wet', 'Cancelled']];
      var clauses = base.map(function (c) { return c.slice(); });
      var selected = [], derived = [], note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      var stage = el('div', { style: { display: 'grid', gap: '6px' } });
      var reset = K.button('Reset', function () { clauses = base.map(function (c) { return c.slice(); }); selected = []; derived = []; draw(); }, { cls: 'btn-dark' });
      host.appendChild(stage);
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px' } }, K.button('Add negated query', function () { if (!clauses.some(function (c) { return c.length === 1 && c[0] === '-Cancelled'; })) clauses.push(['-Cancelled']); draw(); }), reset));
      host.appendChild(note);

      function lit(c) { return c.charAt(0) === '-' ? c.slice(1) : c; }
      function resolve(a, b) {
        for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) {
          if (lit(a[i]) === lit(b[j]) && a[i] !== b[j]) {
            var out = a.filter(function (_, k) { return k !== i; }).concat(b.filter(function (_, k) { return k !== j; }));
            var seen = {};
            out = out.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; });
            return out;
          }
        }
        return null;
      }
      function draw() {
        stage.textContent = '';
        clauses.forEach(function (c, i) {
          var b = el('button', { type: 'button', class: 'lab-clause' + (selected.indexOf(i) >= 0 ? ' sel' : ''), style: { display: 'block', width: '100%', 'text-align': 'left', padding: '9px 12px', background: selected.indexOf(i) >= 0 ? 'oklch(.55 .1 345 / .35)' : '#151A21', border: '1px solid ' + (selected.indexOf(i) >= 0 ? 'oklch(.7 .12 345)' : 'rgba(237,232,221,.16)'), color: '#EDE8DD', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12px', cursor: 'pointer', 'min-height': '44px' } },
            el('span', { text: c.length ? c.join(' or ') : 'empty clause' }));
          b.addEventListener('click', function () {
            var at = selected.indexOf(i);
            if (at >= 0) selected.splice(at, 1); else selected.push(i);
            if (selected.length === 2) {
              var out = resolve(clauses[selected[0]], clauses[selected[1]]);
              if (out) {
                derived.push(out); clauses.push(out);
                selected = [];
                if (!out.length) note.textContent = 'Empty clause derived. The negated query is inconsistent with the knowledge base, so the query is entailed.';
              } else {
                note.textContent = 'No complementary pair between those two clauses. Pick clauses that contain a literal and its negation.';
              }
            }
            draw();
          });
          stage.appendChild(b);
        });
        note.textContent = note.textContent || 'Pick two clauses. Resolution cancels one complementary pair and keeps the rest.';
        if (!clauses.some(function (c) { return !c.length; })) note.textContent = 'Pick two clauses with opposite literals. Add the negated query to aim at the empty clause.';
      }
      draw();
    }
  });

  /* ---------- chaining ---------- */
  AIM.register('chaining', {
    mount: function (host) {
      var st = K.store('w:chaining', { dir: 'forward', extra: false });
      var rules = [
        { if: ['Sunday'], then: 'Burger' },
        { if: ['Burger'], then: 'Happy' },
        { if: ['Rain'], then: 'Wet' },
        { if: ['Wet', 'Cold'], then: 'Slippery' }
      ];
      var stage = el('div', {});
      var log = el('ol', { class: 'lab-log', style: { 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12px', color: 'rgba(237,232,221,.85)', 'padding-left': '18px', 'min-height': '60px' } });
      var note = el('p', { class: 'lab-note' });
      var seg = K.segmented({ label: 'Direction', value: st.get().dir, options: [{ v: 'forward', label: 'Forward' }, { v: 'backward', label: 'Backward' }], onChange: function (v) { st.set({ dir: v, extra: st.get().extra }); seg.set(v); run(); } });
      var extra = K.button('Irrelevant fact', function () { st.set({ dir: st.get().dir, extra: !st.get().extra }); extra.classList.toggle('on', st.get().extra); run(); });
      var runB = K.button('Run', function () { run(); }, { cls: 'btn-dark' });
      host.appendChild(el('div', { style: { display: 'flex', gap: '8px', 'flex-wrap': 'wrap', 'align-items': 'flex-end' } }, seg.el, extra, runB));
      host.appendChild(stage); host.appendChild(log); host.appendChild(note);

      function run() {
        var facts = ['Sunday'];
        if (st.get().extra) facts.push('Grass is green');
        K.clear(stage).appendChild(el('div', { class: 'lab-note', text: 'FACTS: ' + facts.join(', ') }));
        K.clear(log);
        if (st.get().dir === 'forward') {
          var changed = true, steps = 0;
          while (changed) {
            changed = false;
            rules.forEach(function (r) {
              if (r.if.every(function (f) { return facts.indexOf(f) >= 0; }) && facts.indexOf(r.then) < 0) {
                facts.push(r.then); changed = true; steps++;
                log.appendChild(el('li', { text: 'fire ' + r.if.join(' and ') + ' -> ' + r.then }));
              }
            });
          }
          note.textContent = 'Forward chaining fired ' + steps + ' rules and derived ' + facts.slice(1).join(', ') + (st.get().extra ? '. It also read the irrelevant fact, because it processes everything.' : '. It derives every consequence, asked for or not.');
        } else {
          var stepsB = 0;
          function prove(goal, depth) {
            if (facts.indexOf(goal) >= 0) { log.appendChild(el('li', { text: '  '.repeat(depth) + goal + ' is a fact' })); return true; }
            var r = rules.filter(function (x) { return x.then === goal; })[0];
            if (!r) { log.appendChild(el('li', { text: '  '.repeat(depth) + goal + ': no rule' })); return false; }
            log.appendChild(el('li', { text: '  '.repeat(depth) + 'prove ' + goal + ' via ' + r.if.join(' and ') }));
            stepsB++;
            return r.if.every(function (f) { return prove(f, depth + 1); });
          }
          var ok = prove('Happy', 0);
          note.textContent = 'Backward chaining visited ' + stepsB + ' rules to prove Happy. ' + (st.get().extra ? 'It never touched the irrelevant fact.' : 'It only asked about the subgoals of the query.') + (ok ? '' : ' The query is not entailed.');
        }
      }
      run();
    }
  });

  /* ---------- knowledge base ---------- */
  AIM.register('kb-sunday', {
    mount: function (host, cfg) {
      var st = K.store('w:kb', { burger: true, sunday: true, negBurger: false });
      var facts = el('div', { style: { display: 'flex', gap: '6px', 'flex-wrap': 'wrap' } });
      var stage = el('div', {});
      var note = el('p', { class: 'lab-note', style: { 'min-height': '44px' } });
      var b1 = K.button('Sunday', function () { st.set({ burger: st.get().burger, sunday: !st.get().sunday, negBurger: st.get().negBurger }); draw(); }, { cls: 'btn-dark' });
      var b2 = K.button('Sunday -> Burger', function () { st.set({ burger: !st.get().burger, sunday: st.get().sunday, negBurger: st.get().negBurger }); draw(); }, { cls: 'btn-dark' });
      var b3 = K.button('not Burger', function () { st.set({ burger: st.get().burger, sunday: st.get().sunday, negBurger: !st.get().negBurger }); draw(); }, { cls: 'btn-dark' });
      host.appendChild(el('div', { class: 'lab-ui', style: { gap: '6px' } }, b1, b2, b3));
      host.appendChild(facts); host.appendChild(stage); host.appendChild(note);

      function draw() {
        var s = st.get();
        b1.classList.toggle('on', s.sunday); b2.classList.toggle('on', s.burger); b3.classList.toggle('on', s.negBurger);
        b1.textContent = s.sunday ? 'Sunday (fact)' : 'Remove Sunday';
        b2.textContent = s.burger ? 'Remove Sunday -> Burger' : 'Add Sunday -> Burger';
        b3.textContent = s.negBurger ? 'Remove not Burger' : 'Add not Burger';
        var kb = [];
        if (s.sunday) kb.push('Sunday');
        if (s.burger) kb.push('Sunday -> Burger');
        if (s.negBurger) kb.push('not Burger');
        K.clear(facts).appendChild(el('div', { class: 'lab-note', text: 'KB: ' + (kb.length ? kb.join('   ') : 'empty') }));
        K.clear(stage);
        var entailed = s.sunday && s.burger;
        var inconsistent = entailed && s.negBurger;
        var chain = el('div', { style: { display: 'flex', gap: '8px', 'align-items': 'center', 'flex-wrap': 'wrap', 'font-family': 'IBM Plex Mono, monospace', 'font-size': '12px', color: '#EDE8DD' } });
        ['Sunday', 'Sunday -> Burger', 'Burger'].forEach(function (t, i) {
          if (i === 2 && !entailed) return;
          if (i === 1 && !s.burger) return;
          if (i === 0 && !s.sunday) return;
          chain.appendChild(el('span', { style: { padding: '6px 10px', border: '1px solid rgba(237,232,221,.2)', opacity: i === 2 ? '0.75' : '1' }, text: t }));
          chain.appendChild(el('span', { class: 'lab-note', text: i < 2 ? 'then' : '' }));
        });
        if (kb.length) stage.appendChild(chain);
        if (inconsistent) {
          stage.appendChild(el('p', { class: 'lab-note', style: { color: '#D9988C' }, text: 'The KB now contains Burger and not Burger. No model satisfies it, so every sentence is entailed, including false ones.' }));
          note.textContent = 'Inconsistent. Entailment becomes vacuous, which makes the system useless for decisions.';
          note.style.color = '#D9988C';
        } else if (entailed) {
          note.textContent = 'Burger is entailed. Every model of the knowledge base makes it true, and the derivation is the chain shown above.';
          note.style.color = 'rgba(145,141,132,.95)';
        } else {
          note.textContent = s.sunday ? 'Sunday is known but no rule reaches Burger. Nothing follows. Add the rule.' : 'Add Sunday and the rule, then query Burger.';
          note.style.color = 'rgba(145,141,132,.95)';
        }
        if (cfg.mode === 'rung3') note.textContent += ' Entailment is truth in every model, not membership in the KB.';
      }
      draw();
    }
  });
})();
