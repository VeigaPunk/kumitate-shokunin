#!/usr/bin/env node
// Experiment D: probe-level timeout kill of the TOOL -> what happens to the tool's child?
// A parent Node process is killed mid-spawnSync; we observe whether the synchronous
// child survives (orphan) and keeps writing after the parent's death.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const root = '/fast/scratch/hyaku/kumitate-r70/K70AttackTimeout';
const marker = `${root}/expD-marker.txt`;
fs.rmSync(marker, { force: true });
// victim parent: sync-spawns a 30s child (sleep), records child pid, then sleeps.
const victim = `${root}/expD-victim.mjs`;
fs.writeFileSync(victim, `
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const r = spawnSync('bash', ['-c', 'echo $$ > ${marker}.pid; sleep 30; echo woke >> ${marker}'], {encoding:'utf8'});
`);
const p = spawnSync('node', [victim], { encoding: 'utf8', timeout: 1200 });
// probe killed the tool at 1200ms; check orphan liveness at +800ms
await new Promise(r => setTimeout(r, 800));
const pid = fs.readFileSync(`${marker}.pid`, 'utf8').trim();
const alive = (() => { try { process.kill(Number(pid), 0); return true; } catch { return false; } })();
console.log(JSON.stringify({ tool_status: p.status, tool_signal: p.signal, orphan_pid: pid, orphan_alive_after_parent_death: alive }, null, 1));
// cleanup orphan
try { process.kill(Number(pid)); } catch {}
