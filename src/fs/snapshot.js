import fs from 'fs/promises';
import path from 'path';

const snapshot = async () => {
  // Write your code heres
  // Recursively scan workspace directory
  // Write snapshot.json with:
  // - rootPath: absolute path to workspace
  // - entries: flat array of relative paths and metadata
  const workspacePath = path.join(process.cwd(), 'workspace');

    // Check if workspace exists
  try {
    await fs.access(workspacePath);
  } catch (error) {
    throw new Error('FS operation failed');
  }

  const snapshotData = {
    rootPath: workspacePath,
    entries: []
};

async function scanDirectory(dirPath) {
  try {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const absolutePath = path.join(dirPath, item);
      const relativePath = path.relative(workspacePath, absolutePath);
      
      // Skip snapshot.json itself and .js files
      if (relativePath === 'snapshot.json' || item.endsWith('.js')) {
        continue;
      }

      const stats = await fs.stat(absolutePath);

      if (stats.isDirectory()) {
        snapshotData.entries.push({
          path: relativePath,
          type: 'directory'
        });
        await scanDirectory(absolutePath);
      } else if (stats.isFile()) {
        const content = await fs.readFile(absolutePath);
        snapshotData.entries.push({
          path: relativePath,
          type: 'file',
          size: stats.size,
          content: content.toString('base64')
        });
      }
    }
  } catch (error) {
      throw new Error('FS operation failed');
    }
  }

  await scanDirectory(workspacePath);

  const snapshotPath = path.join(workspacePath, 'snapshot.json');
  await fs.writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2), 'utf8');

  console.log(`Snapshot created at: ${snapshotPath}`);
  console.log(`Total entries: ${snapshotData.entries.length}`);
};

await snapshot();



