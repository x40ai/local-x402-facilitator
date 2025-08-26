import { Router } from "express";

const appRouter = Router();

appRouter.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

appRouter.get('/verify', async (req, res) => {
    res.json({ status: 'ok' });
});

appRouter.get('/settle', async (req, res) => {
    res.json({ status: 'ok' });
});

export default appRouter;