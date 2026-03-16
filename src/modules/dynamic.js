import path from 'path';
import { pathToFileURL } from 'url';

const dynamic = async () => {
  // Write your code here
  // Accept plugin name as CLI argument
  // Dynamically import plugin from plugins/ directory
  // Call run() function and print result
  // Handle missing plugin case

  const pluginName = process.argv[2];

  if (!pluginName) {
    console.log('Plugin not found');
    process.exit(1);
  }

  const pluginPath = path.resolve('plugins', `${pluginName}.js`);
  const pluginURL  = pathToFileURL(pluginPath).href;

  try {
    const plugin = await import(pluginURL);
    const result = plugin.run();
    console.log(result);
  } catch (error) {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
