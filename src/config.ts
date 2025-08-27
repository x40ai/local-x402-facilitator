import dotenv from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Load environment variables from .env file
dotenv.config();

const DEFAULT_FACILITATOR_PRIVATE_KEY = "0x5d3574ddbdd5bd5eaa456357e989a1dcb1db4cd8c4f05f11ca4df79d24e974e4";

export interface ConfigData {
  facilitatorPort: number;
  facilitatorAddress: `0x${string}`;
  facilitatorPrivateKey: `0x${string}`;
  testWalletAddress?: `0x${string}`;
  testWalletPrivateKey?: `0x${string}`;
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

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

class Config {
  private data: ConfigData | null = null;
  private loaded: boolean = false;


  public loadConfig(): Config {
    this.data = Config.loadInternal();
    this.loaded = true;

    return this;
  }

  private static parseCommandLineArgs(): ConfigOptions {
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

  private static validateTenderlyConfig(config: ConfigData): void {
    const { tenderly } = config;

    if (!tenderly.rpc) {
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
          `When not using a fixed Tenderly RPC URL, the following fields are required: ${missingFields.join(', ')}\n` 
          + chalk.red(`\n\tThe Local x402 Facilitator relies on Tenderly Virtual TestNets in order to create sandbox environments for x402 development.\n`)
          + chalk.red(`\tAuthentication Docs: `) + "https://docs.tenderly.co/reference/api#/%23authentication\n"
          + chalk.red(`\tAccess Key Docs: `) + "https://docs.tenderly.co/account/projects/how-to-generate-api-access-token\n"
          + chalk.red(`\n\tAlternatively you can use the TENDERLY_RPC env variable or --rpc flag to specify a fixed RPC URL for the facilitator to use.\n`)
          + chalk.red(`\tUse the Admin RPC URL for this as the server will need access to the TestNet cheatcodes.\n`)
          + chalk.red(`\tVirtual TestNets Docs: `) + "https://docs.tenderly.co/virtual-testnets\n"
          // + chalk.blue(`\Local x402 Facilitator Docs: `) + "https://docs.tenderly.co/account/projects/how-to-generate-api-access-token\n"
        );
      }
    }
  }

  private static validateUrl(url: string | undefined, fieldName: string): string | undefined {
    if (!url) return undefined;

    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new ConfigError(`Invalid URL for ${fieldName}: ${url}`);
    }
  }

  private static validatePort(port: string | undefined, defaultPort: number): number {
    if (!port) return defaultPort;

    const parsedPort = parseInt(port, 10);

    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      throw new ConfigError(`Invalid port number: ${port}. Port must be between 1 and 65535.`);
    }

    return parsedPort;
  }

  private static loadInternal(): ConfigData {
    const cliOptions = Config.parseCommandLineArgs();

    // Get values from CLI args or environment variables (CLI takes precedence)
    const facilitatorPortStr = cliOptions.port || process.env.FACILITATOR_PORT;
    const tenderlyRpc = cliOptions.rpc || process.env.TENDERLY_RPC;
    const tenderlyAccountName = cliOptions.account || process.env.TENDERLY_ACCOUNT_NAME;
    const tenderlyProjectName = cliOptions.project || process.env.TENDERLY_PROJECT_NAME;
    const tenderlyAccessKey = cliOptions.accessKey || process.env.TENDERLY_ACCESS_KEY;

    // Validate and parse values
    const facilitatorPort = Config.validatePort(facilitatorPortStr, 8402);
    const facilitatorPrivateKey = process.env.FACILITATOR_PRIVATE_KEY as `0x${string}` || DEFAULT_FACILITATOR_PRIVATE_KEY;
    const validatedRpc = Config.validateUrl(tenderlyRpc, 'TENDERLY_RPC');

    const facilitatorAddress = privateKeyToAccount(facilitatorPrivateKey as `0x${string}`).address;

    const config: ConfigData = {
      facilitatorPort,
      facilitatorAddress,
      facilitatorPrivateKey,
      tenderly: {
        rpc: validatedRpc,
        accountName: tenderlyAccountName,
        projectName: tenderlyProjectName,
        accessKey: tenderlyAccessKey,
      },
    };

    // Validate required Tenderly fields if RPC is provided
    Config.validateTenderlyConfig(config);

    if (process.env.TEST_WALLET_PRIVATE_KEY) {
      const testWalletPrivateKey = process.env.TEST_WALLET_PRIVATE_KEY as `0x${string}`;
      const testWalletAddress = privateKeyToAccount(testWalletPrivateKey).address;
      config.testWalletAddress = testWalletAddress;
      config.testWalletPrivateKey = testWalletPrivateKey;
    }

    return config;
  }

  // Getter methods for accessing config data
  public get facilitatorPort(): number {
    this.validateConfigIsLoaded();

    return this.data!.facilitatorPort;
  }

  public get facilitatorAddress(): `0x${string}` {
    this.validateConfigIsLoaded();

    return this.data!.facilitatorAddress;
  }

  public get facilitatorPrivateKey(): `0x${string}` {
    this.validateConfigIsLoaded();

    return this.data!.facilitatorPrivateKey;
  }

  public get testWalletAddress(): `0x${string}` | undefined {
    this.validateConfigIsLoaded();

    return this.data!.testWalletAddress;
  }

  public get testWalletPrivateKey(): `0x${string}` | undefined {
    this.validateConfigIsLoaded();

    return this.data!.testWalletPrivateKey;
  }

  public get tenderly() {
    this.validateConfigIsLoaded();

    return this.data!.tenderly;
  }

  public setTenderlyRpc(rpc: string) {
    this.data!.tenderly.rpc = rpc;
    console.log(chalk.green("[Config] Set Tenderly RPC URL:"), rpc);
  }

  validateConfigIsLoaded(): void {
    if (!this.loaded) {
      throw new ConfigError('Config not loaded');
    }

    if (!this.data) {
      throw new ConfigError('Config data not loaded');
    }
  }

  public printSetup(): void {
    this.validateConfigIsLoaded();

    console.log(`\tVersion: ${chalk.blue(process.env.npm_package_version)}`);
    console.log(`\tNetwork: ${chalk.blue(`🟦 ${base.name}`)}`);
    console.log(`\tFacilitator Port: ${chalk.blue(`http://localhost:${this.data!.facilitatorPort}`)}`);
    console.log(`\tFacilitator Address: ${chalk.blue(this.data!.facilitatorAddress)}`);

    if (this.data!.tenderly.rpc) {
      console.log(`\tRPC URL: ${chalk.blue(this.data!.tenderly.rpc)}`);
    } else {
      console.log('\tRPC: Dynamic RPC URLs');
    }

    if (this.data!.testWalletAddress) {
      console.log(`\n\t${chalk.magenta("[Test Wallet Enabled]")}`);
      console.log(`\tTest Wallet Address: ${chalk.magenta(this.data!.testWalletAddress)}`);
    }

    console.log('');
  }
}

const config = new Config();

export default config;

