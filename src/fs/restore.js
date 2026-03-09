import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restore = async () => {
  // Write your code here
  // Read snapshot.json
  // Treat snapshot.rootPath as metadata only
  // Recreate directory/file structure in workspace_restored
  
  const workspacePath = __dirname; // Current directory
  const snapshotPath = path.join(workspacePath, 'snapshot.json');
  const restorePath = path.join(workspacePath, 'workspace_restored');
  
  // Check if snapshot.json exists
  try {
    await fs.access(snapshotPath);
  } catch (error) {
    throw new Error('FS operation failed');
  }
  
  // Check if workspace_restored already exists
  try {
    await fs.access(restorePath);
    // If we reach here, it exists - throw error
    throw new Error('FS operation failed');
  } catch (error) {
    // If error is not ENOENT, rethrow it
    if (error.message === 'FS operation failed') {
      throw error;
    }
    // ENOENT is expected - workspace_restored doesn't exist, which is good
  }
  
  // Read snapshot.json
  let snapshotData;
  try {
    const snapshotContent = await fs.readFile(snapshotPath, 'utf8');
    snapshotData = JSON.parse(snapshotContent);
  } catch (error) {
    throw new Error('FS operation failed');
  }
  
  // Create workspace_restored directory
  try {
    await fs.mkdir(restorePath, { recursive: true });
  } catch (error) {
    throw new Error('FS operation failed');
  }
  
  // Recreate directory/file structure
  try {
    for (const entry of snapshotData.entries) {
      const entryPath = path.join(restorePath, entry.path);
      
      if (entry.type === 'directory') {
        await fs.mkdir(entryPath, { recursive: true });
      } else if (entry.type === 'file') {
        // Ensure parent directory exists
        const parentDir = path.dirname(entryPath);
        await fs.mkdir(parentDir, { recursive: true });
        
        // Decode base64 content and write file
        const content = Buffer.from(entry.content, 'base64');
        await fs.writeFile(entryPath, content);
      }
    }
    
    console.log(`Workspace restored to: ${restorePath}`);
    console.log(`Total entries restored: ${snapshotData.entries.length}`);
  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await restore();
