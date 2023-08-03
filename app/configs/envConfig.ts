import dotenv from 'dotenv';

dotenv.config();

const envConfig = {
  port: process.env.PORT || '5000',
  databaseUrl: process.env.DATABASE_URL || '',
  accessTokenSecret: process.env.ACCESSTOKEN_SECRET || '',
  refreshTokenSecret: process.env.REFRESHTOKEN_SECRET || '',
  mailEmail: process.env.MAIL_EMAIL || '',
  mailPassword: process.env.MAIL_PASSWORD || '',
  cloudName: process.env.CLOUDINARY_NAME || '',
  apiKey: process.env.CLOUDINARY_KEY || '',
  apiSecret: process.env.CLOUDINARY_SECRET || '',
};

export default envConfig;
