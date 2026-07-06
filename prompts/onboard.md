# Onboard — from download to a real dashboard in one conversation

The agent takes over data collection and organization: scan the founder's appointed folders, organize the documents, and populate the IR system with real, cited data. This is the first prompt a new user should run.

**Agent contract for this ritual (stricter than usual — this touches the founder's whole file system):**
- **Consent gates every stage.** Never scan, copy, or extract without an explicit yes for that stage.
- **Originals are read-only.** Copy approved files into `ir-workspace/data-room/`; never move, modify, or delete anything outside the repo and workspace.
- **Every number carries a citation** (file + page/cell). A number you can't cite doesn't enter the system — it goes to the open-questions list.
- **Nothing leaves the machine.** No uploads, no pasting document contents into hosted tools. If you are a cloud-backed agent, tell the founder which parts of what you read leave the device, and let them decide before reading any contents.

```
Take over my IR data setup (read AGENTS.md first, then follow all five stages).

STAGE 0 — Consent. Ask me:
  (a) which folders to scan — recommend appointed folders (e.g. ~/Documents/company,
      ~/Downloads) over a whole-device scan, and say why: faster, less noise, and I
      stay in control of what you see. Whole-device only if I insist.
  (b) confirm the ground rules above out loud so I know you know them.
Wait for my answer. Do not proceed without it.

STAGE 1 — Scan (filenames only). Run:  ./bin/ir.js scan <my folders>
It finds candidate financial/investment documents by filename and writes a tick-box
inventory to ir-workspace/onboarding/candidates.md — contents are NOT read at this
stage. Walk me through the list by category; I'll tell you what's relevant, what's
missing (then scan another folder), and what you may open.

STAGE 2 — Organize. Scaffold the workspace first if it doesn't exist yet:
node scripts/init-workspace.js. Then copy only the approved files into
ir-workspace/data-room/ (tier1/ for current-round docs, tier2/ for the rest —
taxonomy is in the Playbooks data-room checklist). Log every copy in
ir-workspace/onboarding/INVENTORY.md as "source path → destination · doc type".
Originals stay untouched.

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

## Why `ir scan` is deliberately dumb

It matches filenames and never opens files, so the founder consents to *contents* being read only after seeing exactly which files are in play — stage by stage, not all-at-once. The intelligence lives in the agent + the founder's answers; the kit just guarantees the process can't overreach silently.
