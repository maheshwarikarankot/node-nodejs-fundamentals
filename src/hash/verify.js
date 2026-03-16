import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const verify = async () => {
  // Write your code here
  // Read checksums.json
  // Calculate SHA256 hash using Streams API
  // Print result: filename — OK/FAIL

  const checksumsPath = path.resolve('checksums.json');

  // Throw if checksums.json doesn't exist
  if (!fs.existsSync(checksumsPath)) {
    throw new Error('FS operation failed');
  }

  const raw = fs.readFileSync(checksumsPath, 'utf-8');
  const checksums = JSON.parse(raw);

  // Calculate SHA256 hash of a file using Streams API
  const hashFile = (filePath) => {
    return new Promise((resolve, reject) => {
      const hash   = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end',  ()      => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  };

  // For each file in checksums.json, calculate and compare
  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = path.resolve('workspace', filename);

    try {
      const actualHash = await hashFile(filePath);
      const status = actualHash === expectedHash ? 'OK' : 'FAIL';
      console.log(`${filename} — ${status}`);
    } catch {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();
