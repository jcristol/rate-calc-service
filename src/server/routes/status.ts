import { Router } from 'express';

export const statusRouter = Router();
statusRouter.get('/', (_req, res) => {
  res.json({ status: 'up' });
});
