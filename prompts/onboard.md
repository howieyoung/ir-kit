# Onboard — from download to a real dashboard in one conversation

The agent takes over data collection and organization: the founder drops documents into one inbox folder (or appoints folders to scan), the agent files them into the right data-room categories — repeatable any time — then extracts the real cap table and financials so the dashboard opens on real, cited data. If the founder provides nothing, the sample data stays. This is the first prompt a new user should run — triggered by the founder simply saying **"ir start"**.

**Agent contract for this ritual (stricter than usual — this touches the founder's whole file system):**
- **Consent gates every stage.** Never scan, copy, or extract without an explicit yes for that stage.
- **Originals are read-only.** Copy approved files into `ir-workspace/data-room/`; never move, modify, or delete anything outside the repo and workspace.
- **Every number carries a citation** (file + page/cell). A number you can't cite doesn't enter the system — it goes to the open-questions list.
- **Nothing leaves the machine.** No uploads, no pasting document contents into hosted tools. If you are a cloud-backed agent, tell the founder which parts of what you read leave the device, and let them decide before reading any contents.

**The founder only needs to say one thing: "ir start".** Everything below is what you do with it.

```
Take over my IR data setup (read AGENTS.md first).

STAGE 0 — Begin + consent. Run:  ./bin/ir.js start
It scaffolds the workspace (including the document inbox) and prints the current
stage + next action. Then confirm the ground rules above to me out loud, and ask
how I want to hand over documents:
  (a) EASIEST — I drop everything into the inbox it created
      (ir-workspace/inbox/ — SAFEs, bank statements, cap table, decks, unsorted
      is fine), or
  (b) you scan folders I appoint:  ./bin/ir.js scan <folders>  (filenames only;
      candidates land in a tick-box inventory we review together, then you COPY
      approved files into the inbox).
Wait for my documents. Do not proceed without them — and if I have nothing to
give, stop: the dashboard keeps its sample data until real data exists.

STAGE 1 — Sort (repeatable, filenames only). Run:  ./bin/ir.js sort
It files inbox documents into data-room category folders and logs everything to
ir-workspace/onboarding/SORT-LOG.md. Whatever it can't classify stays in the
inbox: ask my permission before opening those, classify them by content, and move
them into the right folder yourself. Re-run ir sort ANY time I add more files —
this is a standing service, not a one-off.

STAGE 2 — Inventory. Keep ir-workspace/onboarding/INVENTORY.md current as you go:
every document's location + doc type, so nothing gets lost between sessions.
Originals outside the workspace stay untouched, always.

STAGE 3 — Extract (now you may read approved contents). Work document by document:
  - Executed SAFEs / notes → ./bin/ir.js safe add "<investor>" --principal N --cap N
    --discount F --date D --status Signed, with terms quoted from the document.
  - Incorporation / cap table docs → stakeholders in data/captable.json (direct edit),
    then ./bin/ir.js check.
  - Bank statements / P&L / bookkeeping → ./bin/ir.js close-month for each month you
    can FULLY support with documents (opening cash first, in data/financials.json).
    Partial months: leave fields null.
  - Investor names/emails found in docs → data/crm.json investors + distribution.
  Record every extracted value in INVENTORY.md: value → source file, page/cell.
  Anything ambiguous, conflicting, or missing → ir-workspace/onboarding/OPEN-QUESTIONS.md.
  NEVER guess. An empty field beats a wrong cap table.

STAGE 4 — Verify & hand over.
  - ./bin/ir.js check must pass clean; fix errors before showing me anything.
  - ./bin/ir.js status — then walk me through the dashboard against the citations.
  - Give me OPEN-QUESTIONS.md as my punch list.
  - Only after I confirm the numbers match my reality: set sample=false in
    data/company.json. Until then the SAMPLE banner stays up.
```

## After onboarding

Suggest the natural next steps: `prompts/data-room-audit.md` (what's still missing vs the tier checklists), setting the update day, and — if a raise is on — `prompts/round-kickoff.md`.

## Why `ir scan` and `ir sort` are deliberately dumb

They match filenames and never open files, so the founder consents to *contents* being read only after seeing exactly which files are in play — stage by stage, not all-at-once. The intelligence lives in the agent + the founder's answers; the kit just guarantees the process can't overreach silently.
