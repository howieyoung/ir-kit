# Investor sourcing — find fitted investors & open outreach

Build a fit profile from your own numbers, research matching funds/angels on the public web, log them safely, and draft outreach you review before anything sends. Only PUBLIC investor info is web-searched — your financials never leave the machine. Sourced prospects land on the distribution list **inactive** (they must not receive updates until you've actually made contact), and every draft waits for you to send it.

`ir prospect add` is invariant-safe: it dedupes by normalized name across the CRM, adds an inactive `Prospect nurture` distribution row, and seeds a `Contacted` pipeline commitment with **no ticket** (so unqualified names never inflate the weighted pipeline). Run `./bin/ir.js check` after any direct `crm.json` edit.

```
Source fitted investors for my raise (read AGENTS.md first, then run all five stages).

STAGE 0 — Fit profile. Ground yourself in my data first:
  ./bin/ir.js status --json  — plus data/company.json (roundTarget, roundInstrument),
  data/financials.json (stage, sector cues, latest revenue/traction) and
  data/captable.json. Then ASK me and wait: investment-thesis keywords, target
  check size, stage, geographies, and any MUST-AVOID firms (e.g. investors in
  direct competitors). Privacy: only PUBLIC investor info is web-searched — my
  financials never leave this machine and nothing is uploaded.

STAGE 1 — Research candidates (web). Find funds/angels/accelerators matching my
  stage + thesis + check size + geography. For EACH capture: name, firm,
  why-they-fit (SPECIFIC thesis/portfolio evidence, not generic), typical check,
  stage focus, portfolio conflicts, the best warm-intro path, and a public source
  URL / contact. Produce a RANKED shortlist (~15–25), scored by fit. Quality over
  volume — do not pad the list to hit a number.

STAGE 2 — Log them. For each shortlisted prospect run:
  ./bin/ir.js prospect add "<name>" --fit "<specific reason>" --source "<url or thesis>" [--email E] [--type Fund|Angel|Accelerator] [--ticket N]
  (dedupes by name — re-running updates a prospect in place; a name already in my
   CRM as a real investor/recipient is reported back untouched, never overwritten.)
  Then write a fuller dossier to ir-workspace/crm/prospects/<name>.md:
  fit evidence, warm-intro path, portfolio, contact, source links.
  Sanity-check with ./bin/ir.js prospect list.

STAGE 3 — Draft outreach (TOP prospects only). For each, write BOTH a personalised
  cold email AND a warm-intro-request note → ir-workspace/updates/drafts/outreach/<name>.md.
  Personalise from the dossier, keep it short, make ONE specific ask. NEVER send.

STAGE 4 — Hand-off. I review the drafts and send the ones I like. THEN — for each
  prospect I actually contacted — flip active:true on their Prospect-nurture
  distribution row and log the first interaction in data/crm.json, and
  ./bin/ir.js check.

GUARDRAILS: never invent contact info or fabricate a thesis match — cite the source
and mark unknowns as unknown; prospects stay INACTIVE on the distribution list until
contact is real; don't spam; run ./bin/ir.js check after any direct crm.json edit.
```

## Why prospects land inactive with no ticket

A sourced name is a hypothesis, not a relationship. `active:false` keeps them off every update send until you've actually reached out; the empty ticket keeps them out of the weighted pipeline until there's a real conversation to size. Both flip only after Stage 4 — a send you made, an interaction you logged.
