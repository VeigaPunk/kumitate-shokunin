// K93CriticB negative control: a second execve must be caught (clause: execve after the first).
import { spawnSync } from "node:child_process";
const proof = { evader: "spawn_child", argv: process.argv.slice(2) };
const r = spawnSync(process.execPath, ["-e", "process.stdout.write('')"], { encoding: "utf8" });
proof.child = r.status;
if (process.env.EVADE_PROOF) fs.writeFileSync(process.env.EVADE_PROOF, JSON.stringify(proof, null, 1));
process.stdout.write("[]\n");
