import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function scanDir(dir, rootPath, entries) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.relative(rootPath, fullPath);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      entries.push({ path: relPath, type: 'directory' });
      scanDir(fullPath, rootPath, entries);
    } else {
      const content = fs.readFileSync(fullPath);
      entries.push({
        path: relPath,
        type: 'file',
        size: stat.size,
        content: content.toString('base64'),
      });
    }
  }
}

export function writeSnapshot(workspaceDir) {
  const absWorkspace = path.resolve(workspaceDir);
  if (!fs.existsSync(absWorkspace) || !fs.statSync(absWorkspace).isDirectory()) {
    throw new Error('FS operation failed');
  }
  const entries = [];
  scanDir(absWorkspace, absWorkspace, entries);
  const snapshot = { rootPath: absWorkspace, entries };
  const snapshotPath = path.join(path.dirname(absWorkspace), 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSnapshot(path.resolve('workspace'));
}
