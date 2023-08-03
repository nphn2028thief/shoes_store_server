import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import envConfig from '../configs/envConfig';

export const signAccessToken = async (accountId: mongoose.Types.ObjectId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      accountId,
    };

    const accessSecret: jwt.Secret = envConfig.accessTokenSecret;

    const options: jwt.SignOptions = {
      expiresIn: '2h',
    };

    jwt.sign(payload, accessSecret, options, (err, token) => {
      if (err) {
        reject(err);
      }

      resolve(token);
    });
  });
};

export const signRefreshToken = async (accountId: mongoose.Types.ObjectId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      accountId,
    };

    const refreshSecret: jwt.Secret = envConfig.refreshTokenSecret;

    const options: jwt.SignOptions = {
      expiresIn: '7d',
    };

    jwt.sign(payload, refreshSecret, options, (err, token) => {
      if (err) {
        reject(err);
      }

      resolve(token);
    });
  });
};
