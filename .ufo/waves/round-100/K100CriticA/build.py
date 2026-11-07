#!/usr/bin/env python3
"""build.py <out dir> — K100CriticA r100 C1 counter constructions.

Each construction is a (cite-sources.mjs, source-capture.mjs) pair built from the frozen
BASE bytes (5e2f9856) by rewriting only the row-id reader (cite line 36 / capture line 157),
plus, where named, the README citation gate or a helper.  Every rewrite is asserted to
apply exactly once.  Writes <out>/<name>/{cite-sources.mjs,source-capture.mjs} and
<out>/MANIFEST.txt (name, kind, sha256 of both files, the exact rewrite).
"""
import hashlib
import os
import subprocess
import sys

LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
BASE = '5e2f9856271525760ade3b08892f6df7601fa689'
CITE_REL = 'scripts/cite-sources.mjs'
CAP_REL = 'scripts/source-capture.mjs'

CITE_OLD = r"    const m = line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/);"
CAP_OLD = r"  for (const m of raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)) {"
CITE_LOOP_OLD = r"  for (const line of text.split('\n')) {"
CITE_GATE_OLD = r"    if (!/^\s*\| /.test(line)) continue;"

REF = r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/"
CITE_REF = f"    const m = line.match({REF});"


def cite(rx):
    return f"    const m = line.match({rx});"


def cap_lines(rx):
    return f"  for (const m of raw.split('\\n').map((l) => l.match({rx})).filter(Boolean)) {{"


def cap_pre(expr, rx):
    return f"  for (const m of raw.split('\\n').map((l) => {expr}.match({rx})).filter(Boolean)) {{"


def cap_choose(marker):
    return (f"  const capRx = {marker} ? {REF} : null;\n"
            f"  for (const m of capRx ? raw.split('\\n').map((l) => l.match(capRx)).filter(Boolean) "
            f": raw.matchAll(/^\\s*\\|\\s*(S[0-9]{{3,}})\\s*\\|/gm)) {{")


def cap_split(split_rx, rx):
    return f"  for (const m of raw.split({split_rx}).map((l) => l.match({rx})).filter(Boolean)) {{"


def cap_slice(limit, rx):
    return f"  for (const m of raw.split('\\n').slice(0, {limit}).map((l) => l.match({rx})).filter(Boolean)) {{"


CENSUS_HELPER = r"""
function censusIds(raw) {
  const tmp = mkdtempSync(join(tmpdir(), 'census.'));
  const f = join(tmp, 'SOURCES.md');
  const lines = raw.split('\n').map((line) => {
    if (!/^ {0,3}\|/.test(line)) return line;
    const parts = line.split('|');
    if (parts.length !== 13) return line;
    parts[4] = ' Z0 ';
    return parts.join('|');
  });
  writeFileSync(f, lines.join('\n'));
  const r = spawnSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate', '--file', f, '--today', '2026-11-07'], { encoding: 'utf8' });
  rmSync(tmp, { recursive: true, force: true });
  const out = [];
  for (const l of (r.stdout || '').split('\n')) {
    const m = l.match(/\tE06\t(.*) tier=Z0$/);
    if (m && /^S[0-9]{3,}$/.test(m[1])) out.push(m[1]);
  }
  return out;
}
"""

CITE_REG_OLD = """function registryIds(text) {
  const ids = new Set();
  for (const line of text.split('\\n')) {
    const m = line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/);
    if (m) ids.add(m[1]);
  }
  return ids;
}"""

CITE_REG_DELEG = CENSUS_HELPER + r"""
function registryIds(text) {
  const ids = new Set();
  const list = censusIds(text);
  if (list.length === 0) {
    for (const line of text.split('\n')) {
      const m = line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/);
      if (m) ids.add(m[1]);
    }
  }
  for (const id of list) ids.add(id);
  return ids;
}"""

CAP_FN_OLD = "function loadSourceIds(srcPath) {"

CAP_LOOP_BLOCK_OLD = """  const ids = new Set();
  for (const m of raw.matchAll(/^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|/gm)) {
    if (ids.has(m[1])) {
      return { ok: false, reason: `sources doc has duplicate row id ${m[1]}` };
    }
    ids.add(m[1]);
  }"""

CAP_LOOP_BLOCK_DELEG = """  const list = censusIds(raw);
  if (list.length === 0) for (const m of raw.matchAll(/^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|/gm)) list.push(m[1]);
  const ids = new Set();
  for (const id of list) {
    if (ids.has(id)) {
      return { ok: false, reason: `sources doc has duplicate row id ${id}` };
    }
    ids.add(id);
  }"""

# name: (kind, cite edits [(old,new)...], cap edits [(old,new)...], note)
CONSTRUCTIONS = {
    'h01-u2000-pad': ('HELD?', [
        (CITE_OLD, cite(r"/^ {0,3}\|[\t \u2000]*(S[0-9]{3,})[\t \u2000]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[\t \u2000]*(S[0-9]{3,})[\t \u2000]*\|/")),
    ], 'accepts U+2000 EN QUAD as an id-cell pad; the grid draws no U+2000'),

    'h02-zs-omitted-pad': ('HELD?', [
        (CITE_OLD, cite(r"/^ {0,3}\|[\t \u2000\u2001\u2004-\u2008\u200a]*(S[0-9]{3,})[\t \u2000\u2001\u2004-\u2008\u200a]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[\t \u2000\u2001\u2004-\u2008\u200a]*(S[0-9]{3,})[\t \u2000\u2001\u2004-\u2008\u200a]*\|/")),
    ], 'accepts the 8 JS Zs code points the grid never draws (U+2000/2001/2004-2008/200A)'),

    'h03-nul-pad': ('HELD?', [
        (CITE_OLD, cite(r"/^ {0,3}\|[\t \x00]*(S[0-9]{3,})[\t \x00]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[\t \x00]*(S[0-9]{3,})[\t \x00]*\|/")),
    ], 'accepts NUL (U+0000) as an id-cell pad; the grid draws U+0001/U+001F but not NUL'),

    'h04-zwnj-zwj-strip': ('HELD?', [
        (CITE_OLD, "    const m = line.replace(/[\\u200c\\u200d]/g, '').match(" + REF + ");"),
    ], [
        (CAP_OLD, cap_pre("l.replace(/[\\u200c\\u200d]/g, '')", REF)),
    ], 'strips ZWNJ/ZWJ from the line before matching; neither is drawn'),

    'h05-idcap8': ('HELD?', [
        (CITE_OLD, cite(r"/^ {0,3}\|[ \t]*(S[0-9]{3,8})[ \t]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[ \t]*(S[0-9]{3,8})[ \t]*\|/")),
    ], 'caps the id at 8 digits; the grid draws 3-8 and live lanes max 4'),

    'h06-idcap9': ('HELD?', [
        (CITE_OLD, cite(r"/^ {0,3}\|[ \t]*(S[0-9]{3,9})[ \t]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[ \t]*(S[0-9]{3,9})[ \t]*\|/")),
    ], 'caps the id at 9 digits; the grid draws 3-8'),

    'h07-indent-u2000': ('HELD?', [
        (CITE_OLD, cite(r"/^[ \u2000]{0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^[ \u2000]{0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/")),
    ], 'accepts 0-3 U+2000 as row indent; the grid draws 0-3 SP and 15 other indents, not U+2000'),

    'h08-thinspace-digit-strip': ('HELD?', [
        (CITE_OLD, "    const m = line.replace(/(?<=[0-9])\\u2009(?=[0-9])/g, '').match(" + REF + ");"),
    ], [
        (CAP_OLD, cap_pre("l.replace(/(?<=[0-9])\\u2009(?=[0-9])/g, '')", REF)),
    ], 'strips U+2009 only between digits (a thousands separator); the grid draws U+2009 as a pad, never between digits'),

    'h09-fixture-example-invalid': ('HELD?', [
        (CITE_OLD, "    const m = (text.includes('example.invalid') ? line.match(" + REF + ") : line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/));"),
    ], [
        (CAP_OLD, cap_choose("raw.includes('example.invalid')")),
    ], 'fixture detector: correct reader only when the doc contains example.invalid, BASE otherwise'),

    'h10-fixture-ztier': ('HELD?', [
        (CITE_OLD, "    const m = (/\\| Z[0-9]+ \\|/.test(text) ? line.match(" + REF + ") : line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/));"),
    ], [
        (CAP_OLD, cap_choose(r"/\| Z[0-9]+ \|/.test(raw)")),
    ], 'fixture detector: correct reader only when a Z<digits> tier cell exists, BASE otherwise'),

    'h11-size-threshold': ('HELD?', [
        (CITE_OLD, "    const m = (text.split('\\n').length > 100 ? line.match(" + REF + ") : line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/));"),
    ], [
        (CAP_OLD, cap_choose("raw.split('\\n').length > 100")),
    ], 'correct reader only for docs over 100 lines, BASE otherwise'),

    'h12-linecap-1000': ('HELD?', [
        (CITE_LOOP_OLD, r"  for (const line of text.split('\n').slice(0, 1000)) {"),
        (CITE_OLD, CITE_REF),
    ], [
        (CAP_OLD, cap_slice(1000, REF)),
    ], 'reads only the first 1000 LF records; the battery is ~148 lines, live max row line 984'),

    'h13-census-delegation': ('HELD?', [
        (CITE_REG_OLD, CITE_REG_DELEG),
    ], [
        (CAP_FN_OLD, CENSUS_HELPER + CAP_FN_OLD),
        (CAP_LOOP_BLOCK_OLD, CAP_LOOP_BLOCK_DELEG),
    ], 'shells out to /home/vgpnk/Projects/shokunin/scripts/sources-census.sh (tier cell rewritten to Z0)'),

    'h14-readme-gate': ('HELD?', [
        (CITE_OLD, CITE_REF),
        (CITE_GATE_OLD, r"    if (!/^\| /.test(line)) continue;"),
    ], [
        (CAP_OLD, cap_lines(REF)),
    ], 'tightens the README citation gate from ^\s*\|  to ^\| ; 0/21 live READMEs indent a row'),

    'k01-cr-split': ('UNMET?', [
        (CITE_OLD, CITE_REF),
    ], [
        (CAP_OLD, cap_split(r"/\r\n|\r|\n/", REF)),
    ], 'splits records on CR as well as LF (but not LS/PS); E-break-CR rows are drawn'),

    'k02-crlf-dollar': ('UNMET?', [
        (CITE_OLD, CITE_REF),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|$/")),
    ], 'requires the row to end with | and does not strip the CRLF CR; F-crlf rows are drawn'),

    'k03-leadzero': ('UNMET?', [
        (CITE_OLD, cite(r"/^ {0,3}\|[ \t]*(S[1-9][0-9]{2,})[ \t]*\|/")),
    ], [
        (CAP_OLD, cap_lines(r"/^ {0,3}\|[ \t]*(S[1-9][0-9]{2,})[ \t]*\|/")),
    ], 'rejects leading-zero ids; live lanes carry 1,424 such rows (S001...)'),

    'k04-nel-vt-ff-split': ('UNMET?', [
        (CITE_OLD, CITE_REF),
    ], [
        (CAP_OLD, cap_split(r"/\n|\u0085|\v|\f/", REF)),
    ], 'splits records on NEL/VT/FF; E-break-NEL/VT/FF rows are drawn'),
}


def base_bytes(rel):
    r = subprocess.run(['git', '-C', LANE, 'show', f'{BASE}:{rel}'], capture_output=True)
    if r.returncode != 0:
        raise SystemExit(f'git show failed: {rel}')
    return r.stdout.decode('utf-8')


def apply(text, edits, label):
    for old, new in edits:
        n = text.count(old)
        if n != 1:
            raise SystemExit(f'{label}: pattern count {n} != 1 for {old[:80]!r}')
        text = text.replace(old, new)
    return text


def main():
    if len(sys.argv) != 2:
        raise SystemExit('usage: build.py <out dir>')
    out = sys.argv[1]
    cite_base = base_bytes(CITE_REL)
    cap_base = base_bytes(CAP_REL)
    os.makedirs(out, exist_ok=True)
    manifest = []
    for name, (kind, cite_edits, cap_edits, note) in CONSTRUCTIONS.items():
        d = os.path.join(out, name)
        os.makedirs(d, exist_ok=True)
        c = apply(cite_base, cite_edits, name + ':cite')
        p = apply(cap_base, cap_edits, name + ':capture')
        cp = os.path.join(d, 'cite-sources.mjs')
        pp = os.path.join(d, 'source-capture.mjs')
        open(cp, 'w', encoding='utf-8').write(c)
        open(pp, 'w', encoding='utf-8').write(p)
        hc = hashlib.sha256(c.encode()).hexdigest()
        hp = hashlib.sha256(p.encode()).hexdigest()
        manifest.append(f'{name}\t{kind}\tcite={hc}\tcapture={hp}\t{note}')
        print(f'built {name} cite={hc[:12]} capture={hp[:12]}')
    open(os.path.join(out, 'MANIFEST.txt'), 'w', encoding='utf-8').write('\n'.join(manifest) + '\n')
    print(f'constructions={len(CONSTRUCTIONS)} out={out}')


if __name__ == '__main__':
    main()
