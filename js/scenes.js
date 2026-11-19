/* Metaphor scenes: a playable, themed scene for every concept.
   Each scene is a scene-specific composition with a draggable actor, an action,
   narrated beats and a numeric trace. No course terms are used in the scene. */
(function (A) {
  'use strict';
  var K = A.kit, el = K.el, svg = K.svg;
  var S = {};
  A.scenes = S;
  A.sceneState = A.sceneState || {};

  function add(id, o) { o.id = id; S[id] = o; return o; }
  function P(kind, x, y, s, tone, when) { return { k: kind, x: x, y: y, s: s || 1, tone: tone || 'a', when: when }; }

  function prop(g, kind, tone) {
    var t = 'ms-' + tone;
    switch (kind) {
      case 'house':
        g.appendChild(svg('rect', { x: -34, y: -48, width: 68, height: 48, class: 'ms-d' }));
        g.appendChild(svg('path', { d: 'M-42 -48 L0 -78 L42 -48 Z', class: t }));
        g.appendChild(svg('rect', { x: -8, y: -28, width: 16, height: 28, class: 'ms-c' }));
        g.appendChild(svg('rect', { x: -26, y: -38, width: 12, height: 12, class: 'ms-b' }));
        break;
      case 'shop':
        g.appendChild(svg('rect', { x: -42, y: -56, width: 84, height: 56, class: 'ms-d' }));
        for (var i = 0; i < 4; i++) g.appendChild(svg('rect', { x: -42 + i * 21, y: -72, width: 21, height: 16, class: i % 2 ? t : 'ms-b' }));
        g.appendChild(svg('rect', { x: -24, y: -36, width: 48, height: 16, rx: 2, class: 'ms-c' }));
        g.appendChild(svg('rect', { x: -34, y: -10, width: 28, height: 10, class: 'ms-b' }));
        break;
      case 'tree':
        g.appendChild(svg('rect', { x: -5, y: -36, width: 10, height: 36, class: 'ms-c' }));
        g.appendChild(svg('circle', { cx: -16, cy: -52, r: 20, class: t }));
        g.appendChild(svg('circle', { cx: 14, cy: -56, r: 22, class: t }));
        g.appendChild(svg('circle', { cx: 0, cy: -72, r: 18, class: 'ms-b' }));
        break;
      case 'person':
        g.appendChild(svg('circle', { cx: 0, cy: -60, r: 11, class: 'ms-d' }));
        g.appendChild(svg('path', { d: 'M-14 -48 Q0 -56 14 -48 L12 -18 L-12 -18 Z', class: t }));
        g.appendChild(svg('path', { d: 'M-8 -18 L-12 0 M8 -18 L12 0', class: 'ms-stroke' }));
        break;
      case 'table':
        g.appendChild(svg('rect', { x: -44, y: -30, width: 88, height: 8, rx: 2, class: t }));
        g.appendChild(svg('path', { d: 'M-34 -22 L-38 0 M34 -22 L38 0', class: 'ms-stroke' }));
        break;
      case 'book':
        g.appendChild(svg('rect', { x: -26, y: -30, width: 52, height: 30, rx: 2, class: t }));
        g.appendChild(svg('rect', { x: -20, y: -25, width: 40, height: 20, class: 'ms-d' }));
        g.appendChild(svg('path', { d: 'M-14 -19 H10 M-14 -14 H10', class: 'ms-stroke' }));
        break;
      case 'card':
        g.appendChild(svg('rect', { x: -22, y: -30, width: 44, height: 30, rx: 3, class: 'ms-d' }));
        g.appendChild(svg('path', { d: 'M-14 -21 H12 M-14 -15 H6', class: 'ms-stroke' }));
        break;
      case 'box':
        g.appendChild(svg('rect', { x: -22, y: -28, width: 44, height: 28, rx: 2, class: t }));
        g.appendChild(svg('path', { d: 'M-22 -20 H22', class: 'ms-stroke' }));
        break;
      case 'sign':
        g.appendChild(svg('rect', { x: -2, y: -46, width: 4, height: 46, class: 'ms-c' }));
        g.appendChild(svg('rect', { x: -28, y: -64, width: 56, height: 22, rx: 2, class: 'ms-d' }));
        g.appendChild(svg('path', { d: 'M-20 -53 H18', class: 'ms-stroke' }));
        break;
      case 'shelf':
        g.appendChild(svg('rect', { x: -40, y: -64, width: 80, height: 64, fill: 'none', class: 'ms-stroke' }));
        for (var r = 0; r < 3; r++) {
          g.appendChild(svg('path', { d: 'M-40 ' + (-44 + r * 20) + ' H40', class: 'ms-stroke' }));
          for (var b = 0; b < 5; b++) g.appendChild(svg('rect', { x: -35 + b * 14, y: -61 + r * 20, width: 9, height: 16, class: b % 2 ? t : 'ms-b' }));
        }
        break;
      case 'machine':
        g.appendChild(svg('rect', { x: -34, y: -48, width: 68, height: 48, rx: 4, class: 'ms-d' }));
        g.appendChild(svg('circle', { cx: 0, cy: -24, r: 13, class: 'ms-b' }));
        g.appendChild(svg('path', { d: 'M0 -24 L8 -32', class: 'ms-stroke' }));
        g.appendChild(svg('rect', { x: -24, y: -44, width: 12, height: 5, class: t }));
        break;
      case 'oven':
        g.appendChild(svg('rect', { x: -30, y: -50, width: 60, height: 50, rx: 3, class: t }));
        g.appendChild(svg('rect', { x: -21, y: -36, width: 42, height: 26, rx: 2, class: 'ms-b' }));
        g.appendChild(svg('path', { d: 'M-12 -44 H12', class: 'ms-stroke' }));
        break;
      case 'alarm':
        g.appendChild(svg('circle', { cx: 0, cy: -28, r: 24, class: t }));
        g.appendChild(svg('path', { d: 'M-24 -28 A24 24 0 0 1 24 -28', fill: 'none', class: 'ms-stroke' }));
        g.appendChild(svg('circle', { cx: 0, cy: -28, r: 5, class: 'ms-d' }));
        break;
      case 'gate':
        g.appendChild(svg('rect', { x: -28, y: -52, width: 5, height: 52, class: 'ms-c' }));
        g.appendChild(svg('rect', { x: 23, y: -52, width: 5, height: 52, class: 'ms-c' }));
        g.appendChild(svg('rect', { x: -28, y: -40, width: 56, height: 5, class: t }));
        g.appendChild(svg('rect', { x: -28, y: -28, width: 56, height: 5, class: t }));
        break;
      case 'fence':
        for (var f = 0; f < 4; f++) g.appendChild(svg('rect', { x: -40 + f * 26, y: -40, width: 4, height: 40, class: 'ms-c' }));
        g.appendChild(svg('rect', { x: -44, y: -34, width: 88, height: 4, class: t }));
        g.appendChild(svg('rect', { x: -44, y: -18, width: 88, height: 4, class: t }));
        break;
      case 'scale':
        g.appendChild(svg('rect', { x: -2, y: -52, width: 4, height: 52, class: 'ms-c' }));
        g.appendChild(svg('path', { d: 'M-42 -52 H42', class: 'ms-stroke' }));
        g.appendChild(svg('path', { d: 'M-42 -52 L-52 -34 M42 -52 L52 -34', class: 'ms-stroke' }));
        g.appendChild(svg('path', { d: 'M-62 -34 Q-52 -20 -42 -34 Z', class: t }));
        g.appendChild(svg('path', { d: 'M42 -34 Q52 -20 62 -34 Z', class: t }));
        break;
      case 'jar':
        g.appendChild(svg('path', { d: 'M-18 -34 L-22 0 H22 L18 -34 Z', class: 'ms-d' }));
        g.appendChild(svg('rect', { x: -20, y: -40, width: 40, height: 7, rx: 2, class: t }));
        for (var m = 0; m < 6; m++) g.appendChild(svg('circle', { cx: -11 + (m % 3) * 11, cy: -10 - Math.floor(m / 3) * 10, r: 5, class: m % 2 ? 'ms-b' : 'ms-c' }));
        break;
      case 'die':
        g.appendChild(svg('rect', { x: -18, y: -36, width: 36, height: 36, rx: 5, class: 'ms-d' }));
        [[-8, -26], [8, -26], [0, -18], [-8, -10], [8, -10]].forEach(function (d) { g.appendChild(svg('circle', { cx: d[0], cy: d[1], r: 2.5, class: 'ms-c' })); });
        break;
      case 'target':
        g.appendChild(svg('circle', { cx: 0, cy: -34, r: 30, class: 'ms-d' }));
        g.appendChild(svg('circle', { cx: 0, cy: -34, r: 21, class: 'ms-b' }));
        g.appendChild(svg('circle', { cx: 0, cy: -34, r: 11, class: t }));
        g.appendChild(svg('circle', { cx: 0, cy: -34, r: 3, class: 'ms-c' }));
        break;
      case 'ruler':
        g.appendChild(svg('rect', { x: -50, y: -8, width: 100, height: 12, rx: 2, class: t, transform: 'rotate(-14)' }));
        break;
      case 'dots':
        [[-30, -12], [-8, -30], [16, -20], [36, -38], [-18, 0], [10, -4], [34, 0]].forEach(function (d, i) {
          g.appendChild(svg('circle', { cx: d[0], cy: d[1], r: 3.2, class: i % 2 ? 'ms-c' : t }));
        });
        break;
      case 'network':
        g.appendChild(svg('path', { d: 'M-34 -40 L0 -58 L34 -40 L22 -10 L-22 -10 Z', fill: 'none', class: 'ms-stroke' }));
        [[-34, -40], [0, -58], [34, -40], [22, -10], [-22, -10]].forEach(function (d) {
          g.appendChild(svg('circle', { cx: d[0], cy: d[1], r: 7, class: t }));
        });
        break;
      case 'road':
        g.appendChild(svg('path', { d: 'M-60 0 Q-20 -28 20 -10 Q50 4 70 -18', fill: 'none', stroke: 'var(--scene-ink)', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: '.55' }));
        break;
      case 'ripple':
        for (var w = 0; w < 3; w++) g.appendChild(svg('ellipse', { cx: 0, cy: -2, rx: 22 + w * 18, ry: 6 + w * 5, fill: 'none', class: 'ms-stroke ms-ripple', style: 'animation-delay:' + (w * .35) + 's' }));
        break;
      case 'queue':
        for (var q = 0; q < 4; q++) {
          g.appendChild(svg('circle', { cx: -36 + q * 24, cy: -46, r: 8, class: 'ms-d' }));
          g.appendChild(svg('path', { d: 'M-44 -36 Q' + (-36 + q * 24) + ' -44 ' + (-28 + q * 24) + ' -36 L' + (-28 + q * 24) + ' -8 L-44 -8 Z', class: q % 2 ? t : 'ms-b' }));
        }
        break;
      case 'pot':
        g.appendChild(svg('path', { d: 'M-24 -26 H24 L18 0 H-18 Z', class: t }));
        g.appendChild(svg('path', { d: 'M-30 -26 H30', class: 'ms-stroke' }));
        g.appendChild(svg('path', { d: 'M-10 -34 Q-16 -44 -8 -52 M6 -34 Q0 -46 8 -54', fill: 'none', class: 'ms-stroke ms-steam' }));
        break;
      case 'cake':
        g.appendChild(svg('rect', { x: -30, y: -26, width: 60, height: 26, rx: 4, class: 'ms-b' }));
        g.appendChild(svg('rect', { x: -24, y: -40, width: 48, height: 16, rx: 4, class: t }));
        g.appendChild(svg('circle', { cx: 0, cy: -44, r: 4, class: 'ms-c' }));
        break;
      case 'tray':
        g.appendChild(svg('ellipse', { cx: 0, cy: -12, rx: 42, ry: 10, class: 'ms-d' }));
        g.appendChild(svg('rect', { x: -20, y: -30, width: 14, height: 18, rx: 2, class: t }));
        g.appendChild(svg('rect', { x: 4, y: -28, width: 18, height: 16, rx: 2, class: 'ms-b' }));
        break;
      case 'ball':
        g.appendChild(svg('circle', { cx: 0, cy: -16, r: 16, class: t }));
        g.appendChild(svg('path', { d: 'M-14 -24 Q0 -16 14 -24', fill: 'none', class: 'ms-stroke' }));
        break;
      case 'arrow':
        g.appendChild(svg('path', { d: 'M-40 -4 H30 M18 -14 L32 -4 L18 6', fill: 'none', class: 'ms-stroke' }));
        break;
      case 'curtain':
        g.appendChild(svg('path', { d: 'M-50 -70 Q-20 -30 -30 0 H-50 Z', class: t }));
        g.appendChild(svg('path', { d: 'M50 -70 Q20 -30 30 0 H50 Z', class: t }));
        break;
      case 'car':
        g.appendChild(svg('path', { d: 'M-34 -12 H34 V-26 H-22 Z', class: t }));
        g.appendChild(svg('path', { d: 'M-18 -26 L-10 -38 H12 L20 -26', class: 'ms-d' }));
        g.appendChild(svg('circle', { cx: -20, cy: -8, r: 8, class: 'ms-c' }));
        g.appendChild(svg('circle', { cx: 22, cy: -8, r: 8, class: 'ms-c' }));
        break;
      case 'umbrella':
        g.appendChild(svg('path', { d: 'M-34 -40 Q0 -64 34 -40 Q17 -46 0 -40 Q-17 -46 -34 -40 Z', class: t }));
        g.appendChild(svg('path', { d: 'M0 -40 V0 Q0 6 -6 6', fill: 'none', class: 'ms-stroke' }));
        break;
      case 'notebook':
        g.appendChild(svg('rect', { x: -26, y: -36, width: 52, height: 36, rx: 2, class: 'ms-d' }));
        for (var s = 0; s < 3; s++) g.appendChild(svg('path', { d: 'M-16 ' + (-28 + s * 9) + ' H16', class: 'ms-stroke' }));
        break;
      case 'magnifier':
        g.appendChild(svg('circle', { cx: -5, cy: -38, r: 13, fill: 'none', class: 'ms-stroke' }));
        g.appendChild(svg('path', { d: 'M4 -28 L18 -12', class: 'ms-stroke', 'stroke-width': 4 }));
        break;
      case 'coin':
        g.appendChild(svg('circle', { cx: 0, cy: -18, r: 15, class: t }));
        g.appendChild(svg('circle', { cx: 0, cy: -18, r: 9, class: 'ms-b' }));
        break;
      case 'ticket':
        g.appendChild(svg('rect', { x: -26, y: -28, width: 52, height: 28, rx: 3, class: 'ms-d' }));
        g.appendChild(svg('path', { d: 'M-12 -28 V0 M10 -22 H18 M10 -14 H18', class: 'ms-stroke' }));
        break;
      case 'flag':
        g.appendChild(svg('rect', { x: 0, y: -54, width: 3, height: 54, class: 'ms-c' }));
        g.appendChild(svg('path', { d: 'M3 -54 H34 L24 -42 L34 -30 H3 Z', class: t }));
        break;
      case 'lamp':
        g.appendChild(svg('path', { d: 'M-14 -44 H14 L22 -20 H-22 Z', class: t }));
        g.appendChild(svg('rect', { x: -2, y: -20, width: 4, height: 20, class: 'ms-c' }));
        g.appendChild(svg('ellipse', { cx: 0, cy: 0, rx: 16, ry: 3, class: 'ms-b' }));
        break;
      case 'star':
        g.appendChild(svg('path', { d: 'M0 -40 L9 -22 L28 -20 L14 -7 L18 12 L0 2 L-18 12 L-14 -7 L-28 -20 L-9 -22 Z', class: t }));
        break;
      case 'cloud':
        g.appendChild(svg('ellipse', { cx: -14, cy: 0, rx: 18, ry: 12, class: 'ms-d' }));
        g.appendChild(svg('ellipse', { cx: 8, cy: -4, rx: 22, ry: 15, class: 'ms-d' }));
        g.appendChild(svg('ellipse', { cx: 24, cy: 3, rx: 14, ry: 10, class: 'ms-d' }));
        break;
      case 'fog':
        for (var g2 = 0; g2 < 3; g2++) g.appendChild(svg('ellipse', { cx: -20 + g2 * 24, cy: -18 + g2 * 10, rx: 34, ry: 10, class: 'ms-d', opacity: '.35' }));
        break;
      case 'hill':
        g.appendChild(svg('path', { d: 'M-90 0 Q-40 -90 10 -40 Q50 0 90 -56 L90 40 H-90 Z', class: 'ms-b' }));
        break;
      case 'chair':
        g.appendChild(svg('rect', { x: -16, y: -36, width: 32, height: 8, rx: 2, class: t }));
        g.appendChild(svg('rect', { x: -16, y: -52, width: 5, height: 18, class: t }));
        g.appendChild(svg('path', { d: 'M-14 -28 V0 M14 -28 V0', class: 'ms-stroke' }));
        break;
      default:
        g.appendChild(svg('circle', { cx: 0, cy: -20, r: 14, class: t }));
    }
    return g;
  }

  function actorGlyph(kind) {
    var g = svg('g', { class: 'ms-glyph' });
    if (kind === 'person') {
      g.appendChild(svg('circle', { cx: 0, cy: -50, r: 9, class: 'ms-d' }));
      g.appendChild(svg('path', { d: 'M-11 -40 Q0 -48 11 -40 L9 -14 L-9 -14 Z', class: 'ms-a' }));
    } else if (kind === 'book' || kind === 'card') {
      g.appendChild(svg('rect', { x: -18, y: -44, width: 36, height: 30, rx: 2, class: 'ms-d' }));
      g.appendChild(svg('path', { d: 'M-10 -35 H10 M-10 -28 H4', class: 'ms-stroke' }));
    } else if (kind === 'tray') {
      g.appendChild(svg('ellipse', { cx: 0, cy: -26, rx: 24, ry: 7, class: 'ms-d' }));
      g.appendChild(svg('rect', { x: -10, y: -42, width: 12, height: 14, rx: 2, class: 'ms-a' }));
      g.appendChild(svg('rect', { x: 4, y: -40, width: 10, height: 12, rx: 2, class: 'ms-b' }));
    } else if (kind === 'dial') {
      g.appendChild(svg('circle', { cx: 0, cy: -34, r: 20, class: 'ms-d' }));
      g.appendChild(svg('path', { d: 'M0 -34 L8 -48', class: 'ms-stroke', 'stroke-width': 3 }));
    } else if (kind === 'car') {
      g.appendChild(svg('path', { d: 'M-22 -24 H22 V-38 H-14 Z', class: 'ms-a' }));
      g.appendChild(svg('circle', { cx: -12, cy: -20, r: 6, class: 'ms-c' }));
      g.appendChild(svg('circle', { cx: 14, cy: -20, r: 6, class: 'ms-c' }));
    } else if (kind === 'stone') {
      g.appendChild(svg('ellipse', { cx: 0, cy: -24, rx: 16, ry: 12, class: 'ms-a' }));
    } else if (kind === 'magnifier') {
      g.appendChild(svg('circle', { cx: -4, cy: -34, r: 12, fill: 'none', class: 'ms-stroke', 'stroke-width': 3 }));
      g.appendChild(svg('path', { d: 'M4 -25 L16 -12', class: 'ms-stroke', 'stroke-width': 4 }));
    } else if (kind === 'ticket') {
      g.appendChild(svg('rect', { x: -18, y: -40, width: 36, height: 22, rx: 2, class: 'ms-d' }));
      g.appendChild(svg('path', { d: 'M-8 -40 V-18 M6 -34 H14', class: 'ms-stroke' }));
    } else if (kind === 'umbrella') {
      g.appendChild(svg('path', { d: 'M-24 -36 Q0 -54 24 -36 Q12 -40 0 -36 Q-12 -40 -24 -36 Z', class: 'ms-a' }));
      g.appendChild(svg('path', { d: 'M0 -36 V-14 Q0 -8 -6 -8', fill: 'none', class: 'ms-stroke' }));
    } else if (kind === 'gavel') {
      g.appendChild(svg('rect', { x: -16, y: -44, width: 32, height: 10, rx: 2, class: 'ms-a' }));
      g.appendChild(svg('path', { d: 'M0 -34 V-14', class: 'ms-stroke', 'stroke-width': 4 }));
    } else if (kind === 'robot') {
      g.appendChild(svg('rect', { x: -13, y: -42, width: 26, height: 24, rx: 3, class: 'ms-d' }));
      g.appendChild(svg('circle', { cx: -5, cy: -32, r: 2.5, class: 'ms-c' }));
      g.appendChild(svg('circle', { cx: 5, cy: -32, r: 2.5, class: 'ms-c' }));
      g.appendChild(svg('path', { d: 'M0 -42 V-50', class: 'ms-stroke' }));
    } else if (kind === 'dart') {
      g.appendChild(svg('path', { d: 'M-14 -12 L10 -36 M10 -36 L3 -37 M10 -36 L11 -29', class: 'ms-stroke', 'stroke-width': 3 }));
      g.appendChild(svg('path', { d: 'M-18 -10 L-10 -18 L-6 -10 Z', class: 'ms-a' }));
    } else if (kind === 'camera') {
      g.appendChild(svg('rect', { x: -19, y: -38, width: 38, height: 25, rx: 3, class: 'ms-d' }));
      g.appendChild(svg('circle', { cx: 0, cy: -25, r: 8, class: 'ms-a' }));
      g.appendChild(svg('circle', { cx: 0, cy: -25, r: 3, class: 'ms-c' }));
      g.appendChild(svg('rect', { x: -8, y: -44, width: 12, height: 6, rx: 2, class: 'ms-c' }));
    } else if (kind === 'alarm') {
      g.appendChild(svg('path', { d: 'M-19 -20 A19 19 0 0 1 19 -20 Z', class: 'ms-a' }));
      g.appendChild(svg('rect', { x: -24, y: -20, width: 48, height: 7, rx: 3, class: 'ms-c' }));
      g.appendChild(svg('circle', { cx: 0, cy: -30, r: 4, class: 'ms-d' }));
    } else if (kind === 'ruler') {
      g.appendChild(svg('rect', { x: -30, y: -30, width: 60, height: 10, rx: 1, class: 'ms-a', transform: 'rotate(-18)' }));
      g.appendChild(svg('path', { d: 'M-18 -42 L-18 -50 M-4 -46 L-4 -54 M10 -50 L10 -58', class: 'ms-stroke' }));
    } else if (kind === 'sign') {
      g.appendChild(svg('rect', { x: -2, y: -44, width: 4, height: 44, class: 'ms-c' }));
      g.appendChild(svg('rect', { x: -24, y: -62, width: 48, height: 20, rx: 2, class: 'ms-d' }));
      g.appendChild(svg('path', { d: 'M-16 -52 H16', class: 'ms-stroke' }));
    } else if (kind === 'box') {
      g.appendChild(svg('rect', { x: -17, y: -30, width: 34, height: 30, rx: 2, class: 'ms-a' }));
      g.appendChild(svg('path', { d: 'M-17 -22 H17', class: 'ms-stroke' }));
    } else if (kind === 'ball') {
      g.appendChild(svg('circle', { cx: 0, cy: -26, r: 16, class: 'ms-a' }));
      g.appendChild(svg('path', { d: 'M-14 -34 Q0 -24 14 -34', fill: 'none', class: 'ms-stroke' }));
    } else if (kind === 'cloud') {
      g.appendChild(svg('ellipse', { cx: -10, cy: -26, rx: 15, ry: 10, class: 'ms-d' }));
      g.appendChild(svg('ellipse', { cx: 10, cy: -30, rx: 18, ry: 12, class: 'ms-d' }));
      g.appendChild(svg('ellipse', { cx: 20, cy: -24, rx: 11, ry: 8, class: 'ms-d' }));
    } else if (kind === 'pin') {
      g.appendChild(svg('path', { d: 'M0 -48 C-12 -48 -18 -38 -18 -30 C-18 -18 0 -2 0 -2 C0 -2 18 -18 18 -30 C18 -38 12 -48 0 -48 Z', class: 'ms-a' }));
      g.appendChild(svg('circle', { cx: 0, cy: -31, r: 5, class: 'ms-d' }));
    } else if (kind === 'whistle') {
      g.appendChild(svg('ellipse', { cx: 0, cy: -25, rx: 15, ry: 9, class: 'ms-a' }));
      g.appendChild(svg('rect', { x: 10, y: -29, width: 16, height: 7, rx: 3, class: 'ms-a' }));
      g.appendChild(svg('circle', { cx: -5, cy: -25, r: 3, class: 'ms-d' }));
    } else if (kind === 'chair') {
      g.appendChild(svg('rect', { x: -13, y: -30, width: 26, height: 7, rx: 2, class: 'ms-a' }));
      g.appendChild(svg('rect', { x: -13, y: -44, width: 4, height: 16, class: 'ms-a' }));
      g.appendChild(svg('path', { d: 'M-10 -23 V-2 M10 -23 V-2', class: 'ms-stroke', 'stroke-width': 3 }));
    } else if (kind === 'post') {
      g.appendChild(svg('rect', { x: -3, y: -46, width: 6, height: 46, class: 'ms-a' }));
      g.appendChild(svg('rect', { x: -16, y: -34, width: 32, height: 4, class: 'ms-a' }));
    } else {
      g.appendChild(svg('circle', { cx: 0, cy: -26, r: 17, class: 'ms-a' }));
      g.appendChild(svg('circle', { cx: 0, cy: -26, r: 5, class: 'ms-d' }));
    }
    return g;
  }

  var VIEW_W = 720, VIEW_H = 260, GROUND = 196, ACT_LEFT = 76, ACT_RIGHT = 644;
  var PORTRAIT_W = 360, PORTRAIT_H = 560, PORTRAIT_TOP = 116, PORTRAIT_GROUND = 466;
  var BACKDROP = { hill: 1, fog: 1, road: 1, ripple: 1, curtain: 1, sun: 1, cloud: 1 };

  A.register('metaphor-scene', {
    mount: function (host, cfg) {
      var spec = S[cfg.scene || cfg.sceneId || cfg.id];
      if (!spec) {
        host.appendChild(el('p', { class: 'lab-note', text: 'Scene unavailable: ' + (cfg.scene || cfg.id) }));
        return;
      }
      var h = spec.hue == null ? 40 : spec.hue;
      var portrait = !!(window.matchMedia && window.matchMedia('(max-width:560px)').matches);
      var VW = portrait ? PORTRAIT_W : VIEW_W;
      var VH = portrait ? PORTRAIT_H : VIEW_H;
      var ground = portrait ? PORTRAIT_GROUND : GROUND;
      var beats = spec.beats || [];
      var idx = Math.min(A.sceneState[spec.id] || 0, beats.length - 1);
      var dragging = false, timer = 0, currentT = 0, dragStart = null, dragStartT = 0;

      var wrap = el('div', { class: 'ms', dataset: { scene: spec.id, beat: idx } });
      wrap.style.setProperty('--scene-accent', 'oklch(.54 .13 ' + h + ')');
      wrap.style.setProperty('--scene-bg', 'oklch(.955 .035 ' + h + ')');
      wrap.style.setProperty('--scene-soft', 'oklch(.89 .06 ' + h + ')');
      wrap.style.setProperty('--scene-ink', 'oklch(.31 .04 ' + h + ')');
      wrap.style.setProperty('--scene-line', 'oklch(.66 .07 ' + h + ')');
      wrap.style.setProperty('--scene-paper', 'oklch(.985 .015 ' + h + ')');

      wrap.appendChild(el('div', { class: 'ms-head' },
        el('div', {},
          el('p', { class: 'ms-kicker', text: 'Play the metaphor' }),
          el('h3', { class: 'ms-setting', text: spec.setting })),
        el('p', { class: 'ms-hint', text: spec.hint || ('Drag the ' + (spec.actorName || 'marker') + ', or use the buttons.') })));

      var stage = el('div', { class: 'ms-stage' });
      var root = svg('svg', { viewBox: '0 0 ' + VW + ' ' + VH, class: 'ms-svg', role: 'img', 'aria-label': spec.setting });
      var props = (spec.props || []).map(function (p) {
        return Array.isArray(p) ? { k: p[0], x: p[1], y: p[2], s: p[3] || 1, tone: p[4] || 'a', when: p[5] } : p;
      });
      var kinds = {};
      props.forEach(function (p) { kinds[p.k] = 1; });

      root.appendChild(svg('rect', { x: 0, y: 0, width: VW, height: VH, class: 'ms-sky' }));
      if (portrait) {
        /* Portrait recomposition: sky and a story spine stay put; props are
           rearranged into two readable columns instead of shrinking the wide set. */
        root.appendChild(svg('circle', { cx: 306, cy: 40, r: 17, class: 'ms-sun' }));
        root.appendChild(svg('ellipse', { cx: 82, cy: 84, rx: 34, ry: 10, class: 'ms-cloud-a' }));
        root.appendChild(svg('ellipse', { cx: 262, cy: 38, rx: 24, ry: 7, class: 'ms-cloud-a' }));
        root.appendChild(svg('path', { d: 'M0 384 Q62 314 144 356 T268 338 T360 360 V480 H0 Z', class: 'ms-hill-back' }));
        root.appendChild(svg('path', { d: 'M0 430 Q98 366 196 406 T360 390 V480 H0 Z', class: 'ms-hill-front' }));
        root.appendChild(svg('rect', { x: 0, y: 480, width: VW, height: VH - 480, class: 'ms-ground' }));
        root.appendChild(svg('path', { d: 'M0 480 H360', class: 'ms-horizon' }));
        root.appendChild(svg('path', { d: 'M44 170 q5 -9 10 0 M56 166 q5 -9 10 0 M292 148 q5 -9 10 0', class: 'ms-bird' }));
        if (kinds.road) root.appendChild(svg('path', { d: 'M182 470 C142 376 226 330 174 246 C142 198 202 166 184 112', class: 'ms-road' }));
        if (kinds.ripple) {
          [34, 62, 90].forEach(function (r) {
            root.appendChild(svg('circle', { cx: 180, cy: 300, r: r, class: 'ms-ripple', style: 'animation:none;opacity:.3' }));
          });
        }
        if (kinds.fog) {
          [250, 286, 322].forEach(function (y, i) {
            root.appendChild(svg('rect', { x: 0, y: y, width: 360, height: 18, rx: 9, class: 'ms-fog-band', opacity: .12 + i * .05 }));
          });
        }
        if (kinds.curtain) {
          root.appendChild(svg('path', { d: 'M0 0 H70 Q30 90 16 190 H0 Z', class: 'ms-tone-a ms-curtain' }));
          root.appendChild(svg('path', { d: 'M360 0 H290 Q330 90 344 190 H360 Z', class: 'ms-tone-a ms-curtain' }));
        }
        root.appendChild(svg('path', { d: 'M180 108 V468', class: 'ms-spine' }));
      } else {
        root.appendChild(svg('circle', { cx: 650, cy: 54, r: 22, class: 'ms-sun' }));
        root.appendChild(svg('ellipse', { cx: 128, cy: 60, rx: 48, ry: 14, class: 'ms-cloud-a' }));
        root.appendChild(svg('ellipse', { cx: 500, cy: 42, rx: 34, ry: 10, class: 'ms-cloud-a' }));
        root.appendChild(svg('path', { d: 'M0 194 Q110 118 230 166 T470 150 T720 180 V210 H0 Z', class: 'ms-hill-back' }));
        root.appendChild(svg('path', { d: 'M0 204 Q180 150 350 186 T720 184 V216 H0 Z', class: 'ms-hill-front' }));
        root.appendChild(svg('rect', { x: 0, y: GROUND, width: VW, height: VH - GROUND, class: 'ms-ground' }));
        root.appendChild(svg('path', { d: 'M0 ' + GROUND + ' H720', class: 'ms-horizon' }));
        root.appendChild(svg('path', { d: 'M92 160 q5 -9 10 0 M104 156 q5 -9 10 0 M612 150 q5 -9 10 0', class: 'ms-bird' }));
      }

      var propNodes = new Array(props.length);
      if (portrait) {
        var placeable = [];
        props.forEach(function (p, i) { if (!BACKDROP[p.k]) placeable.push({ p: p, i: i }); });
        var cols = placeable.length > 1 ? 2 : 1;
        var rows = Math.ceil(placeable.length / cols);
        var rowTop = rows <= 1 ? 280 : (rows === 2 ? 160 : 130);
        var rowBottom = rows <= 1 ? 280 : (rows === 2 ? 430 : 450);
        var rowGap = rows > 1 ? Math.min(rows > 3 ? 106 : 130, (rowBottom - rowTop) / (rows - 1)) : 0;
        placeable.forEach(function (item, slot) {
          var p = item.p;
          var x = cols === 1 ? 270 : (slot % 2 ? 290 : 70);
          var y = rowTop + Math.floor(slot / cols) * rowGap;
          var scale = Math.min(1, Math.max(.7, p.s * .82));
          var g = svg('g', {
            class: 'ms-prop ms-tone-' + p.tone,
            transform: 'translate(' + x + ' ' + y.toFixed(1) + ') scale(' + scale.toFixed(2) + ')',
            dataset: { prop: item.i }
          });
          prop(g, p.k, p.tone);
          root.appendChild(g);
          propNodes[item.i] = g;
        });
      } else {
        props.forEach(function (p, i) {
          var g = svg('g', {
            class: 'ms-prop ms-tone-' + p.tone,
            transform: 'translate(' + (p.x * VIEW_W).toFixed(1) + ' ' + (p.y == null ? GROUND : GROUND + (p.y - .84) * 300).toFixed(1) + ') scale(' + (p.s * 1.16).toFixed(2) + ')',
            dataset: { prop: i }
          });
          prop(g, p.k, p.tone);
          root.appendChild(g);
          propNodes[i] = g;
        });
      }

      var actor = svg('g', {
        class: 'ms-actor', tabindex: '0', role: 'slider',
        'aria-label': spec.actorName || 'Scene position',
        'aria-valuemin': '0', 'aria-valuemax': String(Math.max(0, beats.length - 1)), 'aria-valuenow': String(idx),
        'aria-valuetext': beats[idx] ? beats[idx].label : ''
      });
      actor.appendChild(svg('ellipse', { cx: 0, cy: -2, rx: 20, ry: 4, class: 'ms-shadow' }));
      actor.appendChild(svg('circle', { cx: 0, cy: -30, r: 48, class: 'ms-hit' }));
      actor.appendChild(svg('circle', { cx: 0, cy: -30, r: 30, class: 'ms-halo' }));
      var glyph = actorGlyph(spec.actor);
      glyph.setAttribute('transform', 'scale(1.38)');
      actor.appendChild(glyph);
      actor.appendChild(svg('circle', { cx: 0, cy: -30, r: 4, class: 'ms-grip' }));
      root.appendChild(actor);
      stage.appendChild(root);
      wrap.appendChild(stage);

      var trace = el('div', { class: 'ms-trace', 'aria-live': 'polite' });
      var count = el('span', { class: 'ms-count', text: '' });
      var label = el('strong', { class: 'ms-beat-label' });
      var readout = el('span', { class: 'ms-readout' });
      trace.appendChild(count); trace.appendChild(label); trace.appendChild(readout);
      wrap.appendChild(trace);

      var meter = null;
      if (spec.meter) {
        meter = el('div', { class: 'ms-meter', 'aria-hidden': 'true' });
        meter.appendChild(el('span', { class: 'ms-meter-fill' }));
        wrap.appendChild(meter);
      }

      var beatsRow = el('div', { class: 'ms-beats', role: 'group', 'aria-label': 'Scene beats' });
      var beatBtns = beats.map(function (b, i) {
        var btn = el('button', { type: 'button', class: 'ms-beat', 'aria-pressed': String(i === idx), onclick: function () { stop(); setBeat(i); } },
          el('span', { class: 'ms-beat-n', text: String(i + 1).padStart(2, '0') }),
          el('span', { text: b.label }));
        beatsRow.appendChild(btn);
        return btn;
      });
      wrap.appendChild(beatsRow);

      var act = el('button', { type: 'button', class: 'ms-act' });
      var play = el('button', { type: 'button', class: 'ms-ctrl', text: 'Play the scene' });
      var reset = el('button', { type: 'button', class: 'ms-ctrl', text: 'Reset' });
      wrap.appendChild(el('div', { class: 'ms-controls' }, act, play, reset));
      host.appendChild(wrap);

      function actorPoint(t) {
        if (portrait) {
          var py = PORTRAIT_TOP + t * (PORTRAIT_GROUND - PORTRAIT_TOP);
          if (spec.path === 'stairs') py -= 20 * (Math.floor(t * 3) / 3);
          return { x: 180, y: py };
        }
        var lift = 0;
        if (spec.path === 'hill') lift = 70 * Math.sin(Math.PI * t);
        else if (spec.path === 'arc') lift = 46 * Math.sin(Math.PI * t);
        else if (spec.path === 'stairs') lift = 42 * Math.floor(t * 3) / 3;
        return { x: ACT_LEFT + t * (ACT_RIGHT - ACT_LEFT), y: GROUND - lift };
      }

      function place(t, animate) {
        currentT = t;
        var p = actorPoint(t);
        actor.style.transition = animate === false ? 'none' : '';
        actor.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
      }

      function apply(n) {
        idx = K.clamp(n, 0, beats.length - 1);
        var b = beats[idx] || {};
        wrap.dataset.beat = idx;
        A.sceneState[spec.id] = idx;
        count.textContent = (idx + 1) + ' / ' + beats.length;
        label.textContent = b.label || '';
        readout.textContent = b.readout || '';
        act.textContent = b.action || 'Next';
        actor.setAttribute('aria-valuenow', String(idx));
        actor.setAttribute('aria-valuetext', b.label || '');
        beatBtns.forEach(function (btn, i) { btn.setAttribute('aria-pressed', String(i === idx)); });
        propNodes.forEach(function (g, i) {
          if (!g) return;
          var p = props[i];
          g.classList.toggle('ms-off', !!(p.when && p.when.indexOf(idx) < 0));
          g.classList.toggle('ms-hot', !!(b.hl && b.hl.indexOf(i) >= 0));
        });
        if (meter) {
          var val = b.value == null ? idx + 1 : b.value;
          meter.querySelector('.ms-meter-fill').style.width = Math.max(0, Math.min(1, val / (spec.meter.max || beats.length))) * 100 + '%';
        }
        play.textContent = idx >= beats.length - 1 ? 'Replay' : 'Play the scene';
        place(b.at == null ? idx / Math.max(1, beats.length - 1) : b.at, true);
      }

      function setBeat(n, tOverride) {
        apply(n);
        if (tOverride != null) place(tOverride, false);
        K.announce(label.textContent + '. ' + readout.textContent);
      }

      function stop() {
        clearInterval(timer); timer = 0;
        play.textContent = idx >= beats.length - 1 ? 'Replay' : 'Play the scene';
      }

      play.addEventListener('click', function () {
        if (timer) { stop(); return; }
        if (K.reduced()) { setBeat(beats.length - 1); return; }
        if (idx >= beats.length - 1) setBeat(0);
        timer = setInterval(function () {
          if (idx >= beats.length - 1) { stop(); return; }
          setBeat(idx + 1);
        }, 1500);
        setBeat(Math.min(beats.length - 1, idx + 1));
      });
      act.addEventListener('click', function () {
        stop();
        setBeat(idx >= beats.length - 1 ? 0 : idx + 1);
      });
      reset.addEventListener('click', function () {
        stop();
        delete A.sceneState[spec.id];
        setBeat(0);
      });

      function scenePoint(e) {
        var ctm = root.getScreenCTM();
        if (!ctm) return null;
        var pt = root.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        return pt.matrixTransform(ctm.inverse());
      }
      function move(e) {
        if (!dragStart) return;
        var q = scenePoint(e);
        if (!q) return;
        var span = portrait ? PORTRAIT_GROUND - PORTRAIT_TOP : ACT_RIGHT - ACT_LEFT;
        var delta = portrait ? (q.y - dragStart.y) : (q.x - dragStart.x);
        var t = K.clamp(dragStartT + delta / span, 0, 1);
        var nearest = Math.round(t * (beats.length - 1));
        if (nearest !== idx) apply(nearest);
        place(t, false);
      }
      actor.addEventListener('pointerdown', function (e) {
        stop();
        dragging = true;
        dragStart = scenePoint(e);
        dragStartT = currentT;
        stage.classList.add('dragging');
        if (actor.setPointerCapture) actor.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      actor.addEventListener('pointermove', function (e) { if (dragging) move(e); });
      function release(e) {
        if (!dragging) return;
        dragging = false;
        dragStart = null;
        stage.classList.remove('dragging');
        if (actor.releasePointerCapture && e.pointerId != null) actor.releasePointerCapture(e.pointerId);
        setBeat(idx);
      }
      actor.addEventListener('pointerup', release);
      actor.addEventListener('pointercancel', release);
      actor.addEventListener('keydown', function (e) {
        var map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -999, End: 999 };
        if (!(e.key in map)) return;
        e.preventDefault();
        stop();
        if (map[e.key] === -999) setBeat(0);
        else if (map[e.key] === 999) setBeat(beats.length - 1);
        else setBeat(idx + map[e.key]);
      });

      apply(idx);

      /* A resized window can cross the portrait breakpoint. Rebuild the scene at
         the new layout while keeping the persisted beat, and discard the old
         media listener so repeated resizes do not stack scenes. */
      var layoutQuery = window.matchMedia && window.matchMedia('(max-width:560px)');
      if (host._msCleanup) host._msCleanup();
      host._msCleanup = function () {
        clearInterval(timer);
        if (layoutQuery && layoutQuery.removeEventListener) layoutQuery.removeEventListener('change', onLayout);
      };
      function onLayout() {
        if (!layoutQuery || layoutQuery.matches === portrait) return;
        host._msCleanup();
        host._msCleanup = null;
        host.innerHTML = '';
        A.widgets['metaphor-scene'].mount(host, cfg);
      }
      if (layoutQuery && layoutQuery.addEventListener) layoutQuery.addEventListener('change', onLayout);

      return { setBeat: setBeat, get: function () { return idx; }, spec: spec };
    }
  });

  /* SCENES */
  add('four-questions', {
    hue: 28, setting: 'The workshop with four benches', actor: 'person', actorName: 'visitor',
    tryText: 'Drag the visitor from bench to bench, then press the action at each stop.',
    notice: 'The object on the bench never changes. The tool changes the question being asked.',
    props: [['table', .18, .84, 1.2], ['table', .4, .84, 1.2], ['table', .62, .84, 1.2], ['table', .84, .84, 1.2], ['book', .18, .8, .8, 'b'], ['card', .4, .8, .75, 'c'], ['box', .62, .8, .75], ['star', .84, .8, .65]],
    beats: [
      { label: 'The label bench', readout: 'Is it a cat, a dog, or a chair?', action: 'Pick up the label tool', hl: [4] },
      { label: 'The map bench', readout: 'Which road reaches the station?', action: 'Open the map', hl: [5] },
      { label: 'The puzzle bench', readout: 'Which pieces fit together?', action: 'Try a piece', hl: [6] },
      { label: 'The rule bench', readout: 'If it is raining, what follows?', action: 'Read the rulebook', hl: [7] }
    ]
  });

  add('reflex-models', {
    hue: 205, setting: 'The thermostat on the wall', actor: 'dial', actorName: 'dial',
    tryText: 'Drag the dial up and down. Watch the heater and the room respond at once.',
    notice: 'The thermostat checks the room, compares it with a set point, and switches. It never remembers yesterday.',
    meter: { max: 30 },
    props: [['machine', .28, .84, 1.2], ['oven', .76, .84, 1.2, 'b'], ['lamp', .9, .84, .9, 'b'], ['sign', .52, .82, .8, 'c']],
    beats: [
      { label: 'A cold room', readout: '16 degrees. The heater switches on.', action: 'Turn the dial up', value: 16, hl: [1] },
      { label: 'Just right', readout: '20 degrees. The heater switches off.', action: 'Hold the set point', value: 20 },
      { label: 'A warm room', readout: '24 degrees. The window opens.', action: 'Turn the dial again', value: 24, hl: [2] }
    ]
  });

  add('state-models', {
    hue: 275, setting: 'The board game on the kitchen table', actor: 'token', actorName: 'game piece',
    tryText: 'Drag the piece across the board, then roll the die.',
    notice: 'The square and the roll are the whole situation. The next move depends on where you are now.',
    props: [['board', .54, .86, 1.5], ['die', .13, .82, 1], ['house', .9, .82, .8, 'b'], ['star', .42, .55, .7, 'b']],
    beats: [
      { label: 'The start square', readout: 'You are on square two. Nothing has happened yet.', action: 'Roll the die', at: .05 },
      { label: 'Past the corner', readout: 'You are on square five. The short cut is open.', action: 'Move three squares', at: .5 },
      { label: 'One step from home', readout: 'You are on square nine. A six wins.', action: 'Take the last step', at: .95 }
    ]
  });

  add('variable-models', {
    hue: 350, setting: 'The wedding table plan', actor: 'card', actorName: 'place card',
    tryText: 'Drag the place card between the two tables and watch the rules complain.',
    notice: 'Only the seating matters, not the order in which you filled the chairs. A valid plan has no forbidden pair.',
    props: [['table', .28, .84, 1.5], ['table', .74, .84, 1.5], ['person', .2, .84, .8, 'b'], ['person', .36, .84, .8, 'c'], ['person', .66, .84, .8, 'b'], ['person', .82, .84, .8, 'c'], ['sign', .5, .8, .8, 'c']],
    beats: [
      { label: 'Ana sits down', readout: 'Table one now holds Ana and Ben, who will not sit together.', action: 'Move Ana', hl: [2, 3] },
      { label: 'Ben moves across', readout: 'Ben joins table two. Table one is calm again.', action: 'Check the other table', hl: [4, 5] },
      { label: 'The plan holds', readout: 'Every guest has a seat and no forbidden pair shares a table.', action: 'Admire the plan' }
    ]
  });

  add('logic-models', {
    hue: 45, setting: 'The detective notebook by the lamp', actor: 'magnifier', actorName: 'magnifier',
    tryText: 'Drag the magnifier across the desk, then add the next line to the notebook.',
    notice: 'A new line is written only when the facts and the rules force it. Nothing is guessed.',
    props: [['table', .4, .84, 1.6], ['notebook', .32, .82, 1.2], ['lamp', .72, .84, 1], ['card', .55, .8, .8, 'b'], ['book', .86, .82, .9, 'c']],
    beats: [
      { label: 'A fact', readout: 'The door was open this morning.', action: 'Write the fact', hl: [1] },
      { label: 'A rule', readout: 'If the door is open, someone left in a hurry.', action: 'Add the rule', hl: [4] },
      { label: 'A forced conclusion', readout: 'Someone left in a hurry. The notebook now says so.', action: 'Write the conclusion', hl: [0] }
    ]
  });

  add('llms', {
    hue: 160, setting: 'The improviser on a small stage', actor: 'book', actorName: 'script',
    tryText: 'Drag the script across the stage and give the improviser a new opening line.',
    notice: 'The next line can sound right without being true. Fluent continuation is not the same as knowing the plot.',
    props: [['curtain', .16, .84, 1.3], ['shelf', .78, .84, 1.4], ['book', .48, .84, 1, 'b'], ['star', .62, .58, .7]],
    beats: [
      { label: 'The opening line', readout: 'A stranger waits on a rainy platform.', action: 'Give a prompt', hl: [2] },
      { label: 'A plausible next line', readout: 'The train is late, says the stranger. It sounds like the scene.', action: 'Continue the scene' },
      { label: 'A confident mistake', readout: 'The moon is made of cheese. Fluent, but the play is lost.', action: 'Try another line', hl: [3] }
    ]
  });

  add('three-perspectives', {
    hue: 35, setting: 'The bakery at dawn', actor: 'tray', actorName: 'tray',
    tryText: 'Carry the tray from the recipe to the oven, then to the shop counter.',
    notice: 'The recipe says what to make, baking makes it, selling uses the result. One situation, three questions.',
    props: [['shop', .82, .84, 1.1], ['oven', .5, .84, 1.2], ['table', .25, .84, 1.2], ['cake', .82, .82, .8, 'b'], ['book', .25, .82, .8, 'c']],
    beats: [
      { label: 'The recipe', readout: 'Flour, eggs, sugar. This is what should happen.', action: 'Read the recipe', hl: [4] },
      { label: 'The oven', readout: 'The ingredients become a cake. This is what happened.', action: 'Open the oven', hl: [1] },
      { label: 'The counter', readout: 'Eight slices sell before noon. This is what it is for.', action: 'Serve a slice', hl: [0] }
    ]
  });

  add('splitting-data', {
    hue: 300, setting: 'The theatre before opening night', actor: 'ticket', actorName: 'ticket',
    tryText: 'Drag the ticket from the rehearsal room to the auditorium.',
    notice: 'The rehearsal scenes and the opening-night scenes are different. A good rehearsal only helps if opening night is new.',
    props: [['curtain', .22, .84, 1.4], ['curtain', .8, .84, 1.3], ['board', .5, .84, 1.1, 'b'], ['person', .66, .84, .8], ['sign', .5, .78, .8, 'c']],
    beats: [
      { label: 'Rehearsal', readout: 'Five scenes are practised until the lines are smooth.', action: 'Run the scene', hl: [0] },
      { label: 'Opening night', readout: 'A scene nobody rehearsed walks on stage.', action: 'Raise the curtain', hl: [1] },
      { label: 'The comparison', readout: 'The gap between the two nights is the honest score.', action: 'Compare notes', hl: [2] }
    ]
  });

  add('k-fold', {
    hue: 220, setting: 'Five study groups around one table', actor: 'card', actorName: 'question card',
    tryText: 'Pass the question card around the table, one friend at a time.',
    notice: 'Whoever writes the questions sits out that round. Everyone studies four times and writes once.',
    props: [['table', .55, .84, 1.8], ['person', .25, .84, .7, 'b'], ['person', .4, .84, .7, 'c'], ['person', .55, .84, .7, 'b'], ['person', .7, .84, .7, 'c'], ['person', .85, .84, .7, 'b']],
    beats: [
      { label: 'Ana writes', readout: 'Ana writes the practice questions. The other four study.', action: 'Set the questions', hl: [1] },
      { label: 'Ben writes', readout: 'The card passes to Ben. Ana now studies with the rest.', action: 'Pass the card', hl: [2] },
      { label: 'Everyone has written', readout: 'Five rounds later, every friend has taught once and studied four times.', action: 'Collect the scores' }
    ]
  });

  add('metrics', {
    hue: 5, setting: 'The smoke alarm in the hallway', actor: 'alarm', actorName: 'alarm',
    tryText: 'Drag the alarm between the kitchen and the hallway and watch what it notices.',
    notice: 'A false alarm and a missed fire cost different things. One number cannot tell you both.',
    props: [['house', .2, .84, 1.2], ['alarm', .5, .84, 1.1], ['pot', .74, .84, 1], ['star', .86, .72, .6, 'b'], ['sign', .5, .78, .8, 'c']],
    beats: [
      { label: 'Toast smokes', readout: 'The alarm rings. There is no fire.', action: 'Check the kitchen', hl: [2] },
      { label: 'A fire starts', readout: 'The alarm stays silent. This is the costly miss.', action: 'Check the alarm', hl: [1] },
      { label: 'Both are right', readout: 'The alarm rings for the fire and stays quiet for toast.', action: 'Test it again', hl: [0, 1] }
    ]
  });

  add('loss-functions', {
    hue: 15, setting: 'The dartboard in the garden', actor: 'dart', actorName: 'dart',
    tryText: 'Drag the dart across the board, then score the throw three different ways.',
    notice: 'The same throw gets a different penalty depending on how the referee counts distance.',
    props: [['target', .5, .84, 1.5], ['person', .16, .84, .9], ['sign', .84, .82, .8, 'c'], ['card', .3, .82, .7, 'b']],
    beats: [
      { label: 'Distance from the middle', readout: 'Twelve centimetres away. The referee charges twelve.', action: 'Score the throw' },
      { label: 'Squared distance', readout: 'Twelve becomes one hundred and forty-four. A near miss costs much more.', action: 'Square it', hl: [0] },
      { label: 'Nearest ring', readout: 'The throw still lands in ring three. The ring is all that counts.', action: 'Score the ring', hl: [2] }
    ]
  });

  add('overfitting', {
    hue: 265, setting: 'The student at the kitchen table', actor: 'card', actorName: 'answer sheet',
    tryText: 'Slide the answer sheet from last year to the blank paper.',
    notice: 'Memorising the old paper looks perfect until the questions change. Learning the method travels.',
    props: [['table', .5, .84, 1.5], ['person', .32, .84, .9], ['book', .74, .84, 1, 'b'], ['card', .6, .82, .8, 'c'], ['sign', .86, .8, .7, 'b']],
    beats: [
      { label: 'The old paper', readout: 'Every answer is memorised. Last year scores one hundred.', action: 'Memorise it', hl: [2] },
      { label: 'The new paper', readout: 'The questions changed. The same student scores forty.', action: 'Turn the page', hl: [3] },
      { label: 'The method', readout: 'A student who learned the method scores eighty-five on both.', action: 'Learn the method', hl: [1] }
    ]
  });

  add('bias-variance', {
    hue: 190, setting: 'Three targets at the archery range', actor: 'dart', actorName: 'arrow',
    tryText: 'Carry the arrow from target to target and compare the groups of shots.',
    notice: 'A tight group in the wrong place and a wide group around the right place fail for different reasons.',
    props: [['target', .22, .84, .9], ['target', .5, .84, .9], ['target', .78, .84, .9], ['person', .08, .84, .8, 'b'], ['sign', .5, .78, .8, 'c']],
    beats: [
      { label: 'Tight but left', readout: 'Every shot lands together, far from the middle.', action: 'Aim again', hl: [0] },
      { label: 'Scattered but centred', readout: 'The shots spread widely, but their centre is right.', action: 'Steady the hand', hl: [1] },
      { label: 'Tight and centred', readout: 'The group is small and sits on the middle.', action: 'Take the shot', hl: [2] }
    ]
  });

  add('linear-model', {
    hue: 210, setting: 'The ruler laid over a cloud of dots', actor: 'ruler', actorName: 'ruler',
    tryText: 'Drag the ruler across the dots and tilt it at each stop.',
    notice: 'Every position is a different guess. The best one sits closest to all the dots at once.',
    props: [['dots', .5, .78, 1.8], ['table', .5, .88, 1.6], ['sign', .84, .8, .8, 'c']],
    beats: [
      { label: 'Flat and low', readout: 'The line misses the dots above it.', action: 'Tilt the ruler' },
      { label: 'Tilted through', readout: 'The line cuts through the cloud but overshoots the ends.', action: 'Slide it' },
      { label: 'Closest to all', readout: 'The ruler sits as near as it can to every dot.', action: 'Keep this line' }
    ]
  });

  add('least-squares', {
    hue: 40, setting: 'The balance scale in the market', actor: 'token', actorName: 'weight',
    tryText: 'Move the weight from pan to pan until the beam settles.',
    notice: 'The beam levels when the total pull on both sides matches. The gaps are the weights.',
    props: [['scale', .5, .86, 1.6], ['box', .3, .84, .7, 'b'], ['box', .7, .84, .7, 'c'], ['table', .5, .9, 1.8]],
    beats: [
      { label: 'Left pan heavy', readout: 'The beam drops on the left. The gaps pull harder there.', action: 'Move a weight', hl: [1] },
      { label: 'Right pan heavy', readout: 'The beam drops on the right. Now the other side pulls harder.', action: 'Move it back', hl: [2] },
      { label: 'Level beam', readout: 'Both sides pull equally. This is the settling point.', action: 'Let it rest', hl: [0] }
    ]
  });

  add('gradient-descent', {
    hue: 225, setting: 'The foggy hillside', actor: 'person', actorName: 'walker', path: 'hill',
    tryText: 'Drag the walker down the slope, one careful step at a time.',
    notice: 'The walker cannot see the valley. Only the slope underfoot says which way is down.',
    props: [['hill', .5, .86, 3.2, 'b'], ['fog', .7, .58, 1.6], ['flag', .22, .82, .9], ['tree', .86, .84, .8, 'c']],
    beats: [
      { label: 'At the top', readout: 'The ground slopes down to the left. That is all the walker knows.', action: 'Feel the slope' },
      { label: 'One step down', readout: 'The walker moves left. The slope is gentler here.', action: 'Take another step' },
      { label: 'The valley floor', readout: 'The ground is flat. No direction is downhill any more.', action: 'Stop here', hl: [2] }
    ]
  });

  add('learning-rate', {
    hue: 150, setting: 'The same hill, three strides', actor: 'person', actorName: 'walker', path: 'hill',
    tryText: 'Drag the walker down the hill and compare small, huge and steady strides.',
    notice: 'A tiny stride is safe but slow. A huge stride can jump past the valley and climb the other side.',
    props: [['hill', .5, .86, 3.2, 'b'], ['flag', .2, .82, .9], ['tree', .88, .84, .8, 'c'], ['sign', .62, .78, .8]],
    beats: [
      { label: 'Tiny shuffles', readout: "The walker moves a hand's width. Safe, but the valley is far.", action: 'Take tiny steps' },
      { label: 'One giant stride', readout: 'The walker flies over the valley and lands on the far slope.', action: 'Leap', hl: [1] },
      { label: 'A steady stride', readout: 'The walker reaches the valley in a few comfortable steps.', action: 'Walk it' }
    ]
  });

  add('feature-scaling', {
    hue: 275, setting: 'Two knobs on the same machine', actor: 'dial', actorName: 'hand',
    tryText: 'Drag the hand between the two knobs and turn each one.',
    notice: 'One small turn changes the room by a degree; the other changes it by a hundred. A single hand cannot tune both.',
    props: [['machine', .3, .84, 1.3], ['machine', .7, .84, 1.3, 'b'], ['sign', .5, .78, .9, 'c'], ['card', .5, .84, .7, 'b']],
    beats: [
      { label: 'The temperature knob', readout: 'A quarter turn warms the room by one degree.', action: 'Turn it gently', hl: [0] },
      { label: 'The volume knob', readout: 'A quarter turn makes the sound a hundred times louder.', action: 'Barely touch it', hl: [1] },
      { label: 'Both at once', readout: 'The same hand movement does nothing to one and everything to the other.', action: 'Try both', hl: [2] }
    ]
  });

  add('logistic-model', {
    hue: 45, setting: 'The dimmer switch by the door', actor: 'dial', actorName: 'dimmer',
    tryText: 'Drag the dimmer from off to full and watch the light bend.',
    notice: 'The light does not jump from off to on. It bends at both ends and changes most in the middle.',
    props: [['lamp', .62, .84, 1.3], ['machine', .28, .84, 1.2, 'b'], ['card', .82, .82, .7, 'c'], ['sun', .9, .2, .5, 'b']],
    beats: [
      { label: 'Off', readout: 'The room is dark. A tiny turn barely changes it.', action: 'Turn a little', hl: [0] },
      { label: 'Half light', readout: 'The middle of the turn changes the light the most.', action: 'Turn halfway' },
      { label: 'Full light', readout: 'Near the top, another turn adds almost nothing.', action: 'Turn to full', hl: [0] }
    ]
  });

  add('decision-boundary', {
    hue: 120, setting: 'The fence between two flocks', actor: 'token', actorName: 'fence post',
    tryText: 'Drag the fence post across the field and change its bend.',
    notice: 'The fence can be straight, tilted or curved. Its place decides which animals end up together.',
    props: [['fence', .5, .84, 1.6], ['person', .2, .84, .7, 'b'], ['person', .3, .84, .7, 'c'], ['person', .7, .84, .7, 'b'], ['person', .8, .84, .7, 'c'], ['tree', .9, .84, .8]],
    beats: [
      { label: 'A straight fence', readout: 'Two black sheep sit on the white side.', action: 'Move the fence', hl: [0] },
      { label: 'A tilted fence', readout: 'The tilt lets one sheep through and keeps the other out.', action: 'Tilt it' },
      { label: 'A curved fence', readout: 'The bend wraps around the flock without splitting it.', action: 'Bend it', hl: [0] }
    ]
  });

  add('thresholds', {
    hue: 200, setting: 'The turnstile at the station', actor: 'ticket', actorName: 'ticket',
    tryText: 'Drag the ticket through the gate, then lower and raise the bar.',
    notice: 'Lower the bar and more people enter, including some without a valid ticket. Raise it and the queue waits.',
    props: [['gate', .62, .84, 1.4], ['queue', .2, .84, .9], ['ticket', .8, .82, .8, 'b'], ['sign', .5, .78, .8, 'c']],
    beats: [
      { label: 'A high bar', readout: 'Only the best tickets open the gate. The queue grows.', action: 'Raise the bar', hl: [0] },
      { label: 'A low bar', readout: 'Almost everyone enters, including a few without a ticket.', action: 'Lower the bar', hl: [1] },
      { label: 'The right bar', readout: 'Valid tickets pass and the rest are politely turned away.', action: 'Set the bar' }
    ]
  });

  add('log-loss', {
    hue: 355, setting: 'The penalty meter at the fair', actor: 'coin', actorName: 'coin',
    tryText: 'Drag the coin from a cautious guess to a confident one.',
    notice: 'A confident wrong answer is charged far more than a cautious one. The meter never forgives certainty.',
    meter: { max: 100 },
    props: [['machine', .6, .84, 1.4], ['sign', .3, .82, .9, 'c'], ['card', .82, .8, .7, 'b'], ['star', .14, .7, .6]],
    beats: [
      { label: 'A cautious wrong guess', readout: 'The guess is unsure. The meter charges a little.', action: 'Make a guess', value: 12 },
      { label: 'A confident wrong guess', readout: 'The guess is sure and wrong. The meter climbs fast.', action: 'Sound certain', value: 55, hl: [0] },
      { label: 'A certain wrong guess', readout: 'The guess is beyond doubt and still wrong. The charge is huge.', action: 'Double down', value: 98, hl: [0] }
    ]
  });

  add('neurons', {
    hue: 260, setting: 'The committee around a table', actor: 'token', actorName: 'vote',
    tryText: 'Carry the vote from adviser to adviser, then let the chair decide.',
    notice: 'Each adviser speaks with a different amount of trust. The chair adds the trusted votes, not the loudest one.',
    props: [['table', .55, .86, 1.8], ['person', .22, .84, .8, 'b'], ['person', .5, .84, .8, 'c'], ['person', .78, .84, .8, 'b'], ['chair', .9, .84, .8], ['card', .55, .8, .7, 'c']],
    beats: [
      { label: 'Three opinions', readout: 'One says yes, one says no, one is unsure.', action: 'Ask the table', hl: [1, 2, 3] },
      { label: 'Trusted voices', readout: 'The middle adviser is trusted twice as much, so the vote shifts.', action: 'Weigh the votes', hl: [2, 5] },
      { label: 'The chair decides', readout: 'The chair adds the trusted votes and announces one answer.', action: 'Announce it', hl: [4] }
    ]
  });

  add('forward-pass', {
    hue: 30, setting: 'The factory line', actor: 'tray', actorName: 'tray',
    tryText: 'Push the tray from the first station to the last.',
    notice: 'Material enters raw and leaves stamped. Each station changes it once and passes it on.',
    props: [['machine', .28, .84, 1.2], ['machine', .52, .84, 1.2, 'b'], ['machine', .76, .84, 1.2, 'c'], ['box', .9, .82, .7, 'b'], ['sign', .08, .8, .7, 'c']],
    beats: [
      { label: 'Raw material', readout: 'A plain sheet enters at the left.', action: 'Load the line', hl: [0] },
      { label: 'Station two', readout: 'The sheet is shaped, then handed on without going back.', action: 'Pass it on', hl: [1] },
      { label: 'The stamp', readout: 'The last station stamps the finished product.', action: 'Stamp it', hl: [2, 3] }
    ]
  });

  add('backprop', {
    hue: 25, setting: 'The kitchen brigade', actor: 'tray', actorName: 'plate',
    tryText: 'Carry the cold plate back down the line, station by station.',
    notice: 'Blame travels backward from the pass to the grill. Each station keeps only its share.',
    props: [['machine', .24, .84, 1.1, 'b'], ['machine', .48, .84, 1.1, 'c'], ['machine', .72, .84, 1.1], ['person', .88, .84, .8], ['sign', .1, .8, .7, 'b']],
    beats: [
      { label: 'The cold dish', readout: 'The plate comes back cold from the pass.', action: 'Send it back', hl: [3] },
      { label: 'The sauce station', readout: 'The sauce waited too long. The blame moves one station back.', action: 'Trace the delay', hl: [2] },
      { label: 'The grill', readout: 'The grill started late. It gets the correction and the next plate is hot.', action: 'Fix the grill', hl: [1] }
    ]
  });

  add('training-network', {
    hue: 285, setting: 'The sound desk with a hundred knobs', actor: 'dial', actorName: 'hand',
    tryText: 'Drag the hand across the desk and turn a few knobs between listens.',
    notice: 'One pass tells you a little. Each new listen and turn nudges many knobs at once, a little at a time.',
    props: [['machine', .22, .84, 1], ['machine', .38, .84, 1, 'b'], ['machine', .54, .84, 1, 'c'], ['machine', .7, .84, 1, 'b'], ['machine', .86, .84, 1, 'c'], ['sign', .5, .78, .8], ['card', .5, .84, .6, 'b']],
    beats: [
      { label: 'Too many knobs', readout: 'No single knob fixes the mix. The whole desk matters.', action: 'Touch a knob', hl: [0, 1, 2, 3, 4] },
      { label: 'Listen', readout: 'The mix is muddy in the middle and thin at the top.', action: 'Listen closely' },
      { label: 'Turn and listen again', readout: 'Every knob moves a little. The next pass sounds closer.', action: 'Adjust the desk', hl: [5] }
    ]
  });

  add('depth', {
    hue: 315, setting: 'Committees of committees', actor: 'card', actorName: 'answer card',
    tryText: 'Pass the answer card from the first committee to the last.',
    notice: 'The first committee answers simple questions. The next reads those answers and settles questions about them.',
    props: [['table', .2, .84, 1], ['table', .5, .84, 1, 'b'], ['table', .8, .84, 1, 'c'], ['person', .2, .84, .6, 'b'], ['person', .5, .84, .6, 'c'], ['person', .8, .84, .6, 'b'], ['network', .5, .6, .8, 'b']],
    beats: [
      { label: 'The first committee', readout: 'It answers three simple questions.', action: 'Collect answers', hl: [0, 3] },
      { label: 'The second committee', readout: 'It reads the answers and asks what they mean together.', action: 'Pass the card', hl: [1, 4] },
      { label: 'The last table', readout: 'A final committee settles the answer the others could not.', action: 'Announce it', hl: [2, 5] }
    ]
  });

  add('twenty-questions', {
    hue: 200, setting: 'Twenty questions in the living room', actor: 'card', actorName: 'question card',
    tryText: 'Drag the question card from broad to narrow.',
    notice: 'A question that halves the possibilities is worth far more than one that barely dents them.',
    props: [['tree', .84, .84, .9, 'b'], ['card', .5, .84, 1.1, 'c'], ['star', .2, .65, .7], ['person', .12, .84, .8], ['sign', .5, .78, .8, 'b']],
    beats: [
      { label: 'A broad question', readout: 'Is it alive? Half the room disappears.', action: 'Ask it', hl: [1] },
      { label: 'A narrow question', readout: 'Does it fly? The remaining group barely shrinks.', action: 'Ask again' },
      { label: 'The answer', readout: 'It is a bat. The good questions found it in three.', action: 'Name it', hl: [2] }
    ]
  });

  add('entropy', {
    hue: 50, setting: 'Two wrapped presents', actor: 'box', actorName: 'present',
    tryText: 'Move the present from the certain box to the surprising one.',
    notice: 'A present you already recognise tells you little. The one that could be anything tells you a lot.',
    props: [['box', .28, .84, 1.2, 'b'], ['box', .7, .84, 1.2, 'c'], ['star', .7, .62, .7], ['table', .5, .88, 1.8], ['sign', .5, .78, .8]],
    beats: [
      { label: 'Almost certain', readout: 'The box always holds socks. Opening it is no surprise.', action: 'Open it', hl: [0] },
      { label: 'Either way', readout: 'This box holds a ball or a book. You cannot tell which.', action: 'Shake it', hl: [1] },
      { label: 'A real surprise', readout: 'It holds a kite. The answer told you the most.', action: 'Open the second', hl: [2] }
    ]
  });

  add('id3', {
    hue: 160, setting: 'The interviewer with a clipboard', actor: 'card', actorName: 'clipboard',
    tryText: 'Carry the clipboard from the whole group to one small group.',
    notice: 'Ask the question that separates the group most cleanly, then repeat inside each new group.',
    props: [['table', .5, .86, 1.7], ['person', .18, .84, .7, 'b'], ['person', .34, .84, .7, 'c'], ['person', .66, .84, .7, 'b'], ['person', .82, .84, .7, 'c'], ['card', .5, .82, .7]],
    beats: [
      { label: 'The whole group', readout: 'Four candidates, two answers, no order yet.', action: 'Look at the group', hl: [1, 2, 3, 4] },
      { label: 'The cleanest question', readout: 'One question puts each candidate on the right side.', action: 'Ask it', hl: [5] },
      { label: 'Ask again inside', readout: 'Each side gets its own next question. The tree grows.', action: 'Split again' }
    ]
  });

  add('c45', {
    hue: 275, setting: 'The tree with too many branches', actor: 'card', actorName: 'branch card',
    tryText: 'Drag the card along the branches, then trim the smallest ones.',
    notice: 'A question with a thousand answers leaves tiny groups that look tidy. The tidy groups cost too much to trust.',
    props: [['tree', .5, .86, 1.4, 'b'], ['network', .5, .62, 1, 'c'], ['card', .2, .84, .7], ['box', .82, .84, .7, 'b'], ['sign', .5, .78, .8]],
    beats: [
      { label: 'A thousand branches', readout: 'Every answer gets its own twig, most with one leaf.', action: 'Count the branches', hl: [1] },
      { label: 'Each twig looks tidy', readout: 'Pure little groups, but the question told you almost nothing.', action: 'Look closer' },
      { label: 'The price of branching', readout: 'The tiny twigs are trimmed. A simpler question survives.', action: 'Trim the tree', hl: [0] }
    ]
  });

  add('cart', {
    hue: 345, setting: 'Two jars of marbles', actor: 'ball', actorName: 'marble',
    tryText: 'Drop the marble from the mixed jar into one of the pure jars.',
    notice: 'A split is good when the child jars are purer than the parent. Count the colours, not the marbles.',
    props: [['jar', .25, .84, 1.3], ['jar', .55, .84, 1.3, 'b'], ['jar', .82, .84, 1.3, 'c'], ['table', .5, .88, 1.9], ['sign', .5, .78, .8]],
    beats: [
      { label: 'The mixed jar', readout: 'Red and blue together. Any draw is a guess.', action: 'Reach in', hl: [0] },
      { label: 'Two pure jars', readout: 'One jar is all red, the other all blue. A draw is certain.', action: 'Sort them', hl: [1, 2] },
      { label: 'A good split', readout: 'The children are purer than the parent. That is the whole test.', action: 'Check the split' }
    ]
  });

  add('bagging', {
    hue: 210, setting: 'The panel of five experts', actor: 'card', actorName: 'ballot',
    tryText: 'Collect a ballot from each expert and count the votes.',
    notice: 'Each expert saw a different sample. Their separate mistakes cancel when the majority speaks.',
    props: [['table', .5, .86, 1.8], ['person', .16, .84, .65, 'b'], ['person', .33, .84, .65, 'c'], ['person', .5, .84, .65, 'b'], ['person', .67, .84, .65, 'c'], ['person', .84, .84, .65, 'b'], ['card', .5, .8, .7]],
    beats: [
      { label: 'One expert', readout: 'One expert has a favourite answer and a favourite mistake.', action: 'Ask one', hl: [1] },
      { label: 'Five samples', readout: 'Each expert saw different cases, so they disagree in different places.', action: 'Collect ballots', hl: [2, 3, 4, 5] },
      { label: 'The majority', readout: 'Three votes agree. The single mistakes are outvoted.', action: 'Count votes', hl: [6] }
    ]
  });

  add('boosting', {
    hue: 20, setting: 'The coach at practice', actor: 'token', actorName: 'whistle',
    tryText: 'Drag the whistle to the spot where the team keeps missing.',
    notice: 'Each session is spent on the last mistakes. The team improves where it was weakest, not where it was already good.',
    props: [['person', .3, .84, .8], ['person', .5, .84, .8, 'b'], ['person', .7, .84, .8, 'c'], ['target', .84, .84, .8], ['flag', .12, .82, .8], ['sign', .5, .78, .8]],
    beats: [
      { label: 'The team misses left', readout: 'Every shot drifts to the same side.', action: 'Mark the miss', hl: [0] },
      { label: 'Drill the miss', readout: 'The next session practises only the left side.', action: 'Run the drill', hl: [1, 2, 3] },
      { label: 'A new weakness', readout: 'The left improves. The next session moves to the new miss.', action: 'Set the next drill', hl: [3] }
    ]
  });

  add('csp', {
    hue: 330, setting: 'The wedding seating chart', actor: 'card', actorName: 'place card',
    tryText: 'Move the place card from table to table until no rule is broken.',
    notice: 'Every guest needs one seat. The rules are fixed; the order you fill the chairs is not.',
    props: [['table', .25, .86, 1.4], ['table', .55, .86, 1.4, 'b'], ['table', .84, .86, 1.4, 'c'], ['person', .16, .84, .6], ['person', .34, .84, .6, 'b'], ['person', .48, .84, .6, 'b'], ['person', .62, .84, .6, 'c'], ['sign', .5, .76, .7]],
    beats: [
      { label: 'Seat Ana', readout: 'Ana takes the first chair at table one.', action: 'Place her', hl: [0] },
      { label: 'A rule breaks', readout: 'Ben sits down beside Ana, but those two cannot share a table.', action: 'Move Ben', hl: [3, 4] },
      { label: 'A valid chart', readout: 'Every guest is seated and every rule holds.', action: 'Check the chart', hl: [1, 2] }
    ]
  });

  add('backtracking', {
    hue: 190, setting: 'The maze with a piece of chalk', actor: 'token', actorName: 'chalk',
    tryText: 'Walk the chalk through the maze and back out of the dead end.',
    notice: 'The chalk marks the way. At a dead end you return to the last junction, not to the start.',
    props: [['network', .52, .84, 1.5, 'b'], ['card', .2, .84, .7], ['flag', .84, .82, .8], ['sign', .5, .76, .7, 'c']],
    beats: [
      { label: 'Mark the path', readout: 'The chalk moves forward along the only open turn.', action: 'Walk on', hl: [0] },
      { label: 'A dead end', readout: 'The corridor stops. This way cannot work.', action: 'Look around', hl: [2] },
      { label: 'Back to the junction', readout: 'The chalk returns one junction and takes the other turn.', action: 'Back up', hl: [1] }
    ]
  });

  add('propagation', {
    hue: 25, setting: 'A line of dominoes on a table', actor: 'card', actorName: 'first tile',
    tryText: 'Tip the first tile and watch the neighbours lose their choices.',
    notice: 'One fixed value knocks options out of every neighbour, and those neighbours knock out more.',
    props: [['table', .5, .86, 1.8], ['card', .2, .84, .6, 'b'], ['card', .38, .84, .6, 'c'], ['card', .56, .84, .6, 'b'], ['card', .74, .84, .6, 'c'], ['network', .5, .58, 1, 'b']],
    beats: [
      { label: 'One value fixed', readout: 'The first tile falls and shows a single colour.', action: 'Tip it', hl: [1] },
      { label: 'Neighbours lose options', readout: 'The next two tiles can no longer use that colour.', action: 'Watch them fall', hl: [2, 3] },
      { label: 'The line settles', readout: 'Every tile has one option left. The puzzle is solved by elimination.', action: 'See the result', hl: [4] }    ]
  });

  add('local-search', {
    hue: 265, setting: 'Rearranging chairs in the hall', actor: 'token', actorName: 'chair',
    tryText: 'Move the chair of the loudest complainer, one move at a time.',
    notice: 'The room does not need a perfect plan. Find the worst complaint, fix it, and repeat.',
    props: [['chair', .22, .84, .9], ['chair', .42, .84, .9, 'b'], ['chair', .62, .84, .9, 'c'], ['chair', .82, .84, .9, 'b'], ['person', .12, .84, .6], ['person', .72, .84, .6, 'c'], ['sign', .5, .76, .7, 'b']],
    beats: [
      { label: 'Everyone sits anywhere', readout: 'The room is full and three people are complaining.', action: 'Listen', hl: [4, 5] },
      { label: 'Move the loudest', readout: 'One guest moves to the empty corner. Two complaints remain.', action: 'Move them', hl: [3] },
      { label: 'The room settles', readout: 'The last move leaves nobody with a complaint.', action: 'Stop moving' }
    ]
  });

  add('csp-modelling', {
    hue: 120, setting: 'Writing the rules of a board game', actor: 'book', actorName: 'rulebook',
    tryText: 'Drag the rulebook over the board and check each rule.',
    notice: 'Leave a rule out and players cheat. Add one too many and nobody can move.',
    props: [['board', .5, .86, 1.4], ['book', .22, .84, 1], ['die', .78, .84, .9, 'b'], ['sign', .5, .76, .8, 'c'], ['star', .8, .6, .6, 'b']],
    beats: [
      { label: 'Three rules', readout: 'Every move is allowed, blocked, or scored.', action: 'Read them', hl: [1] },
      { label: 'A rule is missing', readout: 'Two players find a move nobody expected.', action: 'Add the rule', hl: [2] },
      { label: 'The game works', readout: 'Every move has an answer and no move is impossible.', action: 'Play a turn', hl: [0] }
    ]
  });

  add('probability', {
    hue: 210, setting: 'The weather forecast on the radio', actor: 'cloud', actorName: 'cloud', path: 'arc',
    tryText: 'Float the cloud over the town and read the forecast at each stop.',
    notice: 'Thirty percent means three days in ten like this. It does not mean the rain will be three-tenths as heavy.',
    props: [['sun', .82, .34, .9, 'b'], ['umbrella', .2, .84, 1], ['sign', .5, .8, .8, 'c'], ['house', .5, .84, 1.1, 'b']],
    beats: [
      { label: 'Three days in ten', readout: 'Similar days rain three times out of ten. Tomorrow is one of them.', action: 'Read the forecast' },
      { label: 'Not a puddle size', readout: 'The number says how often, not how hard the rain falls.', action: 'Check the gauge' },
      { label: 'Plan for the day', readout: 'Take the umbrella. It is a bet on many similar days, not a promise.', action: 'Take the umbrella', hl: [1] }
    ]
  });

  add('conditional', {
    hue: 195, setting: 'The smaller room inside the house', actor: 'lamp', actorName: 'lamp',
    tryText: 'Carry the lamp from the whole house into the one small room.',
    notice: 'Once you are told the event happened, the world shrinks. You measure only inside the smaller room.',
    props: [['house', .35, .84, 1.5], ['table', .68, .84, 1], ['card', .7, .82, .6, 'b'], ['gate', .83, .84, .8, 'c']],
    beats: [
      { label: 'The whole house', readout: 'Every room is possible. The lamp lights all of them.', action: 'Look around', hl: [0] },
      { label: 'The smaller room', readout: 'Someone says the cat is in this room. The rest of the house is now irrelevant.', action: 'Step inside', hl: [3] },
      { label: 'Measure inside', readout: 'Only the small room counts, so the chance changes.', action: 'Search the room', hl: [1] }
    ]
  });

  add('bayes-rule', {
    hue: 35, setting: 'The library with one crime shelf', actor: 'book', actorName: 'book',
    tryText: 'Carry the book from the tall shelves to the single shelf.',
    notice: 'Most books are elsewhere. Even a reliable witness leaves the crime shelf small compared with the whole library.',
    props: [['shelf', .22, .84, 1.3], ['shelf', .5, .84, 1.3, 'b'], ['shelf', .8, .84, 1.3, 'c'], ['magnifier', .62, .82, .9], ['sign', .5, .76, .7]],
    beats: [
      { label: 'The whole library', readout: 'Thousands of books, and only one small crime shelf.', action: 'Look at the shelves', hl: [0, 1, 2] },
      { label: 'The witness speaks', readout: 'A reliable witness says the book came from the crime shelf.', action: 'Follow the witness', hl: [3] },
      { label: 'The shelf is still small', readout: 'The shelf is more likely now, but the rest of the library still matters.', action: 'Weigh the shelf' }
    ]
  });

  add('bayes-nets', {
    hue: 300, setting: 'The rumour in the village', actor: 'card', actorName: 'rumour',
    tryText: 'Pass the rumour through the network and see who hears it.',
    notice: 'You hear the rumour from two friends. That tells you something about the people between you and the source.',
    props: [['network', .5, .84, 1.6, 'b'], ['person', .16, .84, .6], ['person', .84, .84, .6, 'c'], ['sign', .5, .76, .7]],
    beats: [
      { label: 'One person starts it', readout: 'A rumour begins at the bakery.', action: 'Start it', hl: [1] },
      { label: 'Two friends pass it on', readout: 'The baker tells two neighbours, who tell two more.', action: 'Pass it on', hl: [0] },
      { label: 'You hear it twice', readout: 'Both friends tell you. The source is probably close.', action: 'Trace it back', hl: [2] }
    ]
  });

  add('bayes-inference', {
    hue: 15, setting: 'The evidence ledger on the desk', actor: 'magnifier', actorName: 'magnifier',
    tryText: 'Drag the magnifier down the ledger and keep only the rows that match.',
    notice: 'Every way the evidence could happen gets a row. The rows that match are added; the rest are set aside.',
    props: [['notebook', .4, .84, 1.6], ['alarm', .82, .84, .9, 'b'], ['table', .5, .88, 1.9], ['lamp', .16, .84, .9, 'c']],
    beats: [
      { label: 'The alarm rang', readout: 'The evidence is one line: the alarm rang.', action: 'Open the ledger', hl: [0] },
      { label: 'Only matching rows', readout: 'Burglary and no burglary both have rows. Keep the ones where the alarm rang.', action: 'Cross out rows', hl: [1] },
      { label: 'Weight what remains', readout: 'The remaining rows add up. The answer is a share of the whole ledger.', action: 'Add the rows' }
    ]
  });

  add('explaining-away', {
    hue: 345, setting: 'Two excuses for one lateness', actor: 'umbrella', actorName: 'umbrella',
    tryText: 'Move the umbrella from the traffic story to the cancelled train.',
    notice: 'The train already explains the lateness, so traffic becomes less necessary. One excuse can push out the other.',
    props: [['car', .22, .84, 1], ['machine', .55, .84, 1, 'b'], ['sign', .82, .82, .8, 'c'], ['card', .42, .82, .6, 'b']],
    beats: [
      { label: 'Late again', readout: 'The colleague arrives twenty minutes late. Traffic is plausible.', action: 'Guess traffic', hl: [0] },
      { label: 'Then the train', readout: 'The colleague mentions a cancelled train.', action: 'Mention the train', hl: [1] },
      { label: 'Traffic fades', readout: 'The train explains the lateness, so traffic is no longer needed.', action: 'Drop traffic', hl: [3] }
    ]
  });

  add('state', {
    hue: 220, setting: 'The photograph of the room', actor: 'camera', actorName: 'camera',
    tryText: 'Pan the camera around the room and notice what it cannot capture.',
    notice: 'A photo records where things are. It cannot show what is in your pocket or how much battery is left.',
    props: [['house', .35, .84, 1.4], ['table', .7, .84, 1], ['card', .7, .82, .6, 'b'], ['machine', .88, .84, .8, 'c'], ['lamp', .16, .84, .8]],
    beats: [
      { label: 'The room', readout: 'The photo shows the table, the lamp and the door.', action: 'Take the photo', hl: [0, 1, 4] },
      { label: 'What is missing', readout: 'The photo cannot show the key in your pocket or the battery in your bag.', action: 'Check your pockets', hl: [3] },
      { label: 'The whole picture', readout: 'Room, pockets and battery together. Only then can you plan the next move.', action: 'Write it down' }
    ]
  });

  add('state-space', {
    hue: 150, setting: 'The map of all the places', actor: 'token', actorName: 'pin',
    tryText: 'Move the pin from town to town along the roads.',
    notice: 'Every place is a dot and every road is a line. A route is a path through the dots.',
    props: [['network', .5, .84, 1.7, 'b'], ['road', .5, .9, 1.4, 'c'], ['house', .14, .84, .7], ['house', .86, .84, .7, 'c'], ['flag', .5, .62, .7]],
    beats: [
      { label: 'Places become dots', readout: 'The bakery, the station and the school are three dots.', action: 'Mark the places', hl: [0, 2, 3] },
      { label: 'Roads become lines', readout: 'The road from the bakery to the station is one line.', action: 'Draw the roads', hl: [1] },
      { label: 'A path', readout: 'Bakery, station, school. Three dots joined in order.', action: 'Trace the route', hl: [4] }
    ]
  });

  add('modelling-grid', {
    hue: 30, setting: 'Packing the car for a trip', actor: 'car', actorName: 'car',
    tryText: 'Drive the car from home to the fuel station with the parcels aboard.',
    notice: 'The fuel gauge, the parcels and the road are all part of the situation. A plan that forgets one runs dry.',
    props: [['house', .14, .84, 1], ['machine', .82, .84, 1, 'b'], ['box', .5, .84, .7, 'c'], ['box', .62, .84, .6, 'b'], ['sign', .5, .78, .7]],
    beats: [
      { label: 'Half a tank', readout: 'The gauge says half. The next station is far.', action: 'Check the gauge', hl: [1] },
      { label: 'A parcel aboard', readout: 'The boot is full. The car uses more fuel on the hills.', action: 'Load the parcel', hl: [2, 3] },
      { label: 'Refuel', readout: 'The station fills the tank. The trip can continue.', action: 'Fill up', hl: [1] }
    ]
  });

  add('implicit-graph', {
    hue: 40, setting: 'The cookbook, not the meals', actor: 'token', actorName: 'wooden spoon',
    tryText: 'Drag the spoon from the recipe to the pot, then to the table.',
    notice: 'The book holds rules, not every dinner. The same rules can make many different meals.',
    props: [['book', .2, .84, 1.2], ['pot', .5, .84, 1.2, 'b'], ['table', .8, .84, 1.2], ['cake', .8, .82, .7], ['box', .35, .84, .6, 'c']],
    beats: [
      { label: 'The recipe', readout: 'A page lists ingredients and steps, not a finished dinner.', action: 'Read it', hl: [0] },
      { label: 'A dinner appears', readout: 'Follow the steps and one meal exists that did not before.', action: 'Cook it', hl: [1] },
      { label: 'Many dinners', readout: 'Change one ingredient and the same rules make a different meal.', action: 'Try another', hl: [3] }
    ]
  });

  add('framework', {
    hue: 260, setting: 'The ticket desk at the station', actor: 'ticket', actorName: 'ticket',
    tryText: 'Take a ticket from the queue and choose who the clerk serves next.',
    notice: 'The queue is the same; the rule at the desk decides who steps forward. First come, shortest job and urgent all differ.',
    props: [['queue', .2, .84, 1], ['table', .6, .84, 1.2], ['person', .6, .84, .8, 'b'], ['sign', .82, .82, .8, 'c'], ['card', .4, .82, .6]],
    beats: [
      { label: 'First come, first served', readout: 'The person at the front steps up, however long their form.', action: 'Call the front', hl: [0] },
      { label: 'Shortest job first', readout: 'The quick ticket jumps ahead. The long form waits.', action: 'Call the quick one', hl: [4] },
      { label: 'The urgent ticket', readout: 'A red ticket jumps the queue. The policy changed the answer.', action: 'Call the urgent', hl: [3] }
    ]
  });

  add('bfs', {
    hue: 195, setting: 'The ripple in the pond', actor: 'stone', actorName: 'stone',
    tryText: 'Drop the stone and drag it across the pond as the rings spread.',
    notice: 'The ripple reaches everything one ring away before anything two rings away. It never skips a ring.',
    props: [['ripple', .5, .84, 1.8], ['star', .84, .6, .8, 'b'], ['tree', .12, .84, .8], ['sign', .5, .76, .7, 'c']],
    beats: [
      { label: 'The stone lands', readout: 'One ring leaves the stone and touches the nearest reeds.', action: 'Drop the stone', at: .5, hl: [0] },
      { label: 'The first ring', readout: 'Everything one ring away is wet before the next ring starts.', action: 'Follow ring one', at: .5 },
      { label: 'The second ring', readout: 'The frog two rings away feels the water last.', action: 'Follow ring two', at: .5, hl: [1] }
    ]
  });

  add('ucs', {
    hue: 25, setting: 'The toll roads between towns', actor: 'car', actorName: 'car',
    tryText: 'Drive the car along the cheap road, then compare it with the fast one.',
    notice: 'The list keeps trips sorted by what they have cost so far. The cheapest unfinished trip goes next.',
    props: [['road', .5, .88, 1.6], ['gate', .3, .84, .8], ['gate', .72, .84, .8, 'b'], ['coin', .5, .82, .8, 'c'], ['house', .86, .84, .7]],
    beats: [
      { label: 'The cheap road', readout: 'Two coins so far. The other road already costs five.', action: 'Take the cheap road', hl: [1] },
      { label: 'The expensive road', readout: 'The fast road is shorter but the toll is higher.', action: 'Compare the tolls', hl: [2] },
      { label: 'The cheapest trip', readout: 'The long cheap route wins. Cost, not distance, decides.', action: 'Arrive', hl: [3] }
    ]
  });

  add('astar', {
    hue: 120, setting: 'The hike with a pub rumour', actor: 'person', actorName: 'hiker',
    tryText: 'Walk from village to village and listen to the rumour at each sign.',
    notice: 'Each choice adds the road already walked to the rumour of the road ahead. The smallest total wins.',
    props: [['hill', .5, .86, 3, 'b'], ['house', .2, .84, .8], ['house', .82, .84, .8, 'c'], ['sign', .55, .8, .8], ['tree', .9, .84, .7]],
    beats: [
      { label: 'Two miles walked', readout: 'The hiker has walked two miles to this village.', action: 'Check the sign', hl: [3] },
      { label: 'One mile to the pub', readout: 'A rumour says the pub is one mile on. The total is three.', action: 'Believe the rumour' },
      { label: 'Choose the lower total', readout: 'The other road is shorter on foot but the rumour is worse.', action: 'Take the path', hl: [1] }
    ]
  });

  add('heuristics', {
    hue: 90, setting: 'The optimistic signpost', actor: 'sign', actorName: 'signpost',
    tryText: 'Tilt the signpost between an optimistic and a pessimistic rumour.',
    notice: 'A rumour that says the pub is closer than it is makes you confident. A rumour that never overestimates keeps you honest.',
    props: [['house', .8, .84, .9, 'b'], ['tree', .18, .84, .8], ['person', .52, .84, .8, 'c'], ['hill', .5, .88, 2.6, 'b']],
    beats: [
      { label: 'Optimistic rumour', readout: 'The sign says one mile. The pub is really three.', action: 'Follow it', hl: [1] },
      { label: 'Pessimistic rumour', readout: 'The sign says five miles. You nearly give up.', action: 'Read again' },
      { label: 'An honest guess', readout: 'The sign never promises less than the true distance.', action: 'Trust this one', hl: [2] }
    ]
  });

  add('race', {
    hue: 280, setting: 'Three couriers on the same streets', actor: 'car', actorName: 'courier',
    tryText: 'Move the courier between the three coloured routes.',
    notice: 'The ring courier, the cheapest courier and the rumour courier all reach the same door by different rules.',
    props: [['road', .5, .88, 1.7], ['flag', .88, .82, .9], ['car', .3, .84, .7, 'b'], ['car', .52, .84, .7, 'c'], ['car', .72, .84, .7]],
    beats: [
      { label: 'The ring courier', readout: 'This one takes every street in rings, near before far.', action: 'Ride along', hl: [2] },
      { label: 'The cheapest courier', readout: 'This one always finishes the cheapest trip first.', action: 'Compare fares', hl: [3] },
      { label: 'The rumour courier', readout: 'This one listens to guesses about the door and still arrives.', action: 'Follow the rumour', hl: [4] }
    ]
  });

  add('syntax', {
    hue: 230, setting: 'The grammar of a language', actor: 'card', actorName: 'sentence card',
    tryText: 'Slide the sentence card through the grammar arch, then ask whether it is true.',
    notice: 'A sentence can be the right shape and still be false. Grammar is the shape, not the truth.',
    props: [['book', .2, .84, 1.1], ['card', .5, .84, 1.1, 'b'], ['sign', .8, .82, .8, 'c'], ['star', .65, .6, .6]],
    beats: [
      { label: 'The shape is right', readout: 'The words fit together. The sentence is grammatical.', action: 'Pass it through', hl: [1] },
      { label: 'The sentence is false', readout: 'The shape is fine, but the cat is not on the moon.', action: 'Check the facts', hl: [2] },
      { label: 'Shape, not truth', readout: 'Grammar lets the sentence in. It never promises the sentence is true.', action: 'Separate them', hl: [0] }
    ]
  });

  add('semantics', {
    hue: 350, setting: 'The courtroom', actor: 'gavel', actorName: 'gavel',
    tryText: 'Carry the gavel from the witness to the judge and read the verdict.',
    notice: 'Each fact is established or not. The judge combines the facts with the rules and reads one verdict.',
    props: [['table', .48, .86, 1.5], ['person', .28, .84, .8, 'b'], ['person', .7, .84, .8, 'c'], ['card', .5, .82, .7], ['sign', .5, .76, .7]],
    beats: [
      { label: 'The witness speaks', readout: 'One fact is established: the car was red.', action: 'Record it', hl: [1] },
      { label: 'Combine the facts', readout: 'The second fact says the car was not red. Both cannot stand.', action: 'Compare them', hl: [3] },
      { label: 'The verdict', readout: 'The judge applies the rule and reads a single verdict.', action: 'Read it', hl: [2] }
    ]
  });

  add('knowledge-bases', {
    hue: 45, setting: 'The notebook and the question', actor: 'magnifier', actorName: 'magnifier',
    tryText: 'Drag the magnifier from the facts to the rules to the query.',
    notice: 'An answer counts only if it holds in every consistent reading of the notebook.',
    props: [['notebook', .3, .84, 1.3], ['book', .68, .84, 1.1, 'b'], ['card', .84, .82, .7, 'c'], ['lamp', .12, .84, .8], ['table', .5, .88, 1.8]],
    beats: [
      { label: 'Facts on the left', readout: 'The notebook records what is known.', action: 'Read the facts', hl: [0] },
      { label: 'Rules on the right', readout: 'The rulebook turns facts into new facts.', action: 'Apply a rule', hl: [1] },
      { label: 'The question is answered', readout: 'The answer is true in every reading that fits the notebook.', action: 'Answer the question', hl: [2] }
    ]
  });

  add('resolution', {
    hue: 15, setting: 'Two witnesses who cannot both be right', actor: 'car', actorName: 'car',
    tryText: 'Move the car between the two witness statements.',
    notice: 'One says red, one says not red. Together they contradict, so at least one statement must give way.',
    props: [['person', .25, .84, .8, 'b'], ['person', .72, .84, .8, 'c'], ['card', .4, .82, .8], ['card', .6, .82, .8, 'b'], ['sign', .5, .76, .7]],
    beats: [
      { label: 'One says red', readout: 'The first witness is certain about the colour.', action: 'Hear the first', hl: [2] },
      { label: 'One says not red', readout: 'The second witness is just as certain of the opposite.', action: 'Hear the second', hl: [3] },
      { label: 'One claim gives way', readout: 'The two cannot both stand. Resolving the pair removes one.', action: 'Resolve them', hl: [4] }
    ]
  });

  add('chaining', {
    hue: 200, setting: 'The detective board', actor: 'magnifier', actorName: 'magnifier',
    tryText: 'Start at the evidence, then start again at the suspect.',
    notice: 'One direction grows from the evidence. The other grows back from the goal. They meet on the same board.',
    props: [['notebook', .2, .84, 1.1], ['network', .55, .82, 1.3, 'b'], ['card', .85, .82, .8, 'c'], ['flag', .5, .62, .7], ['table', .5, .88, 1.8]],
    beats: [
      { label: 'Start from the evidence', readout: 'The muddy boot implies a walk in the garden.', action: 'Follow it', hl: [0] },
      { label: 'Start from the suspect', readout: 'The suspect would need a reason to be in the garden.', action: 'Work backward', hl: [2] },
      { label: 'They meet', readout: 'Both chains reach the same fact. The case closes.', action: 'Close it', hl: [1] }
    ]
  });

  /* ALL SCENES ADDED */
})(window.AIM);
