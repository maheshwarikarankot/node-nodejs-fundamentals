import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';

const main = async () => {
  // Write your code here
  // Read data.json containing array of numbers
  // Split into N chunks (N = CPU cores)
  // Create N workers, send one chunk to each
  // Collect sorted chunks
  // Merge using k-way merge algorithm
  // Log final sorted array

  //Read data.json
  const dataPath = path.resolve('data.json');
  const raw      = await fs.readFile(dataPath, 'utf-8');
  const numbers  = JSON.parse(raw); 

  //Split array into N chunks (N = CPU core count)
  const numCores = os.cpus().length;
  const chunks   = [];

  const chunkSize = Math.ceil(numbers.length / numCores);

  for (let i = 0; i < numCores; i++) {
    const start = i * chunkSize;
    const end   = start + chunkSize;
    const chunk = numbers.slice(start, end); // slice out this chunk
    if (chunk.length > 0) {
      chunks.push(chunk);                    // only add non-empty chunks
    }
  }

  // Create N workers and send one chunk to each
  //
  // Each worker:
  //   main → sends chunk → worker.js
  //   worker.js sorts it → sends back → main collects it
  //
  const workerPath = path.resolve(path.dirname(import.meta.url.replace('file://', '')), 'worker.js');

  const sortedChunks = await Promise.all(
    chunks.map((chunk, index) => {
      return new Promise((resolve, reject) => {
        // Create a new worker thread from worker.js
        const worker = new Worker(workerPath);

        // Send the chunk to the worker
        worker.postMessage(chunk);

        // Wait for the worker to send back the sorted chunk
        worker.on('message', (sortedChunk) => {
          resolve(sortedChunk); // collect in same order (Promise.all preserves order)
          worker.terminate();   // close the worker thread
        });

        worker.on('error', reject);
      });
    })
  );

  //Merge sorted chunks using k-way merge algorithm
  const pointers = new Array(sortedChunks.length).fill(0); // one pointer per chunk
  const result   = [];

  while (true) {
    let minValue    = Infinity;
    let minChunkIdx = -1;

    // Find the smallest front element across all chunks
    for (let i = 0; i < sortedChunks.length; i++) {
      const pointer = pointers[i];

      if (pointer < sortedChunks[i].length) {       // chunk still has elements
        if (sortedChunks[i][pointer] < minValue) {
          minValue    = sortedChunks[i][pointer];    // new smallest found
          minChunkIdx = i;
        }
      }
    }

    if (minChunkIdx === -1) break; // all chunks exhausted — we're done

    result.push(minValue);         // add smallest to result
    pointers[minChunkIdx]++;       // advance that chunk's pointer
  }

  //Log the final sorted array
  console.log('Sorted array:', result);
};

await main();
