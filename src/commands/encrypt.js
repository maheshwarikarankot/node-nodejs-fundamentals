import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

export default async (currentDir, inputPath, outputPath, password) => {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  try {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const readStream = fs.createReadStream(resolvedInput);
    const writeStream = fs.createWriteStream(resolvedOutput);

    // Write header (salt + iv)
    writeStream.write(salt);
    writeStream.write(iv);

    // Pipe encrypted data
    await pipeline(readStream, cipher, writeStream, { end: false });

    // Write auth tag
    const authTag = cipher.getAuthTag();
    writeStream.write(authTag);
    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    throw new Error('Operation failed');
  }
};
