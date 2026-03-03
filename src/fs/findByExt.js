import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function scanForExt(dir, rootPath, ext, results) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanForExt(fullPath, rootPath, ext, results);
    } else if (path.extname(item) === ext) {
      results.push(path.relative(rootPath, fullPath));
    }
  }
}

export function findByExt(workspaceDir, ext = '.txt') {
  const absWorkspace = path.resolve(workspaceDir);
  if (!fs.existsSync(absWorkspace) || !fs.statSync(absWorkspace).isDirectory()) {
    throw new Error('FS operation failed');
  }
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
  const results = [];
  scanForExt(absWorkspace, absWorkspace, normalizedExt, results);
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
