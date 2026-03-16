import fs from 'fs';
import path from 'path';

const split = async () => {
  // Write your code here
  // Read source.txt using Readable Stream
  // Split into chunk_1.txt, chunk_2.txt, etc.
  // Each chunk max N lines (--lines CLI argument, default: 10)

  //Get --lines argument from CLI, default to 10
  const args     = process.argv.slice(2);
  const linesIdx = args.indexOf('--lines');
  const maxLines = linesIdx !== -1 && args[linesIdx + 1]
    ? parseInt(args[linesIdx + 1])
    : 10;

  //Check source.txt exists
  const sourcePath = path.resolve('source.txt');
  if (!fs.existsSync(sourcePath)) {
    throw new Error('FS operation failed');
  }

  //Set up tracking variables
  let chunkIndex   = 1;      // which chunk file we're writing to (chunk_1, chunk_2...)
  let lineCount    = 0;      // how many lines written to current chunk
  let leftover     = '';     // incomplete line carried over between chunks
  let writeStream  = null;   // current file we're writing to

  //Helper — open the next chunk file for writing
  const openNextChunk = () => {
    if (writeStream) writeStream.end();  // close previous chunk
    writeStream = fs.createWriteStream(path.resolve(`chunk_${chunkIndex}.txt`));
    chunkIndex++;
    lineCount = 0;
  };

  //Open first chunk and create a readable stream from source.txt
  openNextChunk();
  const readStream = fs.createReadStream(sourcePath, { encoding: 'utf-8' });

  //Process data as it arrives chunk by chunk
  readStream.on('data', (chunk) => {
    const data  = leftover + chunk;  // prepend any leftover from previous chunk
    const lines = data.split('\n');

    leftover = lines.pop();          // last item may be incomplete — save for next time

    for (const line of lines) {
      if (lineCount >= maxLines) {
        openNextChunk();             // current chunk is full — start a new one
      }
      writeStream.write(line + '\n');
      lineCount++;
    }
  });

  //Handle any remaining text after stream ends
  readStream.on('end', () => {
    if (leftover) {
      if (lineCount >= maxLines) {
        openNextChunk();
      }
      writeStream.write(leftover);
    }
    if (writeStream) writeStream.end();
    console.log(`Done! Split into ${chunkIndex - 1} chunk(s).`);
  });

  //Handle read errors
  readStream.on('error', () => {
    throw new Error('FS operation failed');
  });
};

await split();
