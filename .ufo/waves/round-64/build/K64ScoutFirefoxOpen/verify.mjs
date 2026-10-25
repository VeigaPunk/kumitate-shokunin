import {readFileSync} from 'fs';
const t = readFileSync('capture/firefox-jujutsu.norm.txt','utf8');
const sec = t.slice(t.lastIndexOf('Working with multiple workspaces'));
const Q = [
"By default, ./mach vcs-setup configures snapshot.auto-update-stale = true",
"which causes jj to automatically update a workspace's working copy when it becomes stale.",
"A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing.",
"We recommend this default because some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale.",
"for example to avoid triggering a slow rebuild after rebasing patches in bulk from another workspace, you can disable this per-workspace:",
"jj config set -- workspace snapshot . auto - update - stale false",
"With auto-update disabled, most jj commands will refuse to run on a stale workspace until you manually update with jj workspace update-stale",
"this is only relevant when you modify one workspace's ancestor from another workspace, which is what causes the former workspace to become stale.",
"you only touch the current workspace's ancestors, then you won't encounter stale workspaces very often.",
];
Q.forEach((q,i)=>console.log(i+1, q.split(' ').length+'w', 'in-section='+sec.includes(q), 'in-page='+t.includes(q)));
console.log('section-has-"jj config set --workspace snapshot.auto-update-stale false"(unspaced):', sec.includes('jj config set --workspace snapshot.auto-update-stale false'));
console.log('sec count of auto-update-stale:', (t.match(/auto-update-stale/g)||[]).length, 'page occurrences of "stale":', (t.match(/stale/gi)||[]).length);
