import { createPublicClient, createWalletClient, http, publicActions } from "viem";
import { base } from "viem/chains";
import { settle as x402Settle } from "x402/facilitator";
import { PaymentPayload, PaymentRequirements } from "x402/types";
import { privateKeyToAccount } from "viem/accounts";
import chalk from "chalk";

import config from "../config";
import { useFacilitator } from "x402/verify";
import TenderlyClient from "../tenderly/client";
import { CustomFacilitatorOptions } from "../types";

const settle = async (payload: PaymentPayload, paymentRequirements: PaymentRequirements, facilitatorOptions?: CustomFacilitatorOptions) => {
    const { rpcUrl: rpcUrlOverride, skipBalanceCheck } = facilitatorOptions || {};

    if (!rpcUrlOverride && !config.tenderly.rpc) {
        const facilitator = useFacilitator();

        return facilitator.settle(payload, paymentRequirements);
    }

    if (rpcUrlOverride) {
        console.log(chalk.blue(`\n[RPC Override] Using RPC URL: ${rpcUrlOverride}\n`));

        if (!skipBalanceCheck) {
            const {isSufficient, balance} = await TenderlyClient.getInstance().verifyFacilitatorBalance(rpcUrlOverride);

            if (!isSufficient) {
                console.log(chalk.bgRedBright(`[Warning]`), chalk.red(`Facilitator balance is low: ${balance} ETH\n`));
            }
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