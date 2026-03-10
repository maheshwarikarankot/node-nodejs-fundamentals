import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath } from '../utils/pathResolver.js';

export default async (currentDir, inputPath, outputPath) => {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  let headers = null;
  let isFirstLine = true;
  let leftover = '';
  const results = [];

  const csvParser = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split('\n');
      leftover = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        if (isFirstLine) {
          headers = line.split(',').map(h => h.trim());
          isFirstLine = false;
        } else {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx] || '';
          });
          results.push(obj);
        }
      }
      callback();
    },
    flush(callback) {
      if (leftover.trim() && headers) {
        const values = leftover.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, idx) => {
          obj[header] = values[idx] || '';
        });
        results.push(obj);
      }
      callback();
    }
  });

  try {
    const readStream = fs.createReadStream(resolvedInput);
    await pipeline(readStream, csvParser);
    
    await fs.promises.writeFile(resolvedOutput, JSON.stringify(results, null, 2));
  } catch (error) {
    throw new Error('Operation failed');
  }
};
