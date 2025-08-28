import { PaymentPayload, PaymentRequirements } from "x402/types";

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

export {
    CustomFacilitatorOptions,
    VerifyRequestBody,
    SettleRequestBody,
}