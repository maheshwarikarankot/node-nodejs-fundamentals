import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import zlib from 'zlib';

const decompressDir = async () => {
  // Write your code here
  // Read archive.br from workspace/compressed/
  // Decompress and extract to workspace/decompressed/
  // Use Streams API

  const compressedDir = path.resolve('workspace/compressed');
  const archiveFile   = path.resolve('workspace/compressed/archive.br');
  const outputDir     = path.resolve('workspace/decompressed');

  if (!fs.existsSync(compressedDir)) {
    throw new Error('FS operation failed');
  }
  if (!fs.existsSync(archiveFile)) {
    throw new Error('FS operation failed');
  }

  //Create output folder if it doesn't exist 
  await fsp.mkdir(outputDir, { recursive: true });

  //Read archive.br and decompress it
  //  archive.br  →  createReadStream  →  BrotliDecompress  →  raw bytes
  const decompressedBuffer = await new Promise((resolve, reject) => {
    const chunks     = [];                                // store incoming data chunks
    const readStream = fs.createReadStream(archiveFile);  // read the .br file
    const brotli     = zlib.createBrotliDecompress();     // decompress stream

    readStream.pipe(brotli); // connect: read → decompress

    brotli.on('data',  (chunk) => chunks.push(chunk));           // collect each chunk
    brotli.on('end',   ()      => resolve(Buffer.concat(chunks))); // join all chunks
    brotli.on('error', reject);
    readStream.on('error', reject);
  });

  let offset = 0; // tracks our current position in the buffer

  while (offset < decompressedBuffer.length) {

    // Find where the header line ends (at the \n)
    const newlinePos = decompressedBuffer.indexOf('\n', offset);
    if (newlinePos === -1) break; // no more headers — we're done

    // Read the header text e.g. "FILE:subdir/nested.txt:12"
    const header = decompressedBuffer.slice(offset, newlinePos).toString();
    offset = newlinePos + 1; // move pointer past the header \n

    if (!header.startsWith('FILE:')) break; // safety check

    // Split header into: relativePath and byteLength
    const withoutPrefix = header.slice(5);                           // remove "FILE:"
    const lastColon     = withoutPrefix.lastIndexOf(':');
    const relativePath  = withoutPrefix.slice(0, lastColon);         // file path
    const byteLength    = parseInt(withoutPrefix.slice(lastColon + 1)); // file size

    // Slice exactly byteLength bytes — that's the file content
    const fileContent = decompressedBuffer.slice(offset, offset + byteLength);
    offset += byteLength + 1; // move pointer past content + separator \n

    // ── Step 4: Write the file to workspace/decompressed/ ───────
    const fullPath = path.join(outputDir, relativePath);
    const fileDir  = path.dirname(fullPath); // get parent folder

    // Create parent folders if needed (e.g. subdir/)
    await fsp.mkdir(fileDir, { recursive: true });

    // Write file content using a WriteStream
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(fullPath);
      writeStream.end(fileContent);         // write content and close
      writeStream.on('finish', resolve);    // done writing file
      writeStream.on('error',  reject);
    });

    console.log(`  Extracted: ${relativePath}`);
  }

  console.log('\nDone! Extracted to workspace/decompressed/');
};

await decompressDir();

