import { Response } from 'express';
import createHttpError from 'http-errors';

const handlers = {
  response: {
    unauthorized: (res: Response, message?: string) => {
      const err = createHttpError.Unauthorized(message || 'Unauthorized');
      return res.status(err.status).send({
        message: err.message,
      });
    },
    success: (res: Response, message?: string, key?: any, data?: any) => {
      return res.json({
        message,
        [key]: data,
      });
    },
    notFound: (res: Response, message?: string) => {
      const err = createHttpError.NotFound(message || 'Not found!');
      return res.status(err.status).send({
        message: err.message,
      });
    },
    badRequest: (res: Response, message?: string) => {
      const err = createHttpError.BadRequest(message || 'Invalid data!');
      return res.status(err.status).send({
        message: err.message,
      });
    },
    conflict: (res: Response, message: string) => {
      const err = createHttpError.Conflict(message);
      return res.status(err.status).send({
        message: err.message,
      });
    },
    error: (res: Response, message?: string, jwtError?: string) => {
      const err = createHttpError.InternalServerError(message || 'Oops! Something went wrong!');
      return res.status(err.status).send({
        message: err.message,
        jwtError,
      });
    },
  },

  request: {},
};

export default handlers;
