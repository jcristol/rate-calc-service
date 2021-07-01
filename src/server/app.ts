import express from 'express';
import { statusRouter } from './status';

const app = express();
app.use('/status', statusRouter);

app.listen(3000);
