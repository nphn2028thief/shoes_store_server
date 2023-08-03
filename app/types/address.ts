import { ObjectId } from 'mongoose';

export interface IShippingAddress {
  accountId: ObjectId;
  phone: string;
  address: string;
}
