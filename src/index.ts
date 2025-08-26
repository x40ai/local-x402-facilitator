import config, { ConfigError } from './config';
import { startServer } from './facilitator/server';

export function main() {
  try {
    config.loadConfig();

    startServer();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('Configuration Error:', error.message);
      process.exit(1);
    } else {
      console.error('Unexpected error:', error);
      process.exit(1);
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}
