/* eslint-disable */

import { calculateWorkersComp } from '../../../src/server/routes/calculator';
import { validate } from '../../../src/server/routes/types';

module.exports = (req: any, res: any) => {
  const workerTimeSheet = validate(req.body);
  const response = calculateWorkersComp(workerTimeSheet);
  res.json({
    body: response
  });
};
