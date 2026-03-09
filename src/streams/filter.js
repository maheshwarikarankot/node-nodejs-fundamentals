import { Transform } from 'stream';
const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout


  const args     = process.argv.slice(2);
  const patIndex = args.indexOf('--pattern');
  const pattern  = patIndex !== -1 && args[patIndex + 1] ? args[patIndex + 1] : '';

  let leftover = '';

  const filterer = new Transform({
    transform(chunk, encoding, callback) {
      const data  = leftover + chunk.toString();
      const lines = data.split('\n');

      leftover = lines.pop();

      const output = lines
        .filter((line) => line.includes(pattern))
        .join('\n');

      if (output) this.push(output + '\n');
      callback();
    },
    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover);
      }
      callback();
    },
  });

  process.stdin.pipe(filterer).pipe(process.stdout);
};

filter();
