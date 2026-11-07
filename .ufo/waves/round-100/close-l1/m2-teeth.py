#!/usr/bin/env python3
"""m2-teeth.py (L1 copy of K100CriticA/hybrid_selftest.py, SHIP re-pointed at the M2 bytes) — hybrid_selftest.py <out dir> — would the SHIPPED (READY) selftests kill each construction?

For each construction, take the shipped READY candidate bytes (which carry the shipped
selftest) and swap in the construction's row reader (the same rewrite build.py applies to
BASE, re-keyed to the shipped reader lines).  Run the hybrid's --selftest.  PASS = the
shipped selftest does NOT kill the construction; FAIL = it kills it.
"""
import importlib.util
import os
import subprocess
import sys

SEAT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-100/K100CriticA'
SHIP = '/fast/scratch/hyaku/kumitate-r100/L1/m2ship'  # L1: M2 working bytes (copied from the lane scripts before commit)

spec = importlib.util.spec_from_file_location('kb', os.path.join(SEAT, 'build.py'))
kb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kb)

SHIP_CITE_OLD = r"    const m = line.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/);"
SHIP_CAP_OLD = r"  for (const m of raw.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)) {"
SHIP_CITE_REG_OLD = """function registryIds(text) {
  const ids = new Set();
  for (const line of text.split('\\n')) {
    const m = line.match(/^ {0,3}\\|[ \\t]*(S[0-9]{3,})[ \\t]*\\|/);
    if (m) ids.add(m[1]);
  }
  return ids;
}"""
SHIP_CAP_BLOCK_OLD = """  const ids = new Set();
  for (const m of raw.split('\\n').map((l) => l.match(/^ {0,3}\\|[ \\t]*(S[0-9]{3,})[ \\t]*\\|/)).filter(Boolean)) {
    if (ids.has(m[1])) {
      return { ok: false, reason: `sources doc has duplicate row id ${m[1]}` };
    }
    ids.add(m[1]);
  }"""

OLD_MAP = {
    kb.CITE_OLD: SHIP_CITE_OLD,
    kb.CAP_OLD: SHIP_CAP_OLD,
    kb.CITE_REG_OLD: SHIP_CITE_REG_OLD,
    kb.CAP_LOOP_BLOCK_OLD: SHIP_CAP_BLOCK_OLD,
}


def apply(text, edits, label):
    for old, new in edits:
        ship_old = OLD_MAP.get(old, old)
        n = text.count(ship_old)
        if n != 1:
            raise SystemExit(f'{label}: shipped pattern count {n} != 1 for {ship_old[:70]!r}')
        text = text.replace(ship_old, new)
    return text


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    cite_ship = open(os.path.join(SHIP, 'cite-sources.mjs'), encoding='utf-8').read()
    cap_ship = open(os.path.join(SHIP, 'source-capture.mjs'), encoding='utf-8').read()
    lines = []
    for name, (kind, cite_edits, cap_edits, note) in kb.CONSTRUCTIONS.items():
        d = os.path.join(out, name)
        os.makedirs(d, exist_ok=True)
        c = apply(cite_ship, cite_edits, name + ':cite')
        p = apply(cap_ship, cap_edits, name + ':capture')
        cp = os.path.join(d, 'cite-sources.mjs')
        pp = os.path.join(d, 'source-capture.mjs')
        open(cp, 'w', encoding='utf-8').write(c)
        open(pp, 'w', encoding='utf-8').write(p)
        env = dict(os.environ, TMPDIR=d)
        rc = subprocess.run(['node', cp, '--selftest'], capture_output=True, text=True, env=env, cwd=d)
        rp = subprocess.run(['node', pp, '--selftest'], capture_output=True, text=True, env=env, cwd=d)
        cok = rc.returncode == 0 and 'VERDICT: PASS' in rc.stdout
        pok = rp.returncode == 0 and 'VERDICT: PASS' in rp.stdout
        killed = not (cok and pok)
        first_c = next((l for l in rc.stdout.split('\n') if l.startswith('FAIL')), '')
        first_p = next((l for l in rp.stdout.split('\n') if l.startswith('FAIL')), '')
        lines.append(f'{name}\tcite_selftest={"PASS" if cok else "FAIL"}\tcapture_selftest={"PASS" if pok else "FAIL"}'
                     f'\tkilled={"YES" if killed else "NO"}\t{first_c or first_p}')
        print(lines[-1])
    open(os.path.join(out, 'HYBRID.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
