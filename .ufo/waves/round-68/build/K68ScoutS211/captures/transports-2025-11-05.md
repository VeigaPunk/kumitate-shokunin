# URL evidence — seat-specified pattern returns 404 (not a capture of page content)

- Pattern tried: https://modelcontextprotocol.io/specification/2025-11-05/basic/transports
- Fetch command: `curl -sS -L -D <headers> -o <body> 'https://modelcontextprotocol.io/specification/2025-11-05/basic/transports'`
- Result: HTTP 404, 0 redirects (effective URL = request URL), body 127278 bytes
  (a Mintlify 404 page), body sha256 85f159235269346e020cf20e37be674eacebc654b23a7bf3a9f002d2dd0f4dd4.
- Sibling probes 2026-10-27: `/specification/2025-11-05/basic` -> 404;
  `/specification/2025-11-05` -> 404. No such revision exists on the site; the
  intended revision is 2025-11-25 (plan's own label for S211: "transports 2025-11-25").

## Response headers

```
HTTP/2 404 
cache-control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
cf-cache-status: REVALIDATED
cf-ray: a51289ebda661d34-GRU
content-security-policy: worker-src 'self' blob:; object-src 'none'; base-uri 'self'; upgrade-insecure-requests; frame-ancestors 'self' https://dashboard.mintlify.com https://app.mintlify.com; form-action 'self'; default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; media-src 'self' data: blob: https:; frame-src 'self' blob: https:; connect-src 'self' data: https: wss:;
content-security-policy-report-only: default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; media-src 'self' data: blob: https:; frame-src 'self' blob: https:; connect-src 'self' data: https: wss:; worker-src 'self' blob:; object-src 'none'; report-uri /_mintlify/api/csp-report; report-to mintlify-csp;
content-type: text/html; charset=utf-8
date: Tue, 27 Oct 2026 14:54:55 GMT
etag: W/"7tqqm5uu6e2q7i"
expires: 0
link: </llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt", </.well-known/api-catalog>; rel="api-catalog", </.well-known/mcp/server-card.json>; rel="mcp-server-card", </.well-known/agent-card.json>; rel="agent-card", </.well-known/agent-skills/index.json>; rel="agent-skills"
pragma: no-cache
reporting-endpoints: mintlify-csp="/_mintlify/api/csp-report"
server: Vercel
strict-transport-security: max-age=63072000
vary: rsc, accept-encoding, Accept, User-Agent
x-content-type-options: nosniff
x-frame-options: DENY
x-llms-txt: /llms.txt
x-matched-path: /_sites/[subdomain]/[[...slug]]
x-mint-proxy-version: 1.0.0-prod
x-mintlify-client-version: 0.0.3971
x-nextjs-prerender: 1
x-nextjs-stale-time: 60
x-served-version: dpl_5Fjw28gBvBxr44VDYorcFKph8FNx
x-vercel-cache: MISS
x-vercel-id: gru1:sfo1:iad1::iad1::sdxvv-1793112895309-0a3a11ddcb3f
x-vercel-project-id: prj_NdMUpHpUIb41Po1H8c6hrChv2bgr
x-version: dpl_5Fjw28gBvBxr44VDYorcFKph8FNx

```
