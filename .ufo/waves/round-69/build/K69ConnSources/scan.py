from pathlib import Path
import hashlib, re, shutil, subprocess
lane = Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
build = lane / '.ufo/waves/round-69/build/K69ConnSources'
scratch = Path('/fast/scratch/hyaku/kumitate-r69/K69ConnSources')
scratch.mkdir(parents=True, exist_ok=True)
try:
    fixture = scratch / 'registry'
    (fixture / 'corpus').mkdir(parents=True, exist_ok=True)
    for child in lane.iterdir():
        if child.name != 'corpus':
            (fixture / child.name).symlink_to(child, target_is_directory=child.is_dir())
    for child in (lane / 'corpus').iterdir():
        if child.name != 'SOURCES.md':
            (fixture / 'corpus' / child.name).symlink_to(child, target_is_directory=child.is_dir())
    text = (lane / 'corpus/SOURCES.md').read_text()
    (build / 'SOURCES-observed.md').write_text(text)
    base = '\n'.join(line for line in text.splitlines() if not re.match(r'^\| S21[456] \|', line)) + '\n'
    receipts = []
    for label, content in [('without-mirrors', base), ('with-mirrors', text)]:
        target = fixture / 'corpus/SOURCES.md'
        target.write_text(content)
        cmd = ['bash', '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate', '--today', '2026-10-30', '--file', str(target)]
        run = subprocess.run(cmd, cwd=scratch, capture_output=True, text=True, timeout=180, env={**__import__('os').environ, 'TMPDIR': str(scratch)})
        receipts.extend([label, 'command: ' + ' '.join(cmd), run.stdout, run.stderr, 'exit=' + str(run.returncode)])
    rows = []
    for number, line in enumerate(text.splitlines(), 1):
        if re.match(r'^\| S2(?:0[1-9]|1[0-6]) \|', line):
            cells = [cell.strip() for cell in line.split('|')[1:-1]]
            rows.append((number, cells))
    receipts.append('family_rows=' + str(len(rows)))
    for number, cells in rows:
        url = re.search(r'https?://\S+', cells[1]).group()
        receipts.append(f'line={number} id={cells[0]} kind={cells[2]} tier={cells[3]} url={url} scope={cells[4]}')
    receipts.append('observed_sources_sha256=' + hashlib.sha256(text.encode()).hexdigest())
    output = '\n'.join(receipts) + '\n'
    (build / 'census-receipt.txt').write_text(output)
    print(output)
finally:
    shutil.rmtree(scratch)
