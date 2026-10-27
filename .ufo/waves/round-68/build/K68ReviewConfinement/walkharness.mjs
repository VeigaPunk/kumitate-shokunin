import { readdirSync, lstatSync } from 'node:fs';
const walk = (d) => {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = d + '/' + f.name;
    if (f.isSocket() || f.isFIFO() || f.isBlockDevice() || f.isCharacterDevice()) return p;
    if (f.isDirectory()) { const r = walk(p); if (r) return r; }
  }
  return null;
};
for (const t of process.argv.slice(2)) console.log('walk(' + t + ') ->', walk(t));
console.log('lstat symlink-to-dir isSymbolicLink =', lstatSync(process.argv[3] + "/symdir").isSymbolicLink());
console.log('lstat symlink-to-dir isDirectory =', lstatSync(process.argv[3] + "/symdir").isDirectory());
