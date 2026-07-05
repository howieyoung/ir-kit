# IR Kit — agent contract

You are operating a founder's investor-relations system. This file is the canonical contract for every coding agent (Claude Code, Codex, Cursor, etc.). The human uses the browser UI; you use the `ir` CLI and files. Both write the same local JSON.

## The three rules

1. **Prefer `ir` verbs over editing JSON.** The CLI enforces cross-collection invariants that raw edits can silently break.
2. **After ANY direct edit to `data/*.json`, run `./bin/ir.js check`.** Exit 0 = safe. Exit 1 = you broke an invariant; fix before doing anything else. This is your test suite.
3. **Never invent a number.** Missing data stays `null`; a month that isn't closed blocks the update draft. Investor-facing numbers trace to `data/financials.json` or they don't exist.

## Capability map

```
./bin/ir.js status --json        ground yourself: every derived metric in one call
./bin/ir.js check [--json]       validate schemas + invariants (your post-edit test)
./bin/ir.js close-month 2026-07 --saas 31000 --ads 14000 --payroll 34000 --infra 4800 --other 3800
./bin/ir.js safe add "Fund X" --principal 50000 --cap 8000000 --status Signed --email a@b.c
./bin/ir.js update draft [--month 2026-07]
./bin/ir.js update mark-sent --subject "..."
./bin/ir.js model round --pre 12000000 --new 3000000 --pool 0.10
./bin/ir.js schedule show
```

All commands take `--json` for structured output; errors go to stderr with exit 1. Data location overrides: `IRKIT_DATA_DIR`, `IRKIT_ROOT` (useful for tests — never point tests at the founder's live data).

`ir safe add` is the canonical example of why verbs beat edits: one call updates the cap table ledger, the CRM commitment (stage + probability), the investor record, and the update-distribution list — and tells you the implied ownership and whether the 15% SAFE-overhang guardrail still holds.

## Privacy — non-negotiable

- `data/*.json` and `ir-workspace/` are confidential. Never commit them, never weaken `.gitignore`, never paste their contents into anything that leaves this machine.
- The only data allowed in the public repo is the fictional sample in `public/js/seed.js`. Keep it fictional.
- Drafts never auto-send. Scheduled runs write to `ir-workspace/updates/drafts/` only; the human reviews and sends. `ir update mark-sent` records a send that already happened — never call it for an email that wasn't actually sent.

## Layout

```
bin/ir.js               the CLI (zero-dep, ESM)
core/ops.js             all mutations + invariants — new operations go HERE, then get a CLI verb
core/check.js           the validation suite behind ir check
core/store.js           Node file access (atomic writes, seed fallback)
server.js               web server: static + GET/PUT /api/<collection>
data/*.json             ALL state (gitignored)
ir-workspace/           private documents: data room, drafts, board records (gitignored)
public/js/metrics.js    pure math: financial derivations, SAFE conversion, cadence
public/js/<page>.js     browser UI modules; update-template.js is shared with the CLI
prompts/                ritual prompts for humans to hand to agents
```

## Data schemas

**financials.json** — `openingCash`, `months[]`: `{ month:"YYYY-MM", saas, ads, payroll, infra, other, inflow, headcount, traffic, pages, platforms, paying }`. Revenue/costs/P&L/cash are derived, never stored. `inflow` = financing proceeds, excluded from burn.

**captable.json** — `stakeholders[]` `{id,name,type,security,shares,notes}` (`type:"Pool"` = unallocated pool; `type:"Founder"` feeds the dilution walk) · `safes[]` `{id,investor,date,principal,cap,discount,status,notes}` (discount is a fraction: 0.2 = 20%) · `roundModel` · `scenarios[]` · `waterfall`.

**crm.json** — `investors[]` · `commitments[]` (stage ∈ Contacted/Meeting/Verbal/SAFE sent/Signed/Wired/Passed; Signed+Wired = closed money) · `interactions[]` · `asks[]` · `distribution[]` (segment ∈ Board/Major, All investors, Prospect nurture).

**updates.json** — `archive[]` `{id, month, subject, body, sentAt}`. The archive drives the streak and due-date roll.

**company.json** — `name, founder, email, tagline, roundTarget, roundInstrument, updateDay (1–28, default 5), sample` (drives the SAMPLE banner — keep `true` until real data replaces the seed).

**checklists.json** — `"docId:index": bool` for playbook checkboxes (position-keyed: append items, don't reorder).

## Recurring rituals

Canonical prompts live in `prompts/` (monthly close, SAFE signed, draft update, meeting prep, data-room audit, round kickoff, scheduling). They now route through `ir` verbs — follow their contracts.

## Code conventions (when extending the kit)

- Zero dependencies, no build step — the kit's core promise. PRs adding packages will be rejected.
- Percentages are fractions in data (0.10 = 10%); format only at render time.
- New operation = function in `core/ops.js` → verb in `bin/ir.js` → mention here and in `ir help`.
- New page = `public/js/<name>.js` exporting `render<Name>(root)`, registered in `app.js`, linked in `index.html`.
- Tutorial content lives in `public/js/guide.js`; regenerate docs with `npm run build-tutorial` — never edit `docs/TUTORIAL.md` directly.
- Verify UI changes: `node server.js`, check `/api/health`, load each page, zero console errors. Verify data changes: `./bin/ir.js check`.
