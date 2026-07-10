// Scaffolds the PRIVATE local IR workspace (thin wrapper — the scaffold lives in
// core/workspace.js and is also run automatically by `ir start`).
//   node scripts/init-workspace.js
import { scaffoldWorkspace, INBOX } from '../core/workspace.js';

const r = scaffoldWorkspace();
console.log(r.existed
  ? `Workspace already exists at ${r.root} — nothing overwritten.`
  : `Private IR workspace created at ${r.root} (${r.created} files).`);
console.log(`Drop your documents into ${INBOX} and run: ./bin/ir.js sort`);
console.log('Or just run ./bin/ir.js start and follow the steps.');
