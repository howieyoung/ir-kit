# Schedule your agent — the draft is waiting on update day

The kit tracks your cadence (dashboard shows due/overdue and your streak; Updates → Schedule exports a recurring calendar file). This prompt makes the *work* scheduled too: your agent drafts the update before you even sit down.

## Why not scheduled email sending?

Deliberate design choice: a local-first, zero-dependency app can't reliably send email on a schedule (that requires an always-on server with SMTP credentials — infrastructure that would hold your data). Auto-send via bring-your-own SMTP is on the roadmap as an opt-in. Until then: **the agent prepares, the human sends.** For investor updates that's a feature — the send should have your eyes on it.

## Claude Code (scheduled task)

Ask Claude Code in this repo:

```
Create a scheduled task: on the 3rd of every month at 9am, run the monthly ritual —
read prompts/draft-update.md and execute it for the month that just ended. If
data/financials.json is missing that month, instead write
ir-workspace/updates/drafts/BLOCKED-[YYYY-MM].md telling me to close the month first.
```

## Plain cron — no agent required for the mechanical part

`ir update draft` generates the metrics-filled draft deterministically (and writes a
BLOCKED note if the month isn't closed) — run `./bin/ir.js schedule show` for
ready-made cron lines:

```bash
# crontab -e
0 9 1 * *  cd $HOME/ir-kit && ./bin/ir.js status                # 1st: close reminder
0 9 3 * *  cd $HOME/ir-kit && ./bin/ir.js update draft          # 3rd: draft waiting
0 9 * * 1  cd $HOME/ir-kit && ./bin/ir.js check                 # Mondays: integrity
```

## Cron with an agent (narrative filled in, not just metrics)

```bash
# 9am on the 3rd — agent expands the draft with highlights/lowlights from the close notes
0 9 3 * * cd $HOME/ir-kit && claude -p "$(cat prompts/draft-update.md)" --allowedTools "Read,Write,Edit,Bash" >> ir-workspace/updates/drafts/cron.log 2>&1
```

## Safety rules for scheduled runs

1. **Draft, never send.** Scheduled runs write to `ir-workspace/updates/drafts/` only — the archive and the send stay manual.
2. **No invented numbers.** If the month isn't closed, the run produces a blocker note, not a guessed draft.
3. **Local only.** The scheduled agent needs no network access beyond the repo folder; don't grant it more.
4. Review the draft the same way you'd review a junior IR hire's work — that's what it is.
