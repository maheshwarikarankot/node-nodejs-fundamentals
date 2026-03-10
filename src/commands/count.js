import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath } from '../utils/pathResolver.js';

export default async (currentDir, inputPath) => {
  const resolvedInput = resolvePath(currentDir, inputPath);

  let lines = 0;
  let words = 0;
  let characters = 0;
  let leftover = '';

  const counter = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const splitLines = data.split('\n');
      leftover = splitLines.pop();

      for (const line of splitLines) {
        lines++;
        characters += line.length + 1; // +1 for newline
        const lineWords = line.split(/\s+/).filter(w => w.length > 0);
        words += lineWords.length;
      }
      callback();
    },
    flush(callback) {
      if (leftover) {
        lines++;
        characters += leftover.length;
        const lineWords = leftover.split(/\s+/).filter(w => w.length > 0);
        words += lineWords.length;
      }
      callback();
    }
  });

  try {
    const readStream = fs.createReadStream(resolvedInput);
    await pipeline(readStream, counter);
    
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${characters}`);
  } catch (error) {
    throw new Error('Operation failed');
  }
};
