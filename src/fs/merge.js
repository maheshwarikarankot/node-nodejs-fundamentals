import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function merge(workspaceDir, files = null) {
  const partsDir = path.join(path.resolve(workspaceDir), 'parts');
  if (!fs.existsSync(partsDir)) {
    throw new Error('FS operation failed');
  }
  let filesToMerge;
  if (files && files.length > 0) {
    filesToMerge = files;
    for (const f of filesToMerge) {
      const filePath = path.join(partsDir, f);
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        throw new Error('FS operation failed');
      }
    }
  } else {
    filesToMerge = fs
      .readdirSync(partsDir)
      .filter((f) => path.extname(f) === '.txt')
      .sort();
    if (filesToMerge.length === 0) {
      throw new Error('FS operation failed');
    }
  }
  const content = filesToMerge
    .map((f) => fs.readFileSync(path.join(partsDir, f), 'utf8'))
    .join('');
  fs.writeFileSync(path.join(path.resolve(workspaceDir), 'merged.txt'), content);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filesArgIndex = process.argv.indexOf('--files');
  const files =
    filesArgIndex !== -1 ? process.argv[filesArgIndex + 1].split(',') : null;
  merge(path.resolve('workspace'), files);
}
