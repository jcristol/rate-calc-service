import { Request, Response } from 'express';

export default (_req: Request, res: Response): void => {
  res.json({ status: 'up' });
};
