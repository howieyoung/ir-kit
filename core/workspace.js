// Private-workspace scaffold + the document inbox. Used by `ir start` and scripts/init-workspace.js.
import fs from 'node:fs';
import path from 'node:path';
import { WORKSPACE } from './store.js';

const TREE = {
  'README.md': `# Private IR workspace

**Everything in here is confidential — keep it out of public repos.**

| Folder | Contents |
|---|---|
| inbox/ | DROP ZONE — put any financial/fundraising/company document here, then run \`ir sort\` |
| data-room/tier1/ | Current-round diligence docs (sorted by category) |
| data-room/tier2/ | Priced-round room, built incrementally |
| financials/closes/ + statements/ | Monthly close notes · bank statements, P&L exports |
| updates/drafts/ + sent/ | Update lifecycle |
| board/packs/ + minutes/ + consents/ | Governance paper trail |
| crm/notes/ + meeting-briefs/ | Per-investor intel |
| fundraising/ | Round plans, term sheets, post-mortems |
| onboarding/ | Scan inventories, sort logs, open questions |

Backup rule: \`git init\` this folder as a PRIVATE repo, or sync to encrypted storage. Never the public IR Kit repo.
`,
  'inbox/README.md': `# Inbox — the drop zone

Drop EVERY financial, fundraising, or company document here — SAFEs, bank statements,
cap tables, incorporation docs, pitch decks, term sheets, anything. Don't worry about
organizing: run \`ir sort\` (or ask your agent) and files get filed into the right
data-room folders by category. Re-run it any time you add more files.
Whatever can't be classified by filename stays here for you and your agent to handle together.
`,
  'data-room/tier1/README.md': 'Tier-1 room: current-round diligence. Sorted by ir sort into category folders. Checklist: Playbooks → Data room.\n',
  'data-room/tier2/README.md': 'Tier-2 room (priced round): consents, stock ledger, 409A, option paperwork, contracts, operating model.\n',
  'data-room/_access-log.md': '# Data room access log\n\n| Date | Who | Tier | Granted via | Revoked |\n|---|---|---|---|---|\n',
  'financials/closes/.gitkeep': '',
  'financials/statements/.gitkeep': '',
  'updates/drafts/.gitkeep': '',
  'updates/sent/.gitkeep': '',
  'board/packs/.gitkeep': '',
  'board/minutes/.gitkeep': '',
  'board/consents/consent-log.md': '# Consent & resolution log\n\n| Date | Action | Type | Doc | Status |\n|---|---|---|---|---|\n',
  'crm/notes/.gitkeep': '',
  'crm/meeting-briefs/.gitkeep': '',
  'crm/next-actions.md': '# Next actions\n\n- [ ] (agent-maintained)\n',
  'fundraising/.gitkeep': '',
  'onboarding/.gitkeep': '',
  '.gitignore': '.DS_Store\n',
};

export const INBOX = path.join(WORKSPACE, 'inbox');

// Idempotent: creates whatever is missing, never overwrites existing files.
export function scaffoldWorkspace(root = WORKSPACE) {
  let created = 0;
  for (const [rel, content] of Object.entries(TREE)) {
    const file = path.join(root, rel);
    if (fs.existsSync(file)) continue;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    created++;
  }
  return { root, created, existed: created === 0 };
}

export function inboxFiles(root = WORKSPACE) {
  const inbox = path.join(root, 'inbox');
  if (!fs.existsSync(inbox)) return [];
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'README.md') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else out.push(full);
    }
  };
  walk(inbox);
  return out;
}

export function dataRoomFileCount(root = WORKSPACE) {
  const dr = path.join(root, 'data-room');
  if (!fs.existsSync(dr)) return 0;
  let n = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'README.md' || e.name === '_access-log.md') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else n++;
    }
  };
  walk(dr);
  return n;
}
