# IR Kit — agent guide

You are operating a founder's investor-relations system. The human manages it in a browser; you manage it through files. Both write the same JSON.

**Privacy rules (non-negotiable):**
- `data/*.json` and `ir-workspace/` are the founder's confidential IR data — gitignored by design. Never commit them, never weaken the `.gitignore`, never paste their contents into anything that leaves this machine.
- The only data allowed in the public repo is the fictional sample in `public/js/seed.js`. If asked to update the seed, keep it fictional — no real investors, contacts, or figures.
- Recurring rituals (monthly close, SAFE signed, update drafting, meeting prep, data-room audit, round kickoff) have canonical prompts in `prompts/` — follow their contracts, especially "never invent a number".

## Layout

```
server.js               zero-dep Node server: static files + GET/PUT /api/<collection>
data/*.json             ALL state — one file per collection (see schemas below)
public/js/app.js        router + settings page
public/js/store.js      persistence (server API with localStorage fallback for static hosting)
public/js/metrics.js    ALL financial + cap-table math, pure functions — change math here only
public/js/ui.js         DOM helpers: el(), fmt, dataTable(), lineChart(), tabs()
public/js/seed.js       sample dataset (mirrored into data/ by scripts/seed-data.js)
public/js/<module>.js   one file per page: dashboard, financials, captable, crm, updates, playbooks
public/js/playbook-content.js   playbook markdown (tailor per company)
prompts/                ready-to-paste prompt sets for recurring IR rituals
scripts/init-workspace.js       scaffolds ir-workspace/ (private local data room, board, CRM folders)
ir-workspace/           the founder's PRIVATE document workspace (gitignored; may not exist yet)
```

## Editing data directly

Safe to edit `data/*.json` while the server runs — it reads per request; the browser sees changes on reload. Writes from the UI are atomic (tmp+rename). Don't fight over a file mid-edit; finish one write before the user saves in the UI.

**financials.json** — `openingCash`, `months[]`: `{ month:"YYYY-MM", saas, ads, payroll, infra, other, inflow, headcount, traffic, pages, platforms, paying }`. Revenue/costs/P&L/cash are derived, never stored. `inflow` = financing proceeds (kept out of burn math).

**captable.json** — `stakeholders[]` (`{id,name,type,security,shares,notes}`, `type:"Pool"` rows are treated as unallocated pool by the round modeler; `type:"Founder"` feeds the dilution walk), `safes[]` (`{id,investor,date,principal,cap,discount,status,notes}` — discount is a fraction, 0.2 = 20%), `roundModel`, `scenarios[]`, `waterfall`.

**crm.json** — `investors[]`, `commitments[]` (`stage` ∈ Contacted/Meeting/Verbal/SAFE sent/Signed/Wired/Passed; Signed+Wired count as closed), `interactions[]`, `asks[]`, `distribution[]` (`segment` ∈ Board/Major, All investors, Prospect nurture).

**updates.json** — `archive[]`: `{id, month, subject, body, sentAt}`.

**checklists.json** — flat map of `"docId:index": bool` for playbook checkboxes. Position-keyed: append checklist items in `playbook-content.js`, don't reorder.

**company.json** — `name, founder, email, tagline, roundTarget, roundInstrument, updateDay (day of month the update is sent, default 5), sample`. Keep `sample:true` until real data replaces the seed everywhere (it drives the SAMPLE pill + banner).

## Conventions

- No dependencies, no build step. Keep it that way — it's the kit's core promise.
- Percentages are fractions (0.10 = 10%) everywhere in data; format only at render time via `fmt.pct`.
- Money is stored as raw numbers (no cents needed); format via `fmt.usd`.
- New page module: export `render<Name>(root)`, register in `app.js` routes, add the sidebar link in `index.html`.
- Cap table math notes live as comments in `metrics.js` (post-money SAFE percentage method; pool top-up closed form: `Δp = max(0, (p − e(1−n))/(1−e))`).
- When the user says a SAFE was signed: update `captable.json` safes AND `crm.json` commitments (stage) AND `crm.json` distribution (add recipient). Those three must reconcile.
- Never invent financial numbers. If the user gives partial month data, leave missing fields `null` — derived metrics skip null months.

## Common tasks

- Monthly close: append a month row to `financials.json`, then remind the user to compose the update (Updates page pre-fills metrics).
- Reset demo: `npm run seed` (destructive).
- Verify after code changes: `node server.js` and check `/api/health`, then each page renders without console errors.
- Tutorial content lives in `public/js/guide.js` (in-app Get started page); after editing it run `npm run build-tutorial` to regenerate `docs/TUTORIAL.md` — never edit TUTORIAL.md directly.
- Scheduled drafting runs (cron/scheduled tasks) follow `prompts/schedule-updates.md`: write drafts to `ir-workspace/updates/drafts/` only; never auto-send, never touch the archive.
