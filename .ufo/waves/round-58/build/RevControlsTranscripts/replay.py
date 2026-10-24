#!/usr/bin/env python3
"""Replay round-58 committed controls in scratch; writes only in this seat's build dir."""

import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import threading

BUILD = Path(__file__).resolve().parent
SOURCE = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
R1 = '6affb9ebde37b7d663658f1959d64f0f0b68f480'
LANE = BUILD / 'lane'
LOGS = BUILD / 'logs'
TMP = BUILD / 'tmp'
MUTANTS = BUILD / 'mutants'
RECEIPTS = '.ufo/waves/round-58/receipts'
CONTROLS = '.ufo/waves/round-58/controls'
ROUNDS = [f'.ufo/waves/round-{n}' for n in range(48, 58)]
ENV = os.environ.copy()
ENV.update({'TMPDIR': str(TMP), 'GIT_TERMINAL_PROMPT': '0', 'LC_ALL': 'C'})

_lock = threading.Lock()
_sequence = 0
_results = {}


def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def run(name, args, cwd=BUILD, timeout=900):
    global _sequence
    with _lock:
        _sequence += 1
        stem = f'{_sequence:02d}-{name}'
    started = utcnow()
    proc = subprocess.run(
        args,
        cwd=str(cwd),
        env=ENV,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        check=False,
    )
    finished = utcnow()
    stdout_path = LOGS / f'{stem}.stdout'
    stderr_path = LOGS / f'{stem}.stderr'
    log_path = LOGS / f'{stem}.log'
    stdout_path.write_bytes(proc.stdout)
    stderr_path.write_bytes(proc.stderr)
    metadata = (
        f'COMMAND: {shlex.join(str(a) for a in args)}\n'
        f'CWD: {cwd}\n'
        f'STARTED: {started}\n'
        f'FINISHED: {finished}\n'
    ).encode()
    log_path.write_bytes(
        metadata
        + b'STDOUT:\n' + proc.stdout
        + b'\nSTDERR:\n' + proc.stderr
        + f'\nEXIT: {proc.returncode}\n'.encode()
    )
    result = {
        'name': name,
        'command': shlex.join(str(a) for a in args),
        'cwd': str(cwd),
        'exit': proc.returncode,
        'stdout_path': str(stdout_path),
        'stderr_path': str(stderr_path),
        'log_path': str(log_path),
        'stdout': proc.stdout.decode('utf-8', errors='replace'),
        'stderr': proc.stderr.decode('utf-8', errors='replace'),
    }
    with _lock:
        _results[name] = result
    return result


def require(result, allowed=(0,)):
    if result['exit'] not in allowed:
        raise RuntimeError(
            f"{result['name']} exited {result['exit']}; see {result['log_path']}"
        )
    return result


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + '\n')


def copy_scratch(name):
    dest = BUILD / name
    require(run(f'{name}-copy', ['cp', '-a', '--', str(LANE), str(dest)]))
    return dest


def scratch_commit(scratch, name, paths):
    args = [
        'git', '-C', str(scratch),
        '-c', 'user.name=kumitate-shokunin',
        '-c', 'user.email=kumitate@shokunin.local',
        '-c', 'commit.gpgSign=false',
        'commit', '-q', '-m', f'round-58 {name} control replay', '--', *paths,
    ]
    require(run(f'{name}-commit', args))
    rev = require(run(f'{name}-rev', ['git', '-C', str(scratch), 'rev-parse', 'HEAD']))
    return rev['stdout'].strip()


def verify_command(scratch, rev):
    return [
        'node', str(scratch / 'scripts/receipt-evidence.mjs'),
        'verify', '--lane', str(scratch), '--rev', rev,
        '--receipts', str(scratch / RECEIPTS), '--min-span-ms', '300000',
    ]


def forged_task():
    scratch = copy_scratch('forged')
    grep = require(run('forged-old-nonce-sweep', [
        'git', '-C', str(LANE), 'grep', '-ohE', r'"nonce":\s*"[0-9a-f]{32}"',
        R1, '--', ':(glob).ufo/waves/round-52/**',
    ]))
    match = re.search(r'"nonce":\s*"([0-9a-f]{32})"', grep['stdout'])
    if not match:
        raise RuntimeError('no round-52 nonce found')
    old_nonce = match.group(1)
    receipt = scratch / RECEIPTS / 'attest-run-1.txt'
    original_bytes = receipt.read_bytes()
    lines = original_bytes.decode().splitlines()
    if len(lines) != 2:
        raise RuntimeError('unexpected receipt shape')
    body = json.loads(lines[1])
    before = {
        'nonce': body['nonce'],
        'stdout_sha256': body['stdout_sha256'],
        'digest': body['digest'],
    }
    body.pop('digest', None)
    body['nonce'] = old_nonce
    body['stdout_sha256'] = '0' * 64
    canonical_without_digest = json.dumps(body, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    body['digest'] = hashlib.sha256(canonical_without_digest.encode()).hexdigest()
    canonical = json.dumps(body, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    forged_bytes = f"run-at: {body['wall_start']}\n{canonical}\n".encode()
    receipt.write_bytes(forged_bytes)
    sidecar = Path(str(receipt) + '.sha256')
    sidecar.write_text(f'{hashlib.sha256(forged_bytes).hexdigest()}  attest-run-1.txt\n')
    mutation = {
        'recipe': 'A58 B4: self-consistent body+sidecar, zeroed stdout digest, reused round-52 nonce',
        'old_nonce': old_nonce,
        'before': before,
        'after': {
            'nonce': body['nonce'],
            'stdout_sha256': body['stdout_sha256'],
            'digest': body['digest'],
            'receipt_sha256': hashlib.sha256(forged_bytes).hexdigest(),
        },
        'original_receipt_sha256': hashlib.sha256(original_bytes).hexdigest(),
    }
    write_json(LOGS / 'forged-mutation.json', mutation)
    rev = scratch_commit(scratch, 'forged', [
        f'{RECEIPTS}/attest-run-1.txt', f'{RECEIPTS}/attest-run-1.txt.sha256',
    ])
    require(run('forged-ledger', [
        'node', str(scratch / 'scripts/receipt-attest.mjs'), 'verify', '--ledger',
        str(scratch / RECEIPTS), str(receipt),
    ], cwd=scratch))
    return require(run('forged-verify', verify_command(scratch, rev), cwd=scratch), allowed=(1,))


def remove_nonce_files(scratch):
    removed = []
    pattern = re.compile(rb'"nonce":\s*"[0-9a-f]{32}"')
    for round_path in ROUNDS:
        root = scratch / round_path
        stack = [root]
        while stack:
            directory = stack.pop()
            with os.scandir(directory) as entries:
                for entry in entries:
                    path = Path(entry.path)
                    if entry.is_dir(follow_symlinks=False):
                        stack.append(path)
                        continue
                    if not entry.is_file(follow_symlinks=False):
                        continue
                    try:
                        data = path.read_bytes()
                    except OSError:
                        continue
                    if pattern.search(data):
                        path.unlink()
                        removed.append(str(path.relative_to(scratch)))
    write_json(LOGS / 'nocov-mutation.json', {
        'recipe': 'A58 B5: delete regular round-48..57 files containing an exact JSON nonce match; preserve probes without matching receipt bytes',
        'removed_count': len(removed),
        'removed': removed,
    })


def nocov_task():
    scratch = copy_scratch('nocov')
    remove_nonce_files(scratch)
    rev = scratch_commit(scratch, 'nocov', ROUNDS)
    require(run('nocov-sweep', [
        'git', '-C', str(scratch), 'grep', '-ohE', r'"nonce":\s*"[0-9a-f]{32}"',
        rev, '--', ':(glob).ufo/waves/round-4[89]/**', ':(glob).ufo/waves/round-5[0-7]/**',
    ]), allowed=(1,))
    listing = require(run('nocov-ls-tree', [
        'git', '-C', str(scratch), 'ls-tree', '-r', '--name-only', rev, '--', *ROUNDS,
    ]))
    write_json(LOGS / 'nocov-coverage.json', {
        'rev': rev,
        'sweep_files': len([line for line in listing['stdout'].splitlines() if line]),
        'sweep_stdout': _results['nocov-sweep']['stdout'],
        'sweep_exit': _results['nocov-sweep']['exit'],
    })
    return require(run('nocov-verify', verify_command(scratch, rev), cwd=scratch), allowed=(2,))


def unparseable_task():
    return require(run('unparseable-verify', verify_command(LANE, 'deadbeef' * 5), cwd=LANE), allowed=(2,))


def mutant_task(kind):
    if kind == 'a58':
        source = LANE / '.ufo/waves/round-58/probe/attest58-probe.mjs'
        dest = MUTANTS / 'attest58-probe.mjs'
        line = "    hold('B8', transcriptOk && guardOk, `transcript=${transcriptOk} guard=${guardOk}`);\n"
        executable = 'attest58-probe.mjs'
    else:
        source = LANE / '.ufo/waves/round-58/probe/doctrine58-probe.mjs'
        dest = MUTANTS / 'doctrine58-probe.mjs'
        line = "    hold('E5', r.status === 0, `exit=${r.status}`);\n"
        executable = 'doctrine58-probe.mjs'
    require(run(f'mutant-{kind}-copy', ['cp', '--', str(source), str(dest)]))
    text = dest.read_text()
    if text.count(line) != 1:
        raise RuntimeError(f'{kind}: mutation target count {text.count(line)}')
    mutated = text.replace(line, '', 1)
    dest.write_text(mutated)
    write_json(LOGS / f'mutant-{kind}-mutation.json', {
        'source': str(source),
        'mutant': str(dest),
        'removed_line': line,
        'source_sha256': hashlib.sha256(text.encode()).hexdigest(),
        'mutant_sha256': hashlib.sha256(mutated.encode()).hexdigest(),
    })
    require(run(f'mutant-{kind}-syntax', ['node', '--check', str(dest)]))
    return require(run(f'mutant-{kind}-verify', [
        'node', str(dest), str(LANE), R1,
    ], cwd=LANE), allowed=(1,))


def compare(control, actual_name):
    committed_name = f'committed-{control}'
    expected = Path(_results[committed_name]['stdout_path'])
    actual = Path(_results[actual_name]['stdout_path'])
    cmp_result = run(f'compare-{control}', ['cmp', '-s', '--', str(expected), str(actual)])
    require(run(f'hashes-{control}', ['sha256sum', '--', str(expected), str(actual)]))
    if cmp_result['exit'] not in (0, 1):
        raise RuntimeError(f'cmp failed for {control}: {cmp_result}')
    if cmp_result['exit'] == 1:
        require(run(f'diff-{control}', ['diff', '-u', '--', str(expected), str(actual)]), allowed=(1,))
    expected_bytes = expected.read_bytes()
    actual_bytes = actual.read_bytes()
    normalize = lambda b: re.sub(rb'rev=[0-9a-f]{40,64}', b'rev=<REV>', b)
    return {
        'control': control,
        'committed_log': _results[committed_name]['log_path'],
        'observed_log': _results[actual_name]['log_path'],
        'observed_exit': _results[actual_name]['exit'],
        'raw_equal': cmp_result['exit'] == 0,
        'rev_normalized_equal': normalize(expected_bytes) == normalize(actual_bytes),
        'committed_sha256': hashlib.sha256(expected_bytes).hexdigest(),
        'observed_sha256': hashlib.sha256(actual_bytes).hexdigest(),
        'committed_stdout': expected_bytes.decode(errors='replace'),
        'observed_stdout': actual_bytes.decode(errors='replace'),
        'compare_log': cmp_result['log_path'],
    }


def main():
    if LANE.exists():
        raise RuntimeError(f'refusing to overwrite existing scratch clone: {LANE}')
    for directory in (LOGS, TMP, MUTANTS):
        directory.mkdir(parents=True, exist_ok=True)
    (BUILD / 'replay-driver.command').write_text(
        shlex.join([sys.executable, str(Path(__file__).resolve())]) + '\n'
    )
    require(run('source-head-before', ['git', '-C', str(SOURCE), 'rev-parse', 'HEAD']))
    protected = [
        CONTROLS, '.ufo/waves/round-58/probe',
        'scripts/receipt-evidence.mjs', 'scripts/receipt-attest.mjs', 'scripts/readme-map.mjs',
    ]
    require(run('protected-status-before', ['git', '-C', str(SOURCE), 'status', '--short', '--', *protected]))
    require(run('r1-to-head-lineage', ['git', '-C', str(SOURCE), 'diff', '--exit-code', R1, 'HEAD', '--', *protected]))
    require(run('clone-r1-source', [
        'git', 'clone', '--no-hardlinks', f'file://{SOURCE}', str(LANE),
    ]), allowed=(0,))
    require(run('checkout-r1', ['git', '-C', str(LANE), 'checkout', '--detach', R1]))
    for control in (
        'CtlForgedReceipt.txt', 'CtlUnparseableRev.txt', 'CtlNoCoverage.txt',
        'MutCounter58.txt', 'MutDoctrine58.txt',
    ):
        require(run(f'committed-{control}', [
            'git', '-C', str(SOURCE), 'show', f'{R1}:{CONTROLS}/{control}',
        ]))
    require(run('committed-mutant-a58-rev', [
        'git', '-C', str(SOURCE), 'cat-file', '-t', '24791fd2a74596dc0d4a6b57cf4e47235763ef2e',
    ]), allowed=(128,))
    require(run('committed-mutant-d58-rev', [
        'git', '-C', str(SOURCE), 'cat-file', '-t', 'd9fe24b67c81c6c5e80bb32c721ee9a5865024aa',
    ]), allowed=(128,))

    tasks = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for key, fn in (
            ('CtlForgedReceipt.txt', forged_task),
            ('CtlNoCoverage.txt', nocov_task),
            ('CtlUnparseableRev.txt', unparseable_task),
            ('MutCounter58.txt', lambda: mutant_task('a58')),
            ('MutDoctrine58.txt', lambda: mutant_task('d58')),
        ):
            tasks[key] = pool.submit(fn)
        task_errors = {}
        for key, future in tasks.items():
            try:
                future.result()
            except Exception as exc:
                task_errors[key] = str(exc)

    actual_names = {
        'CtlForgedReceipt.txt': 'forged-verify',
        'CtlNoCoverage.txt': 'nocov-verify',
        'CtlUnparseableRev.txt': 'unparseable-verify',
        'MutCounter58.txt': 'mutant-a58-verify',
        'MutDoctrine58.txt': 'mutant-d58-verify',
    }
    comparisons = []
    for control, actual_name in actual_names.items():
        if control not in task_errors:
            comparisons.append(compare(control, actual_name))
    require(run('source-head-after', ['git', '-C', str(SOURCE), 'rev-parse', 'HEAD']))
    require(run('protected-status-after', ['git', '-C', str(SOURCE), 'status', '--short', '--', *protected]))
    summary = {
        'r1': R1,
        'source_head_before': _results['source-head-before']['stdout'].strip(),
        'source_head_after': _results['source-head-after']['stdout'].strip(),
        'protected_status_before': _results['protected-status-before']['stdout'],
        'protected_status_after': _results['protected-status-after']['stdout'],
        'task_errors': task_errors,
        'comparisons': comparisons,
        'commands': sorted(_results.values(), key=lambda r: r['log_path']),
    }
    write_json(BUILD / 'summary.json', summary)
    if task_errors:
        raise RuntimeError(f'control tasks failed: {task_errors}')
    if summary['source_head_before'] != summary['source_head_after']:
        raise RuntimeError('source HEAD changed')
    if summary['protected_status_before'] or summary['protected_status_after']:
        raise RuntimeError('protected source paths have status entries')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        (BUILD / 'replay-driver.error').write_text(f'{type(exc).__name__}: {exc}\n')
        (BUILD / 'replay-driver.exit').write_text('1\n')
        raise
    else:
        (BUILD / 'replay-driver.exit').write_text('0\n')
