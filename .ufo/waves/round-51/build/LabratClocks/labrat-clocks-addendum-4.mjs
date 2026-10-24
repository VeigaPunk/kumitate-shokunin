#!/usr/bin/env node
// labrat-clocks-4.mjs — addendum 4: ISO-8601 wall-clock round-trip losslessness + wall-vs-mono ordering agreement.
import { randomBytes } from 'node:crypto';

const out = [];
const say = (s) => { out.push(s); console.log(s); };

// I: Date.now() -> toISOString() -> Date.parse() must be lossless to the millisecond
let lossless = 0, lossy = 0;
for (let i = 0; i < 10000; i++) {
  const ms = Date.now();
  const iso = new Date(ms).toISOString();
  if (Date.parse(iso) === ms) lossless++; else { lossy++; if (lossy === 1) say(`I first-lossy ms=${ms} iso=${iso}`); }
}
say(`I samples=10000 iso_roundtrip_lossless=${lossless} lossy=${lossy}`);

// J: ISO string form + sortability (lexicographic == chronological for same-format UTC 'Z' strings)
const stamps = [];
for (let i = 0; i < 5000; i++) stamps.push(new Date(Date.now() - i * 1000).toISOString());
const lexSorted = [...stamps].sort();
const chronoSorted = [...stamps].sort((a, b) => Date.parse(a) - Date.parse(b));
say(`J samples=5000 lexicographic_eq_chronological=${JSON.stringify(lexSorted) === JSON.stringify(chronoSorted)} iso_sample=${stamps[0]}`);

// K: ordering agreement between the wall clock and the monotonic clock over 300 back-to-back samples
let agree = true, wallBack = 0;
let pw = Date.now(), pm = process.hrtime.bigint();
for (let i = 0; i < 300; i++) {
  const w = Date.now(), m = process.hrtime.bigint();
  if (w < pw) { wallBack++; if (w < pw - 1) agree = false; }
  if (m < pm) agree = false;
  pw = w; pm = m;
}
say(`K samples=300 wall_and_mono_ordering_agree=${agree} wall_regressions=${wallBack}`);

// L: can a 128-bit hex nonce collide? — birthday bound over 1000 draws, with the exact expected-collision figure
const N = 1000, bits = 128, space = 2 ** bits;
let coll = 0; const S = new Set();
for (let i = 0; i < N; i++) { const h = randomBytes(16).toString('hex'); if (S.has(h)) coll++; S.add(h); }
const pBirthday = (N * (N - 1)) / (2 * space);
say(`L draws=${N} observed_collisions=${coll} distinct=${S.size} birthday_p≈${pBirthday.toExponential(3)} space=2^${bits}`);

const ok = lossy === 0 && lossless === 10000 && agree && coll === 0;
say(`RESULT I=${lossy === 0} J=${JSON.stringify(lexSorted) === JSON.stringify(chronoSorted)} K=${agree} L=${coll === 0}`);
process.exit(ok ? 0 : 1);
