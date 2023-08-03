import { ObjectId } from 'mongoose';

export interface IOrder {
  accountId: ObjectId;
  carts: ArrayConstructor;
  total: number;
}
