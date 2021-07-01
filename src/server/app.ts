import express from 'express';
import { statusRouter, calculatorRouter } from './routes';

const app = express();

// needed to read json bodies from post requests
app.use(express.json());
app.use('/status', statusRouter);
app.use('/v1/calculateWorkerHours', calculatorRouter);

app.listen(3000);
