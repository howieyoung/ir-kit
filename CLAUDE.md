# IR Kit

**The canonical agent contract is [AGENTS.md](AGENTS.md) — read it before doing anything.** It has the capability map, data schemas, layout, and code conventions.

The three rules, restated because they're load-bearing:

1. Prefer `./bin/ir.js` verbs over editing `data/*.json` — the CLI enforces the cross-collection invariants.
2. After any direct JSON edit, run `./bin/ir.js check` (exit 1 = you broke something; fix first).
3. Never invent a number, and never auto-send: drafts go to `ir-workspace/updates/drafts/`, the human sends.

Privacy: `data/` and `ir-workspace/` are the founder's confidential IR data — never commit, never exfiltrate, never weaken `.gitignore`. Only the fictional sample in `public/js/seed.js` may appear in the public repo.
