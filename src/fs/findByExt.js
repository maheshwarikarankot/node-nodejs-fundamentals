import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function scanForExt(dir, rootPath, ext, results) {
  const items = await fs.promises.readdir(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      await scanForExt(fullPath, rootPath, ext, results);
    } else if (path.extname(item) === ext) {
      results.push(path.relative(rootPath, fullPath));
    }
  }
}

export async function findByExt(workspaceDir, ext = '.txt') {
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
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
  const results = [];
  await scanForExt(absWorkspace, absWorkspace, normalizedExt, results);
  results.sort();
  for (const p of results) {
    console.log(p);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const extArgIndex = process.argv.indexOf('--ext');
  const ext = extArgIndex !== -1 ? process.argv[extArgIndex + 1] : '.txt';
  findByExt(path.resolve('workspace'), ext);
}
