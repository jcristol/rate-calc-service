/* eslint-disable @typescript-eslint/no-var-requires */
import express from 'express';
import morgan from 'morgan';
import calculatorHandler from './lib/calculator';
import statusHandler from './lib/status';

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.get('/status', statusHandler);
app.post('/v1/calculateWorkerHours', calculatorHandler);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
