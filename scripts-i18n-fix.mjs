import fs from 'fs';

const dir = 'i18n-additions';
const files = [
  ...(fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => `${dir}/${f}`) : []),
  'src/locales/en.json',
  'src/locales/am.json',
  'src/locales/om.json',
];
const BAD = /[一-鿿가-힯]/;

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let text = fs.readFileSync(f, 'utf8');
  const hits = text.match(BAD);
  if (hits) {
    console.log(`${f}: stray CJK chars found: ${[...new Set(hits)].join(' ')}`);
    // remove stray CJK runs entirely
    text = text.replace(/[一-鿿가-힯]+/g, '');
    fs.writeFileSync(f, text);
    console.log(`${f}: cleaned`);
  } else {
    console.log(`${f}: clean`);
  }
}

// validate JSON still parses and report any non-Ethiopic/Latin oddities
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  const bad = [];
  const walk = (obj, path) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === 'object') walk(v, `${path}.${k}`);
      else if (typeof v === 'string') {
        for (const ch of v) {
          const cp = ch.codePointAt(0);
          const ok =
            cp < 0x900 || // ASCII + Latin-1
            (cp >= 0x2000 && cp <= 0x206F) || // general punctuation
            (cp >= 0x2190 && cp <= 0x21FF) || // arrows
            (cp >= 0x25A0 && cp <= 0x25FF) || // geometric shapes
            (cp >= 0x2600 && cp <= 0x27BF) || // misc symbols / dingbats
            (cp >= 0x1200 && cp <= 0x1398) || // Ethiopic
            (cp >= 0x10000 && cp <= 0x1ffff); // emoji etc.
          if (!ok) bad.push(`${path}.${k} -> U+${cp.toString(16)} ${ch}`);
        }
      }
    }
  };
  walk(json, '');
  console.log(`${f}: ${bad.length ? 'odd chars: ' + bad.join(', ') : 'all chars ok'}`);
}