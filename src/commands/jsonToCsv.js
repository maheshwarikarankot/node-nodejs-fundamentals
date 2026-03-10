import fs from 'fs';
import { resolvePath } from '../utils/pathResolver.js';

export default async (currentDir, inputPath, outputPath) => {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  try {
    const jsonData = await fs.promises.readFile(resolvedInput, 'utf8');
    const data = JSON.parse(jsonData);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid JSON format');
    }

    const headers = Object.keys(data[0]);
    const csvLines = [headers.join(',')];

    for (const obj of data) {
      const values = headers.map(header => obj[header] || '');
      csvLines.push(values.join(','));
    }

    const writeStream = fs.createWriteStream(resolvedOutput);
    for (const line of csvLines) {
      writeStream.write(line + '\n');
    }
    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    throw new Error('Operation failed');
  }
};
