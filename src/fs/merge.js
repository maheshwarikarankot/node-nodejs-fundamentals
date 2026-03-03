import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function merge(workspaceDir, files = null) {
  const partsDir = path.join(path.resolve(workspaceDir), 'parts');
  try {
    await fs.promises.access(partsDir);
  } catch {
    throw new Error('FS operation failed');
  }
  let filesToMerge;
  if (files && files.length > 0) {
    filesToMerge = files;
    for (const f of filesToMerge) {
      const filePath = path.join(partsDir, f);
      let stat;
      try {
        stat = await fs.promises.stat(filePath);
      } catch {
        throw new Error('FS operation failed');
      }
      if (!stat.isFile()) {
        throw new Error('FS operation failed');
      }
    }
  } else {
    const allFiles = await fs.promises.readdir(partsDir);
    filesToMerge = allFiles.filter((f) => path.extname(f) === '.txt').sort();
    if (filesToMerge.length === 0) {
      throw new Error('FS operation failed');
    }
  }
  const parts = await Promise.all(
    filesToMerge.map((f) => fs.promises.readFile(path.join(partsDir, f), 'utf8'))
  );
  await fs.promises.writeFile(
    path.join(path.resolve(workspaceDir), 'merged.txt'),
    parts.join('')
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filesArgIndex = process.argv.indexOf('--files');
  const files =
    filesArgIndex !== -1 ? process.argv[filesArgIndex + 1].split(',') : null;
  merge(path.resolve('workspace'), files);
}
