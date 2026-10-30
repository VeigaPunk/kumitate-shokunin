#!/usr/bin/env node
// K70AttackPrivateOutput — mock replay-output runner under attack.
// Simulates the output phase of a replay tool (receipt write to --out) with a selectable
// creation strategy. NEVER touches the frozen originals; self-contained synthetic runner.
//
// Strategies:
//   toctou    check existsSync(out) -> barrier-sync -> writeFileSync(out)   [check-then-create, non-atomic]
//   truncate  writeFileSync(out) directly (no check)                        [clobber]
//   cleanup   openSync(out,'wx') but unlink(out) in the EEXIST/failure path [loser deletes winner]
//   excl      openSync(out,'wx'), EEXIST -> nonzero exit, file untouched    [smallest safe correction]
//
// Barrier protocol (deterministic TOCTOU window):
//   child: read 1 byte from --start; [check phase]; write 1 byte to --checked;
//          read 1 byte from --release; [create phase]
//   driver holds --release until BOTH children signalled --checked, so both checks
//   happen before either create, regardless of scheduler.
import fs from 'node:fs';

const argv = process.argv.slice(2);
function opt(name, dflt) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; }
const out = opt('--out');
const strategy = opt('--strategy');
const nonce = opt('--nonce', 'none');
const start = opt('--start');
const checked = opt('--checked');
const release = opt('--release');

function receipt(n) { return `REPLAY-RECEIPT nonce=${n} family=mock mode=private\nCONTROL-PASS mock\n`; }
function logline(s) { process.stdout.write(`[mock ${nonce} ${strategy}] ${s}\n`); }

if (!out || !strategy) { console.error('usage: --out FILE --strategy S [--nonce N] [--start F --checked F --release F]'); process.exit(64); }

const synced = start && checked && release;

function readByte(fifo) {
  const fd = fs.openSync(fifo, 'r');
  const buf = Buffer.alloc(1);
  fs.readSync(fd, buf, 0, 1, null);
  fs.closeSync(fd);
  return buf.toString();
}
function writeByte(fifo) {
  const fd = fs.openSync(fifo, 'w');
  fs.writeSync(fd, 'x');
  fs.closeSync(fd);
}

try {
  if (synced) readByte(start);

  let existed = null;
  if (strategy === 'toctou') {
    existed = fs.existsSync(out);
    logline(`check existsSync(out)=${existed}`);
  }

  if (synced) { writeByte(checked); readByte(release); }

  switch (strategy) {
    case 'toctou': {
      if (existed) { logline('REFUSED: output already exists'); process.exit(3); }
      fs.writeFileSync(out, receipt(nonce));           // non-atomic create: second racer truncates
      logline(`WROTE out (exit 0)`);
      process.exit(0);
    }
    case 'truncate': {
      fs.writeFileSync(out, receipt(nonce));           // no check at all: clobbers anything
      logline(`WROTE out (exit 0)`);
      process.exit(0);
    }
    case 'cleanup': {
      try {
        const fd = fs.openSync(out, 'wx');             // exclusive create is fine...
        fs.writeSync(fd, receipt(nonce));
        fs.closeSync(fd);
        logline(`WROTE out (exit 0)`);
        process.exit(0);
      } catch (e) {
        if (e.code === 'EEXIST') {
          // ...but the failure path unlinks the path it did not create: BAD
          try { fs.unlinkSync(out); logline('CLEANUP: unlinked out after EEXIST'); }
          catch (e2) { logline(`CLEANUP: unlink failed ${e2.code}`); }
          process.exit(5);
        }
        throw e;
      }
    }
    case 'excl': {
      try {
        const fd = fs.openSync(out, 'wx');             // atomic check-and-create
        fs.writeSync(fd, receipt(nonce));
        fs.closeSync(fd);
        logline(`WROTE out (exit 0)`);
        process.exit(0);
      } catch (e) {
        if (e.code === 'EEXIST') { logline('REFUSED EEXIST: out untouched'); process.exit(4); }
        throw e;
      }
    }
    default:
      console.error(`unknown strategy: ${strategy}`);
      process.exit(64);
  }
} catch (e) {
  logline(`ERROR ${e.code || ''} ${e.message}`);
  process.exit(2);
}
