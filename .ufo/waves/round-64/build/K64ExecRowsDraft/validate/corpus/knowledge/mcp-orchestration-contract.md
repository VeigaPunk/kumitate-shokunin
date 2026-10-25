source: S125 https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture ; S127 https://github.com/modelcontextprotocol/ext-tasks/blob/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md ; S136 https://zenn.dev/komlock_lab/articles/mcp-stateless-spec-2026
verified-at: 2026-10-24
recheck: 90d
coverage-map: frontier item 2 — MCP protocol revisions as they bear on orchestration (PROVINCE.md)
ground: the lane held the 2026-07-28 revision only as queued changelog and README rows; this entry is the first sourced contract an orchestrator has to implement

# MCP orchestration contract (2026-07-28 revision)

## Scope

Frontier item 2, not core. The lane's registry already queued the changelog (S010) and the Tasks README (S026). Neither states the contract a dispatcher has to implement. This entry does, from three pages re-opened on 2026-10-24. It is a spec entry: what a conformant client or server must do. It does not claim any harness on this host implements it.

The mapping onto the lane's dispatcher (repend, wave-slot, claim identity) is interpretation. It is not attributed to the sources.

## What the pages say

- A 2026-07-28 client request carries protocol version and client capabilities in `_meta`, so the server identifies the caller from the request rather than from who connected. receipt:.ufo/waves/round-59/build/ScoutMcpArch/body.html@sha256:3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca
- The located quote is "Every client request carries the io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities fields in _meta" (11 words, offset of the tag-stripped page). receipt:.ufo/waves/round-59/receipts/quote-s125.txt@sha256:7a248183c670eadcd765225727d606a009313b53303868f9ce19ad9e2218a573
- Change notifications are opt-in: the client opens a `subscriptions/listen` stream naming the types it wants, and a missed notification is not state loss. That sentence is on the same S125 page, not a second source.
- A server that has negotiated the Tasks extension must not return `CreateTaskResult` until the task is durably created — a later `tasks/get` for that id would resolve. receipt:.ufo/waves/round-59/build/ScoutMcpTasks/body.md@sha256:5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5
- The located quote is "A server MUST NOT return CreateTaskResult until the task is durably created" (12 words). receipt:.ufo/waves/round-59/receipts/quote-s127.txt@sha256:979e492a081e2f25086086ebf3162ecbcdd57d7ab2acd604ce078401811e6dde
- Task status on that page is one of `working`, `input_required`, `completed`, `failed`, `cancelled`, with an optional `pollIntervalMs`. Polling is the recovery cursor; the creation clause is what makes the id safe to poll.
- A Japanese practitioner account of the same revision says the initialize handshake and `Mcp-Session-Id` were removed from the specification, and that work needing state carries a server-issued handle instead. receipt:.ufo/waves/round-59/build/ScoutZenn/body.html@sha256:64fd5551c7357e2ca4d65deac37dfa8b60050cc1fcfb16df83929501d97395b5
- The located quote is "initialize ハンドシェイクと Mcp-Session-Id が仕様から削除された" (4 words). S136 is tier B and secondary to S125 and S127. receipt:.ufo/waves/round-59/receipts/quote-s136.txt@sha256:2edb8ce1a4ffad88ce8fb1fb72635e5ce04251cb1aa5fe8a476800f188291ff9

## What this round did not adopt

- The id-collision guard against the lane registry (123 ids, S001–S124 minus S121) and the staged package (147 ids) produced an empty collision file. Adopted ids are S125, S127 and S136, the three this entry cites, not the package. receipt:.ufo/waves/round-59/assimilation/reg-ids@sha256:227bc4663eaadaa83b71d587c19fc40d9200608d100c5e3e719ef776e64b968c
- The staged id list is the evidence that the package was larger than the admit. Bulk append is refused. receipt:.ufo/waves/round-59/assimilation/staged-ids@sha256:53d344e19fcd816bbcf945eb533a7142820caa5cf945eebde01a98eed2ad3e5f

## Lane mapping (interpretation, not source)

An orchestrator that treats a reconnect as a new client, and that does not hand back a task id until the id resolves, matches the two spec clauses above. The lane's wave-slot grant and repend mark are the local analogues: a seat id is not proof the seat is running, and a grant that is not yet durable must not be treated as dispatched. That analogy is this lane's, not the specification's.
