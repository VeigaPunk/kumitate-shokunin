from pathlib import Path
import hashlib
import re
import shlex
import subprocess
import sys

lane = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
build = lane / '.ufo/waves/round-58/build/RevPredicateD58'
r1 = '6affb9ebde37b7d663658f1959d64f0f0b68f480'
freeze = '50548ae5b4a47bb8d8cdc62212ec0648aa3776ee'
plan_rel = '.ufo/waves/round-58/plan.md'
probe_rel = '.ufo/waves/round-58/probe/doctrine58-probe.mjs'
final_path = lane / '.ufo/waves/round-58/close/FINAL-doctrine58-R1.txt'


def run(name, argv, cwd=lane):
    result = subprocess.run(argv, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    with (build / f'{name}.txt').open('wb') as stream:
        stream.write(f'CWD: {cwd}\nCOMMAND: {shlex.join(str(x) for x in argv)}\n'.encode())
        stream.write(b'--- STDOUT ---\n')
        stream.write(result.stdout)
        if result.stdout and not result.stdout.endswith(b'\n'):
            stream.write(b'\n')
        stream.write(b'--- STDERR ---\n')
        stream.write(result.stderr)
        if result.stderr and not result.stderr.endswith(b'\n'):
            stream.write(b'\n')
        stream.write(f'--- EXIT: {result.returncode} ---\n'.encode())
    return result


def sentence(data):
    if data is None:
        return None
    match = re.search(rb'(?m)^(?: \* )?(DOCTRINE58_HELD \xe2\x80\x94 node .*$)', data)
    return match.group(1) if match else None


def line_number(data, needle):
    if data is None or needle is None:
        return None
    return next((i for i, line in enumerate(data.splitlines(), 1) if needle in line), None)


run('00-tool-versions-node', ['node', '--version'])
run('01-tool-versions-git', ['git', '--version'])
run('02-r1-object-type', ['git', '-C', str(lane), 'cat-file', '-t', r1])
r1_ancestor = run('03-r1-ancestor', ['git', '-C', str(lane), 'merge-base', '--is-ancestor', r1, 'HEAD'])
r1_plan = run('04-r1-plan', ['git', '-C', str(lane), 'show', f'{r1}:{plan_rel}'])
r1_probe = run('05-r1-probe', ['git', '-C', str(lane), 'show', f'{r1}:{probe_rel}'])
freeze_plan = run('06-freeze-plan', ['git', '-C', str(lane), 'show', f'{freeze}:{plan_rel}'])
freeze_probe = run('07-freeze-probe', ['git', '-C', str(lane), 'show', f'{freeze}:{probe_rel}'])
fresh = run('08-d58-r1-replay', ['node', probe_rel, str(lane), r1])

working_plan = (lane / plan_rel).read_bytes()
working_probe = (lane / probe_rel).read_bytes()
final = final_path.read_bytes()
sources = {
    'working plan': working_plan,
    'working D58 header': working_probe,
    'R1 plan': r1_plan.stdout if r1_plan.returncode == 0 else None,
    'R1 D58 header': r1_probe.stdout if r1_probe.returncode == 0 else None,
    'freeze plan': freeze_plan.stdout if freeze_plan.returncode == 0 else None,
    'freeze D58 header': freeze_probe.stdout if freeze_probe.returncode == 0 else None,
}
sentences = {name: sentence(data) for name, data in sources.items()}
canonical = sentences['working plan']
results = []


def check(name, ok, detail):
    results.append((name, bool(ok), detail))


for name, value in sentences.items():
    check(f'sentence present: {name}', value is not None,
          f'line={line_number(sources[name], value)} sha256={hashlib.sha256(value).hexdigest() if value else "none"}')
    if value is not None:
        print(f'SENTENCE {name} line={line_number(sources[name], value)}: {value.decode()}')

check('all six plan/header sentences byte-identical',
      all(value == canonical for value in sentences.values()) and canonical is not None,
      f'unique={len(set(sentences.values()))}')
check('R1 is a commit and ancestor of HEAD',
      r1_ancestor.returncode == 0,
      f'merge-base exit={r1_ancestor.returncode}')

expected = None
if canonical is not None:
    match = re.search(rb'prints "([^"]+)" and exits 0\.$', canonical)
    check('frozen sentence has output and exit contract', match is not None,
          'prints quoted output and exits 0')
    if match:
        expected = match.group(1).replace(b'<rev>', r1.encode())
        print(f'EXPECTED R1 PREFIX: {expected.decode()}')

suffix = b' | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS\n'
check('FINAL R1 exact predicate output', expected is not None and final == expected + suffix,
      f'bytes={len(final)} sha256={hashlib.sha256(final).hexdigest()}')
check('fresh D58 replay exits 0', fresh.returncode == 0, f'exit={fresh.returncode}')
check('fresh D58 replay has empty stderr', fresh.stderr == b'', f'bytes={len(fresh.stderr)}')
check('fresh D58 stdout exactly reproduces FINAL R1', fresh.stdout == final,
      f'fresh_bytes={len(fresh.stdout)} final_bytes={len(final)} fresh_sha256={hashlib.sha256(fresh.stdout).hexdigest()}')
check('fresh D58 stdout exact predicate output', expected is not None and fresh.stdout == expected + suffix,
      f'bytes={len(fresh.stdout)}')

print(f'FINAL R1: {final.decode(errors="replace")}', end='')
print(f'FRESH R1 STDOUT: {fresh.stdout.decode(errors="replace")}', end='')
for name, ok, detail in results:
    print(f'{"PASS" if ok else "FAIL"}: {name} ({detail})')
failed = [name for name, ok, _ in results if not ok]
print(f'REV_PREDICATE_D58: {"CORROBORATED" if not failed else "FALSIFIED"} checks={len(results)} failed={len(failed)}')
sys.exit(1 if failed else 0)
