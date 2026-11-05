import { openSync, fstatSync, closeSync, constants, readSync } from 'node:fs';
const CAP = 16777216;
for (const p of process.argv.slice(2)) {
  let fd;
  try { fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK); }
  catch (e) { console.log(JSON.stringify({p, openErr: String(e.code || e)})); continue; }
  const st = fstatSync(fd);
  let total = 0, err = null;
  const buf = Buffer.alloc(1 << 20);
  try {
    for (;;) { const n = readSync(fd, buf, 0, buf.length, null); if (n === 0) break; total += n; }
  } catch (e) { err = String(e.code || e); }
  closeSync(fd);
  console.log(JSON.stringify({p, stSize: st.size, isFile: st.isFile(), readBytes: total, contentOverCap: total > CAP, err}));
}
