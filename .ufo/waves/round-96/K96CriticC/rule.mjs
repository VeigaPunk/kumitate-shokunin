// rule.mjs — extract declaredPins() + its SOURCES_*_RE constants from a round-gate file
// and expose it as a pure function over SOURCES text. Used by diff96.mjs (K96CriticC).
import { readFileSync } from 'node:fs';

export function loadRule(toolPath) {
  const src = readFileSync(toolPath, 'utf8');
  const consts = new Map();
  const re = /^const (SOURCES_[A-Z0-9_]+_RE) = (\/.*\/[a-z]*);$/gm;
  let m;
  while ((m = re.exec(src)) !== null) consts.set(m[1], m[2]);
  const need = ['SOURCES_ROW_RE', 'SOURCES_URL_RE', 'SOURCES_PIN_RE', 'SOURCES_SEGMENT_RE'];
  for (const n of need) if (!consts.has(n)) throw new Error(`${toolPath}: missing ${n}`);

  const start = src.indexOf('function declaredPins(');
  if (start < 0) throw new Error(`${toolPath}: declaredPins not found`);
  let depth = 0, end = -1, quote = null;
  for (let j = src.indexOf('{', start); j < src.length; j++) {
    const c = src[j];
    if (quote) {
      if (c === '\\') { j++; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j + 1; break; } }
  }
  if (end < 0) throw new Error(`${toolPath}: unbalanced declaredPins`);
  const fnSrc = src.slice(start, end);
  if (!/function declaredPins\(sourcesText/.test(fnSrc)) throw new Error('unexpected signature');
  const names = [...consts.keys()];
  const values = names.map((n) => {
    // eslint-disable-next-line no-new-func
    return new Function(`return (${consts.get(n)});`)();
  });
  // eslint-disable-next-line no-new-func
  const factory = new Function(...names, `${fnSrc}\nreturn declaredPins;`);
  const fn = factory(...values);
  const hasOutside = /outside\.push\(/.test(fnSrc);
  return function evaluate(text) {
    const pins = new Set();
    const malformed = [];
    const outside = [];
    if (typeof text === 'string') {
      const ret = fn(text, malformed, outside);
      if (ret && typeof ret[Symbol.iterator] === 'function') for (const p of ret) pins.add(p);
    }
    return { pins: [...pins], malformed, outside: hasOutside ? outside : null, hasOutside };
  };
}
