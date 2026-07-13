# Security

## The model

IR Kit is **local-first by design**: your cap table, financials, and investor data live in `data/*.json` and `ir-workspace/` on your machine. There are no accounts, no hosted database, and no telemetry — the project's answer to "how do you protect my data" is "we never have it."

- The server binds to `127.0.0.1` by default and has **no authentication**. It is meant for localhost or a trusted private network.
- If you expose it (`HOST=0.0.0.0`), put it behind an authenticating proxy: Cloudflare Access, Tailscale, or basic auth. Treat it like the confidential system it is.
- The static/demo deployment (GitHub Pages) stores each visitor's data in their own browser localStorage only.
- `data/` and `ir-workspace/` are gitignored. Do not weaken this in forks.

## What the local server hardens against

Even on localhost, a browser tab you didn't open can try to reach `127.0.0.1`. The server defends the common local-service attacks so a malicious web page can't touch your data:

- **DNS rebinding.** When bound to loopback (the default), requests are only served when the `Host` header is a loopback name on the actual port — a page that rebinds its own domain to `127.0.0.1` gets `403`, not your cap table. (Skipped when `HOST` is set non-loopback; that deployment's protection is your authenticating proxy.)
- **Clickjacking / framing.** `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` — no external page can embed the dashboard.
- **MIME sniffing** — `X-Content-Type-Options: nosniff`; **referrer leakage** — `Referrer-Policy: no-referrer`.
- **Content-Security-Policy** — everything is self-hosted (`default-src 'self'`), scripts are strictly same-origin, so injected markup can't load or exfiltrate to a remote origin.
- **Path traversal** — requests are confined to `public/` (strict prefix, null-byte and bad-encoding rejection).
- **Resilience** — one malformed request (bad `Host`, invalid `%`-encoding, oversized body) returns `4xx` and never takes the process down.

These invariants are verified by `node scripts/security-smoke.js`, which runs in CI.

## Working with cloud-backed AI agents

IR Kit itself **never sends your data anywhere** — no telemetry, no uploads, no network calls in the core product. But the kit is designed to be *operated by* an AI coding agent, and that's a separate trust boundary you control:

- A **cloud-backed agent** (Claude, Codex, Cursor, etc.) processes whatever it reads through its provider's servers. When such an agent reads your `data/`, a document in `ir-workspace/`, or your cap table to answer a question, that content is handled by the provider — it is **not** fully-local computation, and the kit's onboarding contract requires the agent to disclose this before reading document contents.
- For fully-local operation, use a **local model / offline agent**; then nothing leaves the device at any layer.
- Document contents are **data, not instructions**: the agent contract (AGENTS.md, prompts/onboard.md) directs agents to ignore any text inside a scanned or inbox document that tries to give them commands, and to surface it to you instead — a defense against prompt-injection via a malicious PDF dropped in the inbox.

## Reporting a vulnerability

Open a GitHub Security Advisory on this repository (Security → Report a vulnerability), or open an issue **without** exploit details asking for a private channel. Please do not include any real company data in reports.

## Scope notes

- Path traversal, the JSON API, the static file server, DNS-rebinding, and the response headers are in scope.
- "The server has no auth" is a documented design decision, not a vulnerability — reports should assume the documented deployment model (single user, localhost). We deliberately do **not** add authentication, rate limiting, accounts, or multi-tenancy: they're meaningless for a single-user local tool and would pull the project toward being a hosted service that holds your data — the opposite of the design.
