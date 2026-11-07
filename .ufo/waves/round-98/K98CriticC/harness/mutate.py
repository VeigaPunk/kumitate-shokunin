#!/usr/bin/env python3
"""mutate.py — 300 seeded random mutations of the current kumitate registry.

usage: python3 mutate.py <base SOURCES.md> <out dir> [count] [seed]

seed base: 20261107 (recorded in the receipt); file i uses random.Random(SEED_BASE + i).
ops per file: 4..9 draws, each one of
  PAD_LEFT   replace the leading pad of a registry/leads row's id cell with one draw
  PAD_RIGHT  replace the trailing pad of that cell with one draw
  PAD_BOTH   both
  INDENT     set the row's indent to one of '', ' ', '  ', '   ', '    ', TAB, ' 'TAB
  DROPCELL   delete one interior `|`-delimited cell (NF changes)
  MOVE       move a row between ## Registry and ## Leads (unopened)
pad draws: SP TAB NBSP VT FF CR U+2003 U+2028 U+FEFF U+200B U+3000 NEL (U+0085).
Writes mut-000.md ... and a JSON manifest with per-file ops and the seed.
"""
import json, random, re, sys, pathlib

PADS = [' ', '\t', '\u00a0', '\x0b', '\x0c', '\r', '\u2003', '\u2028', '\ufeff', '\u200b', '\u3000', '\u0085']
PAD_NAMES = {' ': 'SP', '\t': 'TAB', '\u00a0': 'NBSP', '\x0b': 'VT', '\x0c': 'FF', '\r': 'CR',
             '\u2003': 'EMSP', '\u2028': 'LS', '\ufeff': 'FEFF', '\u200b': 'ZWSP', '\u3000': 'IDSP', '\u0085': 'NEL'}
INDENTS = ['', ' ', '  ', '   ', '    ', '\t', ' \t']
IDCELL = re.compile(r'^(\|)([ \t]*)(S[0-9]{3,})([ \t]*)(\|)')

def section_spans(lines):
    reg = leads = None
    heads = []
    for i, l in enumerate(lines):
        if re.match(r'^ {0,3}##[ \t]', l):
            name = l.lstrip(' ')[2:].strip(' \t')
            heads.append((i, name))
            if name == 'Registry':
                reg = i
            if name.startswith('Leads'):
                leads = i
    return reg, leads, heads

def data_rows(lines, start, heads):
    """indices of `|`-leading rows strictly inside the section beginning at start."""
    end = len(lines)
    for i, _ in heads:
        if i > start:
            end = i
            break
    return [i for i in range(start + 1, end) if lines[i].startswith('|')]

def pick_row(rng, lines, heads):
    reg, leads, _ = section_spans(lines)
    cands = []
    if reg is not None:
        cands += data_rows(lines, reg, heads)
    if leads is not None:
        cands += data_rows(lines, leads, heads)
    cands = [i for i in cands if IDCELL.match(lines[i])]
    return rng.choice(cands) if cands else None

def mutate(lines, rng):
    ops = []
    n = rng.randint(4, 9)
    for _ in range(n):
        kind = rng.choices(['PAD_LEFT', 'PAD_RIGHT', 'PAD_BOTH', 'INDENT', 'DROPCELL', 'MOVE'],
                           weights=[3, 3, 2, 2, 1, 2])[0]
        reg, leads, heads = section_spans(lines)
        i = pick_row(rng, lines, heads)
        if i is None:
            continue
        line = lines[i]
        if kind in ('PAD_LEFT', 'PAD_RIGHT', 'PAD_BOTH'):
            m = IDCELL.match(line)
            left, right = m.group(2), m.group(4)
            draw = rng.choice(PADS)
            if kind in ('PAD_LEFT', 'PAD_BOTH'):
                left = draw
            if kind in ('PAD_RIGHT', 'PAD_BOTH'):
                right = draw
            lines[i] = f'{m.group(1)}{left}{m.group(3)}{right}{m.group(5)}' + line[m.end():]
            ops.append({'row': i, 'op': kind, 'pad': PAD_NAMES[draw]})
        elif kind == 'INDENT':
            ind = rng.choice(INDENTS)
            lines[i] = ind + line.lstrip(' \t')
            ops.append({'row': i, 'op': 'INDENT', 'indent': repr(ind)})
        elif kind == 'DROPCELL':
            cells = line.split('|')
            if len(cells) < 5:
                continue
            k = rng.randrange(2, len(cells) - 1)
            del cells[k]
            lines[i] = '|'.join(cells)
            ops.append({'row': i, 'op': 'DROPCELL', 'cell': k})
        elif kind == 'MOVE':
            # remove from current place, insert at the other section body end
            row = lines.pop(i)
            reg2, leads2, heads2 = section_spans(lines)
            target = leads2 if lines[i].count('|') and i <= (reg2 if reg2 is not None else -1) else reg2
            # decide by origin: if the popped row was inside Registry (i > reg and i < leads/end)
            orig_reg = reg is not None and reg < i and (leads is None or i < leads)
            dest = leads if orig_reg else reg
            if dest is None:
                lines.insert(i, row)
                continue
            dest_rows = data_rows(lines, dest, heads2)
            at = (max(dest_rows) + 1) if dest_rows else dest + 2
            lines.insert(at, row)
            ops.append({'row': i, 'op': 'MOVE', 'to': 'Leads' if orig_reg else 'Registry'})
    return ops

def main():
    base = pathlib.Path(sys.argv[1])
    outdir = pathlib.Path(sys.argv[2])
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 300
    seed = int(sys.argv[4]) if len(sys.argv) > 4 else 20261107
    text = base.read_text()
    outdir.mkdir(parents=True, exist_ok=True)
    manifest = {'base': str(base), 'base_sha256': __import__('hashlib').sha256(text.encode()).hexdigest(),
                'seed_base': seed, 'count': count, 'files': []}
    for i in range(count):
        rng = random.Random(seed + i)
        lines = text.split('\n')
        ops = mutate(lines, rng)
        path = outdir / f'mut-{i:03d}.md'
        path.write_text('\n'.join(lines))
        manifest['files'].append({'file': str(path), 'seed': seed + i, 'ops': ops})
    (outdir / 'manifest.json').write_text(json.dumps(manifest, indent=1))
    print(json.dumps({'base': str(base), 'count': count, 'seed_base': seed,
                      'base_sha256': manifest['base_sha256']}, indent=1))

if __name__ == '__main__':
    main()
