import { v2 } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import envConfig from './envConfig';

v2.config({
  cloud_name: envConfig.cloudName,
  api_key: envConfig.apiKey,
  api_secret: envConfig.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: v2,
  // params: {
  //   folder: 'shoes_store',
  //   format: ['png', 'jpg', 'jpeg', 'webp'],
  // },
});

const parse = multer({
  storage,
});

export default parse;
