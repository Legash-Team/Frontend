import fs from 'fs';
import path from 'path';

const merge = (target, src) => {
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      merge(target[k], v);
    } else {
      target[k] = v;
    }
  }
};

const dir = 'i18n-additions';
const files = fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];

for (const file of files) {
  const m = file.match(/(?:^|\.)(en|am|om)\.json$/);
  if (!m) continue;
  const lang = m[1];
  const localePath = `src/locales/${lang}.json`;
  const add = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  merge(locale, add);
  fs.writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n');
  console.log(`merged ${file} -> ${localePath}`);
}