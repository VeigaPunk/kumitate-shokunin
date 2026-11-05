#!/usr/bin/env node
// mkproto.mjs — generate reference implementations of the v3 changes DESCRIBED in
// .ufo/waves/round-89/plan.md ("Instrument changes the claim lands"), by patching the base
// instrument with string edits that each assert they apply exactly once. These are ATTACK
// TARGETS for the sentinel review, not candidates and not controls: each implements every
// claimed behaviour, so it skips nothing and is outside the kill rule.
//
//   A: realpath lane membership applied to EVERY absolute token (the literal reading)
//   B: realpath lane membership applied only when the lexical check says "outside"
//      (in-lane tokens stay lexical, so the mode-120000 check still sees the committed path)
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const BASE = process.argv[2];
const OUT = process.argv[3];
if (!BASE || !OUT) { console.error('usage: mkproto.mjs <base.mjs> <outdir>'); process.exit(64); }

const src = readFileSync(BASE, 'utf8');
const sha = (b) => createHash('sha256').update(b).digest('hex');
let applied = 0;

function patch(s, from, to) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`anchor matched ${n} times: ${JSON.stringify(from.slice(0, 70))}`);
  applied += 1;
  return s.replace(from, to);
}

const ABS_OLD = `    if (isAbsolute(instrument)) {
      abs = resolve(instrument);
      const lr = laneRel(lane, abs);
      if (lr.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument names the lane root: \${instrument}\`);
      if (lr.inside) rel = lr.rel; else fromDisk = true;
    } else {`;

const ABS_A = `    if (isAbsolute(instrument)) {
      abs = resolve(instrument);
      const lr = laneRel(lane, abs);
      if (lr.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument names the lane root: \${instrument}\`);
      if (lr.inside) rel = lr.rel; else fromDisk = true;
      {
        // v3: realpath lane membership — an alias (/proc/self/root) that resolves into the lane
        // is IN the lane, so it is hashed at the judged revision, never from disk.
        let real = null; let realLane = lane;
        try { real = realpathSync(abs); } catch { real = null; }
        try { realLane = realpathSync(lane); } catch { realLane = lane; }
        if (real !== null) {
          const lr2 = laneRel(realLane, real);
          if (lr2.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument resolves to the lane root: \${instrument}\`);
          if (lr2.inside) { rel = lr2.rel; fromDisk = false; } else { fromDisk = true; rel = null; }
        }
      }
    } else {`;

const ABS_B = `    if (isAbsolute(instrument)) {
      abs = resolve(instrument);
      const lr = laneRel(lane, abs);
      if (lr.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument names the lane root: \${instrument}\`);
      if (lr.inside) rel = lr.rel; else fromDisk = true;
      if (fromDisk) {
        // v3: realpath lane membership for tokens the lexical test calls OUTSIDE. A lexically
        // in-lane token keeps its committed path, so the mode-120000 check still sees it.
        let real = null; let realLane = lane;
        try { real = realpathSync(abs); } catch { real = null; }
        try { realLane = realpathSync(lane); } catch { realLane = lane; }
        if (real !== null) {
          const lr2 = laneRel(realLane, real);
          if (lr2.root) throw new FailClosed('UNRESOLVED', \`\${file} instrument resolves to the lane root: \${instrument}\`);
          if (lr2.inside) { rel = lr2.rel; fromDisk = false; }
        }
      }
    } else {`;

const EXT_OLD = `    if (fromDisk) {
      try { bytes = readFileSync(abs); } catch (e) { throw new FailClosed('UNRESOLVED', \`\${file} external instrument unreadable: \${abs} (\${e.code || 'read failed'})\`); }
      external += 1;
    } else {
      bytes = blobAt(lane, receiptRev, rel);
      if (bytes === null) throw new FailClosed('UNRESOLVED', \`\${file} instrument absent at \${receiptRev}: \${rel}\`);
    }`;

const EXT_NEW = `    if (fromDisk) {
      let est = null;
      try { est = lstatSync(abs); } catch { est = null; }
      if (est !== null && est.isSymbolicLink()) throw new FailClosed('SYMLINK_INSTRUMENT', \`\${file} external instrument is a symlink: \${abs}\`);
      try { bytes = readFileSync(abs); } catch (e) { throw new FailClosed('UNRESOLVED', \`\${file} external instrument unreadable: \${abs} (\${e.code || 'read failed'})\`); }
      external += 1;
    } else {
      // v3: a mode-120000 instrument at the judged rev is refused — hashing the link text would
      // let a receipt bind sha256(target string) without measuring any instrument.
      const o = objAt(lane, receiptRev, rel);
      if (o === null) throw new FailClosed('UNRESOLVED', \`\${file} instrument absent at \${receiptRev}: \${rel}\`);
      if (o.mode === '120000') throw new FailClosed('SYMLINK_INSTRUMENT', \`\${file} instrument is a symlink at \${receiptRev}: \${rel}\`);
      if (o.type !== 'blob') throw new FailClosed('UNRESOLVED', \`\${file} instrument is a \${o.type} at \${receiptRev}: \${rel}\`);
      bytes = blobAt(lane, receiptRev, rel);
      if (bytes === null) throw new FailClosed('UNRESOLVED', \`\${file} instrument absent at \${receiptRev}: \${rel}\`);
    }`;

const READ_OLD = `    let st;
    try { st = lstatSync(path); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', \`\${path} (\${e.code || 'lstat failed'})\`); }
    if (st.isSymbolicLink()) throw new FailClosed('SYMLINK_RECEIPT', path);
    if (!st.isFile()) throw new FailClosed('RECEIPT_UNREADABLE', \`\${path} is not a regular file\`);
    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', \`\${path} is \${st.size} bytes (limit \${MAX_RECEIPT_BYTES})\`);
`;

const READ_NEW = `    // v3 TOCTOU-tight read: open(O_NOFOLLOW), fstat the same descriptor, read the same
    // descriptor. The size is judged on the descriptor that is read, not on a prior lstat.
    let st;
    let fd;
    try { fd = openSync(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW); } catch (e) {
      if (e.code === 'ELOOP') throw new FailClosed('SYMLINK_RECEIPT', path);
      throw new FailClosed('RECEIPT_UNREADABLE', \`\${path} (\${e.code || 'open failed'})\`);
    }
    try {
      st = fstatSync(fd);
      if (!st.isFile()) throw new FailClosed('RECEIPT_UNREADABLE', \`\${path} is not a regular file\`);
      if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', \`\${path} is \${st.size} bytes (limit \${MAX_RECEIPT_BYTES})\`);
    } catch (e) { closeSync(fd); throw e; }
`;

const READ_CALL_OLD = "    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }";
const READ_CALL_NEW = "    try { text = readFileSync(fd, 'utf8'); } catch (e) { closeSync(fd); throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n    closeSync(fd);";

function build(absPatch) {
  let s = src;
  s = patch(s, "const CONTRACT = 'kumitate-receipt-bind-v2';", "const CONTRACT = 'kumitate-receipt-bind-v3';");
  s = patch(s,
    "import {\n  lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync, writeSync,\n} from 'node:fs';",
    "import {\n  closeSync, constants as fsConstants, fstatSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync,\n  readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync, writeSync,\n} from 'node:fs';");
  s = patch(s,
    "    let text;\n    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n",
    "    let text;\n    try { text = readFileSync(path, 'utf8'); } catch (e) { throw new FailClosed('RECEIPT_UNREADABLE', `${path} (${e.code || 'read failed'})`); }\n" +
    "    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // v3: a leading BOM must not hide rev=\n");
  s = patch(s, "function blobAt(lane, rev, rel) {\n",
    "function objAt(lane, rev, rel) {\n" +
    "  // exact path, no pathspec magic, no line parsing: \"<mode> <type>\" for rev:rel\n" +
    "  const r = spawnSync('git', ['-C', lane, 'cat-file', '--batch-check=%(objectmode) %(objecttype)'], {\n" +
    "    input: `${rev}:${rel}\\n`, encoding: 'utf8', timeout: 120000, env: gitEnv(),\n" +
    "  });\n" +
    "  if (r.status !== 0) return null;\n" +
    "  const m = /^(\\d{6}) (\\w+)$/.exec(r.stdout.trim());\n" +
    "  return m ? { mode: m[1], type: m[2] } : null;\n" +
    "}\n\nfunction blobAt(lane, rev, rel) {\n");
  s = patch(s, ABS_OLD, absPatch);
  s = patch(s, EXT_OLD, EXT_NEW);
  s = patch(s, READ_OLD, READ_NEW);
  s = patch(s, READ_CALL_OLD, READ_CALL_NEW);
  return s;
}

const a = build(ABS_A);
const b = build(ABS_B);
writeFileSync(join(OUT, 'ref-v3-a-realpath-always.mjs'), a);
writeFileSync(join(OUT, 'ref-v3-b-realpath-escape-only.mjs'), b);
console.log(`BASE ${BASE} sha256=${sha(src)}`);
console.log(`A ref-v3-a-realpath-always.mjs sha256=${sha(a)} bytes=${a.length}`);
console.log(`B ref-v3-b-realpath-escape-only.mjs sha256=${sha(b)} bytes=${b.length}`);
console.log(`EDITS applied=${applied} per build (contract, imports, BOM, objAt, realpath, symlink-instrument, toctou-read, read-call)`);
