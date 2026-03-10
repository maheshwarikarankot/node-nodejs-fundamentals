export const parseArgs = (args) => {
  const parsed = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      
      // Check if it's a flag (no value) or has a value
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed[key] = args[i + 1];
        i++; // Skip next arg since we used it as value
      } else {
        parsed[key] = true; // It's a flag
      }
    }
  }
  
  return parsed;
};
