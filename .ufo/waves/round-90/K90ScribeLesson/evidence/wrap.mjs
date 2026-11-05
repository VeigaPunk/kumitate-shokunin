// read-only observer: logs what a candidate is handed, then delegates unchanged to the real tool
import { spawnSync } from 'node:child_process';
import { appendFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
const LOG = '/fast/scratch/hyaku/kumitate-r90/K90ScribeLesson/wrap.log';
const real = process.env.WRAP_REAL;
const args = process.argv.slice(2);
let out = `ARGV ${JSON.stringify(args)}\n`;
const di = args.indexOf('--dir');
if (di >= 0) {
  const d = args[di + 1];
  let names = []; try { names = readdirSync(d).sort(); } catch (e) { out += `  DIR-ERR ${e.code}\n`; }
  for (const f of names) {
    const st = statSync(`${d}/${f}`, { throwIfNoEntry: false });
    out += `  FILE ${d}/${f} mode=${st ? (st.mode & 0o777).toString(8) : '?'} size=${st ? st.size : '?'}\n`;
    try { if (st && st.size < 4096 && (st.mode & 0o400)) out += `    BODY ${JSON.stringify(readFileSync(`${d}/${f}`, 'utf8'))}\n`; } catch (e) { out += `    BODY-UNREADABLE ${e.code}\n`; }
  }
}
appendFileSync(LOG, out);
const r = spawnSync(process.execPath, [real, ...args], { encoding: 'utf8', maxBuffer: 32 << 20, env: process.env, cwd: process.cwd() });
process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
process.exit(r.status === null ? 2 : r.status);
