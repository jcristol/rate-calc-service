import { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../api/status';

const createMockResponsObject = () => {
  const res = { json: jest.fn() } as unknown;
  return res as VercelResponse;
};

describe('status handler', () => {
  it('should respond with status up', () => {
    const req = {} as VercelRequest;
    const res = createMockResponsObject();
    const json = res.json;
    handler(req, res);
    expect(json).toBeCalledWith({ status: 'up' });
  });
});
