import json, os, re
p = os.path.expanduser('~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b.jsonl')
calls = {}
order = []
with open(p, errors='replace') as f:
    for i, line in enumerate(f, 1):
        try: o = json.loads(line)
        except Exception: continue
        if o.get('type') != 'message': continue
        m = o.get('message') or {}
        role = m.get('role')
        c = m.get('content')
        if role == 'assistant' and isinstance(c, list):
            for part in c:
                if part.get('type') == 'toolCall':
                    calls[part.get('id') or part.get('toolCallId')] = (i, part.get('name'), part.get('arguments'), o.get('timestamp'))
                    order.append(part.get('id') or part.get('toolCallId'))
        elif role == 'toolResult':
            cid = m.get('toolCallId')
            if cid in calls:
                ln, name, args, ts = calls[cid]
                s = json.dumps(args)
                txt = json.dumps(m.get('content'))
                if re.search(r'tameshi|register\(|WAVES|drive\(|dispatcher', s + txt):
                    print(f'### call line {ln} ts={ts} tool={name} resultline={i}')
                    print('  ARGS:', s[:400])
                    print('  RES :', txt[:700].replace('\\n', '\n         '))
