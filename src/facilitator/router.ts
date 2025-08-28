import { Router, Request } from "express";
import { x402Response } from "x402/types";


import settle from "./settle";
import verify from "./verify";
import { signPaymentRequirement } from "./test-wallet";
import { SettleRequestBody, VerifyRequestBody } from "../types";

const appRouter = Router();

appRouter.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

appRouter.post('/verify', async (req: Request<{}, {}, VerifyRequestBody>, res) => {
    const {paymentRequirements, paymentPayload, facilitatorOptions} = req.body;

    const result = await verify(paymentPayload, paymentRequirements, facilitatorOptions);

    return res.json(result);
});

appRouter.post('/settle', async (req: Request<{}, {}, SettleRequestBody>, res) => {
    const {paymentRequirements, paymentPayload, facilitatorOptions} = req.body;

    const result = await settle(paymentPayload, paymentRequirements, facilitatorOptions);

    return res.json(result);
});

appRouter.post('/test/sign', async (req, res) => {
    const response = req.body;

    const result = await signPaymentRequirement(response as x402Response);

    return res.json(result);
});

export default appRouter;