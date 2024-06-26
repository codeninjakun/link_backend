// Server entry point

import express from 'express';
import { createNewUser, signin } from './routes/user';
import * as dotenv from 'dotenv';
dotenv.config();
import 'dotenv/config.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Test!');
});

app.post('/signup', createNewUser);
app.post('/signin', signin);

app.listen(5000, () => {
  console.log('Works!');
});
