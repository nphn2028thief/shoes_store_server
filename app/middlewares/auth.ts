import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import envConfig from '../configs/envConfig';
import AccountSchema from '../models/AccountSchema';
import { EROLE, IPayloadToken } from '../types';
import handlers from '../utils/handlers';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return handlers.response.unauthorized(res, 'Access denied!');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return handlers.response.unauthorized(res, 'Access denied!');
  }

  jwt.verify(token, envConfig.accessTokenSecret, (err, payload) => {
    if (err?.name === 'TokenExpiredError') {
      return handlers.response.error(res, 'Login session has expired, please login again!', 'TokenExpiredError');
    } else if (err?.name) {
      return handlers.response.error(res, err.message);
    }

    const { accountId } = payload as IPayloadToken;

    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return handlers.response.badRequest(res, 'User is not valid!');
    }

    req.accountId = accountId;
    next();
  });
};

export const verifyRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken) {
    return handlers.response.badRequest(res);
  }

  jwt.verify(refreshToken, envConfig.refreshTokenSecret, (err, payload) => {
    if (err?.name === 'TokenExpiredError') {
      return handlers.response.error(res, 'Login session has expired, please login again!');
    } else if (err?.name === 'JsonWebTokenError') {
      return handlers.response.error(res, err.message);
    } else if (err?.name === 'NotBeforeError') {
      return handlers.response.error(res, err.message);
    }

    const { accountId } = payload as IPayloadToken;

    req.accountId = accountId;
    next();
  });
};

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.accountId;

  try {
    const accountExist = await AccountSchema.findById(accountId);

    if (!accountExist) {
      return handlers.response.unauthorized(res);
    }

    if (accountExist.role === EROLE.ADMIN) {
      return next();
    }

    return handlers.response.unauthorized(res, 'Access denied!');
  } catch (error) {
    return handlers.response.error(res);
  }
};
