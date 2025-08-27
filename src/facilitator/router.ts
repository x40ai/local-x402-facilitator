import { Router } from "express";
import { x402Response } from "x402/types";


import settle from "./settle";
import verify from "./verify";
import { signPaymentRequirement } from "./test-wallet";

const appRouter = Router();

appRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

appRouter.post('/verify', async (req, res) => {
    const {paymentRequirements, paymentPayload, customRpcUrl} = req.body;

    const result = await verify(paymentPayload, paymentRequirements, customRpcUrl);

    return res.json(result);
});

appRouter.post('/settle', async (req, res) => {
    const {paymentRequirements, paymentPayload, customRpcUrl} = req.body;

    const result = await settle(paymentPayload, paymentRequirements, customRpcUrl);

    return res.json(result);
});

appRouter.post('/test/sign', async (req, res) => {
    const response = req.body;

    const result = await signPaymentRequirement(response as x402Response);

    return res.json(result);
});

export default appRouter;