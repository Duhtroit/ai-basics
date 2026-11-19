/* Playwright regression for navigation, deep links, widgets and layout.
   Tooling only, never part of the site. Install once:
     cd .verify && npm install playwright && npx playwright install chromium
   Run:
     node scripts/journey.mjs
   What it proves:
   1. A student can go from the cover to the Unit 11 synthesis and on to the
      exam using only links inside the page. Every step is checked against the
      expected lesson chain, so a dead end, a skipped lesson or an out-of-order
      link fails.
   2. Every lesson, concept and synthesis deep link still resolves after a
      reload, at 1440 and 390, and lands below the sticky header.
   3. Every widget survives interaction without clipped text, labels colliding,
      ink crossing its own frame, or the card changing size.
   4. Every surface in a page (prose, panels, scenes, labs, checks, tests)
      shares one column edge at each width.
   Exit code 0 means everything passed. Writes artifacts/journey.json. */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requestedPort = Number(process.env.PORT);
const port = String(Number.isFinite(requestedPort) && requestedPort > 0 ? requestedPort : 8125);
const base = `http://127.0.0.1:${port}/index.html`;
const artifacts = path.join(root, 'artifacts');
mkdirSync(artifacts, { recursive: true });

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  try {
    playwright = require(path.join(root, '.verify', 'node_modules', 'playwright'));
  } catch {
    console.error('Playwright is missing. Run: cd .verify && npm install playwright && npx playwright install chromium');
    process.exit(2);
  }
}
const { chromium } = playwright;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const notes = [];
const seen = { steps: 0, deepLinks: 0, widgets: 0, interactions: 0, layouts: 0 };
function note(msg) { notes.push(msg); console.log(msg); }
function fail(msg) { problems.push(msg); console.error('FAIL', msg); }

const server = spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let ready = false;
for (let i = 0; i < 50; i++) {
  try {
    const r = await fetch(base);
    if (r.ok) { ready = true; break; }
  } catch {}
  await sleep(100);
}
if (!ready) {
  server.kill('SIGTERM');
  console.error(`server did not start on ${port}`);
  process.exit(2);
}

const browser = await chromium.launch();

async function newPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') fail(`${width}px console: ${m.text()}`); });
  page.on('pageerror', e => fail(`${width}px pageerror: ${e.message}`));
  page.on('requestfailed', r => fail(`${width}px requestfailed: ${r.url()}`));
  page.on('response', r => { if (r.status() >= 400) fail(`${width}px HTTP ${r.status()}: ${r.url()}`); });
  return page;
}

async function settle(page, hash) {
  await page.waitForFunction(h => location.hash === h, hash, { timeout: 10000 }).catch(() => {});
  await sleep(120);
  const got = await page.evaluate(() => location.hash);
  if (got !== hash) fail(`expected ${hash}, landed on ${got}`);
  return got;
}

async function anchorTop(page, selector) {
  // The router scrolls after it renders, so wait for the target to settle
  // below the sticky header before measuring it.
  await page.waitForFunction(sel => {
    const e = document.querySelector(sel);
    if (!e) return false;
    const t = e.getBoundingClientRect().top;
    return t > 40 && t < 170;
  }, selector, { timeout: 5000 }).catch(() => {});
  const box = await page.locator(selector).first().boundingBox();
  return box ? Math.round(box.y) : null;
}

/* ---------- 1. the lesson chain, walked only by clicking ---------- */
async function walkChain(page) {
  await page.goto(base + '#/', { waitUntil: 'load' });
  await page.waitForSelector('.cover .btn');
  const chain = await page.evaluate(() => AIM.manifest.slice().sort((a, b) => a.n - b.n).map(u => ({
    n: u.n,
    title: u.title,
    concepts: u.concepts.map(c => ({ id: c.id, title: c.title }))
  })));
  if (chain.length !== 11) fail(`manifest has ${chain.length} units, expected 11`);
  const expected = [];
  for (const u of chain) {
    expected.push(`#/unit/${u.n}/lesson`);
    for (const c of u.concepts) expected.push(`#/unit/${u.n}/c/${c.id}`);
    expected.push(`#/unit/${u.n}/close`);
  }

  const cta = page.locator('.cover-actions a.btn').first();
  const ctaHref = await cta.getAttribute('href');
  if (ctaHref !== '#/unit/1') fail(`cover call to action points at ${ctaHref}, expected #/unit/1`);
  await cta.click();
  await settle(page, '#/unit/1');
  await page.waitForSelector('.unit-head');
  seen.steps++;

  // Unit 1 opens the lesson from its contents; every later lesson is reached
  // from the previous unit's synthesis link.
  const unitOneContents = await page.locator('.unit-contents a').evaluateAll(as => as.map(a => a.getAttribute('href')));
  const want = [`#/unit/1/lesson`, ...chain[0].concepts.map(c => `#/unit/1/c/${c.id}`), `#/unit/1/close`];
  if (unitOneContents.join('|') !== want.join('|')) fail(`unit 1 contents: expected ${want.length} ordered links, saw ${unitOneContents.join(' ')}`);
  await page.locator('.unit-contents a').first().click();
  await settle(page, expected[0]);

  for (let i = 0; i < expected.length; i++) {
    const hash = expected[i];
    const kind = hash.endsWith('/lesson') ? 'lesson' : hash.endsWith('/close') ? 'close' : 'concept';
    const selector = kind === 'lesson' ? '.lesson-intro' : kind === 'close' ? '.lesson-close' : `#c-${hash.split('/c/')[1]}`;
    await page.waitForSelector(selector);
    seen.steps++;
    const text = (await page.locator(selector).innerText()).trim();
    if (text.length < 200) fail(`${hash}: rendered only ${text.length} characters`);
    const top = await anchorTop(page, selector);
    if (top == null || top < 56 || top > 150) fail(`${hash}: anchor landed at ${top}px, expected 56-150px`);

    // A unit renders every concept at once, so the forward link is the one
    // inside the section the route points at, never simply the first on the page.
    const section = kind === 'lesson' ? '#lesson' : kind === 'close' ? '#put-it-together' : `#c-${hash.split('/c/')[1]}`;
    const target = i + 1 < expected.length ? expected[i + 1] : '#/exam';
    const next = kind === 'lesson' ? page.locator(`${section} .lesson-start`).first() : page.locator(`${section} .lesson-next a.next`).first();
    if (!(await next.count())) { fail(`dead end at ${hash}: no forward link`); break; }
    const href = await next.getAttribute('href');
    if (href !== target) fail(`${hash}: forward link points at ${href}, expected ${target}`);
    await next.click();
    await settle(page, target);
  }

  await page.waitForSelector('.exam-shell');
  seen.steps++;
  const back = await page.locator('a[href="#/unit/11/close"]').count();
  if (!back) fail('exam has no link back to the Unit 11 synthesis');
  note(`chain: cover to exam in ${seen.steps} link clicks, ${expected.length} steps expected`);
}

/* ---------- 2. deep links survive reload ---------- */
async function checkDeepLinks(page, width) {
  await page.goto(base + '#/', { waitUntil: 'load' });
  await page.waitForSelector('.cover .btn');
  const chain = await page.evaluate(() => AIM.manifest.slice().sort((a, b) => a.n - b.n).map(u => ({
    n: u.n,
    concepts: u.concepts.map(c => c.id)
  })));
  const routes = [];
  for (const u of chain) {
    routes.push({ hash: `#/unit/${u.n}/lesson`, sel: '.lesson-intro' });
    for (const id of u.concepts) routes.push({ hash: `#/unit/${u.n}/c/${id}`, sel: `#c-${id}` });
    routes.push({ hash: `#/unit/${u.n}/close`, sel: '.lesson-close' });
  }
  for (const r of routes) {
    await page.goto(base + r.hash, { waitUntil: 'load' });
    await page.waitForSelector(r.sel);
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector(r.sel);
    const hash = await page.evaluate(() => location.hash);
    if (hash !== r.hash) { fail(`${width}px reload: ${r.hash} became ${hash}`); continue; }
    const top = await anchorTop(page, r.sel);
    if (top == null || top < 56 || top > 150) fail(`${width}px reload: ${r.hash} anchors at ${top}px`);
    const len = (await page.locator(r.sel).innerText()).trim().length;
    if (len < 200) fail(`${width}px reload: ${r.hash} rendered ${len} characters`);
    seen.deepLinks++;
  }
  note(`deep links: ${routes.length} routes reload clean at ${width}px`);
}

/* ---------- 3. widgets: clipped text, collisions, frame ink, jitter ---------- */
function auditHost(host) {
  const issues = [];
  const hb = host.getBoundingClientRect();
  const name = host.dataset.widget + '/' + host.dataset.mode;
  const add = (kind, detail) => issues.push(`${name} ${kind}: ${detail}`);
  if (!hb.width) return { issues: ['no box'], rings: [], w: 0, h: 0, nodes: 0 };

  for (const e of host.querySelectorAll('*')) {
    if (e.closest('svg') && e.tagName !== 'svg') continue;
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.left < hb.left - 1.5 || r.right > hb.right + 1.5) {
      const txt = (e.textContent || '').trim().slice(0, 26);
      add('escapes card', `${e.tagName}.${String(e.className.baseVal ?? e.className).slice(0, 18)} "${txt}"`);
    }
  }
  for (const svg of host.querySelectorAll('svg')) {
    const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    if (vb.length !== 4) continue;
    for (const t of svg.querySelectorAll('text')) {
      let b;
      try { b = t.getBBox(); } catch { continue; }
      if (b.x < vb[0] - 0.5 || b.y < vb[1] - 0.5 || b.x + b.width > vb[0] + vb[2] + 0.5 || b.y + b.height > vb[1] + vb[3] + 0.5) {
        add('label outside drawing', `"${t.textContent}"`);
      }
    }
    const texts = [...svg.querySelectorAll('text')].map(t => {
      try { return { t: t.textContent, b: t.getBBox() }; } catch { return null; }
    }).filter(Boolean);
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i].b, c = texts[j].b;
        const w = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x);
        const h = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y);
        if (w > 1 && h > 1) add('labels collide', `"${texts[i].t}" and "${texts[j].t}"`);
      }
    }
  }
  for (const e of host.querySelectorAll('*')) {
    if (e.children.length || !e.textContent.trim()) continue;
    const cs = getComputedStyle(e);
    if (cs.overflow === 'hidden' && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) {
      add('text clipped', `"${e.textContent.trim().slice(0, 24)}"`);
    }
  }
  for (const c of host.querySelectorAll('button, input[type=range], input[type=text]')) {
    const r = c.getBoundingClientRect();
    if (r.width && r.height && r.height < 43.5) add('control under 44px', `${(c.getAttribute('aria-label') || c.textContent.trim()).slice(0, 20)} ${Math.round(r.height)}px`);
  }
  const rings = [...host.querySelectorAll('canvas')].map(cv => {
    try {
      const ctx = cv.getContext('2d');
      const w = cv.width, h = cv.height;
      if (!w || !h) return '';
      const rows = [0, h - 1];
      let hash = 2166136261;
      for (const y of rows) {
        const d = ctx.getImageData(0, y, w, 1).data;
        for (let i = 0; i < d.length; i += 7) { hash ^= d[i]; hash = Math.imul(hash, 16777619); }
      }
      for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 24))) {
        const d = ctx.getImageData(0, y, 1, 1).data;
        hash ^= d[0] + d[1] * 3; hash = Math.imul(hash, 16777619);
        const e = ctx.getImageData(w - 1, y, 1, 1).data;
        hash ^= e[0] + e[1] * 3; hash = Math.imul(hash, 16777619);
      }
      return String(hash >>> 0);
    } catch { return ''; }
  });
  return { issues: [...new Set(issues)], rings, w: Math.round(hb.width), h: Math.round(hb.height), nodes: host.querySelectorAll('*').length };
}

async function mountUnit(page, n) {
  await page.goto(`${base}#/unit/${n}`, { waitUntil: 'load' });
  await page.waitForSelector('.unit-head');
  const count = await page.locator('[data-widget]').count();
  for (let i = 0; i < count; i++) {
    try { await page.locator('[data-widget]').nth(i).scrollIntoViewIfNeeded(); } catch {}
    await sleep(35);
  }
  await sleep(350);
  return count;
}

async function checkWidgets(page, width, deep) {
  let cards = 0, changes = 0;
  for (let n = 1; n <= 11; n++) {
    const count = await mountUnit(page, n);
    for (let i = 0; i < count; i++) {
      const host = page.locator('[data-widget]').nth(i);
      const widget = await host.getAttribute('data-widget');
      const mode = await host.getAttribute('data-mode');
      if (!deep && !['metaphor-scene', 'concept-map'].includes(widget) && i % 3 !== 0) continue;
      await host.scrollIntoViewIfNeeded().catch(() => {});
      const before = await host.evaluate(auditHost);
      before.issues.forEach(x => fail(`unit ${n}: ${x}`));
      seen.widgets++; cards++;

      const buttons = host.locator('button');
      const bc = await buttons.count();
      let clicks = 0;
      for (let b = 0; b < bc && clicks < 8; b++) {
        const btn = buttons.nth(b);
        if (!(await btn.isVisible()) || await btn.isDisabled()) continue;
        const label = (await btn.getAttribute('aria-label')) || (await btn.innerText()).trim();
        const isPlay = label === 'Play';
        await btn.click({ timeout: 2500 }).catch(() => {});
        clicks++;
        await sleep(isPlay ? 500 : 110);
        const after = await host.evaluate(auditHost);
        seen.interactions++; changes++;
        after.issues.forEach(x => fail(`unit ${n}: ${x} (after "${label}")`));
        if (before.w && after.w !== before.w) fail(`unit ${n} ${widget}/${mode}: width ${before.w} -> ${after.w} after "${label}"`);
        if (before.rings.length !== after.rings.length) fail(`unit ${n} ${widget}/${mode}: canvas count changed after "${label}"`);
        after.rings.forEach((r, k) => {
          if (r && before.rings[k] && r !== before.rings[k]) fail(`unit ${n} ${widget}/${mode}: ink crossed the canvas frame after "${label}"`);
        });
        if (after.nodes > before.nodes * 3 + 60) fail(`unit ${n} ${widget}/${mode}: DOM grew ${before.nodes} -> ${after.nodes} after "${label}"`);
        if (isPlay) {
          const pause = host.locator('button[aria-label="Pause"]');
          if (await pause.count()) await pause.first().click().catch(() => {});
        }
      }

      const ranges = host.locator('input[type=range]');
      const rc = Math.min(await ranges.count(), deep ? 2 : 1);
      for (let r = 0; r < rc; r++) {
        const input = ranges.nth(r);
        if (!(await input.isVisible())) continue;
        for (const f of [0.25, 0.75]) {
          await input.evaluate((el, frac) => {
            el.value = String(Number(el.min || 0) + (Number(el.max || 100) - Number(el.min || 0)) * frac);
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }, f);
          await sleep(90);
          const after = await host.evaluate(auditHost);
          seen.interactions++; changes++;
          after.issues.forEach(x => fail(`unit ${n}: ${x} (range ${Math.round(f * 100)}%)`));
          if (before.w && after.w !== before.w) fail(`unit ${n} ${widget}/${mode}: width changed with the range`);
          after.rings.forEach((ring, k) => {
            if (ring && before.rings[k] && ring !== before.rings[k]) fail(`unit ${n} ${widget}/${mode}: ink crossed the canvas frame with the range`);
          });
        }
      }
    }
  }
  note(`widgets: ${cards} cards audited at ${width}px, ${changes} state changes checked`);
}

/* ---------- 4. one column, no overflow ---------- */
async function checkUnitContents(page, chain) {
  for (const u of chain) {
    await page.goto(`${base}#/unit/${u.n}`, { waitUntil: 'load' });
    await page.waitForSelector('.unit-contents');
    const links = await page.locator('.unit-contents a').evaluateAll(as => as.map(a => a.getAttribute('href')));
    const want = [`#/unit/${u.n}/lesson`, ...u.concepts.map(c => `#/unit/${u.n}/c/${c.id}`), `#/unit/${u.n}/close`];
    if (links.join('|') !== want.join('|')) fail(`unit ${u.n} contents: expected ${want.length} ordered links, saw ${links.length}`);
  }
  note('contents: every unit lists its opening, concepts and synthesis in order');
}

async function checkLayout(page, width) {
  const surfaces = ['.unit-head', '.unit-contents', '.lesson-intro', '.concept-head', '.block', '.scene-figure', '.lab', '.check', '.test', '.lesson-close', '.unit-nav', '#connections'];
  for (const n of [1, 3, 8, 11]) {
    await page.goto(`${base}#/unit/${n}/lesson`, { waitUntil: 'load' });
    await page.waitForSelector('.lesson-intro');
    await sleep(400);
    const result = await page.evaluate(list => {
      const out = { edges: [], overflow: 0, wide: [], cols: {} };
      out.overflow = document.documentElement.scrollWidth - innerWidth;
      list.forEach(sel => {
        document.querySelectorAll(sel).forEach(e => {
          const r = e.getBoundingClientRect();
          if (!r.width || !r.height) return;
          out.edges.push({ sel, left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
        });
      });
      const base = document.querySelector('.block')?.getBoundingClientRect();
      if (base) {
        out.edges = out.edges.map(e => ({ ...e, dl: e.left - Math.round(base.left), dr: e.right - Math.round(base.right) }));
      }
      out.wide = [...document.querySelectorAll('main .page *')].filter(e => {
        const r = e.getBoundingClientRect();
        return r.width && r.height && (r.right > innerWidth + 1 || r.left < -1);
      }).slice(0, 6).map(e => `${e.tagName}.${String(e.className).slice(0, 24)}`);
      return out;
    }, surfaces);
    if (result.overflow > 1) fail(`${width}px: unit ${n} overflows by ${result.overflow}px`);
    if (result.wide.length) fail(`${width}px: unit ${n} elements past the viewport: ${result.wide.join('; ')}`);
    const off = result.edges.filter(e => e.dl != null && (Math.abs(e.dl) > 1 || Math.abs(e.dr) > 1));
    if (off.length) fail(`${width}px: unit ${n} surfaces off the column: ${off.slice(0, 6).map(e => `${e.sel}(${e.dl},${e.dr})`).join(' ')}`);
    seen.layouts++;
  }
  note(`layout: ${seen.layouts} page checks, one column at ${width}px`);
}

/* ---------- run ---------- */
{
  const page = await newPage(1440, 900);
  await walkChain(page);
  await checkUnitContents(page, await page.evaluate(() => AIM.manifest.slice().sort((a, b) => a.n - b.n).map(u => ({ n: u.n, concepts: u.concepts.map(c => ({ id: c.id })) }))));
  await checkLayout(page, 1440);
  await page.close();
}
{
  const page = await newPage(1440, 900);
  await checkDeepLinks(page, 1440);
  await checkWidgets(page, 1440, true);
  await page.close();
}
{
  const page = await newPage(390, 844);
  await checkLayout(page, 390);
  await checkDeepLinks(page, 390);
  await checkWidgets(page, 390, false);
  await page.close();
}

await browser.close();
server.kill('SIGTERM');

writeFileSync(path.join(artifacts, 'journey.json'), JSON.stringify({ ...seen, notes, problems }, null, 2));
note(`\n${seen.steps} link steps, ${seen.deepLinks} deep-link reloads, ${seen.widgets} widget cards, ${seen.interactions} state changes, ${seen.layouts} layout checks`);
if (problems.length) {
  note(`${problems.length} problem(s).`);
  process.exit(1);
}
note('journey passed: chain, deep links, widgets and layout are clean.');
