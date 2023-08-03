import { ObjectId } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  products: ObjectId[];
}

export interface ISize {
  size: string;
  enable: boolean;
}

export interface IProduct {
  name: string;
  subTitle: string;
  description: string;
  sizes: ISize[];
  image: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  slug: string;
  categories: ObjectId[];
}
