import express, { Application } from 'express';
import morgan from 'morgan';
import calcHandler from './api/v1/calculateWorkerHours';
import statusHandler from './api/status';

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.get('/status', statusHandler as Application);
app.post('/v1/calculateWorkerHours', calcHandler as Application);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
