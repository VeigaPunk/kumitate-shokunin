import { decide } from './kimi-census.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const root = mkdtempSync(join(process.env.TMPDIR, 'owner-api-'));
try {
  for (const name of ['locks', 'credentials', 'oauth']) {
    mkdirSync(join(root, name), {mode:0o700});
    chmodSync(join(root, name),0o700);
  }
  const ownerFindings = d => d.findings.filter(f=>f.detail.includes('owner does not match'));
  console.log(JSON.stringify({ uid:process.getuid(), implicit:ownerFindings(decide(root)), explicitMismatch:ownerFindings(decide(root,process.getuid() ^ 1)) },null,2));
} finally { rmSync(root,{recursive:true,force:true}); }
