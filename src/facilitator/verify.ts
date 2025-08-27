import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useFacilitator } from "x402/verify";
import { verify as x402Verify } from "x402/facilitator";
import { PaymentPayload, PaymentRequirements } from "x402/types";
import chalk from "chalk";

import config from "../config";
import TenderlyClient from "../tenderly/client";

const verify = async (payload: PaymentPayload, paymentRequirements: PaymentRequirements, rpcUrlOverride?: string) => {
    if (!rpcUrlOverride && !config.tenderly.rpc) {
        const facilitator = useFacilitator();

        return facilitator.verify(payload, paymentRequirements);
    }

    if (rpcUrlOverride) {
        const {isSufficient, balance} = await TenderlyClient.getInstance().verifyFacilitatorBalance(rpcUrlOverride);

        console.warn(chalk.blue(`\n[RPC Override] Using RPC URL: ${rpcUrlOverride}`));

        if (!isSufficient) {
            console.warn(chalk.bgRedBright(`\n[Warning]`), chalk.red(`Facilitator balance is low: ${balance} ETH\n`));
        }
    }

    const client = createPublicClient({
        chain: base,
        transport: rpcUrlOverride ? http(rpcUrlOverride) : http(config.tenderly.rpc),
    });

    return x402Verify(client, payload, paymentRequirements);
};

export default verify;