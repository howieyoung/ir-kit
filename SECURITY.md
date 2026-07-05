# Security

## The model

IR Kit is **local-first by design**: your cap table, financials, and investor data live in `data/*.json` and `ir-workspace/` on your machine. There are no accounts, no hosted database, and no telemetry — the project's answer to "how do you protect my data" is "we never have it."

- The server binds to `127.0.0.1` by default and has **no authentication**. It is meant for localhost or a trusted private network.
- If you expose it (`HOST=0.0.0.0`), put it behind an authenticating proxy: Cloudflare Access, Tailscale, or basic auth. Treat it like the confidential system it is.
- The static/demo deployment (GitHub Pages) stores each visitor's data in their own browser localStorage only.
- `data/` and `ir-workspace/` are gitignored. Do not weaken this in forks.

## Reporting a vulnerability

Open a GitHub Security Advisory on this repository (Security → Report a vulnerability), or open an issue **without** exploit details asking for a private channel. Please do not include any real company data in reports.

## Scope notes

- Path traversal, the JSON API, and the static file server are in scope.
- "The server has no auth" is a documented design decision, not a vulnerability — reports should assume the documented deployment model.
