import { Request, Response } from 'express';
import statusHandler from './status';

const createMockResponsObject = () => {
  const res = { json: jest.fn() } as unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res as Response<any, Record<string, any>>;
};

describe('status handler', () => {
  it('should respond with status up', () => {
    const req = {} as Request;
    const res = createMockResponsObject();
    const json = res.json;
    statusHandler(req, res);
    expect(json).toBeCalledWith({ status: 'up' });
  });
});
