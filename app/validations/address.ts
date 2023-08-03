import Joi from 'joi';
import { IShippingAddress } from '../types/address';

export const shippingAddressValidate = (data: Omit<IShippingAddress, 'accountId'>) => {
  const rule = Joi.object({
    phone: Joi.string().required(),
    address: Joi.string().required(),
  });

  return rule.validate(data);
};
