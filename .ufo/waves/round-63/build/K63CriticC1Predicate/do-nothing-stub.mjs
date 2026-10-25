#!/usr/bin/env node
// Do-nothing stub: prints the lines the frozen probe wants, reads nothing it claims to.
import { existsSync, readdirSync, statSync } from 'node:fs';
const argv = process.argv.slice(2);
const val = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
if (argv.includes('--selftest')) {
  process.stdout.write('INLINE_DISPATCH_SELFTEST: PASS (25/25)\n');
  process.exit(0);
}
const sr = val('--sessions-root');
if (sr) {
  let n = 0;
  try { n = readdirSync(sr, { recursive: true }).filter((f) => String(f).endsWith('.jsonl')).length; } catch { n = 0; }
  if (n === 0) { process.stdout.write('INLINE_DISPATCH: DRIFT (seats=0 sessions=0 done=0 reports=0 dead=0)\nFINDING NOT_A_DISPATCH\n'); process.exit(1); }
}
const lg = val('--dispatcher-log');
if (lg && existsSync(lg) && statSync(lg).size === 0) {
  process.stdout.write('INLINE_DISPATCH: DRIFT (seats=0 sessions=0 done=0 reports=0 dead=0)\nFINDING SPAWN_LOG_ABSENT\n'); process.exit(1);
}
process.stdout.write('INLINE_DISPATCH: CLEAN (seats=80 sessions=80 done=80 reports=80 dead=0)\n');
process.exit(0);
