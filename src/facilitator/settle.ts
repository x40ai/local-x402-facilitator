import { createPublicClient, createWalletClient, http, publicActions } from "viem";
import { base } from "viem/chains";
import { settle as x402Settle } from "x402/facilitator";
import { PaymentPayload, PaymentRequirements } from "x402/types";
import { privateKeyToAccount } from "viem/accounts";

import config from "../config";

const settle = async (payload: PaymentPayload, paymentRequirements: PaymentRequirements) => {
    const account = privateKeyToAccount(config.facilitatorPrivateKey);

    const client = createWalletClient({
        name: "Facilitator Wallet",
        chain: base,
        transport: config.tenderly.rpc ? http(config.tenderly.rpc) : http(),
        account,
    }).extend(publicActions);

    return x402Settle(client, payload, paymentRequirements);
};

export default settle;