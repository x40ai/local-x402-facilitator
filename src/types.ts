import { PaymentPayload, PaymentRequirements, x402Response } from "x402/types";

type CustomFacilitatorOptions = {
    rpcUrl?: string;
    skipBalanceCheck?: boolean;
}

type VerifyRequestBody = {
    paymentPayload: PaymentPayload;
    paymentRequirements: PaymentRequirements;
    facilitatorOptions?: CustomFacilitatorOptions;
}

type SettleRequestBody = {
    paymentPayload: PaymentPayload;
    paymentRequirements: PaymentRequirements;
    facilitatorOptions?: CustomFacilitatorOptions;
}

type TestWalletSignRequestBody = x402Response;

export {
    CustomFacilitatorOptions,
    VerifyRequestBody,
    SettleRequestBody,
    TestWalletSignRequestBody,
}