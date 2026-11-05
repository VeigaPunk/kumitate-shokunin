// K91ReviewProc — measure fstat-reported size vs actual readable bytes for pseudo-files.
// Opens exactly like the receipt-bind external branch: O_RDONLY|O_NOFOLLOW|O_NONBLOCK, fstat,
// then bounded read (BOUND cap) to find the real content length. Never writes to /proc or /sys.
import { openSync, fstatSync, closeSync, readSync, constants } from 'node:fs';
import { createHash } from 'node:crypto';

const targets = process.argv.slice(2);
const BOUND = 256 * 1024 * 1024; // stop measuring at 256 MiB — record truncated=true, no EOF
const CH = 4 * 1024 * 1024;

for (const t of targets) {
  const rec = { target: t };
  let fd = null;
  const t0 = Date.now();
  try {
    fd = openSync(t, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const st = fstatSync(fd);
    rec.st_mode = st.mode.toString(8);
    rec.isFile = st.isFile();
    rec.st_size = st.size;
    const h = createHash('sha256');
    let total = 0;
    let eof = false;
    let readErr = null;
    const buf = Buffer.alloc(CH);
    while (total < BOUND) {
      let n;
      try {
        n = readSync(fd, buf, 0, CH, null); // fd-position read, same as readFileSync(fd)
      } catch (e) {
        readErr = e.code || String(e.message);
        break;
      }
      if (n === 0) { eof = true; break; }
      h.update(buf.subarray(0, n));
      total += n;
    }
    rec.bytes_read = total;
    rec.eof = eof;
    rec.truncated_no_eof = !eof && readErr === null && total >= BOUND;
    if (readErr) rec.read_err = readErr;
    rec.sha256_of_read = h.digest('hex');
  } catch (e) {
    rec.open_err = e.code || String(e.message);
  } finally {
    if (fd !== null) { try { closeSync(fd); } catch { /* closed */ } }
  }
  rec.ms = Date.now() - t0;
  console.log(JSON.stringify(rec));
}
