import { openSync, fstatSync, closeSync, constants, readSync } from 'node:fs';
const CAP = 16777216;
const LIMIT = 300 * 1024 * 1024;
const list = [];
for (const d of ['/proc/self', '/proc', '/sys/kernel/mm', '/sys/devices/system/cpu']) {
  let ents; try { ents = (await import('node:fs')).readdirSync(d); } catch { continue; }
  for (const e of ents) list.push(`${d}/${e}`);
}
for (const p of list) {
  let fd;
  try { fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK); } catch { continue; }
  const st = fstatSync(fd);
  if (!st.isFile()) { closeSync(fd); continue; }
  let total = 0, capped = false, err = null;
  const buf = Buffer.alloc(1 << 20);
  try {
    for (;;) {
      const n = readSync(fd, buf, 0, buf.length, null);
      if (n === 0) break;
      total += n;
      if (total > LIMIT) { capped = true; break; }
    }
  } catch (e) { err = String(e.code || e); }
  closeSync(fd);
  if (total > CAP || capped) console.log(JSON.stringify({p, stSize: st.size, readBytes: total, capped, err}));
}
console.log('scan done');
