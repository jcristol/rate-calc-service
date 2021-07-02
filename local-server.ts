/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Application } from 'express';
import morgan from 'morgan';
import { handler as calcHandler } from './api/lib/calculator';
import { handler as statusHandler } from './api/lib/status';

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.get('/status', statusHandler as Application);
app.post('/v1/calculateWorkerHours', calcHandler as Application);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
