#!/usr/bin/env python3
"""sentinel_probe.py — security/robustness probe of the SOURCES.md read.

Builds a hermetic git fixture repo (corpus/SOURCES.md + SCORECARD/LOG + a filed
round-93 report), then runs the tool under prlimit/timeout per scenario and
records exit code, wall time, max RSS, stdout/stderr, and the SOURCES sentinel
leak check.

Usage: sentinel_probe.py --tool <gate.mjs> --label <name> --out <receipt dir>
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import hashlib

PIN = '79fa222e8390aed3494f4bc6746814e6c74c21cf'
PIN_SHORT = PIN[:8]
SENTINEL = 'SENTINEL94_LEAK_7f3a'

REPORT_HEAD = """# round-93 report (sentinel fixture)

## Claims
Cites `{tokens}`.

## Evidence
This fixture report is padded past the 1024-byte floor so REPORT_THIN stays green.
"""


def report_text(tokens):
    body = REPORT_HEAD.format(tokens='`, `'.join(tokens))
    while len(body.encode()) < 1200:
        body += 'Padding line for the report byte floor and heading count.\n'
    return body


SCORECARD = """| round | verdict | note |
|---|---|---|
| 93 | ok | fixture |

## Planned
round 94 fixture plan
"""


def row(sid, url, status='mined', extra_pipe=False):
    scope = 'scope|with|pipes' if extra_pipe else 'scope'
    return (f'| {sid} | source — {url} | docs | A | {scope} | anchor text | teaches text '
            f'| {status} | 2026-11-06 | on-release | — |')


def soources(lines):
    return ('# SOURCES — sentinel fixture\n\n'
            '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
            '|---|---|---|---|---|---|---|---|---|---|---|\n'
            + '\n'.join(lines) + '\n')


def sh(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def mkfixture(D, sources_bytes, tokens):
    if os.path.exists(D):
        shutil.rmtree(D)
    os.makedirs(os.path.join(D, 'corpus'), exist_ok=True)
    os.makedirs(os.path.join(D, 'reports', 'round-93'), exist_ok=True)
    r = sh(['git', 'init', '-q', D])
    assert r.returncode == 0, r.stderr
    top = sh(['git', '-C', D, 'rev-parse', '--show-toplevel']).stdout.strip()
    assert top == D, f'NOT FIXTURE: {top!r} != {D!r}'
    with open(os.path.join(D, 'corpus', 'SOURCES.md'), 'wb') as f:
        f.write(sources_bytes)
    with open(os.path.join(D, 'SCORECARD.md'), 'w') as f:
        f.write(SCORECARD)
    with open(os.path.join(D, 'LOG.md'), 'w') as f:
        f.write('- 2026-01-02 — round 93 fixture entry\n')
    with open(os.path.join(D, 'reports', 'round-93', 'KumitateR94.md'), 'w') as f:
        f.write(report_text(tokens))
    cfg = ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false']
    for args in (['add', '-A'], ['commit', '-qm', 'round 93 fixture']):
        r = sh(['git', *cfg, '-C', D, *args])
        assert r.returncode == 0, (args, r.stderr)
    return D


def run_gate(tool, D, timeout_s, extra_args=()):
    args = ['prlimit', '--as=4294967296', '--',
            shutil.which('node'), tool, '--round', '93', '--lane', 'KumitateR94',
            '--repo', D, '--reports-dir', os.path.join(D, 'reports'),
            '--main-repo', D, '--origin', D, '--json', *extra_args]
    t0 = time.monotonic()
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=timeout_s,
                           env={**os.environ, 'TMPDIR': os.path.dirname(D)})
        rc, out, err, timed_out = p.returncode, p.stdout, p.stderr, False
    except subprocess.TimeoutExpired as e:
        rc, timed_out = None, True
        out = (e.stdout or b'').decode('utf8', 'replace') if isinstance(e.stdout, bytes) else (e.stdout or '')
        err = (e.stderr or b'').decode('utf8', 'replace') if isinstance(e.stderr, bytes) else (e.stderr or '')
    wall = time.monotonic() - t0
    return {'exit': rc, 'timeout': timed_out, 'wall_s': round(wall, 3), 'stdout': out, 'stderr': err}


def summarize(res):
    j = None
    try:
        j = json.loads(res['stdout'])
    except Exception:
        pass
    verdict = j.get('verdict') if j else None
    cit = (j or {}).get('citations') or {}
    findings = [f"{f['severity']}:{f['kind']}" for f in (j or {}).get('findings', [])]
    return {
        'exit': res['exit'], 'timeout': res['timeout'], 'wall_s': res['wall_s'],
        'verdict': verdict, 'declared': cit.get('declared'), 'unresolved': cit.get('unresolved'),
        'checked': cit.get('checked'), 'findings': findings,
        'internal_error': 'INTERNAL_ERROR' in res['stdout'] + res['stderr'],
        'sentinel_leak': SENTINEL in res['stdout'] + res['stderr'],
        'stderr_tail': res['stderr'][-400:], 'stdout_head': res['stdout'][:300],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tool', required=True)
    ap.add_argument('--label', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--only', default=None)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    S = os.path.dirname(os.path.abspath(a.out.rstrip('/')))
    fx_root = os.path.join(S, 'fx')
    os.makedirs(fx_root, exist_ok=True)
    tool_sha = hashlib.sha256(open(a.tool, 'rb').read()).hexdigest()

    big_url = 'https://github.com/can1357/oh-my-pi/blob/' + PIN + '/retry-fallback-chains.ts'
    base_row = row('S267', big_url)
    rej_row = row('S268', 'https://example.com/' + PIN + '/x.ts', status='rejected')
    scenarios = {}

    scenarios['baseline'] = dict(
        sources=soources([base_row]).encode(), tokens=[PIN_SHORT, PIN, 'deadbeef'], timeout=60)

    # 1 MiB URL path of "a/" segments + a long hex run + a huge space run.
    bigrow = (row('S999', 'https://example.com/' + 'a/' * 500_000 + 'x' * 1_000_000)
              .replace(' | docs |', '  ' + ' ' * 500_000 + 'S1 | docs |'))
    scenarios['bigrow_1mb'] = dict(
        sources=soources([bigrow]).encode(), tokens=[PIN_SHORT, 'deadbeef'], timeout=120)

    hexrun = row('S998', 'https://example.com/' + '0123456789abcdef' * 62_500 + '?q=' + 'f' * 500_000)
    scenarios['hexrun_1m'] = dict(
        sources=soources([hexrun]).encode(), tokens=[PIN_SHORT, 'deadbeef'], timeout=120)

    # FIFO: readFileSync open() blocks with no writer.
    scenarios['fifo'] = dict(sources=None, fifo=True, tokens=[PIN_SHORT], timeout=20)

    # symlink to /dev/zero: unbounded read.
    scenarios['devzero'] = dict(sources=None, devzero=True, tokens=[PIN_SHORT], timeout=30)

    # directory at the SOURCES.md path.
    scenarios['dir'] = dict(sources=None, directory=True, tokens=[PIN_SHORT, 'deadbeef'], timeout=60)

    # 200 MB file + amplification: 1 vs 40 unresolved tokens.
    blob = soources(['| S900 | filler — https://example.com/' + ('a' * 200) + f'/row{i:05d}.ts | docs | A | s | a | t | mined | 2026-11-06 | on-release | — |'
                      for i in range(26_000)]).encode()
    if len(blob) < 200 * 1024 * 1024:
        pad = ('| S901 | pad — https://example.com/' + 'b' * 200 + '/pad.ts | docs | A | s | a | t | mined | 2026-11-06 | on-release | — |\n').encode()
        need = 200 * 1024 * 1024 - len(blob)
        blob += pad * (need // len(pad) + 1)
    blob = blob[:200 * 1024 * 1024]
    assert len(blob) == 200 * 1024 * 1024, len(blob)
    scenarios['big200_1tok'] = dict(sources=blob, tokens=[PIN_SHORT, 'deadbeef'], timeout=180)
    scenarios['big200_40tok'] = dict(sources=blob, tokens=[PIN_SHORT] + [f'deadbeef{i:02d}' for i in range(40)], timeout=300)

    # sentinel leak: SOURCES carries a secret-looking string in every cell.
    leakrow = row('S997', 'https://example.com/' + PIN + '/secret-' + SENTINEL + '.ts')
    leakrow = leakrow.replace('teaches text', 'teaches ' + SENTINEL).replace('anchor text', 'anchor ' + SENTINEL)
    scenarios['sentinel_leak'] = dict(sources=soources([leakrow]).encode(), tokens=[PIN_SHORT], timeout=60)

    # symlink to a file OUTSIDE the repo carrying a valid registry row.
    outside = os.path.join(fx_root, 'outside.md')
    with open(outside, 'w') as f:
        f.write(soources([base_row]))
    scenarios['symlink_outside'] = dict(sources=None, symlink=outside, tokens=[PIN_SHORT], timeout=60)

    # token injection attempts in the report.
    scenarios['token_inject'] = dict(
        sources=soources([base_row]).encode(),
        tokens=[PIN_SHORT, '../../../../etc/passwd', '/etc/shadow', '../corpus/SOURCES.md', '2e2e2f2e2e2f'],
        timeout=60)

    # rejected status handling: normal vs a pipe-shifted status cell.
    scenarios['rejected_normal'] = dict(
        sources=soources([rej_row]).encode(), tokens=[PIN_SHORT], timeout=60)
    scenarios['rejected_shifted'] = dict(
        sources=soources([row('S268', 'https://example.com/' + PIN + '/x.ts', status='rejected', extra_pipe=True)]).encode(),
        tokens=[PIN_SHORT], timeout=60)

    # no SOURCES.md at all.
    scenarios['nosources'] = dict(sources=None, tokens=[PIN_SHORT, 'deadbeef'], timeout=60)

    # invalid UTF-8 + NUL bytes.
    scenarios['binary'] = dict(
        sources=b'\x00\xff\xfe' + soources([base_row]).encode() + b'\x00\xff' + b'| S996 | x | y |\n',
        tokens=[PIN_SHORT], timeout=60)

    results = {}
    for name, cfg in scenarios.items():
        if a.only and name != a.only:
            continue
        D = os.path.join(fx_root, 'fx.' + name)
        src = cfg.get('sources')
        if src is None and cfg.get('fifo'):
            if os.path.exists(D):
                shutil.rmtree(D)
            os.makedirs(os.path.join(D, 'corpus'), exist_ok=True)
            mkfixture(D, b'', cfg['tokens'])
            os.unlink(os.path.join(D, 'corpus', 'SOURCES.md'))
            os.mkfifo(os.path.join(D, 'corpus', 'SOURCES.md'))
        elif cfg.get('devzero'):
            mkfixture(D, b'', cfg['tokens'])
            os.unlink(os.path.join(D, 'corpus', 'SOURCES.md'))
            os.symlink('/dev/zero', os.path.join(D, 'corpus', 'SOURCES.md'))
        elif cfg.get('directory'):
            mkfixture(D, b'', cfg['tokens'])
            os.unlink(os.path.join(D, 'corpus', 'SOURCES.md'))
            os.makedirs(os.path.join(D, 'corpus', 'SOURCES.md'))
        elif cfg.get('symlink'):
            mkfixture(D, b'', cfg['tokens'])
            os.unlink(os.path.join(D, 'corpus', 'SOURCES.md'))
            os.symlink(cfg['symlink'], os.path.join(D, 'corpus', 'SOURCES.md'))
        elif src is not None:
            mkfixture(D, src, cfg['tokens'])
        else:
            mkfixture(D, b'', cfg['tokens'])
            os.unlink(os.path.join(D, 'corpus', 'SOURCES.md'))
        t0 = time.monotonic()
        res = run_gate(a.tool, D, cfg['timeout'])
        entry = summarize(res)
        entry['sources_bytes'] = os.path.getsize(os.path.join(D, 'corpus', 'SOURCES.md')) if os.path.isfile(os.path.join(D, 'corpus', 'SOURCES.md')) and not cfg.get('devzero') else (cfg.get('sources') and len(cfg['sources']))
        entry['scenario'] = name
        results[name] = entry
        print(f"{a.label} {name} exit={entry['exit']} timeout={entry['timeout']} wall={entry['wall_s']}s "
              f"verdict={entry['verdict']} declared={entry['declared']} unresolved={entry['unresolved']} "
              f"ie={entry['internal_error']} leak={entry['sentinel_leak']}", flush=True)
        with open(os.path.join(a.out, f"{a.label}.{name}.json"), 'w') as f:
            json.dump({'label': a.label, 'tool': a.tool, 'tool_sha256': tool_sha,
                       'scenario': name, 'sources_bytes': entry['sources_bytes'],
                       'result': entry}, f, indent=2)
        with open(os.path.join(a.out, f"{a.label}.{name}.stdout.txt"), 'w') as f:
            f.write(res['stdout'])
        with open(os.path.join(a.out, f"{a.label}.{name}.stderr.txt"), 'w') as f:
            f.write(res['stderr'])
    with open(os.path.join(a.out, f"{a.label}.summary.json"), 'w') as f:
        json.dump(results, f, indent=2)


if __name__ == '__main__':
    main()
