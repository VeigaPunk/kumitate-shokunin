import { openSync, fstatSync, readFileSync, closeSync, constants } from 'node:fs';
for (const p of process.argv.slice(2)) {
  try {
    const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const st = fstatSync(fd);
    let n = -1, err = null;
    try { n = readFileSync(fd).length; } catch (e) { err = String(e && e.code || e); }
    closeSync(fd);
    console.log(JSON.stringify({p, isFile: st.isFile(), stSize: st.size, readBytes: n, exceedsCap: n > 16777216, err}));
  } catch (e) { console.log(JSON.stringify({p, openErr: String(e && e.code || e)})); }
}
