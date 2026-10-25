import json, sys, os
p = os.path.expanduser('~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b.jsonl')
n = 0
with open(p) as f:
    for i, line in enumerate(f, 1):
        if 'ExecRows01' not in line:
            continue
        n += 1
        try:
            o = json.loads(line)
        except Exception as e:
            print(i, 'UNPARSEABLE', line[:200]); continue
        t = o.get('type')
        # print structural shape
        print(f'--- line {i} type={t} keys={sorted(o.keys())}')
        for k in ('role', 'toolName', 'tool', 'name', 'label', 'timestamp', 'id'):
            if k in o:
                print(f'    {k}={str(o[k])[:120]}')
        for k in ('message', 'content', 'parts', 'text', 'result'):
            if k in o:
                s = json.dumps(o[k])[:600]
                print(f'    {k}={s}')
print('matching lines:', n)
