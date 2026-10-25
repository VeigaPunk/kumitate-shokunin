import os, json, glob, collections, sys

ROOT = os.path.expanduser('~/.omp/agent/sessions/-Projects-shokunin')
sessions = sorted(d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)))
print('sessions:', sessions)
for s in sessions:
    p = os.path.join(ROOT, s)
    ents = os.listdir(p)
    jsonls = [e for e in ents if e.endswith('.jsonl')]
    mds = [e for e in ents if e.endswith('.md')]
    print(f'  {s}: entries={len(ents)} jsonl={len(jsonls)} md={len(mds)}')

def find(name):
    hits = []
    for s in sessions:
        for e in os.listdir(os.path.join(ROOT, s)):
            if e == name + '.jsonl' or e == name + '.md' or e == name:
                hits.append((s, e))
    return hits

for n in ['KaidokuR35', 'SoujiR26', 'TameshiR45', 'KengakuR33', 'KengakuR35', 'MoriR47', 'KumitateR63', 'ExecRows01', 'ExecRows01-2', 'ExecRows01-3', 'SoujiR27a2', 'TsukuroiR37a2', 'MadoR39a2', 'local']:
    print(n, '->', find(n))
