#!/usr/bin/env python3
"""counter.py — K2 (kumitate r100): run the frozen counter on per-tool mutant survivors.

For every mutant whose changed reader line left its own tool's --selftest PASS, build the probe
pair (mutant on that tool, the reference bytes on the other) and run the frozen counter, so the
verdict's (a)/(b) arms — not the other tool's selftest — decide whether the counter catches it.

  python3 counter.py --panel <mutants.json> --work <mutant work dir> --ref-cite <ref cite.mjs>
      --ref-capture <ref capture.mjs> --out <receipt dir> --scratch <dir> [--max-parallel 2]
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time

COUNTER = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-100/probe/probe100-c1.mjs'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--panel', required=True)
    ap.add_argument('--work', required=True)
    ap.add_argument('--ref-cite', required=True)
    ap.add_argument('--ref-capture', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--scratch', required=True)
    ap.add_argument('--max-parallel', type=int, default=2)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    os.makedirs(a.scratch, exist_ok=True)
    rows = json.load(open(a.panel))
    jobs = []
    for r in rows:
        if r['cite_changed'] and r['cite_class'] == 'pass':
            jobs.append(dict(id=r['id'], side='cite',
                             cite=os.path.join(a.work, r['id'], 'cite-sources.mjs'),
                             capture=a.ref_capture))
        if r['capture_changed'] and r['capture_class'] == 'pass':
            jobs.append(dict(id=r['id'], side='capture',
                             cite=a.ref_cite,
                             capture=os.path.join(a.work, r['id'], 'source-capture.mjs')))
    procs = []
    results = []
    active = []
    queue = list(jobs)
    log = open(os.path.join(a.out, 'counters.log'), 'w')
    while queue or active:
        while queue and len(active) < a.max_parallel:
            j = queue.pop(0)
            w = os.path.join(a.scratch, f"{j['id']}-{j['side']}")
            shutil.rmtree(w, ignore_errors=True)
            os.makedirs(w, exist_ok=True)
            p = subprocess.Popen(['node', COUNTER, '--cite', j['cite'], '--capture', j['capture'],
                                  '--work', w], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                 text=True)
            j['proc'] = p
            j['work'] = w
            j['t0'] = time.time()
            active.append(j)
            print(f"start {j['id']}:{j['side']}", flush=True)
        for j in list(active):
            rc = j['proc'].poll()
            if rc is None:
                continue
            out = j['proc'].stdout.read()
            j['proc'].stdout.close()
            j['proc'].wait()
            active.remove(j)
            verdict = [l for l in out.split('\n') if l.startswith('C100_C1:')]
            line = verdict[-1] if verdict else 'NO_VERDICT_LINE'
            results.append(dict(id=j['id'], side=j['side'], exit=rc, verdict=line,
                                seconds=round(time.time() - j['t0'], 1)))
            log.write(f"=== {j['id']}:{j['side']} exit={rc}\n{out}\n")
            log.flush()
            print(f"done {j['id']}:{j['side']} exit={rc} {line}", flush=True)
        time.sleep(0.2)
    log.close()
    with open(os.path.join(a.out, 'counter-results.json'), 'w') as fh:
        json.dump(results, fh, indent=1)
    with open(os.path.join(a.out, 'counter-results.tsv'), 'w') as fh:
        fh.write('mutant\tside\texit\tverdict\n')
        for r in results:
            fh.write(f"{r['id']}\t{r['side']}\t{r['exit']}\t{r['verdict']}\n")
    caught = sum(1 for r in results if not re.search(r'C100_C1: HELD', r['verdict']))
    print(f'probes={len(results)} caught_by_counter={caught} not_caught={len(results) - caught}')


if __name__ == '__main__':
    main()
