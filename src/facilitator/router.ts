import { Router } from "express";
import verify from "./verify";

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

export default appRouter;