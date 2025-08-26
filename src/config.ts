import dotenv from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';

// Load environment variables from .env file
dotenv.config();

export interface Config {
  facilitatorPort: number;
  tenderly: {
    rpc?: string;
    accountName?: string;
    projectName?: string;
    accessKey?: string;
  };
}

export interface ConfigOptions {
  port?: string;
  rpc?: string;
  account?: string;
  project?: string;
  accessKey?: string;
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function parseCommandLineArgs(): ConfigOptions {
  const program = new Command();
  
  program
    .name('local-x402-facilitator')
    .description('Local x402 facilitator server for development')
    .option('-p, --port <port>', 'Facilitator port number (env: FACILITATOR_PORT)')
    .option('-r, --rpc <url>', 'Tenderly RPC URL (env: TENDERLY_RPC)')
    .option('-a, --account <name>', 'Tenderly account name (env: TENDERLY_ACCOUNT_NAME)')
    .option('-j, --project <name>', 'Tenderly project name (env: TENDERLY_PROJECT_NAME)')
    .option('-k, --access-key <key>', 'Tenderly access key (env: TENDERLY_ACCESS_KEY)')
    .parse();

  return program.opts() as ConfigOptions;
}

function validateTenderlyConfig(config: Config): void {
  const { tenderly } = config;
  
  if (tenderly.rpc) {
    const missingFields: string[] = [];
    
    if (!tenderly.accountName) {
      missingFields.push('TENDERLY_ACCOUNT_NAME or --account');
    }
    
    if (!tenderly.projectName) {
      missingFields.push('TENDERLY_PROJECT_NAME or --project');
    }
    
    if (!tenderly.accessKey) {
      missingFields.push('TENDERLY_ACCESS_KEY or --access-key');
    }
    
    if (missingFields.length > 0) {
      throw new ConfigError(
        `When TENDERLY_RPC is provided, the following fields are required: ${missingFields.join(', ')}`
      );
    }
  }
}

function validateUrl(url: string | undefined, fieldName: string): string | undefined {
  if (!url) return undefined;
  
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new ConfigError(`Invalid URL for ${fieldName}: ${url}`);
  }
}

function validatePort(port: string | undefined, defaultPort: number): number {
  if (!port) return defaultPort;
  
  const parsedPort = parseInt(port, 10);
  
  if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new ConfigError(`Invalid port number: ${port}. Port must be between 1 and 65535.`);
  }
  
  return parsedPort;
}

export function loadConfig(): Config {
  const cliOptions = parseCommandLineArgs();
  
  // Get values from CLI args or environment variables (CLI takes precedence)
  const facilitatorPortStr = cliOptions.port || process.env.FACILITATOR_PORT;
  const tenderlyRpc = cliOptions.rpc || process.env.TENDERLY_RPC;
  const tenderlyAccountName = cliOptions.account || process.env.TENDERLY_ACCOUNT_NAME;
  const tenderlyProjectName = cliOptions.project || process.env.TENDERLY_PROJECT_NAME;
  const tenderlyAccessKey = cliOptions.accessKey || process.env.TENDERLY_ACCESS_KEY;
  
  // Validate and parse values
  const facilitatorPort = validatePort(facilitatorPortStr, 8402);
  const validatedRpc = validateUrl(tenderlyRpc, 'TENDERLY_RPC');
  
  const config: Config = {
    facilitatorPort,
    tenderly: {
      rpc: validatedRpc,
      accountName: tenderlyAccountName,
      projectName: tenderlyProjectName,
      accessKey: tenderlyAccessKey,
    },
  };
  
  // Validate required Tenderly fields if RPC is provided
  validateTenderlyConfig(config);
  
  return config;
}

export function printConfig(config: Config): void {
  console.log(`\tFacilitator Port: ${chalk.blue(`http://localhost:${config.facilitatorPort}`)}`);
  
  if (config.tenderly.rpc) {
    if (config.tenderly.rpc) {
      console.log(`\tRPC URL: ${config.tenderly.rpc}`);
    }
  } else {
    console.log('\tRPC: Not configured');
  }
  console.log('');
}

// Export the error class for use by other modules
export { ConfigError };
