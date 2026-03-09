const execCommand = () => {
  // Write your code here
  // Take command from CLI argument
  // Spawn child process
  // Pipe child stdout/stderr to parent stdout/stderr
  // Pass environment variables
  // Exit with same code as child

  import('child_process').then(({ spawn }) => {
    // Step 1: Get the full command string from CLI argument
    // e.g. node execCommand.js "ls -la"  → process.argv[2] = "ls -la"
    const fullCommand = process.argv[2];

    if (!fullCommand) {
      console.error('Please provide a command. e.g. node execCommand.js "ls -la"');
      process.exit(1);
    }

    //Split command into name + arguments
    const [cmd, ...args] = fullCommand.split(' ');

    //Spawn the child process
    const child = spawn(cmd, args, {
      env:   process.env, // pass all parent environment variables to child
      shell: false,       // run directly, no shell wrapper needed
    });

    //Pipe child stdout → parent stdout
    child.stdout.pipe(process.stdout);

    //Pipe child stderr → parent stderr
    child.stderr.pipe(process.stderr);

    //When child exits, exit parent with the same exit code
    child.on('close', (code) => {
      process.exit(code);
    });

    //Handle spawn errors (e.g. command not found)
    child.on('error', (err) => {
      console.error(`Failed to start command: ${err.message}`);
      process.exit(1);
    });
  });
};

execCommand();
