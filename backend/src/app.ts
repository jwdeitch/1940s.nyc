import express from 'express';
const app = express();
import cors from 'cors';

import createConnection from './createConnection';

import PhotosResource from './api/PhotosResource';

app.use(
  cors({
    origin: ['http://localhost:8080', 'https://1940s.nyc'],
  })
);

app.use(async (req, res, next) => {
  await createConnection();
  next();
});

app.use('/photos', PhotosResource);

app.use(function(req, res) {
  res.status(404).send("Sorry can't find that!");
});

export default app;
