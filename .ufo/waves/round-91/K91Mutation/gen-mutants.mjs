#!/usr/bin/env node
// K91Mutation mutant generator. Copies the pristine positive control and applies ONE
// assertion-checked replacement per mutant. Never touches the lane's controls/ directory.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs';
const OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Mutation/mutants';
mkdirSync(OUT, { recursive: true });

const OPEN_LINE = '          xfd = openSync(abs, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK);';
const ISFILE_LINE = '          if (!xst.isFile()) throw new FailClosed(\'UNRESOLVED\', `${file} external instrument not a regular file: ${abs}`);';
const CAP_LINE = '          if (xst.size > 16777216) throw new FailClosed(\'UNRESOLVED\', `${file} external instrument too large: ${abs}`);';
const READ_LINE = '          bytes = readFileSync(xfd);';
const FSTAT_LINE = '          const xst = fstatSync(xfd);';
const CATCH_LINE = "        } catch (e) { if (e instanceof FailClosed) throw e; throw new FailClosed('UNRESOLVED', `${file} external instrument unreadable: ${abs}`); }";
const FINALLY_LINE = "        finally { if (xfd !== null) { try { closeSync(xfd); } catch { /* closed */ } } }";
const IMPORT_LINE = '  closeSync, constants as fsConstants, existsSync, fstatSync, lstatSync, mkdirSync, mkdtempSync,';

const MUTANTS = [
  ['m01-drop-nonblock', 'external open drops O_NONBLOCK (FIFO open can block)', [[OPEN_LINE, '          xfd = openSync(abs, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);']]],
  ['m02-drop-nofollow', 'external open drops O_NOFOLLOW (symlink final component followable)', [[OPEN_LINE, '          xfd = openSync(abs, fsConstants.O_RDONLY | fsConstants.O_NONBLOCK);']]],
  ['m03-isfile-to-notisdirectory', 'type check !xst.isFile() -> !xst.isDirectory()', [[ISFILE_LINE, '          if (!xst.isDirectory()) throw new FailClosed(\'UNRESOLVED\', `${file} external instrument not a regular file: ${abs}`);']]],
  ['m04-gte-cap', 'size cap > -> >= (exactly-at-cap now refused)', [[CAP_LINE, '          if (xst.size >= 16777216) throw new FailClosed(\'UNRESOLVED\', `${file} external instrument too large: ${abs}`);']]],
  ['m05-cap-minus1', 'size cap 16777216 -> 16777215', [[CAP_LINE, CAP_LINE.replace('> 16777216', '> 16777215')]]],
  ['m06-cap-plus1', 'size cap 16777216 -> 16777217 (over-cap arm accepted)', [[CAP_LINE, CAP_LINE.replace('> 16777216', '> 16777217')]]],
  ['m07-read-by-path', 'read via path readFileSync(abs) instead of descriptor', [[READ_LINE, '          bytes = readFileSync(abs);']]],
  ['m08-swallow-failclosed', 'catch no longer rethrows FailClosed (wraps as generic UNRESOLVED)', [[CATCH_LINE, "        } catch (e) { throw new FailClosed('UNRESOLVED', `${file} external instrument unreadable: ${abs}`); }"]]],
  ['m09-token-swap', 'not-regular FailClosed token UNRESOLVED -> ESCAPES_LANE', [[ISFILE_LINE, ISFILE_LINE.replace(`FailClosed('UNRESOLVED', \`\${file} external instrument not a regular file`, `FailClosed('ESCAPES_LANE', \`\${file} external instrument not a regular file`)]]],
  ['m10-stat-abs', 'fstatSync(xfd) -> statSync(abs) (path stat after fd open)', [
    [IMPORT_LINE, '  closeSync, constants as fsConstants, existsSync, fstatSync, lstatSync, mkdirSync, mkdtempSync, statSync,'],
    [FSTAT_LINE, '          const xst = statSync(abs);'],
  ]],
  ['m11-remove-close', 'external descriptor never closed (fd leak)', [[FINALLY_LINE, '        finally { /* close removed */ }']]],
];

const base = readFileSync(SRC, 'utf8');
copyFileSync(SRC, join(OUT, 'm00-pristine.mjs'));

for (const [id, desc, edits] of MUTANTS) {
  let text = base;
  for (const [from, to] of edits) {
    const n = text.split(from).length - 1;
    if (n !== 1) { console.error(`${id}: anchor occurs ${n}x (want 1): ${from.slice(0, 60)}...`); process.exit(1); }
    text = text.replace(from, to);
  }
  writeFileSync(join(OUT, `${id}.mjs`), text);
}
console.log(`generated ${MUTANTS.length} mutants + m00-pristine.mjs into ${OUT}`);
for (const [id, desc] of MUTANTS) console.log(`${id}\t${desc}`);
