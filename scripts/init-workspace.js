// Scaffolds a PRIVATE local IR workspace next to your data: the folder infrastructure
// for a data room, update archive, board records, and CRM notes that agents and the
// prompt sets in prompts/ operate on.
//
//   node scripts/init-workspace.js [target-dir]     (default: ./ir-workspace, gitignored)
//
// Nothing here is uploaded anywhere. Recommended: `git init` the workspace as its own
// PRIVATE repo (or point it at encrypted storage) for versioned backups.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ir-workspace');

const TREE = {
  'README.md': `# Private IR workspace

Created ${new Date().toISOString().slice(0, 10)} by IR Kit. **Everything in here is confidential — keep it out of public repos.**

| Folder | Contents | Fed by |
|---|---|---|
| data-room/tier1/ | Current-round diligence docs | prompts/data-room-audit.md |
| data-room/tier2/ | Priced-round room, built incrementally | 〃 |
| financials/closes/ | Monthly close notes | prompts/monthly-close.md |
| financials/statements/ | Bank statements, P&L exports | you |
| updates/drafts/ + updates/sent/ | Update lifecycle | prompts/draft-update.md |
| board/packs/ + board/minutes/ + board/consents/ | Governance paper trail | you + agent |
| crm/notes/ + crm/meeting-briefs/ | Per-investor intel | prompts/meeting-prep.md |
| fundraising/ | Round plans, term sheets, closed-round post-mortems | prompts/round-kickoff.md |

Backup rule: \`git init\` this folder as a PRIVATE repo, or sync to encrypted storage. Never the public IR Kit repo.
`,
  'data-room/tier1/README.md': 'Tier-1 room: memo, deck, cert of incorporation, metrics one-pager, cap table export, executed SAFEs + side letters, bank statement, IP assignments. Checklist: Playbooks → Data room.\n',
  'data-room/tier2/README.md': 'Tier-2 room (priced round): consents, stock ledger, 409A, option paperwork, customer contracts, employment agreements, operating model.\n',
  'data-room/_access-log.md': '# Data room access log\n\n| Date | Who | Tier | Granted via | Revoked |\n|---|---|---|---|---|\n',
  'financials/closes/.gitkeep': '',
  'financials/statements/.gitkeep': '',
  'updates/drafts/.gitkeep': '',
  'updates/sent/.gitkeep': '',
  'board/packs/.gitkeep': '',
  'board/minutes/.gitkeep': '',
  'board/consents/consent-log.md': '# Consent & resolution log\n\nEvery corporate action, from day one. At the priced round counsel asks for all of it.\n\n| Date | Action | Type | Doc | Status |\n|---|---|---|---|---|\n',
  'crm/notes/.gitkeep': '',
  'crm/meeting-briefs/.gitkeep': '',
  'crm/next-actions.md': '# Next actions\n\n- [ ] (agent-maintained — see prompts/safe-signed.md)\n',
  'fundraising/.gitkeep': '',
  '.gitignore': '.DS_Store\n',
};

if (fs.existsSync(path.join(root, 'README.md'))) {
  console.error(`Workspace already exists at ${root} — refusing to overwrite.`);
  process.exit(1);
}
for (const [rel, content] of Object.entries(TREE)) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
console.log(`Private IR workspace created at ${root}`);
console.log('Next: git init it as a PRIVATE repo for versioned backups, then try prompts/monthly-close.md with your agent.');
