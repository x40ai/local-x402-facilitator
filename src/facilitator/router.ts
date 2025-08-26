import { Router } from "express";
import verify from "./verify";
import { x402Response } from "x402/types";
import { signPaymentRequirement } from "./test-wallet";

const appRouter = Router();

appRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

appRouter.post('/verify', async (req, res) => {
    const {paymentRequirements, paymentPayload} = req.body;

    const result = await verify(paymentPayload, paymentRequirements);

    return res.json(result);
});

appRouter.get('/settle', async (req, res) => {
    res.json({ status: 'ok' });
});

appRouter.post('/test/sign', async (req, res) => {
    const response = req.body;

    const result = await signPaymentRequirement(response as x402Response);
    
    return res.json(result);
});

export default appRouter;