/* Record one 10-second clip per registered widget and per scene with Playwright.
   Tooling only, never shipped. Requires the Playwright install in .verify.

     node scripts/motion.mjs

   Each clip mounts the widget with the configuration from its first concept, or
   one scene with its own concept, interacts with it at intervals, and writes
   artifacts/motion/<id>.webm plus artifacts/motion/manifest.json. The page is a
   real browser at 960x600. */
import { spawn } from 'node:child_process';
import { mkdirSync, renameSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const requestedPort = Number(process.env.MOTION_PORT);
const port = String(Number.isFinite(requestedPort) && requestedPort > 0 ? requestedPort : 8126);
const base = `http://127.0.0.1:${port}/index.html`;
const scriptFiles = ['js/scenes.js', 'js/widgets/connections.js'].concat(
  readdirSync(path.join(root, 'js', 'widgets')).filter(f => /^\d\d-/.test(f)).map(f => 'js/widgets/' + f)
);
const outDir = path.join(root, 'artifacts', 'motion');
const tmpDir = path.join(outDir, 'tmp');
mkdirSync(outDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(root, '.verify', 'node_modules', 'playwright')); }
const { chromium } = playwright;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
let ready = false;
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
  await sleep(100);
}
if (!ready) { server.kill('SIGTERM'); console.error('server did not start'); process.exit(2); }

const browser = await chromium.launch();
const setup = await browser.newPage({ viewport: { width: 960, height: 600 } });
await setup.goto(base, { waitUntil: 'load' });
await sleep(400);
await setup.evaluate(async (files) => {
  const all = AIM.manifest.map(u => u.file).concat(files);
  for (const src of all) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('load failed: ' + src));
      document.head.appendChild(s);
    });
  }
}, scriptFiles);
const widgets = await setup.evaluate(() => {
  const seen = new Set(), out = [];
  for (const u of AIM.units) {
    for (const c of u.concepts) {
      for (const [kind, spec] of [['rung1', c.metaphor], ['rung2', c.mechanism], ['rung3', c.sandbox]]) {
        if (!spec || !spec.widget || seen.has(spec.widget)) continue;
        seen.add(spec.widget);
        out.push({ id: spec.widget, mode: kind, map: u.map, concept: c.id, unit: u.n });
      }
    }
  }
  if (!seen.has('concept-map')) out.push({ id: 'concept-map', mode: 'rung3', map: AIM.units[0].map, concept: 'connections', unit: 1 });
  var scenes = [];
  for (var u of AIM.units) {
    for (var c of u.concepts) {
      scenes.push({ id: 'scene-' + c.id, widget: 'metaphor-scene', mode: 'scene', concept: c.id, unit: u.n });
    }
  }
  return scenes.concat(out);
});
await setup.close();

async function record(item, index) {
  const ctx = await browser.newContext({
    viewport: { width: 960, height: 600 },
    recordVideo: { dir: tmpDir, size: { width: 960, height: 600 } }
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base, { waitUntil: 'load' });
  await sleep(350);
  await page.evaluate(async (files) => {
    for (const src of files) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error('load failed: ' + src));
        document.head.appendChild(s);
      });
    }
  }, scriptFiles);
  await page.evaluate(({ item }) => {
    const box = document.createElement('div');
    box.id = 'motion-stage';
    box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0E1116;overflow:auto;padding:20px;display:flex;align-items:flex-start;justify-content:center';
    const host = document.createElement('div');
    host.style.cssText = 'width:900px;max-width:100%;margin:0 auto';
    box.appendChild(host);
    document.body.appendChild(box);
    AIM.widgets[item.widget || item.id].mount(host, { mode: item.mode, map: item.map, scene: item.mode === 'scene' ? item.concept : undefined });
  }, { item });
  await sleep(700);

  async function act() {
    try {
      const host = page.locator('#motion-stage > div');
      const play = host.locator('button[aria-label="Play"]');
      if (await play.count()) { await play.first().click({ timeout: 800 }).catch(() => {}); return; }
      const step = host.locator('button[aria-label="Step forward"]');
      if (await step.count()) { await step.first().click({ timeout: 800 }).catch(() => {}); return; }
      const range = host.locator('input[type="range"]').first();
      if (await range.count()) {
        const max = Number(await range.getAttribute('max')) || 1;
        const min = Number(await range.getAttribute('min')) || 0;
        const value = await range.inputValue();
        const next = Number(value) >= max ? min : Math.min(max, Number(value) + (max - min) * 0.3);
        await range.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(next)).catch(() => {});
        return;
      }
      const button = host.locator('button').filter({ hasNotText: /reset|clear/i }).first();
      if (await button.count()) await button.click({ timeout: 800 }).catch(() => {});
    } catch {}
  }

  await sleep(1200);
  await act();
  await sleep(2500);
  await act();
  await sleep(2500);
  await act();
  await sleep(2500);
  await act();
  await sleep(1200);

  const video = page.video();
  await ctx.close();
  const source = await video.path();
  const dest = path.join(outDir, `${item.id}.webm`);
  renameSync(source, dest);
  if (errors.length) console.error(`FAIL ${item.id}: ${errors.join(' | ')}`);
  console.log(`${String(index + 1).padStart(2, '0')}/${widgets.length} ${item.id} ${errors.length ? 'ERRORS' : 'ok'}`);
  return { ...item, video: path.relative(root, dest), seconds: 10, errors };
}

const results = [];
const queue = widgets.slice();
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const item = queue.shift();
    const index = widgets.indexOf(item);
    try { results.push(await record(item, index)); }
    catch (e) { console.error(`FAIL ${item.id}: ${e.message}`); results.push({ ...item, video: null, errors: [e.message] }); }
  }
});
await Promise.all(workers);

await browser.close();
server.kill('SIGTERM');
rmSync(tmpDir, { recursive: true, force: true });

results.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
  viewport: '960x600',
  plannedSeconds: 10,
  widgetCount: widgets.length,
  clips: results
}, null, 2));
console.log(`\n${results.filter(r => r.video).length}/${widgets.length} clips written to ${path.relative(root, outDir)}`);
if (results.some(r => !r.video || r.errors.length)) process.exit(1);
