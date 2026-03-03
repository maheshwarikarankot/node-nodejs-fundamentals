import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function scanDir(dir, rootPath, entries) {
  const items = await fs.promises.readdir(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.relative(rootPath, fullPath);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      entries.push({ path: relPath, type: 'directory' });
      await scanDir(fullPath, rootPath, entries);
    } else {
      const content = await fs.promises.readFile(fullPath);
      entries.push({
        path: relPath,
        type: 'file',
        size: stat.size,
        content: content.toString('base64'),
      });
    }
  }
}

export async function writeSnapshot(workspaceDir) {
  const absWorkspace = path.resolve(workspaceDir);
  let stat;
  try {
    stat = await fs.promises.stat(absWorkspace);
  } catch {
    throw new Error('FS operation failed');
  }
  if (!stat.isDirectory()) {
    throw new Error('FS operation failed');
  }
  const entries = [];
  await scanDir(absWorkspace, absWorkspace, entries);
  const snapshot = { rootPath: absWorkspace, entries };
  const snapshotPath = path.join(path.dirname(absWorkspace), 'snapshot.json');
  await fs.promises.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSnapshot(path.resolve('workspace'));
}
