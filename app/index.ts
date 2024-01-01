import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import createHttpError from 'http-errors';

import envConfig from './configs/envConfig';
import connectToDB from './database';
import routes from './routes';

declare global {
  namespace Express {
    interface Request {
      accountId: string;
    }
  }
}

dotenv.config();

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(cors());
app.use(morgan('tiny'));

app.use('/api/', routes());

connectToDB();

app.use((req, res, next) => {
  next(createHttpError.NotFound("This route doesn't exist!"));
});

app.use((err: createHttpError.HttpError, req: Request, res: Response, next: NextFunction) => {
  res.json({
    status: err.status,
    message: err.message,
  });
});

app.listen(envConfig.port, () => {
  console.log(`Server app listening on port ${envConfig.port}`);
});
