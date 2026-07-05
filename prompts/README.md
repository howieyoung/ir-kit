# Prompt sets — operate IR Kit with your agent

These are ready-to-use prompts for coding agents (Claude Code, Codex, Cursor, etc.) running in this repo. They assume the agent has read [AGENTS.md](../AGENTS.md) (agents pick it up automatically in most tools; paste it in otherwise) and route through the [`ir` CLI](../docs/CLI.md), which enforces the data invariants.

Copy, fill the brackets, paste. Each prompt produces file edits in `data/` and/or your private `ir-workspace/` — your data never needs to leave your machine.

| Prompt | When |
|---|---|
| [monthly-close.md](monthly-close.md) | 10 days after month-end, every month |
| [safe-signed.md](safe-signed.md) | The day a SAFE is signed/wired |
| [draft-update.md](draft-update.md) | Monthly, right after the close |
| [meeting-prep.md](meeting-prep.md) | Before any investor meeting |
| [data-room-audit.md](data-room-audit.md) | Before opening a raise; quarterly after |
| [round-kickoff.md](round-kickoff.md) | When you decide to raise |
| [schedule-updates.md](schedule-updates.md) | Once — put the agent on a monthly schedule |

**Privacy rule for all prompts:** your agent works on local files only. Never paste real cap table or financial data into hosted tools you don't control, and keep `data/` and `ir-workspace/` out of public repos (the `.gitignore` here already does this — keep it that way in forks).
