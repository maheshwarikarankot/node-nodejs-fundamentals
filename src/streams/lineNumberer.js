import { Transform } from 'stream';

const lineNumberer = () => {
  // Write your code here
  // Read from process.stdin
  // Use Transform Stream to prepend line numbers
  // Write to process.stdout
  let lineNumber = 1;
  let leftover = '';

  const numberer = new Transform({
    transform(chunk, encoding, callback) {
      const data  = leftover + chunk.toString();
      const lines = data.split('\n');

      leftover = lines.pop();

      const output = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join('\n');

      if (output) this.push(output + '\n');
      callback();
    },
    flush(callback) {
      if (leftover) {
        this.push(`${lineNumber} | ${leftover}`);
      }
      callback();
    },
  });

  process.stdin.pipe(numberer).pipe(process.stdout);
};

lineNumberer();
