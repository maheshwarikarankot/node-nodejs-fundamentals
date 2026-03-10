import fs from 'fs/promises';
import path from 'path';

export const up = async (currentDir) => {
  const parentDir = path.dirname(currentDir);
  // If already at root, stay there
  if (parentDir === currentDir) {
    return currentDir;
  }
  return parentDir;
};

export const cd = async (currentDir, targetPath) => {
  const resolvedPath = path.isAbsolute(targetPath) 
    ? targetPath 
    : path.resolve(currentDir, targetPath);

  try {
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      throw new Error('Not a directory');
    }
    return resolvedPath;
  } catch (error) {
    throw new Error('Operation failed');
  }
};

export const ls = async (currentDir) => {
  try {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    const folders = [];
    const files = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        folders.push(entry.name);
      } else if (entry.isFile()) {
        files.push(entry.name);
      }
    }

    // Sort alphabetically
    folders.sort();
    files.sort();

    // Print folders first, then files
    for (const folder of folders) {
      console.log(`${folder.padEnd(30)} [folder]`);
    }
    for (const file of files) {
      console.log(`${file.padEnd(30)} [file]`);
    }
  } catch (error) {
    throw new Error('Operation failed');
  }
};
