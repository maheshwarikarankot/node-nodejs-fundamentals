import os from 'os';
import { startRepl } from './repl.js';

const main = async () => {
  console.log('Welcome to Data Processing CLI!');
  
  // Set initial working directory to user's home directory
  const homeDir = os.homedir();
  console.log(`You are currently in ${homeDir}`);
  
  // Start the REPL with home directory as initial working directory
  await startRepl(homeDir);
};

main().catch(console.error);
