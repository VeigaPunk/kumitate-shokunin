// K70AttackPrintStub attack B (private counterexample; never executed against the lane):
// canned-receipt writer. Runs no control; writes the label substrings the frozen counter greps for.
const a = process.argv.slice(2);
const fs = await import('node:fs');
const val = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
if (a.includes('--selftest')) { console.log('CONTROL_REPLAY_SELFTEST: PASS'); process.exit(0); }
const fam = val('--family'), mode = val('--mode'), out = val('--out');
if (!['c1', 'c2'].includes(fam) || !out || !val('--lane') || !val('--work')) process.exit(64);
if (fs.existsSync(out)) process.exit(1);
const label = fam === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
fs.writeFileSync(out, `${label}\ncontrol=${mode} live=no-live\nCONTROL-PASS ${mode}\n`, { flag: 'wx' });
console.log(`CONTROL-PASS ${mode}`);
process.exit(0);
