// Generates docs/TUTORIAL.md from the in-app Guide content (public/js/guide.js)
// so the website and GitHub docs never drift. Run after editing guide.js:
//   npm run build-tutorial
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDE_HUMAN, GUIDE_AGENT, CAPTABLE_101, GLOSSARY } from '../public/js/content/guide.en.js';

const out = `<!-- GENERATED from public/js/content/guide.en.js — edit there, then \`npm run build-tutorial\` -->
# IR Kit tutorial

The same guide that lives in the app (**Get started** in the sidebar), for reading on GitHub.

- [Use it with your agent](#operating-ir-kit-with-your-agent) — the agent track
- [Use it yourself](#your-first-30-minutes) — the human track
- [Cap table 101](#cap-table-101--the-ten-minute-version) — if SAFEs and dilution are new to you
- [Glossary](#glossary)

---

${GUIDE_AGENT}

---

${GUIDE_HUMAN}

---

${CAPTABLE_101}

---

${GLOSSARY}
`;

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'TUTORIAL.md');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out);
console.log('wrote', file);
