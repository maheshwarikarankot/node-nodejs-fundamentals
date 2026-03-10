import fs from 'fs';
import os from 'os';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolvePath } from '../utils/pathResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (currentDir, inputPath, outputPath) => {
  const resolvedInput = resolvePath(currentDir, inputPath);
  const resolvedOutput = resolvePath(currentDir, outputPath);

  try {
    const stats = await fs.promises.stat(resolvedInput);
    const fileSize = stats.size;
    const numCores = os.cpus().length;
    const chunkSize = Math.ceil(fileSize / numCores);

    // Create workers
    const workers = [];
    for (let i = 0; i < numCores; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      
      if (start >= fileSize) break;

      const worker = new Worker(path.resolve(__dirname, '../workers/logWorker.js'), {
        workerData: { filePath: resolvedInput, start, end }
      });

      workers.push(new Promise((resolve, reject) => {
        worker.on('message', resolve);
        worker.on('error', reject);
      }));
    }

    // Wait for all workers
    const results = await Promise.all(workers);

    // Merge results
    const merged = {
      total: 0,
      levels: {},
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
      pathCounts: {},
      totalResponseTime: 0
    };

    for (const result of results) {
      merged.total += result.total;
      merged.totalResponseTime += result.totalResponseTime;

      for (const [level, count] of Object.entries(result.levels)) {
        merged.levels[level] = (merged.levels[level] || 0) + count;
      }

      for (const [statusClass, count] of Object.entries(result.status)) {
        merged.status[statusClass] += count;
      }

      for (const [path, count] of Object.entries(result.pathCounts)) {
        merged.pathCounts[path] = (merged.pathCounts[path] || 0) + count;
      }
    }

    // Compute top paths
    const topPaths = Object.entries(merged.pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Compute average response time
    const avgResponseTimeMs = merged.total > 0 
      ? merged.totalResponseTime / merged.total 
      : 0;

    const output = {
      total: merged.total,
      levels: merged.levels,
      status: merged.status,
      topPaths,
      avgResponseTimeMs: parseFloat(avgResponseTimeMs.toFixed(2))
    };

    await fs.promises.writeFile(resolvedOutput, JSON.stringify(output, null, 2));
  } catch (error) {
    throw new Error('Operation failed');
  }
};