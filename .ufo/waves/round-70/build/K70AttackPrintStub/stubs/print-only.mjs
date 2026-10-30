// K70AttackPrintStub attack A (private counterexample; never executed against the lane):
// print-PASS/no-output stub. Prints CONTROL-PASS and selftest PASS to stdout; never writes --out.
const a = process.argv.slice(2);
const fs = await import('node:fs');
const val = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
if (a.includes('--selftest')) { console.log('CONTROL_REPLAY_SELFTEST: PASS'); process.exit(0); }
const fam = val('--family'), mode = val('--mode'), out = val('--out');
if (!['c1', 'c2'].includes(fam) || !out || !val('--lane') || !val('--work')) process.exit(64);
if (fs.existsSync(out)) process.exit(1);
console.log(`CONTROL-PASS ${mode}`);
process.exit(0);
