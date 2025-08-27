import { createPublicClient, createWalletClient, http, publicActions } from "viem";
import { base } from "viem/chains";
import { settle as x402Settle } from "x402/facilitator";
import { PaymentPayload, PaymentRequirements } from "x402/types";
import { privateKeyToAccount } from "viem/accounts";
import chalk from "chalk";

import config from "../config";
import { useFacilitator } from "x402/verify";
import TenderlyClient from "../tenderly/client";

const settle = async (payload: PaymentPayload, paymentRequirements: PaymentRequirements, rpcUrlOverride?: string) => {
    if (!rpcUrlOverride && !config.tenderly.rpc) {
        const facilitator = useFacilitator();

        return facilitator.settle(payload, paymentRequirements);
    }

    if (rpcUrlOverride) {
        const {isSufficient, balance} = await TenderlyClient.getInstance().verifyFacilitatorBalance(rpcUrlOverride);

        console.log(chalk.blue(`\n[RPC Override] Using RPC URL: ${rpcUrlOverride}\n`));

        if (!isSufficient) {
            console.log(chalk.bgRedBright(`[Warning]`), chalk.red(`Facilitator balance is low: ${balance} ETH\n`));
        }
    }

    const account = privateKeyToAccount(config.facilitatorPrivateKey);

    const client = createWalletClient({
        name: "Facilitator Wallet",
        chain: base,
        transport: rpcUrlOverride ? http(rpcUrlOverride) : http(config.tenderly.rpc),
        account,
    }).extend(publicActions);

    return x402Settle(client, payload, paymentRequirements);
};

export default settle;