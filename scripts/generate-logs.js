import fs from 'fs';

const args = process.argv.slice(2);
const outputIdx = args.indexOf('--output');
const linesIdx = args.indexOf('--lines');

const output = outputIdx !== -1 ? args[outputIdx + 1] : 'logs.txt';
const lines = linesIdx !== -1 ? parseInt(args[linesIdx + 1]) : 1000;

const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
const services = ['user-service', 'order-service', 'payment-service'];
const methods = ['GET', 'POST', 'PUT', 'DELETE'];
const paths = ['/api/users', '/api/orders', '/api/payments', '/api/products'];
const statusCodes = [200, 201, 400, 404, 500];

console.log(`Generating ${lines} log lines...`);

const writeStream = fs.createWriteStream(output);

for (let i = 0; i < lines; i++) {
  const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();
  const level = levels[Math.floor(Math.random() * levels.length)];
  const service = services[Math.floor(Math.random() * services.length)];
  const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
  const responseTime = Math.floor(Math.random() * 500);
  const method = methods[Math.floor(Math.random() * methods.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];
  
  writeStream.write(`${timestamp} ${level} ${service} ${statusCode} ${responseTime} ${method} ${path}\n`);
  
  // Show progress every 100k lines
  if ((i + 1) % 100000 === 0) {
    console.log(`  ${i + 1} lines generated...`);
  }
}

writeStream.end();
writeStream.on('finish', () => {
  console.log(`✓ Generated ${lines} log lines in ${output}`);
});
