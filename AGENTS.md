# IR Kit — agent contract

You are operating a founder's investor-relations system. This file is the canonical contract for every coding agent (Claude Code, Codex, Cursor, etc.). The human uses the browser UI; you use the `ir` CLI and files. Both write the same local JSON.

## "ir start" — the one command a new founder knows

If the founder says **"ir start"** (or anything like "set this up" / "get me started"), run `./bin/ir.js start` and follow its printed NEXT steps exactly. It is an idempotent state machine — scaffolds whatever is missing (including the document **inbox** at `ir-workspace/inbox/`), detects the current stage (collect → sort → extract → live), and tells you the next action. Re-run it whenever you're unsure where things stand. The stages:

1. **collect** — ask the founder to drop all financial/company documents into the inbox (or offer `ir scan` on appointed folders). If they have nothing to provide, stop: the dashboard keeps the sample data.
2. **sort** — `./bin/ir.js sort` files inbox documents into data-room category folders by filename. **Repeatable any time** new files land. Leftovers it can't classify stay in the inbox: get consent before opening them, classify by content, move them yourself.
3. **extract** — the onboarding contract below: verbs + citations, never guess.
4. **live** — the monthly rhythm.

## The three rules

1. **Prefer `ir` verbs over editing JSON.** The CLI enforces cross-collection invariants that raw edits can silently break.
2. **After ANY direct edit to `data/*.json`, run `./bin/ir.js check`.** Exit 0 = safe. Exit 1 = you broke an invariant; fix before doing anything else. This is your test suite.
3. **Never invent a number.** Missing data stays `null`; a month that isn't closed blocks the update draft. Investor-facing numbers trace to `data/financials.json` or they don't exist.

## Capability map

```
./bin/ir.js start                guided setup state machine — run when the founder says "ir start" (idempotent)
./bin/ir.js sort                 file inbox docs into data-room categories (repeatable any time)
./bin/ir.js status --json        ground yourself: every derived metric in one call
./bin/ir.js check [--json]       validate schemas + invariants (your post-edit test)
./bin/ir.js close-month 2026-07 --saas 31000 --ads 14000 --payroll 34000 --infra 4800 --other 3800
./bin/ir.js safe add "Fund X" --principal 50000 --cap 8000000 --status Signed --email a@b.c
./bin/ir.js prospect add "Acme Capital" --fit "leads pre-seed dev-tools" --source "<url>"   sourced target → CRM (inactive nurture + Contacted pipeline, no ticket)
./bin/ir.js prospect list [--json]
./bin/ir.js update draft [--month 2026-07]
./bin/ir.js update mark-sent --subject "..."
./bin/ir.js model round --pre 12000000 --new 3000000 --pool 0.10
./bin/ir.js export board-pack|tearsheet|captable   real-data artifacts → ir-workspace/exports/
./bin/ir.js scan <folder> [...]  onboarding: candidate financial docs by FILENAME only → onboarding/candidates.md
./bin/ir.js schedule show
```

`ir export` writes markdown/CSV substance generated from actuals (board pack, one-pager, diligence cap-table CSV). Styling into pptx/docx/PDF is your job if you have those skills — never alter the numbers while styling.

All commands take `--json` for structured output; errors go to stderr with exit 1. Data location overrides: `IRKIT_DATA_DIR`, `IRKIT_ROOT` (useful for tests — never point tests at the founder's live data).

`ir safe add` is the canonical example of why verbs beat edits: one call updates the cap table ledger, the CRM commitment (stage + probability), the investor record, and the update-distribution list — and tells you the implied ownership and whether the 15% SAFE-overhang guardrail still holds.

## Privacy — non-negotiable

- `data/*.json` and `ir-workspace/` are confidential. Never commit them, never weaken `.gitignore`, never paste their contents into anything that leaves this machine.
- The only data allowed in the public repo is the fictional sample in `public/js/seed.js` (localized text in `public/js/seed-i18n.js` — sample data materializes in the locale active at seed/reset time). Keep it fictional.
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

**financials.json** — `openingCash`, `months[]`: `{ month:"YYYY-MM", saas, ads, fde, otherRev, payroll, infra, other, inflow, headcount, traffic, pages, platforms, paying }`. Revenue = `saas + ads + fde + otherRev` (saas = system/subscription, ads = advertising, fde = FDE / one-time services fee, otherRev = other/non-core income e.g. rent); costs/P&L/cash are derived, never stored. `inflow` = financing proceeds, excluded from burn. `company.expectedFunding` (+ `expectedFundingNote`) drives the dashboard's expected-funding runway scenario — a verbal/planned amount, never booked into cash.

**captable.json** — `stakeholders[]` `{id,name,type,security,shares,notes}` (`type:"Pool"` = unallocated pool; `type:"Founder"` feeds the dilution walk) · `safes[]` `{id,investor,date,principal,cap,discount,status,notes}` (discount is a fraction: 0.2 = 20%) · `roundModel` · `scenarios[]` · `waterfall`.

**crm.json** — `investors[]` · `commitments[]` (stage ∈ Contacted/Meeting/Verbal/SAFE sent/Signed/Wired/Passed; Signed+Wired = closed money) · `interactions[]` · `asks[]` · `distribution[]` (segment ∈ Board/Major, All investors, Prospect nurture).

**updates.json** — `archive[]` `{id, month, subject, body, sentAt}`. The archive drives the streak and due-date roll.

**company.json** — `name, founder, email, tagline, roundTarget, roundInstrument, updateDay (1–28, default 5), sample` (drives the SAMPLE banner — keep `true` until real data replaces the seed).

**checklists.json** — `"docId:index": bool` for playbook checkboxes (position-keyed: append items, don't reorder).

## Onboarding (first run with a new founder)

`prompts/onboard.md` is the canonical ritual and is stricter than normal operation because it touches the founder's file system: consent gates every stage; `ir scan` matches filenames only (never opens files); originals are read-only — approved files get *copied* into `ir-workspace/data-room/`; every extracted number carries a file+page citation in `ir-workspace/onboarding/INVENTORY.md`; ambiguity goes to `OPEN-QUESTIONS.md`, never into data; `company.sample` flips to `false` only after the founder confirms the numbers. If you are cloud-backed, disclose what leaves the device before reading any document contents.

## Recurring rituals

Canonical prompts live in `prompts/` (onboarding, investor sourcing & outreach, monthly close, SAFE signed, draft update, meeting prep, board meeting, shareholder/AGM meeting, data-room audit, round kickoff, scheduling). They route through `ir` verbs — follow their contracts. `prospect add` is the sourcing analogue of `safe add`: it reconciles the CRM (an inactive `Prospect nurture` distribution row + a `Contacted` pipeline commitment with no ticket) so a sourced name can't receive updates or inflate the weighted pipeline until you've actually made contact.

## Code conventions (when extending the kit)

- Zero dependencies, no build step — the kit's core promise. PRs adding packages will be rejected.
- **i18n is mandatory:** UI strings go through `t()` (from `public/js/i18n.js`); every key must exist, non-empty, in ALL six locales — one dictionary file per locale in `public/js/i18n/`, long-form content per locale in `public/js/content/`. CI (`scripts/check-i18n.js`) fails otherwise. Adding or changing a user-facing string = updating all six locales in the same change.
- **Terminology rule:** finance acronyms/jargon (ARR, MoM, MOIC, NRR, net burn, runway…) keep the English term first + a local gloss in parentheses, e.g. zh-TW「ARR（年化營收）」. Data enum VALUES stay English (only `opt.*` display labels are translated) — translating stored values breaks `ir check`. Select options are `{ value, label }` pairs. Full rule in CONTRIBUTING.md.
- Percentages are fractions in data (0.10 = 10%); format only at render time.
- New operation = function in `core/ops.js` → verb in `bin/ir.js` → mention here and in `ir help`.
- New page = `public/js/<name>.js` exporting `render<Name>(root)`, registered in `app.js`, linked in `index.html`.
- Tutorial content lives in `public/js/guide.js`; regenerate ALL locale tutorials (docs/TUTORIAL.md + docs/i18n/TUTORIAL.*.md) with `npm run build-tutorial` — never edit them directly.
- Release = bump `VERSION` in `public/js/version.js` **and** `"version"` in `package.json` together, then tag `vX.Y.Z` and publish a GitHub release (the in-app About links send users there for updates).
- Verify UI changes: `node server.js`, check `/api/health`, load each page, zero console errors. Verify data changes: `./bin/ir.js check`.
