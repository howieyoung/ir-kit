# The `ir` CLI — complete reference

The command line for IR Kit. Built for coding agents first, but humans use it too — it's often faster than the UI for a single fact ("what's my runway?") or a mechanical ritual (recording a signed SAFE).

```bash
./bin/ir.js <command> [args] [--flags]
# or, after `npm link` (optional): ir <command>
```

- Every command supports `--json` for structured output (human-readable summaries otherwise).
- Errors go to stderr and exit `1`; success exits `0`. Agents: branch on exit codes.
- The CLI and the web UI read and write the same `data/*.json` — they never disagree.

## Environment

| Variable | Effect | Default |
|---|---|---|
| `IRKIT_DATA_DIR` | Where collections (`*.json`) live | `<repo>/data` |
| `IRKIT_ROOT` | Parent of `ir-workspace/` (drafts, exports) | parent of data dir |

Point these at a throwaway directory for tests or experiments — **never run experiments against your live data**. With no data files present, commands run against the built-in sample company; the first write creates real files.

---

## `ir start`

The one command a new founder needs to know — usually spoken to their agent as just **"ir start"**. An idempotent state machine: scaffolds whatever is missing (private workspace + the document **inbox** at `ir-workspace/inbox/`), detects the current stage, and prints the exact next action with the privacy ground rules. Stages: **collect** (drop documents into the inbox, or `ir scan` appointed folders) → **sort** → **extract** (agent work, citations required) → **live** (the monthly rhythm). Safe to re-run at any moment; if the founder provides no documents, the dashboard keeps its sample data.

## `ir sort`

Files everything in the inbox into data-room category folders (`tier1/safes`, `tier1/bank-statements`, `tier2/board`, …) by **filename only** — contents are never opened. Collisions get numbered suffixes; every move is logged to `ir-workspace/onboarding/SORT-LOG.md`. Files it can't classify stay in the inbox for the agent to handle by content, with consent. **Repeatable any time** new documents land — it's a standing filing service.

## `ir status`

Every derived metric in one call — the grounding command an agent (or you) runs first.

```console
$ ir status
Protico  [SAMPLE DATA]
2026-06: revenue $39,500 (15.2% MoM) · ARR run-rate $474,000
cash $177,550 · burn(3mo) −$8,067 · runway 22 mo → 2028-04
update: due 2026-07-05 (0d) · streak 0
round: $0 of $750,000 (0.0%) · weighted $25,000
cap table: 4 SAFEs $300,000 · implied 4.2% (ok) · founder 81.0%
```

`--json` returns `{company, financials, cadence, round, capTable}` with stable field names (`runwayMonths`, `safeImpliedTotalPct`, `daysUntilDue`, …). Percentages are fractions (`0.042` = 4.2%).

## `ir check`

The verification loop: schema validation + cross-collection invariants. **Run after any direct edit to `data/*.json`.**

```console
$ ir check
✗ ERROR  [recon.commitment-without-safe] crm.commitments[2]: "Ghost Fund" is Signed but has no SAFE ledger entry — cap table and CRM disagree
✗ 1 error(s), 0 warning(s)      # exit code 1
```

Checks include: month format/duplicates/gaps, numeric types, cap-table share sanity, SAFE terms present (cap and/or discount), discount-is-a-fraction, CRM stage/segment/probability enums, **ledger↔CRM reconciliation** (a Signed/Wired commitment must have a SAFE entry), signed investors present on the distribution list, and the 15% SAFE-overhang guardrail (warning). `--json` → `{ok, errors[], warnings[]}` with machine-readable `code` and `where` per finding.

## `ir close-month`

```bash
ir close-month 2026-07 --saas 31000 --ads 14000 --payroll 34000 --infra 4800 --other 3800 \
  [--inflow 0 --headcount 6 --traffic 58000000 --pages 1050000 --platforms 66 --paying 37]
```

Validates the month key, refuses duplicates, appends, and reports: revenue, net P&L, cash — plus flags for >20% MoM moves, sub-6-month runway, and negative cash. Omitted fields stay `null` (never guessed). Amending an existing month = edit the JSON, then `ir check`.

## `ir safe add`

```bash
ir safe add "Fund X" --principal 50000 --cap 8000000 \
  [--discount 0.2] [--status Signed|Wired|Verbal|"SAFE sent"|Target] [--date 2026-07-05] \
  [--email jane@fundx.com] [--contact "Jane Doe"] [--type Fund] [--segment "All investors"]
```

One call, four reconciled writes: the SAFE ledger entry, the CRM commitment (stage + stage-appropriate probability), the investor record, and the update-distribution entry (the last two only for Signed/Wired). Reports implied ownership, total SAFE overhang vs the 15% guardrail, and round progress. Refuses a SAFE with neither cap nor discount (conversion would be undefined). Discounts are fractions: `0.2` = 20%.

## `ir prospect add` / `ir prospect list`

```bash
ir prospect add "Acme Capital" --fit "leads pre-seed dev-tools in EU" --source "https://acme.example/thesis" \
  [--email partner@acme.example] [--type Fund|Angel|Accelerator|Other] [--ticket 50000]
ir prospect list [--json]
```

The sourcing analogue of `safe add`, for investors you've *found* but not yet contacted. One `add` makes two reconciled CRM writes: an **inactive** `Prospect nurture` distribution row (so a sourced name can't receive updates until you flip `active` after real contact) and a `Contacted` pipeline commitment with **no ticket** (so unqualified names never inflate the weighted pipeline). Requires `--fit` and `--source` — a prospect you can't justify or cite doesn't get logged. Dedupes by name: re-running updates a prior *prospect* in place instead of duplicating, and a name you already track as a real investor/recipient/deal is reported back untouched — never overwritten. Stays green under `ir check`. Drives [prompts/investor-sourcing.md](../prompts/investor-sourcing.md), which researches candidates on the public web and drafts the outreach (never sends). `list` prints each prospect with its pipeline stage and fit.

## `ir update draft` / `ir update mark-sent`

```bash
ir update draft [--month 2026-07]
ir update mark-sent [--subject "Protico — July 2026 Update"] [--month 2026-07]
```

`draft` writes the metrics-filled YC-format skeleton to `ir-workspace/updates/drafts/<month>.md` — deterministically, from actuals. If the month isn't closed it writes a `BLOCKED-<month>.md` note and exits 1 instead of inventing numbers. `mark-sent` archives the draft (feeding the streak and rolling the due date) — **only call it for an email that was actually sent**; sending itself stays human (web UI BCC button or your mail client).

## `ir model round`

```bash
ir model round --pre 12000000 --new 3000000 [--pool 0.10]
```

Priced-round conversion with post-money SAFE mechanics: post-money, new-investor %, SAFE %, pool top-up (closed form), price per share, and the full pro-forma cap table. Same math as the web UI's Round modeler (`public/js/metrics.js`).

## `ir export`

```bash
ir export board-pack   # CEO-letter skeleton + last-3-months table + financial position + cap table snapshot
ir export tearsheet    # one-pager: latest metrics, round status, contact
ir export captable     # diligence-ready CSV: stakeholders + SAFEs with implied %
```

Artifacts generated from actuals into `ir-workspace/exports/`, dated. Markdown/CSV substance by design — style into pptx/docx/PDF with your own tools or agent; the numbers must not change in styling.

## `ir scan`

```bash
ir scan ~/Documents/company ~/Downloads
```

Onboarding helper: walks the appointed folders and finds candidate financial/investment documents — **by filename and metadata only; file contents are never read**. Writes a tick-box inventory to `ir-workspace/onboarding/candidates.md` grouped by category (SAFEs, cap table, incorporation, bank statements, P&L, term sheets, board, investor materials, tax). Skips hidden and system directories, with hard limits on depth and file count. Requires explicit folders — there is deliberately no "scan everything" default; consent comes first. This is stage 1 of [prompts/onboard.md](../prompts/onboard.md), which takes a new founder from download to a dashboard running on real, source-cited data in one conversation.

## `ir schedule show`

Prints ready-made cron lines: close reminder (1st), deterministic draft (3rd), weekly `ir check` (Mondays). See [prompts/schedule-updates.md](../prompts/schedule-updates.md) for agent-in-the-loop variants and safety rules.

---

## Agent rules of engagement

The full contract is [AGENTS.md](../AGENTS.md). The compressed version:

1. Prefer these verbs over editing `data/*.json` — invariants live in the verbs.
2. After any direct JSON edit: `ir check`, and fix before proceeding.
3. Never invent a number; never auto-send; `data/` and `ir-workspace/` never leave the machine.
