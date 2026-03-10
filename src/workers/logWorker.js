import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';

const { filePath, start, end } = workerData;

const processChunk = async () => {
  const stats = {
    total: 0,
    levels: {},
    status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
    pathCounts: {},
    totalResponseTime: 0
  };

  const readStream = fs.createReadStream(filePath, { start, end: end - 1 });
  let leftover = '';
  let firstChunk = true;

  for await (const chunk of readStream) {
    const data = leftover + chunk.toString();
    let lines = data.split('\n');
    leftover = lines.pop();

    // Skip partial first line if not at file start
    if (firstChunk && start !== 0) {
      lines.shift();
      firstChunk = false;
    } else {
      firstChunk = false;
    }

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(' ');
      if (parts.length < 7) continue;

      const [timestamp, level, service, statusCode, responseTime, method, path] = parts;

      stats.total++;
      stats.levels[level] = (stats.levels[level] || 0) + 1;

      const statusClass = Math.floor(parseInt(statusCode) / 100) + 'xx';
      if (stats.status[statusClass] !== undefined) {
        stats.status[statusClass]++;
      }

      stats.pathCounts[path] = (stats.pathCounts[path] || 0) + 1;
      stats.totalResponseTime += parseInt(responseTime);
    }
  }

  parentPort.postMessage(stats);
};

processChunk().catch(error => {
  parentPort.postMessage({ error: error.message });
});
