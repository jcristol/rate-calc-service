import { Request, Response } from 'express';

export const handler = (_req: Request, res: Response): void => {
  res.json({ status: 'up' });
};
