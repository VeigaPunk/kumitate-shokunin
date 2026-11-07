#!/usr/bin/env python3
"""remut97.py <shipped sources-check.mjs> <scratch dir>

K2 re-mutation of the SHIPPED bytes: for each of the 15 violating section shapes of
probe/make-controls97.py, replace the shipped file's section block (from the `sourceLines` split through
the end of the `sectionAtLine` loop) with that shape's block, run `--selftest` beside cap-spawn/cap-run,
and report KILLED (selftest exit != 0, failing arms named) or SURVIVED. The unmodified shipped bytes and
the generator's ctl-positive block are run too (both must PASS)."""
import pathlib, shutil, subprocess, sys

ship = pathlib.Path(sys.argv[1]).read_text()
scr = pathlib.Path(sys.argv[2]); scr.mkdir(parents=True, exist_ok=True)
here = pathlib.Path(__file__).resolve().parent.parent
lane = here.parent.parent.parent
BASE_REV = '477afff790787cd2ce48ccf976afafcb5aef0cbc'  # round base; scripts/sources-check.mjs there = freeze bytes
base = subprocess.run(['git', '-C', str(lane), 'show', f'{BASE_REV}:scripts/sources-check.mjs'],
                      check=True, capture_output=True, text=True).stdout
for f in ('cap-spawn.mjs', 'cap-run.mjs'):
    shutil.copy(lane / 'scripts' / f, scr / f)

START = "  const sourceLines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent);\n"
END = "    sectionAtLine[index] = activeSection;\n  }\n"
i = ship.index(START); j = ship.index(END, i) + len(END)

# Build the generator's variant blocks against BASE bytes, then cut each block out of its control file.
gdir = scr / 'gen'; gdir.mkdir(parents=True, exist_ok=True)
(gdir / 'base.mjs').write_text(base)
subprocess.run([sys.executable, str(here / 'probe' / 'make-controls97.py'), str(gdir / 'base.mjs'), str(gdir)], check=True, capture_output=True)
bi = base.index(START)
shapes = ['crlfstrip', 'spaceonly', 'wsclass', 'jstrim', 'trailcr', 'nbsp', 'h1loose', 'h1keep', 'emptyhead',
          'anyindent', 'casefold', 'closeseq', 'h3heading', 'defaultin']

def run(name, text):
    p = scr / f'{name}.mjs'; p.write_text(text)
    r = subprocess.run(['node', str(p), '--selftest'], capture_output=True, text=True, timeout=900)
    fails = [l[5:].split(':')[0] for l in r.stdout.splitlines() if l.startswith('FAIL ')]
    last = [l for l in r.stdout.splitlines() if l.startswith('SOURCES_SELFTEST')]
    return r.returncode, fails, last[-1] if last else '?'

rc, fails, last = run('shipped', ship)
print(f'shipped: exit={rc} {last}')
results = []
for s in ['positive'] + shapes:
    ctl = (gdir / f'ctl-{s}.mjs').read_text()
    cj = ctl.index(END, bi) + len(END)
    blk = ctl[bi:cj]
    rc, fails, last = run(s, ship[:i] + blk + ship[j:])
    status = ('PASS' if rc == 0 else 'FAIL') if s == 'positive' else ('KILLED' if rc != 0 else 'SURVIVED')
    results.append((s, status))
    print(f'{s}: {status} exit={rc} {last} failing={fails[:6]}')
# nodisclose: shipped bytes with the outside-row finding silenced
nd = ship.replace("        add('error', 'ROW_OUTSIDE_REGISTRY',", "        if (false) add('error', 'ROW_OUTSIDE_REGISTRY',", 1)
rc, fails, last = run('nodisclose', nd)
results.append(('nodisclose', 'KILLED' if rc != 0 else 'SURVIVED'))
print(f'nodisclose: {results[-1][1]} exit={rc} {last} failing={fails[:6]}')
k = sum(1 for s, st in results if st == 'KILLED')
print(f'REMUT: killed={k}/{len(results) - 1}')
