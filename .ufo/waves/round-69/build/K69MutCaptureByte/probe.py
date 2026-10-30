import hashlib, json, os, pathlib, shutil, subprocess, tempfile
LANE = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
OUT = LANE / '.ufo/waves/round-69/build/K69MutCaptureByte'
S = pathlib.Path('/fast/scratch/hyaku/kumitate-r69/K69MutCaptureByte')
BASE = '14057f3e3899180c95713bace088fb9c0d0046e3'
PROBE = LANE / '.ufo/waves/round-69/probe/deprec69-probe.mjs'
S.mkdir(parents=True, exist_ok=True)
env = dict(os.environ, TMPDIR=str(S))
meta = {'base': BASE, 'axes': ['coverage: origin authentication', 'operability: isolated reproducibility'], 'runs': []}
def run(args, **kw):
    return subprocess.run(args, cwd=S, env=env, check=True, **kw)
def sha(b): return hashlib.sha256(b).hexdigest()
try:
    D = pathlib.Path(tempfile.mkdtemp(prefix='fx.', dir=S))
    archive = S / 'base.tar'
    with archive.open('wb') as f: run(['git', '-C', str(LANE), 'archive', BASE], stdout=f)
    run(['tar', '-xf', str(archive), '--no-same-owner', '--no-same-permissions', '-C', str(D)])
    run(['git', '-C', str(D), 'init', '-q'])
    def git(*args):
        actual = run(['git', '-C', str(D), 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip()
        assert actual == str(D), (actual, D)
        return run(['git', '-C', str(D), *args], capture_output=True, text=True).stdout.strip()
    entry = D / 'corpus/knowledge/mcp-deprecation-registry.md'
    pins = D / '.ufo/pins/source-captures.json'
    data = json.loads(pins.read_bytes())
    pin = next(c for c in data['captures'] if c['sourceId'] == 'S210')
    cap = D / pin['path']
    original = {p: p.read_bytes() for p in [entry, pins, cap]}
    origin = '\n## Capture origin\n\n' + ''.join(f'- S{i} — capture 2026-10-30 — pinned\n' for i in range(207, 214))
    entry.write_bytes(original[entry] + origin.encode())
    prepared = {p: p.read_bytes() for p in [entry, pins, cap]}
    meta['hashes_base'] = {str(p.relative_to(D)): sha(b) for p,b in original.items()}
    meta['hashes_pristine'] = {str(p.relative_to(D)): sha(b) for p,b in prepared.items()}
    for phase in ['pristine', 'mutated', 'restored']:
        if phase == 'mutated':
            b = original[cap] + b'\nK69MutCaptureByte fabricated capture line\n'
            cap.write_bytes(b)
            pin['sha256'], pin['bytes'] = sha(b), len(b)
            pins.write_text(json.dumps(data, indent=2) + '\n')
        if phase == 'restored':
            for p,b in prepared.items(): p.write_bytes(b)
        meta['hashes_' + phase] = {str(p.relative_to(D)): sha(p.read_bytes()) for p in prepared}
        git('add', '-A')
        git('-c', 'user.name=K69MutCaptureByte', '-c', 'user.email=mutation@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', phase)
        rev = git('rev-parse', 'HEAD')
        for mode in ['live', 'offline']:
            args = ['node', str(PROBE), str(D), rev] + (['--no-live'] if mode == 'offline' else [])
            r = subprocess.run(args, cwd=S, env=env, capture_output=True, text=True, timeout=900)
            receipt = phase + '-' + mode + '.txt'
            (OUT / receipt).write_text(r.stdout + r.stderr + f'EXIT_CODE={r.returncode}\n')
            meta['runs'].append({'phase':phase,'mode':mode,'rev':rev,'command':args,'exit':r.returncode,'receipt':receipt,'output':r.stdout.strip()})
            print(phase, mode, r.stdout.strip(), 'EXIT_CODE=' + str(r.returncode), flush=True)
    meta['restored_prepared_exact'] = all(p.read_bytes() == b for p,b in prepared.items())
    for p,b in original.items(): p.write_bytes(b)
    meta['restored_base_exact'] = all(p.read_bytes() == b for p,b in original.items())
    meta['hashes_final'] = {str(p.relative_to(D)): sha(p.read_bytes()) for p in original}
finally:
    shutil.rmtree(S)
    meta['scratch_removed'] = not S.exists()
    (OUT / 'metadata.json').write_text(json.dumps(meta, indent=2) + '\n')
    print('SCRATCH_REMOVED=' + str(meta['scratch_removed']), flush=True)
