import { spawn } from 'child_process';

const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child

  // Step 1: Get the full command string from CLI argument
  const fullCommand = process.argv[2];

  if (!fullCommand) {
    process.exit(1);
  }

  //Split command into name + arguments
  const parts = fullCommand.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  //Spawn the child process
  const child = spawn(cmd, args, {
    env:   process.env, // pass all parent environment variables to child
    stdio: 'inherit',   // inherit parent's stdin, stdout, stderr
    shell: false,       // run directly, no shell wrapper needed
  });

  //When child exits, exit parent with the same exit code
  child.on('close', (code) => {
    process.exit(code);
  });

  //Handle spawn errors (e.g. command not found)
  child.on('error', (err) => {
    console.error(`Failed to start command: ${err.message}`);
    process.exit(1);
  });
};

execCommand();
