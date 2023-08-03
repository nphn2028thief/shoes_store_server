import { ObjectId } from 'mongoose';

export interface IProductInCart {
  _id: ObjectId;
  name: string;
  size: string;
  image: string;
  price: number;
  buyAmount: number;
}

export interface ICart {
  accountId: ObjectId;
  products: IProductInCart[];
}
