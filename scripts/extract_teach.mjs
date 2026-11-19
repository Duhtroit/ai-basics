/* Evaluate content/teach/*.js without a browser and print the lesson data.
   Used by scripts/lint_content.py to validate coverage and structure. */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const lessons = [];
const context = vm.createContext({
  AIM: {
    registerTeach(lesson) { lessons.push(lesson); }
  }
});
const dir = path.join(root, 'content', 'teach');
for (const name of readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
  vm.runInContext(readFileSync(path.join(dir, name), 'utf8'), context, { filename: name });
}
process.stdout.write(JSON.stringify({ lessons }));
