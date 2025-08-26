import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { verify as x402Verify } from "x402/facilitator";
import { PaymentPayload, PaymentRequirements } from "x402/types";
import { useFacilitator } from "x402/verify";

import config from "../config";

const verify = async (payload: PaymentPayload, paymentRequirements: PaymentRequirements) => {
    const client = createPublicClient({
        chain: mainnet,
        transport: config.tenderly.rpc ? http(config.tenderly.rpc) : http(),
    });

    return x402Verify(client, payload, paymentRequirements);
};

export default verify;