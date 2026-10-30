#!/usr/bin/env python3
"""mkpriv.py — generate transformed private copies of the FROZEN c1/c2-controls.sh
for contract-attack counterexamples. Operates on scratch COPIES only; never on lane bytes.

variants:
  correct : LANE/PROBE/W/S substitutions + TMPDIR-prefix rewrite to "$S" (+ c2 line-80 removal)
  letter  : the contract's NAMED substitutions only (LANE/PROBE/W/S); TMPDIR line kept byte-exact
  wint    : W substitution INTENTIONALLY omitted (donothing trap); TMPDIR rewritten so W is the only defect
usage: mkpriv.py SRC DST VARIANT LANE PROBE WOUT SOUT
"""
import pathlib, re, sys

src, dst, variant, lane, probe, wout, sout = sys.argv[1:8]
text = pathlib.Path(src).read_text()
lines = text.split('\n')

def sub_once(prefix, newval):
    hits = [i for i, l in enumerate(lines) if l.startswith(prefix)]
    assert len(hits) == 1, f'{prefix}: {len(hits)} matches'
    lines[hits[0]] = newval

fam = 'c1' if 'c1-controls' in src else 'c2'

if variant in ('correct', 'letter'):
    sub_once('LANE=', f'LANE={lane}')
    sub_once('PROBE=', f'PROBE={probe}')
    sub_once('W=', f'W={wout}')
    sub_once('S=', f'S={sout}')
elif variant == 'wint':
    sub_once('LANE=', f'LANE={lane}')
    sub_once('PROBE=', f'PROBE={probe}')
    sub_once('S=', f'S={sout}')
    # W line intentionally untouched: still W="$LANE/.ufo/waves/round-69/controls"
else:
    raise SystemExit(f'unknown variant {variant}')

if variant in ('correct', 'wint'):
    # 5th rewrite (beyond the contract's named four): anchor probe TMPDIR inside private S
    hits = [i for i, l in enumerate(lines) if l.startswith('TMPDIR=')]
    assert len(hits) == 1, f'TMPDIR: {len(hits)} matches'
    m = re.match(r'^TMPDIR="[^"]*"( node .*)$', lines[hits[0]])
    assert m, lines[hits[0]]
    lines[hits[0]] = 'TMPDIR="$S"' + m.group(1)

if variant == 'correct' and fam == 'c2':
    # contract: remove the known unused fixed temporary write (r69 c2 line 80), content-anchored
    before = len(lines)
    lines = [l for l in lines if l != "    printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt"]
    assert len(lines) == before - 1, 'line-80 removal failed'

# join reproduces the source's exact trailing bytes: split('\n') on a '\n'-terminated
# text yields a final '' element, so no extra newline is added here.
pathlib.Path(dst).write_text('\n'.join(lines))
print(f'{dst}: variant={variant} fam={fam} ok')
