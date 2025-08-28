# local-x402-facilitator

An x402 facilitator server for local development that works natively with Tenderly Virtual TestNets. Avoiding bottlenecks while testing and creating sandbox environments for x402 development.

## Motivation

Working with x402 on Base Sepolia and other testnets typically requires utilising faucets for wallet funding, which can create development bottlenecks. Tenderly Virtual TestNets solve this by providing isolated developer environments with easily funded wallets, while also giving you access to all of Tenderly's blockchain development tooling.

> NOTICE: This server is meant solely for local development and is **not meant to be used in production environments!**.

## Usage

The local x402 facilitator is meant to be run as a local server alongside your local development environemnet.

The server can be configured through environment variables or command line arguments. Command line arguments take precedence over environment variables.

You can running using the `npx` command:

```bash
npx local-x402-facilitator --rpc <TENDERLY_TESTNET_RPC_URL>
```

Or alternatively you can install the npm package and run it using an npm script.

```bash
npm install --save-dev local-x402-facilitator
```

```json
{
    "scripts": {
        "facilitator": "local-x402-facilitator --rpc <TENDERLY_TESTNET_RPC_URL>",
    }
}
```

### Environment Variables

The facilitator server loads the `.env` file from the root of your project. Create a `.env` file in the project root with the following variables:

```bash
# Optional: Facilitator port (defaults to 8402)
FACILITATOR_PORT=8402

# Optional: Facilitator Wallet Private Key (defaults to pk for 0x4dFbEAb12fEf03583B22a82D4ac338116AaD4a27)
FACILITATOR_WALLET_PRIVATE=

# Optional: Private key for Test Wallet that can used to sign x402Response payloads and is automatically funded when boothing a Virtual TestNet.
TEST_WALLET_PRIVATE_KEY=

# enderly configuration for Virtual TestNets
# If you do not provide a fixed TENDERLY_RPC, then all other Tenderly fields become required

# Tenderly RPC URL (optional) - Recommended setting for those that have paid Tenderly accounts.
TENDERLY_RPC=https://rpc.vnet.tenderly.co/devnet/your-virtual-testnet-id

# Required when TENDERLY_RPC is not provided
# This will then enable dynamic Virtual TestNet creation.
TENDERLY_ACCOUNT_NAME=your-account-name
TENDERLY_PROJECT_NAME=your-project-name
TENDERLY_ACCESS_KEY=your-access-key
```

#### Available CLI Options

When running the server using the CLI command, you can alternatively use the following CLI flags.

- `-p, --port <port>`: Facilitator port number (env: FACILITATOR_PORT)
- `-r, --rpc <url>`: Tenderly RPC URL (env: TENDERLY_RPC)  
- `-a, --account <name>`: Tenderly account name (env: TENDERLY_ACCOUNT_NAME)
- `-j, --project <name>`: Tenderly project name (env: TENDERLY_PROJECT_NAME)
- `-k, --access-key <key>`: Tenderly access key (env: TENDERLY_ACCESS_KEY)
- `-h, --help`: Display help for command

### Usage with x402 Client

This local facilitator server can then be used with the the x402 client library.

```js
import {useFacilitator} from 'x402/verify';

const facilitator = useFacilitator({
    url: 'http://localhost:8402',
});

await facilitator.verify(signedPayload, paymentRequirement);
```

## API Endpoints

By default the facilitator server is available at `http://localhost:8402`

### POST - /verify

```ts
import { PaymentPayload, PaymentRequirements } from "x402/types";

type VerifyRequestBody = {
    paymentPayload: PaymentPayload;
    paymentRequirements: PaymentRequirements;
    facilitatorOptions?: CustomFacilitatorOptions;
}
```

### POST - /settle

```ts
import { PaymentPayload, PaymentRequirements } from "x402/types";

type SettleRequestBody = {
    paymentPayload: PaymentPayload;
    paymentRequirements: PaymentRequirements;
    facilitatorOptions?: CustomFacilitatorOptions;
}
```

### POST - /test/sign

Requires the `TEST_WALLET_PRIVATE_KEY` to be defined.

```ts
import { x402Response } from "x402/types";

type TestWalletSignBody = x402Response;
```

### Types

You can check the types for `PaymentPayload`, `PaymentRequirements` and `x402Response` in the official [x402 types](https://github.com/coinbase/x402/blob/main/typescript/packages/x402/src/types/verify/x402Specs.ts) repository.

The below types are the custom types for the local x402 facilitator.

```ts
type CustomFacilitatorOptions = {
    rpcUrl?: string; // When this param is provided it overrides the defined RPC URL from the environment used for Facilitator client calls.
    skipBalanceCheck?: boolean; // Disable checking if the facilitator wallet has enough balance on this RPC Url. Set this to `true` to reduce the response time as it doesn't call the RPC Url before performing transactions.
}
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

# Test the CLI
npm run cli -- --help
```

## Roadmap

| Feature | State |
| --- | --- |
| Add support for other Networks besides Base | TODO |
| Create local studio app for viewing requests | TODO |
| Add dynamic creation of new Virtual TestNets when current TestNets reaches free plan block height limit | TODO |