import Joi from 'joi';
import { IProduct } from '../types/product';

export const createProductValidate = (data: Omit<IProduct, 'image' | 'thumbnail'>) => {
  const rule = Joi.object({
    name: Joi.string().required(),
    subTitle: Joi.string().required(),
    description: Joi.string().required(),
    sizes: Joi.array()
      .items(
        Joi.object({
          size: Joi.string().required(),
          enable: Joi.boolean().required(),
        }).required(),
      )
      .required(),
    price: Joi.number(),
    originalPrice: Joi.number().required(),
    slug: Joi.string(),
    categories: Joi.array()
      .items(
        Joi.string()
          .required()
          .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId'),
      )
      .required(),
  });

  return rule.validate(data);
};
