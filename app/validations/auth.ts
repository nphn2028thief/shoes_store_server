import Joi from 'joi';
import { IAccount, ILoginInfo, IRegisterInfo, IResetPassword } from '../types';

export const registerValidate = (data: IRegisterInfo) => {
  const rule = Joi.object({
    email: Joi.string().required().email(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }).required();

  return rule.validate(data);
};

export const loginValidate = (data: ILoginInfo) => {
  const rule = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).required();

  return rule.validate(data);
};

export const updateMeValidate = (data: Pick<IAccount, 'firstName' | 'lastName' | 'avatar'>) => {
  const rule = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),
    avatar: Joi.string().allow(''),
  });

  return rule.validate(data);
};

export const testUpdate = (data: {
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  address: string;
}) => {
  const rule = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),
    avatar: Joi.string().allow(''),
    phone: Joi.string(),
    address: Joi.string(),
  });

  return rule.validate(data);
};

export const emailValidate = (data: { email: string }) => {
  const rule = Joi.object({
    email: Joi.string().required().email(),
  }).required();

  return rule.validate(data);
};

export const otpValidate = (data: { email: string; otp: number }) => {
  const rule = Joi.object({
    email: Joi.string().required().email(),
    otp: Joi.number().required(),
  }).required();

  return rule.validate(data);
};

export const resetPasswordValidate = (data: IResetPassword) => {
  const rule = Joi.object({
    email: Joi.string().required().email(),
    newPassword: Joi.string().required(),
    confirmNewPassword: Joi.ref('newPassword'),
  }).with('newPassword', 'confirmNewPassword');

  return rule.validate(data);
};
