import { Request, Response } from 'express';
import { getRankings } from '../src/controllers/rankings.controller';

const mockRequest = () => {
  const req = {} as Request;
  req.body = {};
  req.query = {};
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Rankings Controller', () => {
  it('should return 400 if invalid ranking type is provided', async () => {
    const req = mockRequest();
    const res = mockResponse();

    req.body.type = 'invalid_type';

    await getRankings(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ message: 'Invalid ranking type' });
  });
});
