import Joi from 'joi';
import { ICart } from '../types/cart';

export const addToCartValidator = (data: Pick<ICart, 'products'>) => {
  const rule = Joi.object({
    _id: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId'),
    name: Joi.string().required(),
    size: Joi.string().required(),
    image: Joi.string().required(),
    price: Joi.number().required(),
    buyAmount: Joi.number().required(),
  }).required();

  return rule.validate(data);
};
