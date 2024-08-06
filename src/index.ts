// Server entry point
import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import 'dotenv/config.js';

import router from './routes/userRoute';
import { globalErrorHandler } from './middleware/errorMiddleware';

const routeUser = `/api/user`;
const routeLink = `/`;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routeUser, router);
app.use(routeLink, router);

app.get('/', (req, res) => {
  res.send('Test!');
});

app.use(globalErrorHandler);
app.listen(5000, () => {
  console.log('Works!');
});
