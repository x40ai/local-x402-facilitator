import * as x402Client from "x402/client";
import {exact} from "x402/schemes"
import {privateKeyToAccount} from "viem/accounts";
import { PaymentRequirements, ChainIdToNetwork, x402Response } from "x402/types";
import { base } from "viem/chains";

import config from "../config";

export async function signPaymentRequirement(response: x402Response) {
    if (!response.accepts) {
        throw new Error("No accepts found in response");
    }

    if (!config.testWalletPrivateKey) {
        throw new Error("No test wallet private key found in config");
    }

    const account = privateKeyToAccount(config.testWalletPrivateKey);

    const paymentRequirement = x402Client.selectPaymentRequirements(response.accepts, ChainIdToNetwork[base.id]);
    
    const jwtString = await x402Client.createPaymentHeader(
        account,
        response.x402Version,
        paymentRequirement
    );
    
    const payload = exact.evm.decodePayment(jwtString);

    return {
        jwt: jwtString,
        payload,
    };
}