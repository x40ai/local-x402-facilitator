# local-x402-facilitator

An x402 facilitator server for local development that works natively with Tenderly Virtual TestNets. Avoiding bottlenecks while testing and creating sandbox environments for x402 development.

## Motivation

* Working with x402 on Base Sepolia and other Testnets requires faucets
* Tenderly Virtual TestNets provide developer environments where wallets can be easily funded.
* You might want to take advantage of the other Tenderly tooling

## Usage

The facilitator can be configured through environment variables or command line arguments. Command line arguments take precedence over environment variables.

```
npx local-x402-facilitator --rpc <TENDERLY_TESTNET_RPC_URL>
```

Or 

```
npm install local-x402-facilitator
```

```json
// package.json
{
    // ...package.json
    "scripts": {
        "facilitator": "local-x402-facilitator --rpc <TENDERLY_TESTNET_RPC_URL>",
    }
}
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Optional: Facilitator port (defaults to 8402)
FACILITATOR_PORT=8402
# Optional: Facilitator Wallet Private Key (defaults to pk for 0x4dFbEAb12fEf03583B22a82D4ac338116AaD4a27)
FACILITATOR_WALLET_PRIVATE=

# Optiona: Private key for Test Wallet that is used to sign x402Response payloads and is automatically funded when boothing a Virtual TestNet.
TEST_WALLET_PRIVATE_KEY

# Optional: Tenderly configuration for Virtual TestNets
# If you provide TENDERLY_RPC, then all other Tenderly fields become required

# Tenderly RPC URL (optional)
TENDERLY_RPC=https://rpc.vnet.tenderly.co/devnet/your-virtual-testnet-id

# Required when TENDERLY_RPC is not provided
# This will then enable dynamic Virtual TestNet creation.
TENDERLY_ACCOUNT_NAME=your-account-name
TENDERLY_PROJECT_NAME=your-project-name
TENDERLY_ACCESS_KEY=your-access-key
```

### Command Line Arguments

```bash
# Start with default configuration
npm run dev

# Or use the CLI with custom arguments
npx local-x402-facilitator --port 9000 --rpc "https://rpc.vnet.tenderly.co/devnet/your-testnet" --account "your-account" --project "your-project" --access-key "your-key"
```

#### Available CLI Options

- `-p, --port <port>`: Facilitator port number (env: FACILITATOR_PORT)
- `-r, --rpc <url>`: Tenderly RPC URL (env: TENDERLY_RPC)  
- `-a, --account <name>`: Tenderly account name (env: TENDERLY_ACCOUNT_NAME)
- `-j, --project <name>`: Tenderly project name (env: TENDERLY_PROJECT_NAME)
- `-k, --access-key <key>`: Tenderly access key (env: TENDERLY_ACCESS_KEY)
- `-h, --help`: Display help for command

### Configuration Validation

- **Port**: Must be a valid number between 1 and 65535
- **Tenderly RPC URL**: Must be a valid URL if provided
- **Tenderly Dependencies**: If `TENDERLY_RPC` is not provided, all other Tenderly fields (account, project, access key) become required

### Usage Examples

```bash
# Default configuration (port 8402, no Tenderly)
npm run dev

# Custom port only
npm run dev -- --port 3000

# Full Tenderly configuration
npm run dev -- --rpc "https://rpc.vnet.tenderly.co/devnet/abc123" --account "myaccount" --project "myproject" --access-key "mykey"
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build the project
npm run build

# Run linting
npm run lint

# Test the CLI
npm run cli -- --help
```

### Publishing

This package uses automated NPM publishing via GitHub Actions following [GitHub's official tutorial](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages). See [Publishing Guide](./.github/PUBLISHING.md) for setup instructions.

To publish a new version:

1. Create a GitHub release with a version tag (e.g., `v0.1.1`)
2. The GitHub Action automatically publishes to NPM

## Roadmap