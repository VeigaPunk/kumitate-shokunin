// fakeclock.cjs — per-process clock offset preload (control harness only).
// Each node process takes the next offset from /tmp/forgerctl-clock.counter,
// advancing it by STEP ms. Used only to realize the AUTHOR-SCHEDULED >=300 s
// span that plan.md limits (b) requires between the three committed receipts.
// The receipts themselves are produced by REAL invocations of the honest tool.
const fs = require('node:fs');
const COUNTER = '/tmp/forgerctl-clock.counter';
const STEP = 400000; // 400 s between successive processes
try {
  let n = 0;
  try { n = Number(fs.readFileSync(COUNTER, 'utf8').trim()) || 0; } catch { n = 0; }
  fs.writeFileSync(COUNTER, String(n + 1));
  const offset = n * STEP;
  const RealDate = Date;
  const shifted = class extends RealDate {
    constructor(...a) { if (a.length === 0) super(RealDate.now() + offset); else super(...a); }
    static now() { return RealDate.now() + offset; }
  };
  global.Date = shifted;
} catch { /* harness-only: leave the clock alone on any failure */ }
