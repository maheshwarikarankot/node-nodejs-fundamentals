import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function restoreSnapshot(baseDir = process.cwd()) {
  const snapshotPath = path.join(baseDir, 'snapshot.json');
  let snapshotContent;
  try {
    snapshotContent = await fs.promises.readFile(snapshotPath, 'utf8');
  } catch {
    throw new Error('FS operation failed');
  }
  const restoredDir = path.join(baseDir, 'workspace_restored');
  try {
    await fs.promises.access(restoredDir);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message === 'FS operation failed') throw err;
  }
  let snapshot;
  try {
    snapshot = JSON.parse(snapshotContent);
  } catch {
    throw new Error('FS operation failed');
  }
  await fs.promises.mkdir(restoredDir, { recursive: true });
  for (const entry of snapshot.entries) {
    const dest = path.join(restoredDir, entry.path);
    if (entry.type === 'directory') {
      await fs.promises.mkdir(dest, { recursive: true });
    } else {
      await fs.promises.mkdir(path.dirname(dest), { recursive: true });
      await fs.promises.writeFile(dest, Buffer.from(entry.content, 'base64'));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  restoreSnapshot(process.cwd());
}
