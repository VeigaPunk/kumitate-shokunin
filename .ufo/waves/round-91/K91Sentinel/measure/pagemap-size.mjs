import { openSync, fstatSync, closeSync, constants, readSync } from 'node:fs';
const p = process.argv[2];
const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
const st = fstatSync(fd);
const buf = Buffer.alloc(1 << 20);
let total = 0;
try {
  for (;;) {
    const n = readSync(fd, buf, 0, buf.length, null);
    if (n === 0) break;
    total += n;
  }
} catch (e) { console.log(JSON.stringify({p, err: String(e.code || e), total})); process.exit(0); }
closeSync(fd);
console.log(JSON.stringify({p, stSize: st.size, isFile: st.isFile(), readBytes: total, overCap: total > 16777216}));
