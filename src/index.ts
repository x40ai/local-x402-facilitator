import config, { ConfigError } from './config';
import { startServer } from './facilitator/server';
import TenderlyClient from './tenderly/client';

export function main() {
  try {
    config.loadConfig();
    
    TenderlyClient.initialize();

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
