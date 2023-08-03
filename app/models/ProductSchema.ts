import mongoose from 'mongoose';
import { IProduct } from '../types/product';

const Schema = mongoose.Schema;

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    subTitle: { type: String, required: true },
    description: { type: String, required: true },
    sizes: [{ size: String, enable: Boolean }],
    image: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number },
    originalPrice: { type: Number, required: true },
    slug: { type: String, unique: true, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Product', ProductSchema);
