/* Measure the gzipped weight a visitor downloads.
   Shell is index, CSS, kit, app, glossary, manifest and the three fonts.
   A unit page adds scenes, the map widget, that unit's prose, widgets and teaching file.
   Also reports the home page and the all-content review/exam page.

     node scripts/measure_size.mjs

   Writes artifacts/size.json and exits non-zero if a budget is missed. */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const gz = file => gzipSync(readFileSync(path.join(root, file)), { level: 9 }).length;
const kb = bytes => +(bytes / 1024).toFixed(1);
const source = readFileSync(path.join(root, 'content', 'manifest.js'), 'utf8');
const manifest = JSON.parse(source.slice(source.indexOf('(') + 1, source.lastIndexOf(')')));
const fonts = readdirSync(path.join(root, 'assets', 'fonts')).map(f => 'assets/fonts/' + f);
const shellFiles = ['index.html', 'css/course.css', 'js/kit.js', 'js/app.js', 'content/glossary.js', 'content/manifest.js', ...fonts];

const shell = shellFiles.reduce((n, f) => n + gz(f), 0);
const shared = ['js/scenes.js', 'js/widgets/connections.js'];
const units = manifest.map(m => {
  const bytes = [...shellFiles, ...shared, m.file, m.teach, m.widget, ...(m.extraWidgets || [])].reduce((n, f) => n + gz(f), 0);
  return { n: m.n, short: m.short, bytes, kb: kb(bytes) };
});
const heaviest = units.reduce((a, b) => (a.bytes >= b.bytes ? a : b));
const contentBytes = manifest.reduce((n, m) => n + gz(m.file), 0);
const allContent = shell + contentBytes;
const home = shell + gz('js/widgets/01-paradigms.js');
const fontBytes = fonts.reduce((n, f) => n + gz(f), 0);

const result = {
  method: 'gzip -9 per shipped file, summed as a browser fetches them',
  shell: { kb: kb(shell), bytes: shell, files: shellFiles, limitKb: 300 },
  units,
  heaviestUnit: { n: heaviest.n, short: heaviest.short, kb: heaviest.kb, limitKb: 250 },
  home: { kb: kb(home) },
  allContentPage: { kb: kb(allContent) },
  fonts: { files: fonts, bytes: fontBytes, kb: kb(fontBytes), limitKb: 120 }
};
mkdirSync(path.join(root, 'artifacts'), { recursive: true });
writeFileSync(path.join(root, 'artifacts', 'size.json'), JSON.stringify(result, null, 2));

console.log(`shell: ${result.shell.kb} KB gzipped (limit 300, ${fonts.length} fonts included)`);
for (const u of units) console.log(`unit ${String(u.n).padStart(2)}: ${u.kb} KB`);
console.log(`heaviest unit: ${heaviest.kb} KB (limit 250)`);
console.log(`home: ${result.home.kb} KB; review/exam: ${result.allContentPage.kb} KB; fonts: ${result.fonts.kb} KB (limit 120)`);

if (shell > 300 * 1024) { console.error('shell budget missed'); process.exit(1); }
if (heaviest.bytes > 250 * 1024) { console.error('unit budget missed'); process.exit(1); }
if (fontBytes > 120 * 1024) { console.error('font budget missed'); process.exit(1); }
