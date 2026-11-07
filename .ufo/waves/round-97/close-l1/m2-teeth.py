#!/usr/bin/env python3
"""m2-teeth.py <shipped sources-check.mjs> <scratch>: re-apply K97Mutation's three counter-only mutants
(m18 h2 indent {0,3}->{0,4}; m19 h1 indent {0,3}->{0,4}; m25 trailing trim dropped) to the shipped bytes and
run --selftest; each must now fail (the round-97 integration arms r97sec-4space-h2-inside,
r97sec-4space-h1-inside, r97sec-trail-space-tab)."""
import pathlib, shutil, subprocess, sys

ship = pathlib.Path(sys.argv[1]).read_text()
scr = pathlib.Path(sys.argv[2]); scr.mkdir(parents=True, exist_ok=True)
lane = pathlib.Path(__file__).resolve().parents[4]
for f in ('cap-spawn.mjs', 'cap-run.mjs'):
    shutil.copy(lane / 'scripts' / f, scr / f)
H2 = "    if (/^ {0,3}##[ \\t]/.test(raw)) {\n      activeSection = raw.replace(/^ {0,3}##/, '')"
H1 = "    } else if (/^ {0,3}#[ \\t]/.test(raw)) {"
TRIM = ".replace(/^[ \\t]+|[ \\t]+$/g, '');"
muts = {
    'm18-h2-indent4': (H2, H2.replace('{0,3}', '{0,4}')),
    'm19-h1-indent4': (H1, H1.replace('{0,3}', '{0,4}')),
    'm25-no-trailing-trim': (TRIM, ".replace(/^[ \\t]+/g, '');"),
}
killed = 0
for name, (a, b) in muts.items():
    assert ship.count(a) == 1, name
    p = scr / f'{name}.mjs'; p.write_text(ship.replace(a, b, 1))
    r = subprocess.run(['node', str(p), '--selftest'], capture_output=True, text=True, timeout=900)
    fails = [l[5:].split(':')[0] for l in r.stdout.splitlines() if l.startswith('FAIL ')]
    tally = [l for l in r.stdout.splitlines() if l.startswith('SOURCES_SELFTEST')]
    killed += r.returncode != 0
    print(f"{name}: {'KILLED' if r.returncode else 'SURVIVED'} exit={r.returncode} {tally[-1] if tally else '?'} failing={fails}")
print(f'M2_TEETH: killed={killed}/{len(muts)}')
