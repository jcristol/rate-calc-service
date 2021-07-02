import { VercelRequest, VercelResponse } from '@vercel/node';

export const handler = (_req: VercelRequest, res: VercelResponse): void => {
  res.json({ status: 'up' });
};
