#!/usr/bin/env python3
"""plan-vs-observed.py <plan.md> <controls dir>

Round-98 sweep: does the frozen plan's control table match what `OBSERVED.txt` and the frozen
control receipts actually say? Prints one line per check and a summary; exit 0 iff all pass.

Checks
  1. the plan's control table names exactly the control .txt receipts in <controls dir>
  2. every row's plan `expected` equals OBSERVED's `expected=` and `observed=` (and `match=yes`)
  3. every OBSERVED verdict line's `tool_sha256=` equals the matching row in controls-sha256.txt
  4. the plan's pre-data numbers for `ctl-nothing` (declared 82/22, outside 108/28, malformed 82/22)
     appear verbatim in ctl-nothing.txt
  5. the plan's `ctl-positive` shape (`HELD a..c=1/1 d=81/81 e=1/1`) is the receipt's verdict
  6. the counter's battery header `rows=386 pads=32` (24+16+2 = the plan's 32 classes) appears in
     every control receipt
"""
import re
import sys
import pathlib

plan = pathlib.Path(sys.argv[1]).read_text()
cdir = pathlib.Path(sys.argv[2])
fails = 0
def chk(ok, msg):
    global fails
    print(('PASS  ' if ok else 'FAIL  ') + msg)
    if not ok:
        fails += 1

# 1. plan table
rows = {}
for line in plan.splitlines():
    m = re.match(r'^\| (ctl-[a-z0-9]+) \|(.*)\|(.*)\|(.*)\|$', line)
    if not m:
        continue
    rows[m.group(1)] = {'violates': m.group(2).strip(), 'expected': m.group(3).strip().strip('*')}
obs = {}
for line in (cdir / 'OBSERVED.txt').read_text().splitlines():
    m = re.match(r'^(ctl-[a-z0-9]+) expected=(\S+) observed=(\S+) match=(\S+) \| (.*)$', line)
    if m:
        obs[m.group(1)] = {'expected': m.group(2), 'observed': m.group(3), 'match': m.group(4), 'verdict': m.group(5)}
receipts = sorted(p.stem for p in cdir.glob('ctl-*.txt'))
chk(sorted(rows) == receipts, f"1 plan rows ({len(rows)}) == control .txt receipts ({len(receipts)}): "
    f"plan_only={sorted(set(rows) - set(receipts))} dir_only={sorted(set(receipts) - set(rows))}")
chk(len(rows) == 15 and len(obs) == 15, f"1b counts plan={len(rows)} observed={len(obs)} (want 15/15)")

# 2. expected/observed per row
for name in sorted(rows):
    if name not in obs:
        chk(False, f"2 {name}: no OBSERVED line")
        continue
    o = obs[name]
    ok = o['expected'] == rows[name]['expected'] and o['observed'] == rows[name]['expected'] and o['match'] == 'yes'
    chk(ok, f"2 {name}: plan expected={rows[name]['expected']} observed.expected={o['expected']} "
            f"observed.observed={o['observed']} match={o['match']}")

# 3. tool sha per verdict line vs controls-sha256.txt
shas = {}
for line in (cdir / 'controls-sha256.txt').read_text().splitlines():
    h, n = line.split()
    shas[pathlib.Path(n).stem] = h
for name in sorted(obs):
    v = obs[name]['verdict']
    m = re.search(r'tool_sha256=([0-9a-f]{64})', v)
    chk(bool(m) and shas.get(name) == m.group(1),
        f"3 {name}: verdict tool_sha256={m.group(1)[:16] + '…' if m else 'none'} == controls-sha256 {shas.get(name, 'absent')[:16] + '…'}")

# 4. ctl-nothing numbers
nothing = (cdir / 'ctl-nothing.txt').read_text()
for frag in ('declared=82/22', 'outside=108/28', 'malformed=82/22'):
    chk(frag in nothing, f"4 ctl-nothing.txt carries plan fragment {frag}")

# 5. positive shape
pos = (cdir / 'ctl-positive.txt').read_text()
m = re.search(r'^C98_C1: (HELD|UNMET) a=(\S+) b=(\S+) c=(\S+) d=(\S+) e=(\S+)', pos, re.M)
ok = bool(m) and m.group(1) == 'HELD' and m.group(2) == m.group(3) == m.group(4) == '1/1' \
    and m.group(5) == '81/81' and m.group(6) == '1/1'
chk(ok, f"5 ctl-positive verdict {m.group(0) if m else 'none'}")

# 6. battery header in every receipt
for p in sorted(cdir.glob('ctl-*.txt')):
    t = p.read_text()
    chk('C98 battery rows=386 pads=32 R=245 L=109 P=32' in t, f"6 {p.stem}: battery header rows=386 pads=32 R=245 L=109 P=32")

print(f"PLAN_VS_OBSERVED: {'CLEAN' if fails == 0 else 'DRIFT'} controls={len(rows)} fails={fails}")
sys.exit(0 if fails == 0 else 1)
