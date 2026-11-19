/* AI Basics, shared interaction toolkit. No dependencies. */
window.AIM = window.AIM || {};
(function (A) {
  'use strict';

  A.units = [];
  A.widgets = {};
  A.glossary = {};
  A.manifest = [];

  A.registerUnit = function (u) { A.units.push(u); };
  A.register = function (id, def) { A.widgets[id] = def; };
  A.defineTerms = function (terms) { Object.assign(A.glossary, terms); };
  A.registerManifest = function (list) { A.manifest = list; };

  var NS = 'http://www.w3.org/2000/svg';

  function append(node, kids) {
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      if (Array.isArray(k)) return append(node, k);
      node.appendChild(k.nodeType ? k : document.createTextNode(String(k)));
    });
  }

  function el(tag, attrs) {
    var n = document.createElement(tag);
    apply(n, attrs);
    append(n, Array.prototype.slice.call(arguments, 2));
    return n;
  }

  function svg(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    apply(n, attrs, true);
    append(n, Array.prototype.slice.call(arguments, 2));
    return n;
  }

  function apply(n, attrs, isSvg) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class' || k === 'className') { n.setAttribute('class', v); return; }
      if (k === 'text') { n.textContent = v; return; }
      if (k === 'html') { n.innerHTML = v; return; }
      if (k === 'dataset') { Object.keys(v).forEach(function (d) { n.dataset[d] = v[d]; }); return; }
      if (k === 'style' && typeof v === 'object') { Object.keys(v).forEach(function (s) { n.style[s] = v[s]; }); return; }
      if (k.slice(0, 2) === 'on' && typeof v === 'function') { n.addEventListener(k.slice(2).toLowerCase(), v); return; }
      n.setAttribute(k, v === true ? '' : v);
    });
  }

  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function fmt(n, d) {
    if (!isFinite(n)) return '--';
    var s = Number(n).toFixed(d == null ? 2 : d);
    return s.replace(/\.?0+$/, '') || '0';
  }
  function pct(n) { return Math.round(n * 100) + '%'; }

  function scale(d0, d1, r0, r1) {
    var span = d1 - d0 || 1;
    return function (v) { return r0 + ((v - d0) / span) * (r1 - r0); };
  }

  function seeded(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function tween(ms, step) {
    if (reduced()) { step(1); return function () {}; }
    var start = performance.now(), raf = 0, done = false;
    function frame(t) {
      if (done) return;
      var p = clamp((t - start) / ms, 0, 1);
      step(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function () { done = true; cancelAnimationFrame(raf); };
  }

  function store(key, fallback) {
    var data = fallback;
    try {
      var raw = localStorage.getItem(key);
      if (raw) data = JSON.parse(raw);
    } catch (e) { /* storage may be unavailable */ }
    return {
      get: function () { return data; },
      set: function (next) {
        data = next;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
        return data;
      }
    };
  }

  function announce(msg) {
    var live = document.getElementById('aim-live');
    if (!live) {
      live = el('div', { id: 'aim-live', class: 'sr', 'aria-live': 'polite', 'aria-atomic': 'true' });
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* ---------- icons ---------- */
  function icon(name) {
    var paths = {
      play: 'M6 4l10 6-10 6z',
      pause: 'M6 4h3v12H6zM13 4h3v12h-3z',
      step: 'M5 4v12M8 10l8 5-8 5z',
      replay: 'M4 10a6 6 0 1 0 2-4.5M4 4v4h4',
      reset: 'M4 4v5h5M5 9a6 6 0 1 1 1 6'
    };
    var n = svg('svg', { viewBox: '0 0 20 20', 'aria-hidden': 'true' });
    n.appendChild(svg('path', { d: paths[name] || paths.reset, fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    return n;
  }

  /* ---------- controls ---------- */
  var uid = 0;
  function slider(o) {
    var id = 's' + (++uid);
    var out = el('output', { for: id, text: o.format ? o.format(o.value) : fmt(o.value, o.digits) });
    var input = el('input', {
      id: id, type: 'range', min: o.min, max: o.max, step: o.step == null ? 1 : o.step, value: o.value,
      'aria-label': o.label,
      oninput: function () {
        var v = parseFloat(input.value);
        out.textContent = o.format ? o.format(v) : fmt(v, o.digits);
        if (o.onInput) o.onInput(v);
      }
    });
    return {
      el: el('div', { class: 'field' + (o.wide ? ' wide' : '') },
        el('label', { for: id }, el('span', { text: o.label }), out), input),
      input: input,
      set: function (v) { input.value = v; out.textContent = o.format ? o.format(v) : fmt(v, o.digits); }
    };
  }

  function segmented(o) {
    var wrap = el('div', { class: 'field wide' }, el('label', {}, el('span', { text: o.label || '' })));
    var seg = el('div', { class: 'seg', role: 'group', 'aria-label': o.label || 'Options' });
    var buttons = [];
    o.options.forEach(function (opt) {
      var b = el('button', {
        type: 'button', 'aria-pressed': String(opt.v === o.value), text: opt.label,
        onclick: function () {
          buttons.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          o.onChange(opt.v);
        }
      });
      buttons.push(b); seg.appendChild(b);
    });
    wrap.appendChild(seg);
    return { el: wrap, set: function (v) { buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(o.options[i].v === v)); }); } };
  }

  function button(label, onClick, o) {
    o = o || {};
    var b = el('button', { type: 'button', class: o.cls || 'btn-dark' + (o.icon ? ' icon' : ''), 'aria-label': o.aria || label || undefined, onclick: onClick });
    if (o.icon) b.appendChild(icon(o.icon));
    if (label) b.appendChild(el('span', { text: label }));
    return b;
  }

  function transport(o) {
    var max = o.length - 1;
    var idx = clamp(o.start || 0, 0, max);
    var playing = false, timer = 0;
    var playBtn, stepBtn, range;

    function frame() {
      o.onFrame(idx);
      if (range) range.value = idx;
      if (stepBtn) stepBtn.disabled = idx >= max;
      var atEnd = idx >= max;
      if (playBtn) {
        clear(playBtn);
        playBtn.appendChild(icon(playing ? 'pause' : atEnd ? 'replay' : 'play'));
        playBtn.setAttribute('aria-label', playing ? 'Pause' : atEnd ? 'Replay' : 'Play');
      }
    }
    function set(n) {
      idx = clamp(n, 0, max);
      frame();
    }
    function stop() { playing = false; clearInterval(timer); frame(); }
    function play() {
      if (playing) return stop();
      if (reduced()) { set(max); return; }
      if (idx >= max) idx = 0;
      playing = true;
      timer = setInterval(function () {
        if (idx >= max) return stop();
        idx += 1; frame();
        if (idx >= max) stop();
      }, o.interval || 700);
      frame();
    }

    playBtn = el('button', { type: 'button', class: 'btn-dark icon', 'aria-label': 'Play', onclick: play });
    stepBtn = el('button', {
      type: 'button', class: 'btn-dark icon', 'aria-label': 'Step forward',
      onclick: function () { stop(); set(idx + 1); }
    });
    stepBtn.appendChild(icon('step'));
    var back = el('button', {
      type: 'button', class: 'btn-dark icon', 'aria-label': 'Step back',
      onclick: function () { stop(); set(idx - 1); }
    });
    back.appendChild(icon('replay'));
    range = el('input', {
      type: 'range', min: 0, max: max, step: 1, value: 0, 'aria-label': o.scrubLabel || 'Step',
      oninput: function () { stop(); set(parseInt(range.value, 10)); }
    });

    var bar = el('div', { class: 'lab-ui', style: { alignItems: 'center' } },
      el('div', { style: { display: 'flex', gap: '6px' } }, back, playBtn, stepBtn),
      el('div', { class: 'field wide' }, el('label', {}, el('span', { text: o.label || 'Step' }), el('output', { text: '0 / ' + max })), range)
    );
    var out = bar.querySelector('output');
    var original = frame;
    frame = function () {
      original();
      if (out) out.textContent = idx + ' / ' + max;
    };
    frame();
    bar.__set = set;
    bar.__stop = stop;
    return { el: bar, set: set, stop: stop, play: play, get: function () { return idx; }, max: max };
  }

  /* ---------- canvas ---------- */
  function canvas(host, aspect, draw) {
    var cv = el('canvas', { 'aria-hidden': 'true' });
    cv.style.width = '100%';
    cv.style.aspectRatio = String(aspect);
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    var W = 0, H = 0;
    function render() {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      draw(ctx, W, H);
    }
    function resize() {
      var r = cv.getBoundingClientRect();
      if (!r.width) return;
      W = r.width;
      H = r.height || r.width / aspect;
      var d = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * d);
      cv.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      render();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);
    requestAnimationFrame(resize);
    return { cv: cv, ctx: ctx, render: render, resize: resize, size: function () { return { w: W, h: H }; } };
  }

  function plot(host, aspect) {
    var wrap = el('div', { class: 'plot', style: { aspectRatio: String(aspect) } });
    host.appendChild(wrap);
    return wrap;
  }

  function dpr() { return Math.min(2, window.devicePixelRatio || 1); }

  function axis(ctx, w, h, o) {
    var pad = o.pad || { l: 38, r: 16, t: 18, b: 30 };
    ctx.save();
    ctx.strokeStyle = 'rgba(237,232,221,.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();
    ctx.fillStyle = 'rgba(145,141,132,.9)';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    (o.yTicks || []).forEach(function (t) {
      var y = o.y(t.v);
      ctx.fillText(t.label, pad.l - 6, y);
      ctx.strokeStyle = 'rgba(237,232,221,.06)';
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    });
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    (o.xTicks || []).forEach(function (t) {
      ctx.fillText(t.label, o.x(t.v), h - pad.b + 6);
    });
    if (o.xLabel) { ctx.textAlign = 'right'; ctx.fillText(o.xLabel, w - pad.r, h - 12); }
    if (o.yLabel) { ctx.textAlign = 'left'; ctx.fillText(o.yLabel, 4, 2); }
    ctx.restore();
    return pad;
  }

  /* Chart ink stays inside the plot frame: save, clip to the axes rectangle,
     and the caller restores once the data layer is drawn. */
  function clipPlot(ctx, pad, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.l, pad.t, Math.max(0, w - pad.l - pad.r), Math.max(0, h - pad.t - pad.b));
    ctx.clip();
  }

  function niceTicks(min, max, count) {
    var span = max - min || 1;
    var step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var out = [];
    for (var v = Math.ceil(min / step) * step; v <= max + step * .001; v += step) {
      out.push({ v: v, label: fmt(v, step < 1 ? 1 : 0) });
    }
    return out;
  }

  function onKey(node, handlers) {
    node.setAttribute('tabindex', node.getAttribute('tabindex') || '0');
    node.addEventListener('keydown', function (e) {
      var fn = handlers[e.key];
      if (fn) { e.preventDefault(); fn(e); }
    });
  }

  function readout(rows) {
    return el('div', { class: 'lab-note' }, rows.map(function (r) {
      return el('div', {}, el('span', { text: r[0] + ' ' }), el('b', { text: r[1] }));
    }));
  }

  function legend(items) {
    return el('div', { class: 'map-legend', style: { display: 'flex', gap: '14px', flexWrap: 'wrap' } },
      items.map(function (it) {
        return el('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
          el('span', { style: { width: '8px', height: '8px', background: it.color, display: 'inline-block', borderRadius: '50%' } }),
          it.label);
      })
    );
  }

  function label(text, color) {
    return el('span', { class: 'lab-note', style: color ? { color: color } : null, text: text });
  }

  A.kit = {
    el: el, svg: svg, clear: clear, clamp: clamp, lerp: lerp, fmt: fmt, pct: pct, scale: scale,
    seeded: seeded, reduced: reduced, tween: tween, store: store, announce: announce, icon: icon,
    slider: slider, segmented: segmented, button: button, transport: transport, canvas: canvas, plot: plot,
    axis: axis, clipPlot: clipPlot, niceTicks: niceTicks, onKey: onKey, readout: readout, legend: legend, label: label, dpr: dpr
  };
})(window.AIM);
