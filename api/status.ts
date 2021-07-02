import { VercelRequest, VercelResponse } from '@vercel/node';

export default (_req: VercelRequest, res: VercelResponse): void => {
  res.json({ status: 'up' });
};
