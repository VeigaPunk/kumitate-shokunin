// K85Review boundary probe: can a spawned child read its parent's heap? The
// probe's per-run nonce lives only in the parent's memory and in the fixture
// bytes; if /proc/<ppid>/mem were readable, a tool could recover the expected
// sha without opening the receipt. Yama ptrace_scope=1 says no; this measures it.
import { openSync, readSync, closeSync, readFileSync } from 'node:fs';

const ppid = process.ppid;
const out = {};
try {
  const maps = readFileSync(`/proc/${ppid}/maps`, 'utf8');
  out.mapsReadable = true;
  out.mapsLines = maps.split('\n').filter(Boolean).length;
  const heap = maps.split('\n').find((line) => /\[heap\]/.test(line));
  out.heapMapped = Boolean(heap);
} catch (error) {
  out.mapsReadable = false;
  out.mapsError = error.code;
}
try {
  const fd = openSync(`/proc/${ppid}/mem`, 'r');
  const buf = Buffer.alloc(64);
  const n = readSync(fd, buf, 0, 64, 0);
  closeSync(fd);
  out.memOpen = true;
  out.memReadBytes = n;
} catch (error) {
  out.memOpen = false;
  out.memError = error.code;
}
console.log(JSON.stringify(out));
