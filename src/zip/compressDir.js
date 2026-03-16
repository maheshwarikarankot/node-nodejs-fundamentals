import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import stream from 'stream';

const compressDir = async () => {
  // Write your code here
  // Read all files from workspace/toCompress/
  // Compress entire directory structure into archive.br
  // Save to workspace/compressed/
  // Use Streams API

  const sourceDir  = path.resolve('workspace/toCompress');
  const outputDir  = path.resolve('workspace/compressed');
  const outputFile = path.resolve('workspace/compressed/archive.br');

  //Throw if toCompress doesn't exist
  if (!fs.existsSync(sourceDir)) {
    throw new Error('FS operation failed');
  }

  //Create workspace/compressed/ if it doesn't exist
  await fsp.mkdir(outputDir, { recursive: true });

  //Recursively collect all files from toCompress/
  const collectFiles = async (dir) => {
    const results = [];
    const items   = await fsp.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat     = await fsp.stat(fullPath);

      if (stat.isDirectory()) {
        const nested = await collectFiles(fullPath);
        results.push(...nested);
      } else {
        results.push(fullPath);
      }
    }
    return results;
  };

  const allFiles = await collectFiles(sourceDir);

  //Build a custom archive format and pipe through Brotli
  const brotli     = zlib.createBrotliCompress();
  const writeStream = fs.createWriteStream(outputFile);

  // Pipe brotli output → file
  brotli.pipe(writeStream);

  for (const filePath of allFiles) {
    const relativePath = path.relative(sourceDir, filePath);
    const fileBuffer   = await fsp.readFile(filePath);

    // Write header: relative path + byte size
    brotli.write(`FILE:${relativePath}:${fileBuffer.length}\n`);

    // Write raw file content
    brotli.write(fileBuffer);

    // Write separator between files
    brotli.write('\n');
  }

  //Finalize the stream
  brotli.end();
  
  //Wait for writeStream to fully finish
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  console.log(`Done! Compressed ${allFiles.length} file(s) into archive.br`);
};

await compressDir();
