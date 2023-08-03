import { ObjectId } from 'mongoose';

export enum EROLE {
  'ADMIN' = 'ADMIN',
  'USER' = 'USER',
}

export interface ILoginInfo {
  username: string;
  password: string;
}

export interface IRecoverInfo {
  email: string;
}

export interface IRegisterInfo extends ILoginInfo {
  email: string;
  firstName: string;
  lastName: string;
}

export interface IResetPassword {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface IAccount {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: EROLE.USER | EROLE.ADMIN;
  shippingAddresses: ObjectId[];
  otp: number;
  expiresIn: number;
}

export interface IPayloadToken {
  accountId: string;
  iat: number;
  exp: number;
}

export interface ITest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: EROLE.USER | EROLE.ADMIN;
  shippingAddresses: { _id: ObjectId; phone: string; address: string }[];
  otp: number;
  expiresIn: number;
}
