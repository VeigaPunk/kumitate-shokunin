function items67(text) {
  const lines = String(text).split('\n');
  const heads = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const f = lines[i].match(/^ {0,3}(```|~~~)/);
    if (f) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) heads.push({ i, lvl: m[1].length });
  }
  if (!heads.length) return { sections: [], items: [] };
  const sections = heads.map((h, idx) => {
    const end = idx + 1 < heads.length ? heads[idx + 1].i : lines.length;
    const sec = []; let fence = false;
    for (let j = h.i + 1; j < end; j += 1) {
      const fv = lines[j].match(/^ {0,3}(```|~~~)/);
      if (fv) { fence = !fence; sec.push({ l: lines[j], fence: true }); continue; }
      sec.push({ l: lines[j], fence });
    }
    return sec;
  });
  const items = [];
  for (const sec of sections) {
    const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
    for (let i = 0; i < sec.length; i += 1) {
      const l = sec[i].l;
      if (sec[i].fence) continue;
      const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
      const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1].l));
      if (row) { items.push({ n: null, text: l }); continue; }
      if (!list) continue;
      let body = l;
      for (let j = i + 1; j < sec.length; j += 1) {
        const n = sec[j];
        if (n.fence && !/^ {0,3}(```|~~~)/.test(n.l)) { body += `\n${n.l}`; continue; }
        if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n.l) || (n.l.startsWith('|') && !isSep(n.l))) break;
        if (/^\S/.test(n.l) && sec[j - 1].l.trim() === '') break;
        body += `\n${n.l}`;
      }
      items.push({ n: null, text: body });
    }
  }
  return { sections, items: items.map((x) => x.text) };
}
export { items67 };
