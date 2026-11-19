/* Dump registered units and glossary as JSON for the content linter. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.argv[2] || '.';
const sandbox = { window: {}, console };
const AIM = {
  units: [],
  widgets: {},
  glossary: {},
  registerUnit(u) { this.units.push(u); },
  defineTerms(t) { Object.assign(this.glossary, t); },
  kit: {}
};
sandbox.window.AIM = AIM;
sandbox.AIM = AIM;
vm.createContext(sandbox);

const files = [];
for (const dir of ['content', 'content/units']) {
  const full = path.join(root, dir);
  for (const name of fs.readdirSync(full).sort()) {
    if (name.endsWith('.js') && name !== 'manifest.js') files.push(path.join(full, name));
  }
}
for (const f of files) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f });
}
process.stdout.write(JSON.stringify({ units: AIM.units, glossary: AIM.glossary }));
