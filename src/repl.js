import readline from 'readline';
import { up, cd, ls } from './navigation.js';
import { parseArgs } from './utils/argParser.js';
import csvToJson from './commands/csvToJson.js';
import jsonToCsv from './commands/jsonToCsv.js';
import count from './commands/count.js';
import hash from './commands/hash.js';
import hashCompare from './commands/hashCompare.js';
import encrypt from './commands/encrypt.js';
import decrypt from './commands/decrypt.js';
import logStats from './commands/logStats.js';

export const startRepl = async (initialCwd) => {
  let currentWorkingDirectory = initialCwd;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  const printCwd = () => {
    console.log(`You are currently in ${currentWorkingDirectory}`);
  };

  const handleCommand = async (line) => {
    const trimmed = line.trim();
    
    if (!trimmed) {
      return;
    }

    if (trimmed === '.exit') {
      console.log('Thank you for using Data Processing CLI!');
      rl.close();
      process.exit(0);
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'up':
          currentWorkingDirectory = await up(currentWorkingDirectory);
          printCwd();
          break;

        case 'cd':
          if (args.length === 0) {
            console.log('Invalid input');
            break;
          }
          currentWorkingDirectory = await cd(currentWorkingDirectory, args[0]);
          printCwd();
          break;

        case 'ls':
          await ls(currentWorkingDirectory);
          printCwd();
          break;

        case 'csv-to-json':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output) {
              console.log('Invalid input');
              break;
            }
            await csvToJson(currentWorkingDirectory, parsed.input, parsed.output);
            printCwd();
          }
          break;

        case 'json-to-csv':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output) {
              console.log('Invalid input');
              break;
            }
            await jsonToCsv(currentWorkingDirectory, parsed.input, parsed.output);
            printCwd();
          }
          break;

        case 'count':
          {
            const parsed = parseArgs(args);
            if (!parsed.input) {
              console.log('Invalid input');
              break;
            }
            await count(currentWorkingDirectory, parsed.input);
            printCwd();
          }
          break;

        case 'hash':
          {
            const parsed = parseArgs(args);
            if (!parsed.input) {
              console.log('Invalid input');
              break;
            }
            await hash(currentWorkingDirectory, parsed.input, parsed.algorithm, parsed.save);
            printCwd();
          }
          break;

        case 'hash-compare':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.hash) {
              console.log('Invalid input');
              break;
            }
            await hashCompare(currentWorkingDirectory, parsed.input, parsed.hash, parsed.algorithm);
            printCwd();
          }
          break;

        case 'encrypt':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output || !parsed.password) {
              console.log('Invalid input');
              break;
            }
            await encrypt(currentWorkingDirectory, parsed.input, parsed.output, parsed.password);
            printCwd();
          }
          break;

        case 'decrypt':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output || !parsed.password) {
              console.log('Invalid input');
              break;
            }
            await decrypt(currentWorkingDirectory, parsed.input, parsed.output, parsed.password);
            printCwd();
          }
          break;

        case 'log-stats':
          {
            const parsed = parseArgs(args);
            if (!parsed.input || !parsed.output) {
              console.log('Invalid input');
              break;
            }
            await logStats(currentWorkingDirectory, parsed.input, parsed.output);
            console.log('Analysis complete!');
            printCwd();
          }
          break;

        default:
          console.log('Invalid input');
      }
    } catch (error) {
      console.log('Operation failed:', error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
    }
  };

  rl.prompt();

  rl.on('line', async (line) => {
    await handleCommand(line);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Thank you for using Data Processing CLI!');
    process.exit(0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nThank you for using Data Processing CLI!');
    process.exit(0);
  });
};
