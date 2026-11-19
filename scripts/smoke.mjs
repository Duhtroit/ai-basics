/* Playwright verification for the course. Tooling only, never part of the site.
   Install once:
     cd .verify && npm install playwright && npx playwright install chromium
   Run:
     node scripts/smoke.mjs
   The script starts its own static server on PORT (default 8124), mounts all
   135 lab configurations through the real router and lazy observer, answers all
   11 unit tests and all same-or-different pairs, fails on console errors, page
   errors, failed requests or HTTP 4xx/5xx, writes screenshots under
   artifacts/screenshots, and measures frame timing under artifacts/frame-timing.
   Exit code 0 means every assertion passed. */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requestedPort = Number(process.env.PORT);
const port = String(Number.isFinite(requestedPort) && requestedPort > 0 ? requestedPort : 8124);
const base = `http://127.0.0.1:${port}/index.html`;
const artifacts = path.join(root, 'artifacts');
const shotDir = path.join(artifacts, 'screenshots');
const timingDir = path.join(artifacts, 'frame-timing');
const sceneDir = path.join(artifacts, 'scenes');
mkdirSync(shotDir, { recursive: true });
mkdirSync(timingDir, { recursive: true });
mkdirSync(sceneDir, { recursive: true });

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

const problems = [];
const shots = [];
const timings = [];
const remoteRequests = new Set();
const fontRequests = new Set();
const pageOrigin = new URL(base).origin;
const EXPECTED_SCENES = 60;
const EXPECTED_CONCEPTS = 124;
const EXPECTED_MAPS = 11;
const EXPECTED_CONFIGS = EXPECTED_CONCEPTS + EXPECTED_MAPS;
let mountedTotal = 0;
let hostTotal = 0;
let conceptTotal = 0;
let mapTotal = 0;
let sceneTotal = 0;
const sceneShots = [];

function note(msg) { console.log(msg); }
function fail(msg) { problems.push(msg); console.error('FAIL', msg); }

const browser = await chromium.launch();

async function newPage(width, height, extra) {
  const page = await browser.newPage(Object.assign({ viewport: { width, height }, deviceScaleFactor: 1 }, extra || {}));
  page.on('console', m => { if (m.type() === 'error') fail(`${width}px console: ${m.text()}`); });
  page.on('pageerror', e => fail(`${width}px pageerror: ${e.message}`));
  page.on('requestfailed', r => fail(`${width}px requestfailed: ${r.url()} (${r.failure()?.errorText})`));
  page.on('response', r => {
    if (r.status() >= 400) fail(`${width}px HTTP ${r.status()}: ${r.url()}`);
  });
  page.on('request', r => {
    const u = new URL(r.url());
    if (u.origin !== pageOrigin && u.protocol !== 'data:') remoteRequests.add(r.url());
    if (/\.woff2$/.test(u.pathname)) fontRequests.add(u.pathname);
  });
  return page;
}

async function waitForRoute(page, hash) {
  await page.goto(`${base}${hash}`, { waitUntil: 'load' });
  await page.waitForFunction(h => location.hash === h && document.querySelector('main .page'), hash, { timeout: 10000 }).catch(() => {});
  await sleep(250);
}

async function mountUnit(page, n) {
  await waitForRoute(page, `#/unit/${n}`);
  const count = await page.locator('[data-widget]').count();
  for (let i = 0; i < count; i++) {
    const host = page.locator('[data-widget]').nth(i);
    try {
      await host.scrollIntoViewIfNeeded();
      await sleep(45);
    } catch {
      fail(`unit ${n}: host ${i} could not be scrolled into view`);
    }
  }
  await sleep(350);
  const state = await page.evaluate(() => {
    const hosts = [...document.querySelectorAll('[data-widget]')];
    return {
      hosts: hosts.length,
      concepts: hosts.filter(h => !h.closest('#connections')).length,
      scenes: hosts.filter(h => h.dataset.widget === 'metaphor-scene').length,
      maps: hosts.filter(h => h.closest('#connections')).length,
      mounted: hosts.filter(h => h.dataset.mounted === '1').length,
      failed: hosts.filter(h => /could not start|unavailable/i.test(h.textContent)).map(h => `${h.dataset.widget}/${h.dataset.mode}`),
      unfilled: hosts.filter(h => !h.textContent.trim() && !h.querySelector('canvas, svg')).map(h => `${h.dataset.widget}/${h.dataset.mode}`)
    };
  });
  conceptTotal += state.concepts;
  mapTotal += state.maps;
  sceneTotal += state.scenes;
  if (state.mounted !== state.hosts) fail(`unit ${n}: ${state.mounted}/${state.hosts} mounted`);
  for (const f of state.failed) fail(`unit ${n}: widget reported failure ${f}`);
  for (const f of state.unfilled) fail(`unit ${n}: widget rendered nothing ${f}`);
  return state;
}

for (const [width, height] of [[1440, 900], [1024, 768], [390, 844]]) {
  const page = await newPage(width, height);
  let widthHosts = 0, widthMounted = 0;
  note(`\nviewport ${width}x${height}`);

  await waitForRoute(page, '#/');
  await page.screenshot({ path: path.join(shotDir, `${width}-cover.png`) });
  shots.push(`${width}-cover.png`);

  for (let n = 1; n <= 11; n++) {
    const state = await mountUnit(page, n);
    widthHosts += state.hosts;
    widthMounted += state.mounted;
    note(`unit ${n}: ${state.mounted}/${state.hosts} mounted`);
  }
  hostTotal = Math.max(hostTotal, widthHosts);
  mountedTotal = Math.max(mountedTotal, widthMounted);
  // conceptTotal/sceneTotal/mapTotal are accumulated across all three viewports.
  if (widthHosts !== EXPECTED_CONFIGS) fail(`${width}px: expected ${EXPECTED_CONFIGS} lab configurations, saw ${widthHosts} hosts`);
  if (widthMounted !== EXPECTED_CONFIGS) fail(`${width}px: expected ${EXPECTED_CONFIGS} mounted labs, saw ${widthMounted}`);

  if (width === 1440) {
    let interacted = 0;
    for (let n = 1; n <= 11; n++) {
      await waitForRoute(page, `#/unit/${n}`);
      const scenes = page.locator('[data-widget="metaphor-scene"]');
      const count = await scenes.count();
      for (let i = 0; i < count; i++) {
        const host = scenes.nth(i);
        await host.scrollIntoViewIfNeeded();
        await sleep(90);
        const ms = host.locator('.ms');
        const id = await ms.getAttribute('data-scene');
        const before = await ms.getAttribute('data-beat');
        const action = host.locator('.ms-act');
        if (!(await action.count())) { fail(`scene ${id}: no action control`); continue; }
        await action.click();
        await sleep(120);
        const after = await ms.getAttribute('data-beat');
        if (before === after) fail(`scene ${id}: action did not change the beat`);
        else interacted++;
        const figure = host.locator('xpath=..');
        await figure.screenshot({ path: path.join(sceneDir, `${id}.png`) });
        sceneShots.push(`${id}.png`);
        if (i === 0 && n === 1) {
          const actor = host.locator('.ms-actor');
          await actor.focus();
          const kbBefore = await ms.getAttribute('data-beat');
          await page.keyboard.press('ArrowRight');
          await sleep(80);
          if (kbBefore === await ms.getAttribute('data-beat')) fail(`scene ${id}: keyboard arrow did not move`);
          const box = await actor.boundingBox();
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2 + 150, box.y + box.height / 2, { steps: 8 });
            await page.mouse.up();
            await sleep(120);
            if (kbBefore === await ms.getAttribute('data-beat')) fail(`scene ${id}: drag did not change the beat`);
          }
        }
      }
    }
    note(`scenes: ${interacted} interacted and captured`);

    // State survives a route away and back, reset returns to the first beat, and play advances.
    await waitForRoute(page, '#/unit/2/c/three-perspectives');
    let probe = page.locator('[data-widget="metaphor-scene"]').first();
    await probe.scrollIntoViewIfNeeded();
    await sleep(120);
    await probe.locator('.ms-act').click();
    await sleep(100);
    const kept = await probe.locator('.ms').getAttribute('data-beat');
    await waitForRoute(page, '#/');
    await waitForRoute(page, '#/unit/2/c/three-perspectives');
    probe = page.locator('[data-widget="metaphor-scene"]').first();
    await probe.scrollIntoViewIfNeeded();
    await sleep(120);
    if (await probe.locator('.ms').getAttribute('data-beat') !== kept) fail('scene state was not restored after navigation');
    await probe.locator('.ms-ctrl', { hasText: 'Reset' }).click();
    await sleep(100);
    if (await probe.locator('.ms').getAttribute('data-beat') !== '0') fail('scene reset did not return to the first beat');
    await probe.locator('.ms-ctrl', { hasText: 'Play the scene' }).click();
    await sleep(1700);
    if (await probe.locator('.ms').getAttribute('data-beat') === '0') fail('scene play did not advance');
    note('scene state restore, reset and play: pass');
  }

  const layout = await page.evaluate(() => {
    const vw = innerWidth;
    const overflow = document.documentElement.scrollWidth - vw;
    const wide = [...document.querySelectorAll('body *')].filter(e => {
      if (e.closest('.skip')) return false;
      if (e.closest('.rail') && !e.closest('.rail.open')) return false;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      return r.right > vw + 1 || r.left < -1;
    }).slice(0, 8).map(e => `${e.tagName}.${String(e.className).slice(0, 30)} right=${Math.round(e.getBoundingClientRect().right)}`);
    const small = [...document.querySelectorAll('[data-widget] button, [data-widget] input[type=range], [data-widget] input[type=text], [data-widget] .seg button')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 44;
    }).map(e => `${e.textContent.trim().slice(0, 20) || e.getAttribute('aria-label') || e.type}:${Math.round(e.getBoundingClientRect().height)}px`).slice(0, 12);
    return { vw, overflow, wide, small };
  });
  if (layout.overflow > 1) fail(`${width}px horizontal overflow ${layout.overflow}px`);
  if (layout.wide.length) fail(`${width}px elements past viewport: ${layout.wide.join('; ')}`);
  if (layout.small.length) fail(`${width}px lab controls under 44px: ${layout.small.join('; ')}`);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await waitForRoute(page, '#/unit/3/c/least-squares');
  await page.locator('#c-least-squares').scrollIntoViewIfNeeded();
  await sleep(150);
  await page.screenshot({ path: path.join(shotDir, `${width}-reading.png`) });
  shots.push(`${width}-reading.png`);

  await waitForRoute(page, '#/unit/8/c/bayes-inference');
  const alarm = page.locator('[data-widget="alarm-infer"]').first();
  await alarm.scrollIntoViewIfNeeded();
  await sleep(400);
  await page.screenshot({ path: path.join(shotDir, `${width}-lab.png`) });
  shots.push(`${width}-lab.png`);

  await waitForRoute(page, '#/unit/10/c/bfs');
  const bfs = page.locator('[data-widget="bfs-wave"]').first();
  await bfs.scrollIntoViewIfNeeded();
  await sleep(250);
  const play = bfs.locator('button[aria-label="Play"]');
  if (await play.count()) await play.click();
  await sleep(300);
  await page.screenshot({ path: path.join(shotDir, `${width}-search.png`) });
  shots.push(`${width}-search.png`);

  await waitForRoute(page, '#/unit/5/c/backprop');
  const blame = page.locator('[data-widget="blame-flow"]').first();
  await blame.scrollIntoViewIfNeeded();
  await sleep(250);
  const play2 = blame.locator('button[aria-label="Play"]');
  if (await play2.count()) await play2.click();
  await sleep(250);
  await page.screenshot({ path: path.join(shotDir, `${width}-backprop.png`) });
  shots.push(`${width}-backprop.png`);

  if (width === 390) {
    /* Every scene is separately composed at 390. Exercise the action, keyboard
       and vertical drag, audit the portrait frame, then capture all 60. */
    let mobileInteracted = 0;
    for (let n = 1; n <= 11; n++) {
      await waitForRoute(page, `#/unit/${n}`);
      const scenes = page.locator('[data-widget="metaphor-scene"]');
      const count = await scenes.count();
      for (let i = 0; i < count; i++) {
        const host = scenes.nth(i);
        await host.scrollIntoViewIfNeeded();
        await sleep(90);
        const ms = host.locator('.ms');
        const id = await ms.getAttribute('data-scene');
        const actor = host.locator('.ms-actor');
        const before = await ms.getAttribute('data-beat');
        const action = host.locator('.ms-act');
        if (!(await action.count())) { fail(`390 scene ${id}: no action control`); continue; }
        await action.click();
        await sleep(140);
        const after = await ms.getAttribute('data-beat');
        if (before === after) fail(`390 scene ${id}: action did not change the beat`);
        else mobileInteracted++;
        if (await actor.getAttribute('aria-valuenow') !== after) fail(`390 scene ${id}: aria-valuenow did not follow the action`);

        await actor.focus();
        await page.keyboard.press('Home');
        await sleep(90);
        if (await ms.getAttribute('data-beat') !== '0') fail(`390 scene ${id}: Home did not return to beat 0`);
        await page.keyboard.press('ArrowRight');
        await sleep(100);
        if (await ms.getAttribute('data-beat') !== '1') fail(`390 scene ${id}: ArrowRight did not advance to the next beat`);
        if (await actor.getAttribute('aria-valuenow') !== '1') fail(`390 scene ${id}: aria-valuenow did not follow the keyboard`);

        await page.keyboard.press('Home');
        await sleep(430);
        const box = await actor.boundingBox();
        if (!box) fail(`390 scene ${id}: actor has no box`);
        else {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 200, { steps: 12 });
          await page.mouse.up();
          await sleep(240);
          const dragged = await ms.getAttribute('data-beat');
          if (dragged === '0') fail(`390 scene ${id}: vertical drag did not change the beat`);
          if (await actor.getAttribute('aria-valuenow') !== dragged) fail(`390 scene ${id}: aria-valuenow did not follow the drag`);
        }

        const frame = await host.evaluate(el => {
          const ms = el.querySelector('.ms');
          const svg = ms.querySelector('.ms-svg');
          const sr = svg.getBoundingClientRect();
          const trace = ms.querySelector('.ms-trace').getBoundingClientRect();
          const beats = ms.querySelector('.ms-beats').getBoundingClientRect();
          const controls = ms.querySelector('.ms-controls').getBoundingClientRect();
          const caption = el.parentElement.querySelector('.scene-caption').getBoundingClientRect();
          const actorBox = ms.querySelector('.ms-actor').getBoundingClientRect();
          const outside = [], overlap = [];
          ms.querySelectorAll('.ms-prop').forEach(node => {
            const r = node.getBoundingClientRect();
            if (!r.width || !r.height) return;
            if (r.left < sr.left - 1 || r.right > sr.right + 1 || r.top < sr.top - 1 || r.bottom > sr.bottom + 1) outside.push(node.dataset.prop);
            if (!(r.right < actorBox.left || r.left > actorBox.right || r.bottom < actorBox.top || r.top > actorBox.bottom)) overlap.push(node.dataset.prop);
          });
          return {
            outside, overlap,
            order: [Math.round(sr.bottom - trace.top), Math.round(trace.bottom - beats.top), Math.round(beats.bottom - controls.top), Math.round(controls.bottom - caption.top)],
            small: [...ms.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height < 44).map(b => b.textContent.trim().slice(0, 18)),
            viewBox: svg.getAttribute('viewBox')
          };
        });
        if (frame.viewBox !== '0 0 360 560') fail(`390 scene ${id}: expected portrait viewBox, saw ${frame.viewBox}`);
        if (frame.outside.length) fail(`390 scene ${id}: props clipped outside the frame: ${frame.outside.join(', ')}`);
        if (frame.overlap.length) fail(`390 scene ${id}: props overlap the actor: ${frame.overlap.join(', ')}`);
        if (frame.order.some(v => v > 1)) fail(`390 scene ${id}: scene/controls/caption overlap ${frame.order.join(',')}`);
        if (frame.small.length) fail(`390 scene ${id}: controls under 44px: ${frame.small.join(', ')}`);

        await page.keyboard.press('Home');
        await sleep(450);
        await page.evaluate(() => { const t = document.querySelector('.topbar'); if (t) t.style.visibility = 'hidden'; });
        await host.locator('xpath=..').screenshot({ path: path.join(sceneDir, `390-${id}.png`) });
        await page.evaluate(() => { const t = document.querySelector('.topbar'); if (t) t.style.visibility = ''; });
        sceneShots.push(`390-${id}.png`);
      }
    }
    note(`390 scenes: ${mobileInteracted} action beats progressed, portrait audit and screenshots complete`);
  }

  await page.close();
}

async function checkReducedMotion() {
  const page = await newPage(1440, 900, { reducedMotion: 'reduce' });
  const result = {};

  await waitForRoute(page, '#/unit/10/c/bfs');
  let host = page.locator('[data-widget="bfs-wave"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(350);
  const bfsMax = Number(await host.locator('input[type=range]').getAttribute('max'));
  await host.locator('button[aria-label="Play"]').click();
  await sleep(60);
  const bfsOut = await host.locator('output').first().innerText();
  const bfsNote = await host.locator('.lab-note').first().innerText();
  if (!bfsOut.includes(`${bfsMax} / ${bfsMax}`)) fail(`reduced motion: bfs play did not jump to the final frame, saw ${bfsOut}`);
  if (!/Layer \d+/.test(bfsNote)) fail(`reduced motion: bfs has no numeric trace, saw ${bfsNote.slice(0, 40)}`);
  result.bfs = `${bfsOut}; ${bfsNote.slice(0, 48)}`;

  await waitForRoute(page, '#/unit/5/c/backprop');
  host = page.locator('[data-widget="blame-flow"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(350);
  const blameMax = Number(await host.locator('input[type=range]').getAttribute('max'));
  await host.locator('button[aria-label="Play"]').click();
  await sleep(60);
  const blameOut = await host.locator('output').first().innerText();
  if (!blameOut.includes(`${blameMax} / ${blameMax}`)) fail(`reduced motion: backprop play did not jump to the final frame, saw ${blameOut}`);
  result.blame = blameOut;

  await waitForRoute(page, '#/unit/3/c/gradient-descent');
  host = page.locator('[data-widget="descent-contour"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(350);
  await host.locator('button', { hasText: 'Run' }).first().click();
  await sleep(80);
  const descentNote = await host.locator('.lab-note').first().innerText();
  const loss = Number((descentNote.match(/loss ([0-9.]+)/) || [])[1]);
  if (!isFinite(loss) || loss > 1) fail(`reduced motion: descent did not settle instantly, trace ${descentNote}`);
  result.descent = descentNote;

  await waitForRoute(page, '#/unit/2/c/three-perspectives');
  host = page.locator('[data-widget="metaphor-scene"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(350);
  const beats = await host.locator('.ms-beat').count();
  await host.locator('.ms-ctrl', { hasText: 'Play the scene' }).click();
  await sleep(60);
  const beat = await host.locator('.ms').getAttribute('data-beat');
  const sceneCount = await host.locator('.ms-count').innerText();
  if (beat !== String(beats - 1)) fail(`reduced motion: scene play did not jump to the final beat, saw ${beat}`);
  if (!sceneCount.includes(`${beats} / ${beats}`)) fail(`reduced motion: scene has no numeric trace, saw ${sceneCount}`);
  result.scene = `${sceneCount}; beat ${beat}`;

  const duration = await page.evaluate(() => getComputedStyle(document.querySelector('.opt') || document.body).transitionDuration);
  const seconds = Math.max(...duration.split(',').map(v => parseFloat(v)));
  if (!(seconds <= 0.001)) fail(`reduced motion: transitions still last ${duration}`);
  result.cssTransition = duration;

  await page.close();
  return result;
}

async function checkPersistence() {
  const page = await newPage(1440, 900);
  const result = {};

  await waitForRoute(page, '#/unit/10/c/bfs');
  let host = page.locator('[data-widget="bfs-wave"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(300);
  await host.locator('button[aria-label="Step forward"]').click();
  await sleep(60);
  await host.locator('button[aria-label="Step forward"]').click();
  await sleep(80);
  const bfsBefore = await host.locator('input[type=range]').inputValue();
  await waitForRoute(page, '#/');
  await waitForRoute(page, '#/unit/10/c/bfs');
  host = page.locator('[data-widget="bfs-wave"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(350);
  const bfsAfter = await host.locator('input[type=range]').inputValue();
  if (bfsBefore !== bfsAfter) fail(`persistence: bfs frame ${bfsBefore} became ${bfsAfter}`);
  await host.locator('button', { hasText: 'Reset' }).click();
  await sleep(80);
  const bfsReset = await host.locator('input[type=range]').inputValue();
  if (bfsReset !== '0') fail(`persistence: bfs reset left frame ${bfsReset}`);
  result.bfs = `frame ${bfsBefore} restored, reset ${bfsReset}`;

  await waitForRoute(page, '#/unit/5/c/backprop');
  host = page.locator('[data-widget="blame-flow"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(300);
  await host.locator('button[aria-label="Step forward"]').click();
  await sleep(60);
  await host.locator('button[aria-label="Step forward"]').click();
  await sleep(80);
  const blameBefore = await host.locator('output').first().innerText();
  await waitForRoute(page, '#/');
  await waitForRoute(page, '#/unit/5/c/backprop');
  host = page.locator('[data-widget="blame-flow"]').first();
  await host.scrollIntoViewIfNeeded();
  await sleep(350);
  const blameAfter = await host.locator('output').first().innerText();
  if (blameBefore !== blameAfter) fail(`persistence: backprop ${blameBefore} became ${blameAfter}`);
  await host.locator('button', { hasText: 'Reset' }).click();
  await sleep(80);
  const blameReset = await host.locator('output').first().innerText();
  if (!blameReset.startsWith('0 /')) fail(`persistence: backprop reset left ${blameReset}`);
  result.blame = `${blameBefore} restored, reset ${blameReset}`;

  await page.close();
  return result;
}

async function checkAssessments() {
  const page = await newPage(1440, 900);
  let tests = 0, items = 0, pairsChecked = 0;
  for (let n = 1; n <= 11; n++) {
    await waitForRoute(page, `#/unit/${n}`);
    const section = page.locator('#test');
    await section.scrollIntoViewIfNeeded();
    await section.locator('.test-foot button').click();
    await page.waitForSelector('#test .q .q-text');
    const data = await page.evaluate(n => {
      const u = AIM.units.find(x => x.n === n);
      return { test: u.test, pairs: u.pairs || [] };
    }, n);
    if (data.test.length !== 12) fail(`unit ${n}: expected 12 test items, saw ${data.test.length}`);

    for (let i = 0; i < data.test.length; i++) {
      const q = data.test[i];
      const item = page.locator('#test .q').nth(i);
      if (q.type === 'numeric') {
        await item.locator('input[type="number"]').fill(String(q.answer));
      } else if (q.type === 'ordering') {
        for (let target = 0; target < q.items.length; target++) {
          for (let guard = 0; guard < q.items.length; guard++) {
            const rows = item.locator('.q-order-row');
            const texts = await rows.allInnerTexts();
            const at = texts.findIndex(t => t.includes(q.items[target]));
            if (at === target) break;
            if (at < 0) { fail(`unit ${n} item ${i + 1}: ordering row for ${q.items[target]} missing`); break; }
            await rows.nth(at).locator('button', { hasText: at > target ? 'Up' : 'Down' }).click();
          }
        }
      } else if (q.type === 'short') {
        await item.locator('textarea').fill(q.model);
        const boxes = item.locator('input[type="checkbox"]');
        const total = await boxes.count();
        for (let b = 0; b < total; b++) await boxes.nth(b).check();
        if (total !== q.rubric.length) fail(`unit ${n} item ${i + 1}: ${total} rubric boxes for ${q.rubric.length} criteria`);
      } else {
        await item.locator('.opt').nth(q.answer).click();
      }
      items++;
    }

    await page.locator('#test .test-foot button').click();
    await sleep(200);
    const score = await page.locator('#test .test-score').innerText();
    if (!score.startsWith('12 of 12 correct')) fail(`unit ${n}: mixed-format test scored ${score}`);
    tests++;

    const connections = page.locator('#connections');
    await connections.scrollIntoViewIfNeeded();
    const cards = connections.locator('.paircheck');
    const cardCount = await cards.count();
    if (cardCount !== data.pairs.length) fail(`unit ${n}: ${cardCount} pair cards for ${data.pairs.length} pairs`);
    for (let i = 0; i < data.pairs.length; i++) {
      const card = cards.nth(i);
      await card.locator(`button[data-same="${data.pairs[i].same}"]`).click();
      if (!(await card.locator('.fb.show').count())) fail(`unit ${n} pair ${i + 1}: no feedback after the answer`);
      pairsChecked++;
    }
    note(`unit ${n}: ${score}, ${data.pairs.length} pairs checked`);
  }
  await page.close();
  return { tests, items, pairs: pairsChecked };
}

function stats(samples) {
  const s = samples.slice().sort((a, b) => a - b);
  const sum = s.reduce((a, b) => a + b, 0);
  const avg = sum / s.length;
  return {
    frames: s.length,
    avgMs: +avg.toFixed(2),
    p95Ms: +s[Math.floor(s.length * 0.95)].toFixed(2),
    maxMs: +s[s.length - 1].toFixed(2),
    fps: +(1000 / avg).toFixed(1)
  };
}

async function timeLoop(page, hash, widget, cycles) {
  await waitForRoute(page, hash);
  const host = page.locator(`[data-widget="${widget}"]`).first();
  await host.scrollIntoViewIfNeeded();
  await sleep(400);
  const raw = await page.evaluate(async ({ widget, cycles }) => {
    const host = document.querySelector(`[data-widget="${widget}"]`);
    const step = host.querySelector('button[aria-label="Step forward"]');
    const range = host.querySelector('input[type=range]');
    const times = [];
    let last = performance.now();
    const start = last;
    let i = 0;
    await new Promise(resolve => {
      function frame(t) {
        times.push(t - last);
        last = t;
        if (!step || step.disabled) {
          if (range) {
            range.value = range.min || 0;
            range.dispatchEvent(new Event('input', { bubbles: true }));
          }
        } else {
          step.click();
        }
        i++;
        if (i < cycles) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    return times.slice(5);
  }, { widget, cycles });
  return stats(raw);
}

// Frame timing is measured on its own 1440 page so background screenshot work cannot interfere.
{
  const page = await newPage(1440, 900);
  const search = await timeLoop(page, '#/unit/10/c/bfs', 'bfs-wave', 240);
  timings.push({ widget: 'bfs-wave', ...search });
  writeFileSync(path.join(timingDir, 'bfs-wave.json'), JSON.stringify({ widget: 'bfs-wave', viewport: '1440x900', ...search }, null, 2));
  if (search.fps < 55 || search.p95Ms > 20) fail(`bfs-wave frame budget missed: ${search.fps} fps, p95 ${search.p95Ms}ms`);

  const blame = await timeLoop(page, '#/unit/5/c/backprop', 'blame-flow', 240);
  timings.push({ widget: 'blame-flow', ...blame });
  writeFileSync(path.join(timingDir, 'blame-flow.json'), JSON.stringify({ widget: 'blame-flow', viewport: '1440x900', ...blame }, null, 2));
  if (blame.fps < 55 || blame.p95Ms > 20) fail(`blame-flow frame budget missed: ${blame.fps} fps, p95 ${blame.p95Ms}ms`);

  await page.close();
}

const assessment = await checkAssessments();
note(`assessments: ${assessment.tests}/11 unit tests at 100%, ${assessment.items} items, ${assessment.pairs} pairs`);
const reducedMotion = await checkReducedMotion();
note(`reduced motion: bfs ${reducedMotion.bfs}; scene ${reducedMotion.scene}`);
const persistence = await checkPersistence();
note(`persistence: ${persistence.bfs}; ${persistence.blame}`);

const fonts = Array.from(fontRequests).sort();
if (remoteRequests.size) fail(`remote requests observed: ${Array.from(remoteRequests).join(', ')}`);
if (fonts.length !== 3) fail(`expected 3 self-hosted woff2 fonts, saw ${fonts.length}: ${fonts.join(', ')}`);
note(`network: ${remoteRequests.size} remote requests, ${fonts.length} local woff2 files`);

await browser.close();
server.kill('SIGTERM');

writeFileSync(path.join(artifacts, 'summary.json'), JSON.stringify({
  expectedConfigs: EXPECTED_CONFIGS,
  hostTotal,
  mountedTotal,
  screenshots: shots,
  sceneScreenshots: sceneShots,
  timings,
  assessment,
  reducedMotion,
  persistence,
  network: { remote: Array.from(remoteRequests), fonts },
  problems
}, null, 2));

note(`\nper viewport: ${hostTotal} hosts, ${mountedTotal} mounted (${EXPECTED_SCENES} scenes + 64 deeper labs + ${EXPECTED_MAPS} maps)`);
note(`across three viewports: ${sceneTotal} scenes, ${conceptTotal} concept labs, ${mapTotal} maps`);
if (hostTotal !== EXPECTED_CONFIGS) fail(`expected ${EXPECTED_CONFIGS} lab configurations per viewport, saw ${hostTotal}`);
if (mountedTotal !== EXPECTED_CONFIGS) fail(`expected ${EXPECTED_CONFIGS} mounted labs per viewport, saw ${mountedTotal}`);
if (conceptTotal !== EXPECTED_CONCEPTS * 3) fail(`expected ${EXPECTED_CONCEPTS * 3} concept labs across three viewports, saw ${conceptTotal}`);
if (mapTotal !== EXPECTED_MAPS * 3) fail(`expected ${EXPECTED_MAPS * 3} map labs across three viewports, saw ${mapTotal}`);
if (sceneTotal !== EXPECTED_SCENES * 3) fail(`expected ${EXPECTED_SCENES * 3} scenes across three viewports, saw ${sceneTotal}`);
const desktopScenes = sceneShots.filter(s => !s.startsWith('390-'));
const mobileScenes = sceneShots.filter(s => s.startsWith('390-'));
const uniqueScenes = new Set(desktopScenes.map(s => s.replace(/\.png$/, '')));
if (uniqueScenes.size !== EXPECTED_SCENES) fail(`expected ${EXPECTED_SCENES} unique scene captures, saw ${uniqueScenes.size}`);
if (mobileScenes.length !== EXPECTED_SCENES) fail(`expected ${EXPECTED_SCENES} mobile scene captures, saw ${mobileScenes.length}`);
for (const t of timings) note(`${t.widget}: ${t.fps} fps, avg ${t.avgMs}ms, p95 ${t.p95Ms}ms, max ${t.maxMs}ms`);
note(`screenshots: ${shots.length} in artifacts/screenshots`);

if (problems.length) {
  note(`\n${problems.length} problem(s).`);
  process.exit(1);
}
note('\nsmoke passed: all lab configurations mounted, console and requests clean, screenshots and timings written.');
