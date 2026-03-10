import fs from 'fs';
import crypto from 'crypto';
import { resolvePath } from '../utils/pathResolver.js';

export default async (currentDir, inputPath, outputPath, password) => {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  try {
    const fileBuffer = await fs.promises.readFile(resolvedInput);

    // Extract salt, iv, and authTag
    const salt = fileBuffer.subarray(0, 16);
    const iv = fileBuffer.subarray(16, 28);
    const authTag = fileBuffer.subarray(fileBuffer.length - 16);
    const ciphertext = fileBuffer.subarray(28, fileBuffer.length - 16);

    // Derive key
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    await fs.promises.writeFile(resolvedOutput, decrypted);
  } catch (error) {
    throw new Error('Operation failed');
  }
};
