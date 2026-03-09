import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findByExt = async () => {
  // Write your code here
  // Recursively find all files with specific extension
  // Parse --ext CLI argument (default: .txt)
  const workspacePath = __dirname;
  
  // Check if workspace exists
  try {
    await fs.access(workspacePath);
  } catch (error) {
    throw new Error('FS operation failed');
  }
  
  // Parse --ext argument
  let extension = '.txt'; // default
  const extIndex = process.argv.indexOf('--ext');
  if (extIndex !== -1 && process.argv[extIndex + 1]) {
    extension = process.argv[extIndex + 1];
    // Ensure extension starts with a dot
    if (!extension.startsWith('.')) {
      extension = '.' + extension;
    }
  }
  
  const foundFiles = [];
  
  async function scanDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.relative(workspacePath, fullPath);
        
        // Skip node_modules
        if (relativePath.startsWith('node_modules')) {
          continue;
        }
        
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (stats.isFile()) {
          if (path.extname(fullPath) === extension) {
            foundFiles.push(relativePath);
          }
        }
      }
    } catch (error) {
      throw new Error('FS operation failed');
    }
  }
  
  await scanDirectory(workspacePath);
  
  // Sort alphabetically
  foundFiles.sort();
  
  // Print one per line
  foundFiles.forEach(file => console.log(file));
};

await findByExt();
