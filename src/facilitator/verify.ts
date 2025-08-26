import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { useFacilitator } from "x402/verify";
import { verify as x402Verify } from "x402/facilitator";
import { PaymentPayload, PaymentRequirements } from "x402/types";

import config from "../config";

const verify = async (payload: PaymentPayload, paymentRequirements: PaymentRequirements, rpcUrlOverride?: string) => {
    if (!rpcUrlOverride && !config.tenderly.rpc) {
        const facilitator = useFacilitator();

        return facilitator.verify(payload, paymentRequirements);
    }

    const client = createPublicClient({
        chain: base,
        transport: rpcUrlOverride ? http(rpcUrlOverride) : http(config.tenderly.rpc),
    });

    return x402Verify(client, payload, paymentRequirements);
};

export default verify;