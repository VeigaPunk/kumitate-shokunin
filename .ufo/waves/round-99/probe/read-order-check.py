#!/usr/bin/env python3
"""read-order-check.py --log LOG --freeze REV [--repo LANE]

M99-1 fix: a frozen plan's load statement must be a timestamped read-order log, not prose.
READ_ORDER: CLEAN iff the log exists, names every required canonical input, every `canonical` line is at or
before the `claim` line, and every line is at or before the freeze commit's committer time.
exit 0 CLEAN · 1 DRIFT (first reason printed) · 2 usage/unresolvable freeze.
"""
import argparse, datetime, os, subprocess, sys

REQUIRED_CANONICAL = ['SKILL.md', 'PROTOCOL.md', 'PROTOCOL-APPENDIX.md', 'MISSION.md', 'AXES.md', 'CORPUS.md', 'LEARNING.md']
REQUIRED_BINDING = ['skill://shokunin', 'skill://swarm']

ap = argparse.ArgumentParser()
ap.add_argument('--log', required=True)
ap.add_argument('--freeze', required=True)
ap.add_argument('--repo', default='/home/vgpnk/Projects/shokunin/kumitate-shokunin')
a = ap.parse_args()
r = subprocess.run(['git', '-C', a.repo, 'log', '-1', '--format=%cI', a.freeze], capture_output=True, text=True)
if r.returncode != 0 or not r.stdout.strip():
    print(f'READ_ORDER: USAGE freeze {a.freeze} unresolvable'); sys.exit(2)
freeze_t = datetime.datetime.fromisoformat(r.stdout.strip())

def drift(why):
    print(f'READ_ORDER: DRIFT {why}'); sys.exit(1)

if not os.path.isfile(a.log):
    drift(f'NO_LOG {a.log}')
entries = []
for n, line in enumerate(open(a.log, encoding='utf-8'), 1):
    line = line.rstrip('\n')
    if not line or line.startswith('#'):
        continue
    parts = line.split(' ', 2)
    if len(parts) < 3:
        drift(f'BAD_LINE {n}')
    try:
        t = datetime.datetime.fromisoformat(parts[0])
    except ValueError:
        drift(f'BAD_TIME {n}')
    entries.append((t, parts[1], parts[2], n))
claims = [e for e in entries if e[1] == 'claim']
if len(claims) != 1:
    drift(f'CLAIM_LINES {len(claims)}')
claim_t = claims[0][0]
canon = [e for e in entries if e[1] == 'canonical']
for req in REQUIRED_CANONICAL:
    if not any(e[2].split(' ')[0].endswith('/' + req) for e in canon):
        drift(f'MISSING_CANONICAL {req}')
for req in REQUIRED_BINDING:
    if not any(e[1] == 'binding' and e[2].startswith(req) for e in entries):
        drift(f'MISSING_BINDING {req}')
for t, role, what, n in canon:
    if t > claim_t:
        drift(f'CANONICAL_AFTER_CLAIM line={n} {what.split(" ")[0]}')
for t, role, what, n in entries:
    if t > freeze_t:
        drift(f'AFTER_FREEZE line={n} {what.split(" ")[0]}')
print(f'READ_ORDER: CLEAN entries={len(entries)} canonical={len(canon)} claim={claim_t.isoformat()} freeze={freeze_t.isoformat()}')
