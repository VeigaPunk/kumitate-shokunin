import { openSync, fstatSync, readFileSync, closeSync, constants } from 'node:fs';
import { createHash } from 'node:crypto';
for (const p of process.argv.slice(2)) {
  try {
    const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const st = fstatSync(fd);
    const b = readFileSync(fd);
    closeSync(fd);
    console.log(JSON.stringify({p, isFile: st.isFile(), stSize: st.size, readBytes: b.length, exceedsCap: b.length > 16777216, sha: createHash('sha256').update(b).digest('hex')}));
  } catch (e) { console.log(JSON.stringify({p, err: String(e && e.code || e)})); }
}
