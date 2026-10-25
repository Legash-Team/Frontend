import fs from 'fs';
import path from 'path';

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const flat = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
  typeof v === 'object' && v !== null ? flat(v, `${prefix}${k}.`) : [`${prefix}${k}`]);
const enKeys = new Set(flat(en));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : (/\.(tsx?|jsx?)$/.test(e.name) ? [p] : []);
  });
}

const missing = new Map();
for (const file of walk('src')) {
  const src = fs.readFileSync(file, 'utf8');
  // t('key') and t("key") — ignore template literals
  const re = /\bt\(\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const key = m[1];
    if (!enKeys.has(key)) {
      if (!missing.has(key)) missing.set(key, []);
      missing.get(key).push(file);
    }
  }
}

// Cross-language key parity check
const langKeys = {};
for (const lang of ['en', 'am', 'om']) {
  langKeys[lang] = new Set(flat(JSON.parse(fs.readFileSync(`src/locales/${lang}.json`, 'utf8'))));
}
const all = new Set([...langKeys.en, ...langKeys.am, ...langKeys.om]);
let parity = 0;
for (const key of all) {
  for (const lang of ['en', 'am', 'om']) {
    if (!langKeys[lang].has(key)) {
      console.log(`PARITY: ${lang} missing ${key}`);
      parity++;
    }
  }
}
console.log('PARITY ISSUES:', parity);

console.log('MISSING KEYS:', missing.size);
for (const [key, files] of [...missing.entries()].sort()) {
  console.log(`  ${key}  <- ${[...new Set(files)].join(', ')}`);
}
