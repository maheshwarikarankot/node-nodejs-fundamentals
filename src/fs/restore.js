import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function restoreSnapshot(baseDir = process.cwd()) {
  const snapshotPath = path.join(baseDir, 'snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    throw new Error('FS operation failed');
  }
  const restoredDir = path.join(baseDir, 'workspace_restored');
  if (fs.existsSync(restoredDir)) {
    throw new Error('FS operation failed');
  }
  let snapshot;
  try {
    snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  } catch {
    throw new Error('FS operation failed');
  }
  fs.mkdirSync(restoredDir, { recursive: true });
  for (const entry of snapshot.entries) {
    const dest = path.join(restoredDir, entry.path);
    if (entry.type === 'directory') {
      fs.mkdirSync(dest, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(entry.content, 'base64'));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  restoreSnapshot(process.cwd());
}
