import fs from 'fs/promises';
import path from 'path';

const merge = async () => {
  // Write your code here
  // Default: read all .txt files from workspace/parts in alphabetical order
  // Optional: support --files filename1,filename2,... to merge specific files in provided order
  // Concatenate content and write to workspace/merged.txt
  
  const workspacePath = path.join(process.cwd(), 'workspace');
  const partsPath = path.join(workspacePath, 'parts');
  const mergedPath = path.join(workspacePath, 'merged.txt');
  
  // Check if parts folder exists
  try {
    await fs.access(partsPath);
  } catch (error) {
    throw new Error('FS operation failed');
  }
  
  let filesToMerge = [];
  
  // Parse --files argument
  const filesIndex = process.argv.indexOf('--files');
  if (filesIndex !== -1 && process.argv[filesIndex + 1]) {
    // Specific files mode
    const fileList = process.argv[filesIndex + 1].split(',');
    filesToMerge = fileList;
    
    // Check if all requested files exist
    for (const filename of filesToMerge) {
      try {
        await fs.access(path.join(partsPath, filename));
      } catch (error) {
        throw new Error('FS operation failed');
      }
    }
  } else {
    // Default mode: find all .txt files
    try {
      const items = await fs.readdir(partsPath);
      filesToMerge = items
        .filter(item => item.endsWith('.txt'))
        .sort();
      
      // Check if we found any .txt files
      if (filesToMerge.length === 0) {
        throw new Error('FS operation failed');
      }
    } catch (error) {
      throw new Error('FS operation failed');
    }
  }
  
  // Read and concatenate files
  let mergedContent = '';
  try {
    for (const filename of filesToMerge) {
      const filePath = path.join(partsPath, filename);
      const content = await fs.readFile(filePath, 'utf8');
      mergedContent += content;
    }
    
    // Write merged content
    await fs.writeFile(mergedPath, mergedContent, 'utf8');
    
    console.log(`Merged ${filesToMerge.length} file(s) to: ${mergedPath}`);
  } catch (error) {
    throw new Error('FS operation failed');
  }
};

await merge();
