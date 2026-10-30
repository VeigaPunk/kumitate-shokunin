// probe-standin.mjs — minimal faithful reproduction of the frozen counters' startup
// sequence (ledger69-probe.mjs lines ~64-78 / deprec69-probe.mjs lines ~76-88):
//   1. POISON env refuse, 2. positional-arg usage gate (exit 64), 3. mkdtempSync(join(tmpdir(), '<fam>69.')).
// If TMPDIR names a missing directory, step 3 throws ENOENT exactly like the real counters.
const FAM = process.env.STANDIN_FAM || 'ledger';
const RULE = FAM === 'ledger' ? 'L69' : 'M69';
const POISON = ['NODE_OPTIONS','LD_PRELOAD','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_COMMON_DIR','TAR_OPTIONS'];
for (const k of POISON) {
  if (process.env[k]) {
    console.log(`${FAM.toUpperCase()}69_UNMET held=0/7 checks=7 rev=unknown rule=${RULE} | ENV_POISONED:${k}`);
    process.exit(2);
  }
}
const pos = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (pos.length < 2) { process.stderr.write(`usage: probe-standin <lane-dir> <rev>\n`); process.exit(64); }
import('node:fs').then(({ mkdtempSync }) => {
  import('node:os').then(({ tmpdir }) => {
    import('node:path').then(({ join }) => {
      const T = mkdtempSync(join(tmpdir(), `${FAM}69.`)); // crash point when TMPDIR parent is missing
      console.log(`${FAM.toUpperCase()}69_UNMET held=0/7 checks=7 rev=${pos[1]} rule=${RULE} | standin-past-mkdtemp`);
      process.exit(1);
    });
  });
});
